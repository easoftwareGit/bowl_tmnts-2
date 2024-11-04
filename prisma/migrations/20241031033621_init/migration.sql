-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL DEFAULT concat('usr_', replace(cast(gen_random_uuid() as text), '-', '')),
    "email" VARCHAR NOT NULL,
    "password_hash" TEXT,
    "first_name" VARCHAR NOT NULL,
    "last_name" VARCHAR NOT NULL,
    "phone" VARCHAR,
    "role" TEXT NOT NULL DEFAULT 'USER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Bowl" (
    "id" TEXT NOT NULL DEFAULT concat('bwl_', replace(cast(gen_random_uuid() as text), '-', '')),
    "bowl_name" VARCHAR NOT NULL,
    "city" VARCHAR NOT NULL,
    "state" VARCHAR NOT NULL,
    "url" VARCHAR NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Bowl_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tmnt" (
    "id" TEXT NOT NULL DEFAULT concat('tmt_', replace(cast(gen_random_uuid() as text), '-', '')),
    "tmnt_name" TEXT NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "user_id" TEXT NOT NULL,
    "bowl_id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Tmnt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Event" (
    "id" TEXT NOT NULL DEFAULT concat('evt_', replace(cast(gen_random_uuid() as text), '-', '')),
    "tmnt_id" TEXT NOT NULL,
    "event_name" TEXT NOT NULL,
    "team_size" INTEGER NOT NULL,
    "games" INTEGER NOT NULL,
    "entry_fee" DECIMAL(9,2) NOT NULL,
    "lineage" DECIMAL(9,2) NOT NULL,
    "prize_fund" DECIMAL(9,2) NOT NULL,
    "other" DECIMAL(9,2) NOT NULL,
    "expenses" DECIMAL(9,2) NOT NULL,
    "added_money" DECIMAL(9,2) NOT NULL,
    "sort_order" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Div" (
    "id" TEXT NOT NULL DEFAULT concat('div_', replace(cast(gen_random_uuid() as text), '-', '')),
    "tmnt_id" TEXT NOT NULL,
    "div_name" TEXT NOT NULL,
    "hdcp_per" DOUBLE PRECISION NOT NULL,
    "hdcp_from" INTEGER NOT NULL,
    "int_hdcp" BOOLEAN NOT NULL DEFAULT true,
    "hdcp_for" TEXT NOT NULL DEFAULT 'Game',
    "sort_order" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Div_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Squad" (
    "id" TEXT NOT NULL DEFAULT concat('sqd_', replace(cast(gen_random_uuid() as text), '-', '')),
    "event_id" TEXT NOT NULL,
    "squad_name" TEXT NOT NULL,
    "squad_date" TIMESTAMP(3) NOT NULL,
    "squad_time" TEXT,
    "games" INTEGER NOT NULL,
    "lane_count" INTEGER NOT NULL,
    "starting_lane" INTEGER NOT NULL,
    "sort_order" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Squad_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Lane" (
    "id" TEXT NOT NULL DEFAULT concat('lan_', replace(cast(gen_random_uuid() as text), '-', '')),
    "lane_number" INTEGER NOT NULL,
    "squad_id" TEXT NOT NULL,
    "in_use" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Lane_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pot" (
    "id" TEXT NOT NULL DEFAULT concat('pot_', replace(cast(gen_random_uuid() as text), '-', '')),
    "squad_id" TEXT NOT NULL,
    "div_id" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL,
    "fee" DECIMAL(9,2) NOT NULL,
    "pot_type" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Pot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Brkt" (
    "id" TEXT NOT NULL DEFAULT concat('brk_', replace(cast(gen_random_uuid() as text), '-', '')),
    "squad_id" TEXT NOT NULL,
    "div_id" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL,
    "start" INTEGER NOT NULL,
    "games" INTEGER NOT NULL,
    "players" INTEGER NOT NULL,
    "fee" DECIMAL(9,2) NOT NULL,
    "first" DECIMAL(9,2) NOT NULL,
    "second" DECIMAL(9,2) NOT NULL,
    "admin" DECIMAL(9,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Brkt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Elim" (
    "id" TEXT NOT NULL DEFAULT concat('elm_', replace(cast(gen_random_uuid() as text), '-', '')),
    "squad_id" TEXT NOT NULL,
    "div_id" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL,
    "start" INTEGER NOT NULL,
    "games" INTEGER NOT NULL,
    "fee" DECIMAL(9,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Elim_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Player" (
    "id" TEXT NOT NULL DEFAULT concat('ply_', replace(cast(gen_random_uuid() as text), '-', '')),
    "tmnt_id" TEXT NOT NULL,
    "first_name" VARCHAR NOT NULL,
    "last_name" VARCHAR NOT NULL,
    "average" INTEGER,
    "usbc" VARCHAR,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Player_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Entry" (
    "id" SERIAL NOT NULL,
    "player_id" TEXT NOT NULL,
    "div_id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Entry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Game" (
    "id" SERIAL NOT NULL,
    "squad_id" TEXT NOT NULL,
    "player_id" TEXT NOT NULL,
    "game_num" INTEGER NOT NULL,
    "score" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Game_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Lane_asmt" (
    "id" SERIAL NOT NULL,
    "lane" INTEGER NOT NULL,
    "player_id" TEXT NOT NULL,
    "squad_id" TEXT NOT NULL,
    "position" VARCHAR NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Lane_asmt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "testDate" (
    "id" SERIAL NOT NULL,
    "sod" TIMESTAMP(3) NOT NULL,
    "eod" TIMESTAMP(3) NOT NULL,
    "gmt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "testDate_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_idx" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Event_tmnt_id_event_name_key" ON "Event"("tmnt_id", "event_name");

-- CreateIndex
CREATE UNIQUE INDEX "Div_tmnt_id_div_name_key" ON "Div"("tmnt_id", "div_name");

-- CreateIndex
CREATE UNIQUE INDEX "Squad_event_id_squad_name_key" ON "Squad"("event_id", "squad_name");

-- CreateIndex
CREATE UNIQUE INDEX "Lane_squad_id_lane_number_key" ON "Lane"("squad_id", "lane_number");

-- CreateIndex
CREATE UNIQUE INDEX "Pot_div_id_pot_type_key" ON "Pot"("div_id", "pot_type");

-- CreateIndex
CREATE UNIQUE INDEX "Brkt_div_id_start_key" ON "Brkt"("div_id", "start");

-- CreateIndex
CREATE UNIQUE INDEX "Elim_div_id_start_games_key" ON "Elim"("div_id", "start", "games");

-- CreateIndex
CREATE UNIQUE INDEX "Entry_player_id_div_id_key" ON "Entry"("player_id", "div_id");

-- CreateIndex
CREATE UNIQUE INDEX "Game_squad_id_player_id_game_num_key" ON "Game"("squad_id", "player_id", "game_num");

-- CreateIndex
CREATE UNIQUE INDEX "Lane_asmt_lane_position_key" ON "Lane_asmt"("lane", "position");

-- CreateIndex
CREATE UNIQUE INDEX "Lane_asmt_player_id_squad_id_key" ON "Lane_asmt"("player_id", "squad_id");

-- AddForeignKey
ALTER TABLE "Tmnt" ADD CONSTRAINT "Tmnt_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Tmnt" ADD CONSTRAINT "Tmnt_bowl_id_fkey" FOREIGN KEY ("bowl_id") REFERENCES "Bowl"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_tmnt_id_fkey" FOREIGN KEY ("tmnt_id") REFERENCES "Tmnt"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Div" ADD CONSTRAINT "Div_tmnt_id_fkey" FOREIGN KEY ("tmnt_id") REFERENCES "Tmnt"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Squad" ADD CONSTRAINT "Squad_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "Event"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Lane" ADD CONSTRAINT "Lane_squad_id_fkey" FOREIGN KEY ("squad_id") REFERENCES "Squad"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pot" ADD CONSTRAINT "Pot_div_id_fkey" FOREIGN KEY ("div_id") REFERENCES "Div"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pot" ADD CONSTRAINT "Pot_squad_id_fkey" FOREIGN KEY ("squad_id") REFERENCES "Squad"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Brkt" ADD CONSTRAINT "Brkt_div_id_fkey" FOREIGN KEY ("div_id") REFERENCES "Div"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Brkt" ADD CONSTRAINT "Brkt_squad_id_fkey" FOREIGN KEY ("squad_id") REFERENCES "Squad"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Elim" ADD CONSTRAINT "Elim_div_id_fkey" FOREIGN KEY ("div_id") REFERENCES "Div"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Elim" ADD CONSTRAINT "Elim_squad_id_fkey" FOREIGN KEY ("squad_id") REFERENCES "Squad"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Player" ADD CONSTRAINT "Player_tmnt_id_fkey" FOREIGN KEY ("tmnt_id") REFERENCES "Tmnt"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Entry" ADD CONSTRAINT "Entry_div_id_fkey" FOREIGN KEY ("div_id") REFERENCES "Div"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Entry" ADD CONSTRAINT "Entry_player_id_fkey" FOREIGN KEY ("player_id") REFERENCES "Player"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Game" ADD CONSTRAINT "Game_player_id_fkey" FOREIGN KEY ("player_id") REFERENCES "Player"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Lane_asmt" ADD CONSTRAINT "Lane_asmt_player_id_fkey" FOREIGN KEY ("player_id") REFERENCES "Player"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Lane_asmt" ADD CONSTRAINT "Lane_asmt_squad_id_fkey" FOREIGN KEY ("squad_id") REFERENCES "Squad"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
