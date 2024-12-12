import sqlite3 from 'sqlite3';
import { promisify } from 'util';

const db = new sqlite3.Database('wordmate.db');

// Convert callback-based methods to Promise-based
const runAsync = promisify(db.run.bind(db));
const allAsync = promisify(db.all.bind(db));
const getAsync = promisify(db.get.bind(db));

// Initialize database tables
const initDb = async () => {
  await runAsync(`
    CREATE TABLE IF NOT EXISTS vocabulary (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      word TEXT NOT NULL,
      definition TEXT NOT NULL,
      example TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
};

export { db, initDb, runAsync, allAsync, getAsync };
