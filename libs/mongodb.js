const MongoClient = require("mongodb").MongoClient,
  { dbUrl, dbName } = require("../config/db");

class Db {

	static getInstance() {
		!Db.instance && (Db.instance = new Db())
		return Db.instance
	}

  constructor() {
    this.dbClient = null;
  }

  connect() {
    return new Promise((resolve, reject) => {
      this.dbClient
        ? resolve(this.dbClient)
        : MongoClient.connect(dbUrl, (err, client) => {
            err ? reject(err) : resolve(this.dbClient = client.db(dbName));
          });
    });
  }

  find(collectionName, where) {
    return this.connect().then(
        db =>
          new Promise((resolve, reject) => {
						const result = db.collection(collectionName).find(where);
						result.toArray((err, docs) => {
							err ?	reject(err) : resolve(docs)
						})
          })
      )
      .catch(err => {});
	}
	
	insert(collectionName, where) {
    return this.connect().then(
        db =>
          new Promise((resolve, reject) => {
            db.collection(collectionName).insertOne(where, err => {
              err ? reject(err) : resolve();
            });
          })
      )
      .catch(err => {});
	}
	
	update(collectionName, where, field) {
		return this.connect().then(
			db =>
				new Promise((resolve, reject) => {
					db.collection(collectionName).updateOne(where, {$set: field}, (err, result) => {
						err ? reject(err) : resolve(result);
					});
				})
		)
		.catch(err => {});
	}
	
	delete(collectionName, where) {
		return this.connect().then(
			db =>
				new Promise((resolve, reject) => {
					db.collection(collectionName).removeOne(where, (err, result) => {
						err ? reject(err) : resolve(result);
					});
				})
		)
		.catch(err => {});
	}
}

module.exports = Db.getInstance();
