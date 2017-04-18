import * as bodyParser from 'body-parser'
import {  logInfo, logError, logDebug, logRoute } from './logger'
import * as cors from 'cors'

export default function setupcors(app) {
  logInfo("Setting up cors rules")
  app.use(cors())
}
