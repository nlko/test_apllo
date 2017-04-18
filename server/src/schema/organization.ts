import * as R from 'ramda'
import { computeUrl, commonComputePathId, updateOrCreate, schemaOrg,
  commonGetList, commonGetOne, commonRemove,
  commonFindById, getElementIdInLdPath } from './common'
import { commonResolver, myGet, myPost } from '../helpers/graphql_resolver'
import {  logInfo, logError, logDebug } from '../helpers/logger'
import * as People from './person'

/*$ @setCurrentObj(organizations) */
/***********************************
 * GraphQL schema for Organization *
 ***********************************/
let schema = 'Organization'
let path = 'organizations'
/*$  */

var lastId = 1

var organizations = [{
  id: '1',
  name: 'test'
}]

export default {
  type: `
    type Organization {
      # The index.
      id: String!
      # The short company name.
      name: String!
      # Link to people member of this company.
      people: [Person]
    }
`,
  query:
  `
        # Retrieve a Organization according to its id.
      organization(id:String!): Organization
      # Retrieve an Organization
      organizations: [Organization]
  `
  ,
  mutation:
  `
        # Create a Organization or or update according to its id.
      createOrganization(
            name: String!
          ): Organization
      updateOrganization(
            id: String!
            name: String!
          ): Organization
      # Remove an existing Organization according to its id.
      removeOrganization(id:String!): Boolean
  `
  ,
  resolvers: {
    Query: {
      organizations(root, args, context, info) {
        logInfo('organizations')
        return organizations
      },
      organization(root, args, context, info) {
        logInfo('organization with id ${args.id}')
        return R.find(R.propEq('id', args.id), organizations)
      },
    },
    Mutation: {
      createOrganization(root, args, context, info) {
        logInfo('createOrganization')
        lastId++
        const orga = R.compose(
          R.set(R.lensProp('id'), '' + lastId),
          R.set(R.lensProp('name'), args.name)
        )(args)
        organizations.push(orga)

        return  new Promise(resolve => setTimeout((=>return resolve(orga)), 2000));

      },
      updateOrganization(root, args, context, info) {
        logInfo(`updateOrganization with id ${args.id}`)

        const orga = R.compose(
          R.set(R.lensProp('id'), args.id),
          R.set(R.lensProp('name'), args.name)
        )({})

        const id = R.findIndex(R.propEq('id', args.id))(organizations)

        console.dir(R.update(id, orga, organizations))

        const getRes = R.curry( ()=> id < 0 ? null :
          R.compose(
            R.curry(_ => orga),
            R.curry(orgs => organizations = orgs),
            R.update(id, orga)
          )(organizations))

        return new Promise(resolve => setTimeout((=>return resolve(getRes())), 2000));
      },
      removeOrganization(root, args, context, info) {
        logInfo('removeOrganization with id ${args.id}')
        organizations = organizations.filter(R.propEq('id', args.id), args);
        return new Promise(resolve => setTimeout((=>return resolve(true)), 2000));
      },
    },
    Organization: {
      people(elem, args, context, info) {
        return People.findFromLdList(context, elem.people)
      }
    }
  }
}

export let findById = commonFindById(path, schema)

export let findFromLd = (context, link) =>
  findById(context, getElementIdInLdPath(path, link))

export let computePathId = (elemId) => commonComputePathId(path, elemId)
