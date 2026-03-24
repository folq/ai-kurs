import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import * as sqliteVec from "@photostructure/sqlite-vec";
import Database from "better-sqlite3";
import { config } from "dotenv";
import { AzureOpenAI } from "openai";

config({ path: path.join(process.cwd(), ".env.local") });

const DB_PATH = path.join(process.cwd(), "data", "movies.db");

type SeedMovie = {
  title: string;
  year: number;
  type: "movie" | "tv_show";
  genre: string;
  description: string;
  rating: number;
};

async function main() {
  const dataDir = path.dirname(DB_PATH);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  if (fs.existsSync(DB_PATH)) {
    fs.unlinkSync(DB_PATH);
    console.log("Removed existing database");
  }

  const db = new Database(DB_PATH);
  sqliteVec.load(db);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");

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

    CREATE VIRTUAL TABLE movie_embeddings USING vec0(
      movie_id INTEGER PRIMARY KEY,
      embedding float[1536]
    );
  `);

  const movies: SeedMovie[] = JSON.parse(
    fs.readFileSync(path.join(__dirname, "movies.json"), "utf-8"),
  );

  console.log(`Inserting ${movies.length} movies...`);

  const insertMovie = db.prepare(`
    INSERT INTO movies (title, year, type, genre, description, rating)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  const insertMany = db.transaction((movies: SeedMovie[]) => {
    for (const movie of movies) {
      insertMovie.run(
        movie.title,
        movie.year,
        movie.type,
        movie.genre,
        movie.description,
        movie.rating,
      );
    }
  });

  insertMany(movies);
  console.log("Movies inserted.");

  const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
  const apiKey = process.env.AZURE_OPENAI_API_KEY;
  const embeddingDeployment =
    process.env.AZURE_OPENAI_EMBEDDING_DEPLOYMENT || "text-embedding-3-small";

  if (!endpoint || !apiKey) {
    console.log(
      "\nSkipping embedding generation: AZURE_OPENAI_ENDPOINT and AZURE_OPENAI_API_KEY not set.",
    );
    console.log("Run the seed script again after setting up your .env.local");
    db.close();
    return;
  }

  const client = new AzureOpenAI({
    endpoint,
    apiKey,
    apiVersion: "2024-10-21",
  });

  console.log("\nGenerating embeddings...");

  const allMovies = db
    .prepare("SELECT id, title, description, genre FROM movies")
    .safeIntegers(false)
    .all() as {
    id: number;
    title: string;
    description: string;
    genre: string;
  }[];

  function float32ToHex(arr: number[]): string {
    const f32 = new Float32Array(arr);
    return Buffer.from(f32.buffer).toString("hex");
  }

  const BATCH_SIZE = 20;
  for (let i = 0; i < allMovies.length; i += BATCH_SIZE) {
    const batch = allMovies.slice(i, i + BATCH_SIZE);
    const texts = batch.map((m) => `${m.title} (${m.genre}): ${m.description}`);

    const response = await client.embeddings.create({
      model: embeddingDeployment,
      input: texts,
    });

    for (let j = 0; j < batch.length; j++) {
      const embedding = response.data[j].embedding;
      const id = batch[j].id;
      const hex = float32ToHex(embedding);
      db.exec(
        `INSERT INTO movie_embeddings(movie_id, embedding) VALUES (${id}, x'${hex}')`,
      );
    }

    console.log(
      `  Embedded ${Math.min(i + BATCH_SIZE, allMovies.length)}/${allMovies.length}`,
    );
  }

  console.log("Seeding complete!");
  db.close();
}

main().catch(console.error);
