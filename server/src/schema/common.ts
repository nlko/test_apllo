import * as R from 'ramda'
import { commonResolver, myGet, myPost, myPut, myDelete } from '../helpers/graphql_resolver'

let apiUrl = `http://gateway_nginx/`

export let schemaOrg = (name) => 'http://schema.org/' + name

export let computeUrl = (api, id = null) => id == null ? apiUrl + api : apiUrl + api + `/` + id

export let computeId = (path, elemId = null) =>
  elemId ? `${path}/${elemId}` : path

export let commonComputePathId = (path, elemId) => '/' + computeId(path, elemId)

export let transformIfExists = R.curry((source: string,
                                        dest: string,
                                        transFn: (any)=>any,
                                        args: Object) => {

  return args[source] || args[source]=="" ? // Something to change ?
    R.set(R.lensProp(dest),      // the field to set
      // Value to set assume because of a bug in graphql-tag that "" should be
      // set to null
      args[source] == "" ? null : transFn(args[source]), // value to set
      R.omit([source], args) // remove source
    )
    :args // nothing to change

})

export let commonFindById = R.curry((path, schema, context, elemId) =>
  commonGetOne(R.set(R.lensProp('path'),path,context), schema, elemId))

export let getElementIdInLdPath = (rootPath, link) =>
  link

export let commonGetList = (context, schema) => {
  let id = computeId(context.path)
  let type = 'hydra:Collection'
  let url = computeUrl(context.path)
  context.url = url
  return commonResolver(myGet(url, context), context, schema, id, type)
}

export let commonGetOne = (context, schema, elemId) => {
  let id = computeId(context.path, elemId)
  let type = schemaOrg(schema)
  let url = computeUrl(context.path, elemId)
  context.url = url
  return commonResolver(myGet(url, context), context, schema, id, type)
}

let updateReq = (context, args) => {
  let req
  if (args.id) {
    let elemId = args.id
    delete args.id
    req = myPut(computeUrl(context.path, elemId))
  } else {
    req = myPost(computeUrl(context.path))
  }
  console.dir(args)
  return req(context,args)
}

export let updateOrCreate = (context, schema, args) => {
  let id = computeId(context.path, args.id)
  let type = schemaOrg(schema)
  let request = updateReq(context, args)
  return commonResolver(request, context, schema, id, type)
}

export let commonRemove = (context, schema, elemId) => {
  let id = computeId(context.path, elemId)
  let type = schemaOrg(schema)
  let url = computeUrl(context.path, elemId)
  return commonResolver(myDelete(url, context), context, schema, id, type, (data, res) => {
    return true
  })
}
