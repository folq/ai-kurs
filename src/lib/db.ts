import path from "node:path";
import * as sqliteVec from "@photostructure/sqlite-vec";
import Database from "better-sqlite3";

const DB_PATH = path.join(process.cwd(), "data", "movies.db");

let _db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (_db) return _db;

  const fs = require("node:fs");
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  _db = new Database(DB_PATH);
  sqliteVec.load(_db);
  _db.pragma("journal_mode = WAL");
  _db.pragma("foreign_keys = ON");

  initSchema(_db);
  return _db;
}

function initSchema(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS movies (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      year INTEGER,
      type TEXT NOT NULL CHECK(type IN ('movie', 'tv_show')),
      genre TEXT NOT NULL,
      description TEXT NOT NULL,
      rating REAL,
      poster_url TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS favorites (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      movie_id INTEGER NOT NULL REFERENCES movies(id) ON DELETE CASCADE,
      note TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );
  `);

  const vecTableExists = db
    .prepare(
      "SELECT name FROM sqlite_master WHERE type='table' AND name='movie_embeddings'",
    )
    .get();

  if (!vecTableExists) {
    db.exec(`
      CREATE VIRTUAL TABLE movie_embeddings USING vec0(
        movie_id INTEGER PRIMARY KEY,
        embedding float[1536]
      );
    `);
  }
}

export type Movie = {
  id: number;
  title: string;
  year: number | null;
  type: "movie" | "tv_show";
  genre: string;
  description: string;
  rating: number | null;
  poster_url: string | null;
  created_at: string;
};

export type Favorite = {
  id: number;
  movie_id: number;
  note: string | null;
  created_at: string;
};
