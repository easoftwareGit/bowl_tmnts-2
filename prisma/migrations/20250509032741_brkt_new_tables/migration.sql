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
ALTER TABLE "Player" ALTER COLUMN "id" SET DEFAULT concat('ply_', replace(cast(gen_random_uuid() as text), '-', ''));

-- AlterTable
ALTER TABLE "Pot" ALTER COLUMN "id" SET DEFAULT concat('pot_', replace(cast(gen_random_uuid() as text), '-', ''));

-- AlterTable
ALTER TABLE "Pot_Entry" ALTER COLUMN "id" SET DEFAULT concat('pen_', replace(cast(gen_random_uuid() as text), '-', ''));

-- AlterTable
ALTER TABLE "Squad" ALTER COLUMN "id" SET DEFAULT concat('sqd_', replace(cast(gen_random_uuid() as text), '-', ''));

-- AlterTable
ALTER TABLE "Tmnt" ALTER COLUMN "id" SET DEFAULT concat('tmt_', replace(cast(gen_random_uuid() as text), '-', ''));

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "id" SET DEFAULT concat('usr_', replace(cast(gen_random_uuid() as text), '-', ''));

-- CreateTable
CREATE TABLE "Brkt_Refund" (
    "id" TEXT NOT NULL DEFAULT concat('brf_', replace(cast(gen_random_uuid() as text), '-', '')),
    "brkt_id" TEXT NOT NULL,
    "player_id" TEXT NOT NULL,
    "num_refunds" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Brkt_Refund_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Brkt_Match" (
    "id" TEXT NOT NULL DEFAULT concat('bmt_', replace(cast(gen_random_uuid() as text), '-', '')),
    "brkt_id" TEXT NOT NULL,
    "index" INTEGER NOT NULL,

    CONSTRAINT "Brkt_Match_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Brkt_Seed" (
    "id" TEXT NOT NULL DEFAULT concat('brf_', replace(cast(gen_random_uuid() as text), '-', '')),
    "brkt_id" TEXT NOT NULL,
    "player_id" TEXT NOT NULL,
    "index" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Brkt_Seed_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Brkt_Refund_brkt_id_player_id_key" ON "Brkt_Refund"("brkt_id", "player_id");

-- CreateIndex
CREATE UNIQUE INDEX "Brkt_Match_brkt_id_index_key" ON "Brkt_Match"("brkt_id", "index");

-- CreateIndex
CREATE UNIQUE INDEX "Brkt_Seed_brkt_id_player_id_index_key" ON "Brkt_Seed"("brkt_id", "player_id", "index");

-- AddForeignKey
ALTER TABLE "Brkt_Refund" ADD CONSTRAINT "Brkt_Refund_brkt_id_fkey" FOREIGN KEY ("brkt_id") REFERENCES "Brkt"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Brkt_Refund" ADD CONSTRAINT "Brkt_Refund_player_id_fkey" FOREIGN KEY ("player_id") REFERENCES "Player"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Brkt_Match" ADD CONSTRAINT "Brkt_Match_brkt_id_fkey" FOREIGN KEY ("brkt_id") REFERENCES "Brkt"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Brkt_Seed" ADD CONSTRAINT "Brkt_Seed_brkt_id_fkey" FOREIGN KEY ("brkt_id") REFERENCES "Brkt"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Brkt_Seed" ADD CONSTRAINT "Brkt_Seed_player_id_fkey" FOREIGN KEY ("player_id") REFERENCES "Player"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
