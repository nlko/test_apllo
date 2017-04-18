import * as mongodb from 'mongodb'

/////////////////////////////////////////////////////////////////////
// DB DEFINITION & MGT

export default function InitMongo(dbname: string, cb) {
  let mongoClient = mongodb.MongoClient

  mongoClient.connect(`mongodb://db_mongo:27017/${dbname}`, function(err, db) {
    if (err) {
      console.log(`connection error:`)
      console.dir(err)
      throw err
    }

    cb(db)
  })
}
