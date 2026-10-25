import { sql } from "drizzle-orm";
import { index, integer, primaryKey, real, sqliteTable, text } from "drizzle-orm/sqlite-core";

// user_id stays empty until there are accounts; it saves a data migration when the app goes public.
const createdAt = () => text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`);

export const people = sqliteTable("people", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id"),
  name: text("name").notNull(),
  closeness: integer("closeness").notNull(), // 1 = closest; see lib/tiers.ts
  color: integer("color").notNull(), // index into lib/person-colors.ts
  notes: text("notes").notNull().default(""),
  createdAt: createdAt(),
});

export const entries = sqliteTable("entries", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id"),
  body: text("body").notNull(),
  date: text("date").notNull(), // YYYY-MM-DD
  createdAt: createdAt(),
});

// Who a moment is with. No rows means a solo moment.
export const entryPeople = sqliteTable(
  "entry_people",
  {
    entryId: integer("entry_id").notNull().references(() => entries.id, { onDelete: "cascade" }),
    personId: integer("person_id").notNull().references(() => people.id, { onDelete: "cascade" }),
  },
  // The primary key covers lookups by entry; the index covers a person's timeline.
  (t) => [primaryKey({ columns: [t.entryId, t.personId] }), index("entry_people_person_id").on(t.personId)],
);

export const places = sqliteTable("places", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id"),
  name: text("name").notNull(),
  area: text("area").notNull().default(""),
  lat: real("lat").notNull(),
  lng: real("lng").notNull(),
  createdAt: createdAt(),
});

export const personPlaces = sqliteTable(
  "person_places",
  {
    personId: integer("person_id").notNull().references(() => people.id, { onDelete: "cascade" }),
    placeId: integer("place_id").notNull().references(() => places.id, { onDelete: "cascade" }),
  },
  // The primary key covers lookups by person; the index covers who goes to a place.
  (t) => [primaryKey({ columns: [t.personId, t.placeId] }), index("person_places_place_id").on(t.placeId)],
);
