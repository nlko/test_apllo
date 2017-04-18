import * as R from 'ramda'
import * as unirest from 'unirest'
import {  logInfo, logError, logDebug } from './logger'
import { GraphQLError } from 'graphql'

let isJson = (contentType) => /^application\/json.*/.test(contentType)
let isLdJson = (contentType) => /^application\/ld\+json.*/.test(contentType)
let isText = (contentType) => /^text\/html.*/.test(contentType)
let checkKey = (data, key, val) => {
  return (data.hasOwnProperty(key)) && (new RegExp(val)).test(data[key])
}
let isHydra = (data) => {
  return checkKey(data, '@type', '.*')
}

let processHeader = (res) => {

  const statusCode = res.status;
  const contentType = res.headers['content-type'];
  console.log('contentType')
  console.dir(contentType)
  console.dir(/^application\/ld\+json;.*/.test(contentType))
  let isLd = false
  let error;
  if (!res.ok) {
    console.log(res.body)
    error = new Error(statusCode);
  } else if (isText(contentType)) {

  } else if (isJson(contentType)) {

  } else if (isLdJson(contentType)) {
    isLd = true
  } else {
    logError("Invalid content-type:" + contentType)
    error = new Error(`Invalid content-type.\n` +
      `Expected "application/json" but received "${contentType}"`);
  }

  return [error, isLd]
}

let checkHydra = (data, type, schema, id) => {
  let error
  console.dir(data)
  console.dir(schema)
  console.dir(id)
  console.dir(type)
  if (!(
    checkKey(data, "@context", "\/contexts\/" + schema.replace(/\//g, '\/'))
    && checkKey(data, "@id", "\/" + id.replace(/\//g, '\/'))
    //&& checkKey(data, "@type", type.replace(/\//g, '\/'))
  )) {
    error = new Error(`Invalid hydra data in\n` + data);
    console.log('error')
    console.log("\/contexts\/" + schema.replace(/\//g, '\/'))
    console.log("\/" + id.replace(/\//g, '\/'))
    console.log("hydra:" + type.replace(/\//g, '\/'))
    return [error, null]
  }


  return [error,
    (type === 'hydra:Collection') ? data['hydra:member'] : data
  ]
}

export class DataConnector {
  private res
  private schema
  private id
  private type

  constructor() {

  }

  set(res, schema, id, type) {
    this.res = res
    this.schema = schema
    this.id = id
    this.type = type
  }

  public processData = () => {
    try {
      logDebug('Request response received')

      if (!this.res) {
        return rejectWithError(this.res, 'Internal error : invalid request response')
      }

      let [error, isLd] = processHeader(this.res)

      if (error) {
        return [null, error]
      }

      // still necesary ?
      this.res.setEncoding('utf8');

      let checkHydraIfNecessary =
        (data) =>
          isLd && isHydra(data) ?
            checkHydra(data, this.type, this.schema, this.id) : [null, data]

      let parsedData = this.res.body

      logDebug('body', parsedData)
      {
        let [error, realData] = checkHydraIfNecessary(parsedData)

        logDebug('realData for ' + this.type + ' ' + this.id, realData)
        console.dir(realData)
        console.dir(error)
        return error ? [null, error]
          : [realData, null]
      }

    } catch (e) {
      console.log(e.message);
      [null, e]
    }
  }

}

export let commonResolver = (request, context, schema, id, type, postProcess = (data, _) => data) => {
  if (context.url && context.cache[context.url]) {
    return context.cache[context.url]
  }
  else {
    const result = new Promise(
      function(resolve, reject) {
        logDebug('commonResolver: Resolving request')

        let rejectWithError = (res, error: Error | string) => {
          // consume response data to free up memory
          if (res)
            res.resume()

          if (typeof error === `string`) {
            error = new Error(<string>error + ` : ${res.body.code}, ${res.body.message}`)
          }

          return reject(error)
        }

        request.end((res) => {
          const dataConnector = new DataConnector()
          dataConnector.set(res, schema, id, type)
          const [data, error] = dataConnector.processData()
          const setCache = data => {
            if (context.url)
              context.cache[context.url] = data
            return data
          }

          return error ? rejectWithError(res, error) :
            resolve(setCache(postProcess(data, res)))
        })
      }
    )
    logDebug('Getting on ' + context.url)
    return context.cache[context.url] = result
  }
}

const addAuthorizeInHeader = (req, header = {}) =>
  (req.headers.authorization) ? R.set(R.lensProp('authorization'), req.headers.authorization, header) : header

const commonHeader = { 'Accept': 'application/json', 'Content-Type': 'application/json' }

export let myGet = (url, context) => {
  //logDebug(`Get on url : ${url}`)
  const headers = addAuthorizeInHeader(context.req)
  return unirest.get(url).headers(headers)
}
export let myPost = R.curry((url, context, data) => {
  logDebug([`Post on url : ${url}\n`, data])
  const headers = addAuthorizeInHeader(context.req, commonHeader)
  return unirest.post(url, 'application/json', JSON.stringify(data)).headers(headers)
})
export let myPut = R.curry((url, context, data) => {
  logDebug([`Put on url : ${url}\n`, data])
  const headers = addAuthorizeInHeader(context.req, commonHeader)
  return unirest.put(url, 'application/json', JSON.stringify(data)).headers(headers)
})
export let myDelete = R.curry((url, context) => {
  logDebug([`Delete on url : ${url}\n`])
  const headers = addAuthorizeInHeader(context.req, commonHeader)
  return unirest.delete(url, 'application/json').headers(headers)
})
