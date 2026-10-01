import Database from "better-sqlite3";
import path from "path";

const db = new Database(path.join(process.cwd(), "temple.db"));
db.pragma("journal_mode = WAL");

db.exec(`
  CREATE TABLE IF NOT EXISTS bookings (
    id TEXT PRIMARY KEY,
    sevaId TEXT NOT NULL,
    sevaName TEXT NOT NULL,
    devoteeName TEXT NOT NULL,
    rashi TEXT NOT NULL,
    nakshatra TEXT NOT NULL,
    date TEXT NOT NULL,
    slot TEXT NOT NULL,
    sankalpa TEXT,
    amount INTEGER NOT NULL,
    prasadamDelivery INTEGER NOT NULL,
    address TEXT,
    bookingTime TEXT NOT NULL,
    status TEXT NOT NULL,
    tokenNumber TEXT NOT NULL,
    paymentMethod TEXT,
    createdAt TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS donations (
    id TEXT PRIMARY KEY,
    cause TEXT NOT NULL,
    amount INTEGER NOT NULL,
    devoteeName TEXT NOT NULL,
    panNumber TEXT,
    sankalpaOccasion TEXT,
    date TEXT NOT NULL,
    receiptNumber TEXT NOT NULL,
    createdAt TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS members (
    id TEXT PRIMARY KEY,
    memberNumber TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    designation TEXT NOT NULL,
    department TEXT NOT NULL,
    phone TEXT NOT NULL,
    validTill TEXT NOT NULL,
    status TEXT NOT NULL,
    createdAt TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS member_scans (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    memberNumber TEXT NOT NULL,
    scannedAt TEXT NOT NULL
  );
`);

// Migration: older members table (created before memberNumber existed)
const memberCols = db.prepare(`PRAGMA table_info(members)`).all() as { name: string }[];
if (!memberCols.some((c) => c.name === "memberNumber")) {
  console.log("Migrating members table: adding memberNumber...");
  db.exec(`
    ALTER TABLE members RENAME TO members_old;

    CREATE TABLE members (
      id TEXT PRIMARY KEY,
      memberNumber TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      designation TEXT NOT NULL,
      department TEXT NOT NULL,
      phone TEXT NOT NULL,
      validTill TEXT NOT NULL,
      status TEXT NOT NULL,
      createdAt TEXT NOT NULL
    );

    INSERT INTO members (id, memberNumber, name, designation, department, phone, validTill, status, createdAt)
    SELECT id,
           'TMP-' || strftime('%Y', 'now') || '-' || printf('%04d', ROW_NUMBER() OVER (ORDER BY createdAt)),
           name, designation, department, phone, validTill, status, createdAt
    FROM members_old;

    DROP TABLE members_old;
  `);
}

export default db;