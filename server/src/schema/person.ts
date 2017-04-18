import * as R from 'ramda'
import { computeUrl, commonComputePathId, updateOrCreate, schemaOrg,
         commonGetList, commonGetOne, commonRemove,
         commonFindById, getElementIdInLdPath,
         transformIfExists } from './common'
import * as Organization from './organization'
import { logInfo, logError, logDebug } from '../helpers/logger'

/*$ @setCurrentObj(clients) */
/*****************************
 * GraphQL schema for Person *
 *****************************/
let schema = 'Person'
let path = 'people'
/*$  */

var lastId = 1

var people = [{
  id:'1',
  name: 'test'
}]

export default {
  type:
  /*$ @indent.gqlDescription.str(type, ).gqlGetType.strln(,{).indent.str(${type}).strln().indent.str(}).toString */
`  type Person {
      # The index.
      id: String!
      name: String!
      organization: Organization
  }`
  /*$  */
  ,
  query:
  /*$ @gqlQueries(get,list).toString */
`
        # Retrieve a Person according to its id.
      person(id:String!): Person
      # Retrieve an Person
      people: [Person]
  `
  /*$  */
  ,
  mutation:
  /*$ @gqlQueries(create,remove).toString */
`
        # Create a Person or or update according to its id.
      createPerson(
            id: String
            name: String!
            organizationId: String!): Person
      # Remove an existing Person according to its id.
      removePerson(id:String!): Boolean
  `
  /*$  */
  ,
  resolvers:
  {
    Query: {
      /*$ @gqlQueriesContent(list,get) */
      people(root, args, context, info) {
        logInfo('people')
        return people
      },
      person(root, args, context, info) {
        logInfo(`person with id ${args.id}`)
        return R.find(R.propEq('id', args.id),people)
      },
      /*$  */
    },
    Mutation: {
      /*$ @gqlQueriesContent(create,remove) */
      createPerson(root, args, context, info) {
        logInfo('createPerson with id ${args.id}')

        lastId++
        person = R.compose (
          R.set(R.lensProp('id'),''+lastId),
          R.set(R.lensProp('name'),args.name)
        )(args)
        people.push(person)
        return person
      },
      removePerson(root, args, context, info) {
        logInfo('removePerson with id ${args.id}')
        people = people.filter(R.propEq('id', args.id),args);
        return true
      },
      /*$  */
    },
    Person: {
      organization(person, args, context, info) {
        return Organization.findById(context)
      }
    },
  }
}

export let findById = commonFindById(path, schema)

export let findFromLd = (context, link) =>
  findById(context, getElementIdInLdPath(path, link))

export let findFromLdList = (context, links) =>
  links.map(link => findFromLd(context, link).then(data => data))

export let computePathId = (elemId) => commonComputePathId(path, elemId)
