/*
  Warnings:

  - You are about to drop the column `tmnt_id` on the `Player` table. All the data in the column will be lost.
  - You are about to drop the `Entry` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Lane_asmt` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `lane` to the `Player` table without a default value. This is not possible if the table is not empty.
  - Added the required column `position` to the `Player` table without a default value. This is not possible if the table is not empty.
  - Added the required column `squad_id` to the `Player` table without a default value. This is not possible if the table is not empty.
  - Made the column `average` on table `Player` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Entry" DROP CONSTRAINT "Entry_div_id_fkey";

-- DropForeignKey
ALTER TABLE "Entry" DROP CONSTRAINT "Entry_player_id_fkey";

-- DropForeignKey
ALTER TABLE "Lane_asmt" DROP CONSTRAINT "Lane_asmt_player_id_fkey";

-- DropForeignKey
ALTER TABLE "Lane_asmt" DROP CONSTRAINT "Lane_asmt_squad_id_fkey";

-- DropForeignKey
ALTER TABLE "Player" DROP CONSTRAINT "Player_tmnt_id_fkey";

-- AlterTable
ALTER TABLE "Bowl" ALTER COLUMN "id" SET DEFAULT concat('bwl_', replace(cast(gen_random_uuid() as text), '-', ''));

-- AlterTable
ALTER TABLE "Brkt" ALTER COLUMN "id" SET DEFAULT concat('brk_', replace(cast(gen_random_uuid() as text), '-', ''));

-- AlterTable
ALTER TABLE "Div" ALTER COLUMN "id" SET DEFAULT concat('div_', replace(cast(gen_random_uuid() as text), '-', ''));

-- AlterTable
ALTER TABLE "Elim" ALTER COLUMN "id" SET DEFAULT concat('elm_', replace(cast(gen_random_uuid() as text), '-', ''));

-- AlterTable
ALTER TABLE "Event" ALTER COLUMN "id" SET DEFAULT concat('evt_', replace(cast(gen_random_uuid() as text), '-', ''));

-- AlterTable
ALTER TABLE "Lane" ALTER COLUMN "id" SET DEFAULT concat('lan_', replace(cast(gen_random_uuid() as text), '-', ''));

-- AlterTable
ALTER TABLE "Player" DROP COLUMN "tmnt_id",
ADD COLUMN     "lane" INTEGER NOT NULL,
ADD COLUMN     "position" VARCHAR NOT NULL,
ADD COLUMN     "squad_id" TEXT NOT NULL,
ALTER COLUMN "id" SET DEFAULT concat('ply_', replace(cast(gen_random_uuid() as text), '-', '')),
ALTER COLUMN "average" SET NOT NULL;

-- AlterTable
ALTER TABLE "Pot" ALTER COLUMN "id" SET DEFAULT concat('pot_', replace(cast(gen_random_uuid() as text), '-', ''));

-- AlterTable
ALTER TABLE "Squad" ALTER COLUMN "id" SET DEFAULT concat('sqd_', replace(cast(gen_random_uuid() as text), '-', ''));

-- AlterTable
ALTER TABLE "Tmnt" ALTER COLUMN "id" SET DEFAULT concat('tmt_', replace(cast(gen_random_uuid() as text), '-', ''));

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "id" SET DEFAULT concat('usr_', replace(cast(gen_random_uuid() as text), '-', ''));

-- DropTable
DROP TABLE "Entry";

-- DropTable
DROP TABLE "Lane_asmt";

-- CreateTable
CREATE TABLE "Div_Entry" (
    "id" TEXT NOT NULL DEFAULT concat('den_', replace(cast(gen_random_uuid() as text), '-', '')),
    "squad_id" TEXT NOT NULL,
    "div_id" TEXT NOT NULL,
    "player_id" TEXT NOT NULL,
    "amount" DECIMAL(9,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Div_Entry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pot_Entry" (
    "id" TEXT NOT NULL DEFAULT concat('pen_', replace(cast(gen_random_uuid() as text), '-', '')),
    "pot_id" TEXT NOT NULL,
    "player_id" TEXT NOT NULL,
    "amount" DECIMAL(9,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Pot_Entry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Brkt_Entry" (
    "id" TEXT NOT NULL DEFAULT concat('bre_', replace(cast(gen_random_uuid() as text), '-', '')),
    "brkt_id" TEXT NOT NULL,
    "player_id" TEXT NOT NULL,
    "brackets" INTEGER NOT NULL,
    "amount" DECIMAL(9,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Brkt_Entry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Elim_Entry" (
    "id" TEXT NOT NULL DEFAULT concat('ele_', replace(cast(gen_random_uuid() as text), '-', '')),
    "elim_id" TEXT NOT NULL,
    "player_id" TEXT NOT NULL,
    "amount" DECIMAL(9,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Elim_Entry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Div_Entry_squad_id_div_id_player_id_key" ON "Div_Entry"("squad_id", "div_id", "player_id");

-- CreateIndex
CREATE UNIQUE INDEX "Pot_Entry_pot_id_player_id_key" ON "Pot_Entry"("pot_id", "player_id");

-- CreateIndex
CREATE UNIQUE INDEX "Brkt_Entry_brkt_id_player_id_key" ON "Brkt_Entry"("brkt_id", "player_id");

-- CreateIndex
CREATE UNIQUE INDEX "Elim_Entry_elim_id_player_id_key" ON "Elim_Entry"("elim_id", "player_id");

-- AddForeignKey
ALTER TABLE "Player" ADD CONSTRAINT "Player_squad_id_fkey" FOREIGN KEY ("squad_id") REFERENCES "Squad"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Div_Entry" ADD CONSTRAINT "Div_Entry_div_id_fkey" FOREIGN KEY ("div_id") REFERENCES "Div"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Div_Entry" ADD CONSTRAINT "Div_Entry_squad_id_fkey" FOREIGN KEY ("squad_id") REFERENCES "Squad"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Div_Entry" ADD CONSTRAINT "Div_Entry_player_id_fkey" FOREIGN KEY ("player_id") REFERENCES "Player"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pot_Entry" ADD CONSTRAINT "Pot_Entry_pot_id_fkey" FOREIGN KEY ("pot_id") REFERENCES "Pot"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pot_Entry" ADD CONSTRAINT "Pot_Entry_player_id_fkey" FOREIGN KEY ("player_id") REFERENCES "Player"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Brkt_Entry" ADD CONSTRAINT "Brkt_Entry_brkt_id_fkey" FOREIGN KEY ("brkt_id") REFERENCES "Brkt"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Brkt_Entry" ADD CONSTRAINT "Brkt_Entry_player_id_fkey" FOREIGN KEY ("player_id") REFERENCES "Player"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Elim_Entry" ADD CONSTRAINT "Elim_Entry_elim_id_fkey" FOREIGN KEY ("elim_id") REFERENCES "Elim"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Elim_Entry" ADD CONSTRAINT "Elim_Entry_player_id_fkey" FOREIGN KEY ("player_id") REFERENCES "Player"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
