import collection from './collection'
import * as express from 'express'
import * as path from 'path'

/////////////////////////////////////////////////////////////////////
// EVENT COLLECTION

export default class Event extends collection {
  constructor(db) {
    super(db, 'events', {
      validator: {
        '$and':
        [
          { 'ressource_id': { '$type': "string" } },
          { 'post': { '$type': "string" } }
        ]
      },
      validationAction: "error"
    })
  }

  routes() {
    let router = express.Router()

    router.get('/', (req, res) => {
      this.all(req, res)
    });

    router.get(path.join('/', ':id'), (req, res) => {
      this.read(req, res)
    });

    router.get(path.join('/', 'ressource', ':id'), (req, res) => {
      this.getRessourceRelated(req, res)
    });

    router.delete(path.join('/', 'ressource', ':id'), (req, res) => {
      this.deleteRessourceRelated(req, res)
    });

    router.post('/', (req, res) => {
      this.create(req, res)
    });

    router.put(path.join('/', ':id'), (req, res) => {
      this.update(req, res)
    });

    router.delete(path.join('/', ':id'), (req, res) => {
      this.delete(req, res)
    });

    return router
  }

  all(req, res) {
    super.fetch().sort({ 'date': -1 }).toArray(function(err, result) {
      if (err) {
        res.status(500).send(err)
      }
      else {
        res.send(result)
      }
    })
  }

  create(req, res) {
    let obj = req.body
    obj.date = Date.now()
    super.create(req.body, function(err, result) {
      if (err) {
        res.status(500).send(err)
      }
      else {
        res.status(201).send(result)
      }
    })
  }

  read(req, res) {
    super.read(req.params.id, function(err, result) {
      if (err) {
        res.status(500).send(err)
      }
      else {
        res.status(200).send(result)
      }
    })
  }

  getRessourceRelated(req, res) {
    super.fetch({ ressource_id: req.params.id }).sort({ 'date': -1 }).toArray(function(err, result) {
      if (err) {
        res.status(500).send(err)
      }
      else {
        res.send(result)
      }
    })
  }

  update(req, res) {
    let data = req.body
    if (data._id) delete data._id
    if (data.date) delete data.date
    super.update(req.params.id, data, function(err, result) {
      if (err) {
        res.status(500).send(err)
      }
      else {
        res.status(204).send(result)
      }
    })
  }

  delete(req, res) {
    super.deleteOne(req.params.id, function(err, result) {
      if (err) {
        res.status(500).send(err)
      }
      else {
        res.status(204).send(result)
      }
    })
  }

  deleteRessourceRelated(req, res) {
    super.delete({ ressource_id: req.params.id }, function(err, result) {
      if (err) {
        res.status(500).send(err)
      }
      else {
        res.status(204).send(result)
      }
    })
  }
}
