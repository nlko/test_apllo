import * as proxy from 'express-http-proxy'

export default function proxyRoute(app, basePath, destination) {
  try {
    app.use(basePath, proxy(destination, {
      forwardPath: function(req, res) {
        return basePath;
      }
    }))
  } catch (e) {
    console.log(`Failed to proxy ${basePath} to ${destination} with error :`)
    console.dir(e)
  }
}
