const sqlite3 = require('sqlite3').verbose();
const logger = require('../config/logger');

class Database {
  constructor() {
    this.db = new sqlite3.Database('recipesApp.db', (err) => {
      if (err) {
        logger.error('Error opening database:', err.message);
      } else {
        logger.info('Database connected.');
        this.init();
      }
    });
  }

  init() {
    this.db.run(`
      CREATE TABLE IF NOT EXISTS recipes (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      ingredients TEXT NOT NULL,
      preparationSteps TEXT NOT NULL,
      preparationTime INTEGER NOT NULL
    );
    `, (err) => {
      if (err) logger.error('Error creating table:', err.message);
      else logger.info('Database table initialized.');
    });
  }

  run(query, params = []) {
    return new Promise((resolve, reject) => {
      this.db.run(query, params, function (err) {
        if (err) {
          logger.error('Database run error:', err.message);
          reject(err);
        } else {
          resolve(this);
        }
      });
    });
  }

  get(query, params = []) {
    return new Promise((resolve, reject) => {
      this.db.get(query, params, (err, result) => {
        if (err) {
          logger.error('Database get error:', err.message);
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
  }

  all(query, params = []) {
    return new Promise((resolve, reject) => {
      this.db.all(query, params, (err, rows) => {
        if (err) {
          logger.error('Database all error:', err.message);
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }
}

module.exports = new Database();
