import { graphqlExpress, graphiqlExpress } from 'graphql-server-express'
import * as bodyParser from 'body-parser'
import {  logInfo, logError, logDebug } from './logger'
import * as cors from 'cors'

export default function graphql(app, schema) {
  let endPointUrl = `http://localhost:3000`

  logInfo('Creating graphiql route at /graphiql')
  logInfo(`Graphql endpoint : ${endPointUrl}`)

  app.use('/graphiql', (req, res, next) => { console.log('graphiql'); next() }, graphiqlExpress({
    endpointURL: endPointUrl,
  }));

  logInfo('Creating graphql route at /')
  app.post('/', (req, res, next) => { console.log('graphql'); next() }, bodyParser.json(),
    cors(),
    (req, res, next) => {
      console.dir(req.body)
      next();
    },
    (req, res, next) => graphqlExpress({ schema: schema, context: { req: req, cache: [] } })(req, res, next)
  );
}
