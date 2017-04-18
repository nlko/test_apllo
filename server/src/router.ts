import * as R from 'ramda'
import * as http from 'http'
import proxy from './helpers/proxy'
import graphql from './helpers/graphql'
import cors from './helpers/cors'
import {setDefaultRoutes, debugRoute} from './helpers/route'
import { commonResolver, myGet, myPost } from './helpers/graphql_resolver'
import { makeExecutableSchema } from 'graphql-tools';

import Organization from './schema/organization'
import Person from './schema/person'
import { computeUrl }from './schema/common'

export default function router(app) {

  const entityTable = [
    Organization,
    Person,
  ]

  const propInTable = R.curry((elem: string, arr: any[]) => R.map(R.prop(elem), arr))
  const propQuery = propInTable('query')
  const propMutation = propInTable('mutation')
  const propType = propInTable('type')
  const propResolvers = propInTable('resolvers')
  const gqlStrPart = (proper): string => R.compose(R.join('\n'), proper)

  const Q = gqlStrPart(propQuery)(entityTable)
  const M = gqlStrPart(propMutation)(entityTable)

  const strSchema = `
    # Possible queries for Manager GraphQL API.
    type Query {
      ${Q}
    }

    # Possible mutations for Manager GraphQL API.
    type Mutation {
      ${M}
    }

    # Manager GraphQL API
    schema {
      query : Query
      mutation : Mutation
    }
  `;

  const typeDefs = [strSchema].concat(propType(entityTable))

  // Deep merge Operator that merge l with r according
  // to an operator op in case of key equality
  let deepMergeOp = R.curry((op, l, r) => R.mergeWithKey(op, l, r))

  // Deep merge an array of object (return an object)
  let deepMerge = arr => R.reduce(
    deepMergeOp(deepMergeOp),
    {}, arr
  )

  // Merge all resolvers
  let resolveFunctions = deepMerge(propResolvers(entityTable))

  console.log(typeDefs.join('\n'))
  console.log(resolveFunctions)

  let schema = makeExecutableSchema({
    typeDefs: typeDefs,
    resolvers: resolveFunctions,
  });

  app.use(debugRoute)

  cors(app)

  graphql(app, schema)

  /* GET for login */
  /*  app.get('/login', function(req, res, next) {
      res.render('users/login', {
        title: 'Login'
      });
    });*/
  app.get('/', function(req, res, next) {
    res.send('ok');
  });
}
