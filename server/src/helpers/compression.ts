import {  logInfo, logError, logDebug, logRoute } from './logger'
import * as compression from 'compression'

export default function setupCompression(app) {
  logInfo("Setting up compression rule")
  app.use(compression())
}
