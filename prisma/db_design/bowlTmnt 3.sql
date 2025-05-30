CREATE TABLE IF NOT EXISTS "brkt" (
	"id" serial NOT NULL UNIQUE,
	"squad_id" uuid NOT NULL,
	"div_id" uuid NOT NULL,
	"start" bigint NOT NULL,
	"games" bigint NOT NULL,
	"fee" numeric(10,0) NOT NULL,
	"first" numeric(10,0) NOT NULL,
	"second" numeric(10,0) NOT NULL,
	"admin" numeric(10,0) NOT NULL,
	PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "brkt_entry" (
	"id" serial NOT NULL UNIQUE,
	"brkt_id" uuid NOT NULL,
	"player_id" uuid NOT NULL,
	"brkts" bigint NOT NULL,
	PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "brkt_refund" (
	"id" serial NOT NULL UNIQUE,
	"brkt_id" uuid NOT NULL,
	"player_id" uuid NOT NULL,
	"refund" bigint NOT NULL,
	PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "brkt_match" (
	"id" serial NOT NULL UNIQUE,
	"brkt_id" uuid NOT NULL,
	"index" bigint NOT NULL,
	PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "brkt_seed" (
	"id" serial NOT NULL UNIQUE,
	"brkt_match_id" uuid NOT NULL,
	"player_id" uuid NOT NULL,
	"index" bigint NOT NULL,
	PRIMARY KEY ("id")
);


ALTER TABLE "brkt_entry" ADD CONSTRAINT "brkt_entry_fk1" FOREIGN KEY ("brkt_id") REFERENCES "brkt"("id");
ALTER TABLE "brkt_refund" ADD CONSTRAINT "brkt_refund_fk1" FOREIGN KEY ("brkt_id") REFERENCES "brkt"("id");
ALTER TABLE "brkt_match" ADD CONSTRAINT "brkt_match_fk1" FOREIGN KEY ("brkt_id") REFERENCES "brkt"("id");
ALTER TABLE "brkt_seed" ADD CONSTRAINT "brkt_seed_fk1" FOREIGN KEY ("brkt_match_id") REFERENCES "brkt_match"("id");