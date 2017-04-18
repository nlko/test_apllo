
/*
 * opt:
 * - app : mandatory express application
 * - debugRoute : optional debug middleware
 * - serverCommonCheck : optional debug middleware
 */
export default function loadRoute(opt, basePath, router) {
  try {
    opt.app.use(
      basePath,
      opt.debugRoute ? opt.debugRoute : debugRoute,
      opt.serverCommonCheck ? opt.serverCommonCheck : serverCommonCheck,
      router.routes())
  } catch (e) {
    console.log(`Failed to mount ${basePath} router with error :`)
    console.dir(e)
  }
}

function serverCommonCheck(req, res, next) {
  console.log('common check : ok')
  next();
}

export function debugRoute(req, res, next) {
  console.log('**************************************************************');
  console.log("Received " + req.method + " request at " + req._parsedUrl.path);
  console.log("Content follows :");
  console.log(req.body);
  console.log('**************************************************************');
  next();
};

export function setDefaultRoutes(app) {
  if (!app) throw new Error("Missing app parameter");

  app.all('*', debugRoute, function(req, res) {
    console.log('404');
    res.status(404).send();
  });
}
