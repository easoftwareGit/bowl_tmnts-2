CREATE TABLE IF NOT EXISTS "users" (
	"id" uuid NOT NULL UNIQUE DEFAULT 'gen_random_uuid',
	"email" text NOT NULL UNIQUE,
	"pashword_hash" text NOT NULL,
	"first_name" varchar(255) NOT NULL,
	"last_name" text NOT NULL,
	"phone" text NOT NULL,
	"google" text NOT NULL,
	PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "tmnts" (
	"id" uuid NOT NULL UNIQUE DEFAULT 'gen_random_uuid',
	"user_id" uuid NOT NULL,
	"bowl_id" uuid NOT NULL,
	"tmnt_name" text NOT NULL,
	"city" text NOT NULL,
	"state" text NOT NULL,
	"start_date" text NOT NULL,
	"end_date" text NOT NULL,
	PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "events" (
	"id" uuid NOT NULL DEFAULT 'gen_random_uuid',
	"tmnt_id" uuid NOT NULL,
	"event_name" text NOT NULL,
	"team_size" bigint NOT NULL,
	"games" bigint NOT NULL,
	"entry_fee" numeric(10,0) NOT NULL,
	"lineage" numeric(10,0) NOT NULL,
	"prize-fund" numeric(10,0) NOT NULL,
	"other" numeric(10,0) NOT NULL,
	"expenses" numeric(10,0) NOT NULL,
	"added_money" numeric(10,0) NOT NULL,
	"sort_order" bigint NOT NULL,
	PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "squads" (
	"id" uuid NOT NULL DEFAULT 'gen_random_uuid',
	"event_id" uuid NOT NULL,
	"squad_name" text NOT NULL,
	"date" date NOT NULL,
	"time" time without time zone,
	"games" bigint NOT NULL,
	"sort_order" bigint NOT NULL,
	PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "divs" (
	"id" uuid NOT NULL DEFAULT 'gen_random_uuid',
	"tmnt_id" uuid NOT NULL,
	"div_name" text NOT NULL,
	"hdcp_per" varchar(255) NOT NULL,
	"sort_order" bigint NOT NULL,
	PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "hdcps" (
	"id" uuid NOT NULL DEFAULT 'gen_random_uuid',
	"div_id" uuid NOT NULL,
	"hdcp_from" bigint NOT NULL,
	"int_hdcp" boolean NOT NULL,
	"game" boolean NOT NULL,
	PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "players" (
	"id" uuid NOT NULL DEFAULT 'uuid_generate_v4',
	"tmnt_id" uuid NOT NULL,
	"first_name" text NOT NULL,
	"last_name" text NOT NULL,
	"average" bigint NOT NULL,
	"usbc" text NOT NULL,
	PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "entries" (
	"id" bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
	"player_id" uuid NOT NULL,
	"div_id" uuid NOT NULL,
	PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "games" (
	"id" bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
	"squad_id" uuid NOT NULL,
	"player_id" uuid NOT NULL,
	"game_num" bigint NOT NULL,
	"score" bigint NOT NULL,
	PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "bowls" (
	"id" uuid NOT NULL DEFAULT 'gen_random_uuid',
	"bowl_name" text NOT NULL,
	"city" text NOT NULL,
	"state" text NOT NULL,
	"url" text NOT NULL,
	PRIMARY KEY ("id")
);


ALTER TABLE "tmnts" ADD CONSTRAINT "tmnts_fk1" FOREIGN KEY ("user_id") REFERENCES "users"("id");

ALTER TABLE "tmnts" ADD CONSTRAINT "tmnts_fk2" FOREIGN KEY ("bowl_id") REFERENCES "bowls"("id");
ALTER TABLE "events" ADD CONSTRAINT "events_fk1" FOREIGN KEY ("tmnt_id") REFERENCES "tmnts"("id");
ALTER TABLE "squads" ADD CONSTRAINT "squads_fk1" FOREIGN KEY ("event_id") REFERENCES "events"("id");
ALTER TABLE "divs" ADD CONSTRAINT "divs_fk1" FOREIGN KEY ("tmnt_id") REFERENCES "tmnts"("id");
ALTER TABLE "hdcps" ADD CONSTRAINT "hdcps_fk1" FOREIGN KEY ("div_id") REFERENCES "divs"("id");
ALTER TABLE "players" ADD CONSTRAINT "players_fk1" FOREIGN KEY ("tmnt_id") REFERENCES "tmnts"("id");
ALTER TABLE "entries" ADD CONSTRAINT "entries_fk1" FOREIGN KEY ("player_id") REFERENCES "players"("id");

ALTER TABLE "entries" ADD CONSTRAINT "entries_fk2" FOREIGN KEY ("div_id") REFERENCES "divs"("id");
ALTER TABLE "games" ADD CONSTRAINT "games_fk1" FOREIGN KEY ("squad_id") REFERENCES "squads"("id");

ALTER TABLE "games" ADD CONSTRAINT "games_fk2" FOREIGN KEY ("player_id") REFERENCES "players"("id");
