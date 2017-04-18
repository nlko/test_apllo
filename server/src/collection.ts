import * as mongodb from 'mongodb'

/////////////////////////////////////////////////////////////////////
// MONGO COLLECTION BASE CLASS

export default class collection {
  private accessor
  constructor(public db, public name: string, validator = {}) {
    this.accessor = this.collection(name, validator)
  }

  routes() {
    throw "Routes arn't redefined"
  }

  collection(col: string, validator = {}) {
    this.db.createCollection(col, validator)
    return this.db.collection(col)
  }

  fetch(param: Object = {}) {
    return this.accessor.find(param)
  }

  create(data: Object, cb) {
    this.accessor.insertOne(data, cb)
  }

  read(id: string, cb) {
    this.accessor.findOne({ _id: mongodb.ObjectID(id) }, cb)
  }

  update(id: string, data: Object, cb) {
    this.accessor.findOneAndUpdate({ _id: mongodb.ObjectID(id) }, { $set: data }, cb)
  }

  deleteOne(id: string, cb) {
    this.accessor.deleteOne({ _id: mongodb.ObjectID(id) }, cb)
  }

  delete(param: Object = {}, cb) {
    this.accessor.deleteOne(param, cb)
  }

}
