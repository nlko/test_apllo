import * as R from 'ramda'

import * as winston from 'winston'

let localLog = R.curry((level, str)=> {
  if(R.isArrayLike(str))
    return winston.log(level,...str)
  else
    return winston.log(level,str)
})

export let logInfo = localLog('info')
export let logError = localLog('error')
export let logDebug = localLog('debug')
export let logRoute = (str) => (req, res, next) => { logInfo(str); next() }
winston.level = 'debug';
