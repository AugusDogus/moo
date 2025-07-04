// Example model schema from the Drizzle docs
// https://orm.drizzle.team/docs/sql-schema-declaration

import { sql } from "drizzle-orm";
import { index, sqliteTableCreator } from "drizzle-orm/sqlite-core";

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const createTable = sqliteTableCreator((name) => `moo_${name}`);

export const posts = createTable(
  "post",
  (d) => ({
    id: d.integer({ mode: "number" }).primaryKey({ autoIncrement: true }),
    name: d.text({ length: 256 }),
    userId: d.text().notNull(),
    createdAt: d
      .integer({ mode: "timestamp" })
      .default(sql`(unixepoch())`)
      .notNull(),
    updatedAt: d.integer({ mode: "timestamp" }).$onUpdate(() => new Date()),
  }),
  (t) => [index("name_idx").on(t.name)],
);

export const user = createTable("user", (d) => ({
  id: d.text().primaryKey(),
  name: d.text().notNull(),
  email: d.text().notNull().unique(),
  emailVerified: d
    .integer({ mode: "boolean" })
    .$defaultFn(() => false)
    .notNull(),
  image: d.text(),
  createdAt: d
    .integer({ mode: "timestamp" })
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: d
    .integer({ mode: "timestamp" })
    .$defaultFn(() => new Date())
    .notNull(),
}));

export const session = createTable("session", (d) => ({
  id: d.text().primaryKey(),
  expiresAt: d.integer({ mode: "timestamp" }).notNull(),
  token: d.text().notNull().unique(),
  createdAt: d.integer({ mode: "timestamp" }).notNull(),
  updatedAt: d.integer({ mode: "timestamp" }).notNull(),
  ipAddress: d.text(),
  userAgent: d.text(),
  userId: d
    .text()
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
}));

export const account = createTable("account", (d) => ({
  id: d.text().primaryKey(),
  accountId: d.text().notNull(),
  providerId: d.text().notNull(),
  userId: d
    .text()
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: d.text(),
  refreshToken: d.text(),
  idToken: d.text(),
  accessTokenExpiresAt: d.integer({ mode: "timestamp" }),
  refreshTokenExpiresAt: d.integer({ mode: "timestamp" }),
  scope: d.text(),
  password: d.text(),
  createdAt: d.integer({ mode: "timestamp" }).notNull(),
  updatedAt: d.integer({ mode: "timestamp" }).notNull(),
}));

export const verification = createTable("verification", (d) => ({
  id: d.text().primaryKey(),
  identifier: d.text().notNull(),
  value: d.text().notNull(),
  expiresAt: d.integer({ mode: "timestamp" }).notNull(),
  createdAt: d.integer({ mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: d.integer({ mode: "timestamp" }).$defaultFn(() => new Date()),
}));

// Game tables
export const gameRooms = createTable("game_room", (d) => ({
  id: d.text().primaryKey(),
  code: d.text({ length: 4 }).notNull().unique(),
  createdBy: d
    .text()
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  status: d.text().default("waiting").notNull(),
  createdAt: d
    .integer({ mode: "timestamp" })
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: d
    .integer({ mode: "timestamp" })
    .$defaultFn(() => new Date())
    .notNull(),
}));

export const games = createTable("game", (d) => ({
  id: d.text().primaryKey(),
  roomId: d
    .text()
    .notNull()
    .references(() => gameRooms.id, { onDelete: "cascade" }),
  player1Id: d
    .text()
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  player2Id: d
    .text()
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  player1Code: d.text({ length: 4 }), // Will be set when player picks their code
  player2Code: d.text({ length: 4 }), // Will be set when player picks their code
  currentRound: d.integer({ mode: "number" }).default(1).notNull(),
  winnerId: d
    .text()
    .references(() => user.id, { onDelete: "set null" }),
  status: d.text().default("code_selection").notNull(),
  createdAt: d
    .integer({ mode: "timestamp" })
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: d
    .integer({ mode: "timestamp" })
    .$defaultFn(() => new Date())
    .notNull(),
}));

export const gameMoves = createTable("game_move", (d) => ({
  id: d.text().primaryKey(),
  gameId: d
    .text()
    .notNull()
    .references(() => games.id, { onDelete: "cascade" }),
  playerId: d
    .text()
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  round: d.integer({ mode: "number" }).notNull(),
  guess: d.text({ length: 4 }).notNull(), // 4 emojis as indices "0123"
  bulls: d.integer({ mode: "number" }).notNull(),
  cows: d.integer({ mode: "number" }).notNull(),
  createdAt: d
    .integer({ mode: "timestamp" })
    .$defaultFn(() => new Date())
    .notNull(),
}));

// Add indexes for performance
export const gameRoomsIndex = index("game_rooms_code_idx").on(gameRooms.code);
export const gameMovesIndex = index("game_moves_game_round_idx").on(gameMoves.gameId, gameMoves.round);
