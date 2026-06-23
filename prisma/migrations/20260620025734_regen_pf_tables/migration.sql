-- AlterTable
ALTER TABLE "Bowl" ALTER COLUMN "id" SET DEFAULT concat('bwl_', replace(cast(gen_random_uuid() as text), '-', ''));

-- AlterTable
ALTER TABLE "Brkt" ALTER COLUMN "id" SET DEFAULT concat('brk_', replace(cast(gen_random_uuid() as text), '-', ''));

-- AlterTable
ALTER TABLE "Brkt_Entry" ALTER COLUMN "id" SET DEFAULT concat('bre_', replace(cast(gen_random_uuid() as text), '-', ''));

-- AlterTable
ALTER TABLE "Div" ALTER COLUMN "id" SET DEFAULT concat('div_', replace(cast(gen_random_uuid() as text), '-', ''));

-- AlterTable
ALTER TABLE "Div_Entry" ALTER COLUMN "id" SET DEFAULT concat('den_', replace(cast(gen_random_uuid() as text), '-', ''));

-- AlterTable
ALTER TABLE "Elim" ALTER COLUMN "id" SET DEFAULT concat('elm_', replace(cast(gen_random_uuid() as text), '-', ''));

-- AlterTable
ALTER TABLE "Elim_Entry" ALTER COLUMN "id" SET DEFAULT concat('ele_', replace(cast(gen_random_uuid() as text), '-', ''));

-- AlterTable
ALTER TABLE "Event" ALTER COLUMN "id" SET DEFAULT concat('evt_', replace(cast(gen_random_uuid() as text), '-', ''));

-- AlterTable
ALTER TABLE "Game" ALTER COLUMN "id" SET DEFAULT concat('gam_', replace(cast(gen_random_uuid() as text), '-', ''));

-- AlterTable
ALTER TABLE "Lane" ALTER COLUMN "id" SET DEFAULT concat('lan_', replace(cast(gen_random_uuid() as text), '-', ''));

-- AlterTable
ALTER TABLE "Money" ALTER COLUMN "id" SET DEFAULT concat('pri_', replace(cast(gen_random_uuid() as text), '-', ''));

-- AlterTable
ALTER TABLE "One_Brkt" ALTER COLUMN "id" SET DEFAULT concat('obk_', replace(cast(gen_random_uuid() as text), '-', ''));

-- AlterTable
ALTER TABLE "Payout" ALTER COLUMN "id" SET DEFAULT concat('pay_', replace(cast(gen_random_uuid() as text), '-', ''));

-- AlterTable
ALTER TABLE "Player" ALTER COLUMN "id" SET DEFAULT concat('ply_', replace(cast(gen_random_uuid() as text), '-', ''));

-- AlterTable
ALTER TABLE "Pot" ALTER COLUMN "id" SET DEFAULT concat('pot_', replace(cast(gen_random_uuid() as text), '-', ''));

-- AlterTable
ALTER TABLE "Pot_Entry" ALTER COLUMN "id" SET DEFAULT concat('pen_', replace(cast(gen_random_uuid() as text), '-', ''));

-- AlterTable
ALTER TABLE "Squad" ALTER COLUMN "id" SET DEFAULT concat('sqd_', replace(cast(gen_random_uuid() as text), '-', ''));

-- AlterTable
ALTER TABLE "Stage" ALTER COLUMN "id" SET DEFAULT concat('stg_', replace(cast(gen_random_uuid() as text), '-', ''));

-- AlterTable
ALTER TABLE "Tmnt" ALTER COLUMN "id" SET DEFAULT concat('tmt_', replace(cast(gen_random_uuid() as text), '-', ''));

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "id" SET DEFAULT concat('usr_', replace(cast(gen_random_uuid() as text), '-', ''));

-- CreateTable
CREATE TABLE "Event_PF" (
    "id" TEXT NOT NULL DEFAULT concat('epf_', replace(cast(gen_random_uuid() as text), '-', '')),
    "event_id" TEXT,
    "position" INTEGER NOT NULL,
    "amount" DECIMAL(9,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Event_PF_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pot_PF" (
    "id" TEXT NOT NULL DEFAULT concat('ppf_', replace(cast(gen_random_uuid() as text), '-', '')),
    "pot_id" TEXT,
    "game_num" INTEGER NOT NULL,
    "position" INTEGER NOT NULL,
    "amount" DECIMAL(9,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Pot_PF_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Elim_PF" (
    "id" TEXT NOT NULL DEFAULT concat('lpf_', replace(cast(gen_random_uuid() as text), '-', '')),
    "elim_id" TEXT,
    "position" INTEGER NOT NULL,
    "amount" DECIMAL(9,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Elim_PF_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Event_PF_event_id_position_key" ON "Event_PF"("event_id", "position");

-- CreateIndex
CREATE UNIQUE INDEX "Pot_PF_pot_id_game_num_position_key" ON "Pot_PF"("pot_id", "game_num", "position");

-- CreateIndex
CREATE UNIQUE INDEX "Elim_PF_elim_id_position_key" ON "Elim_PF"("elim_id", "position");

-- AddForeignKey
ALTER TABLE "Event_PF" ADD CONSTRAINT "Event_PF_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Pot_PF" ADD CONSTRAINT "Pot_PF_pot_id_fkey" FOREIGN KEY ("pot_id") REFERENCES "Pot"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Elim_PF" ADD CONSTRAINT "Elim_PF_elim_id_fkey" FOREIGN KEY ("elim_id") REFERENCES "Elim"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
