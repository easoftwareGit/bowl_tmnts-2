/*
  Warnings:

  - The primary key for the `Brkt_Refund` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `brkt_id` on the `Brkt_Refund` table. All the data in the column will be lost.
  - You are about to drop the column `id` on the `Brkt_Refund` table. All the data in the column will be lost.
  - You are about to drop the column `player_id` on the `Brkt_Refund` table. All the data in the column will be lost.
  - The primary key for the `Brkt_Seed` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `brkt_id` on the `Brkt_Seed` table. All the data in the column will be lost.
  - You are about to drop the column `id` on the `Brkt_Seed` table. All the data in the column will be lost.
  - You are about to drop the column `index` on the `Brkt_Seed` table. All the data in the column will be lost.
  - You are about to drop the `Brkt_Match` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[brkt_entry_id]` on the table `Brkt_Refund` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[one_brkt_id,player_id]` on the table `Brkt_Seed` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `brkt_entry_id` to the `Brkt_Refund` table without a default value. This is not possible if the table is not empty.
  - Added the required column `one_brkt_id` to the `Brkt_Seed` table without a default value. This is not possible if the table is not empty.
  - Added the required column `seed` to the `Brkt_Seed` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Brkt_Match" DROP CONSTRAINT "Brkt_Match_brkt_id_fkey";

-- DropForeignKey
ALTER TABLE "Brkt_Refund" DROP CONSTRAINT "Brkt_Refund_brkt_id_fkey";

-- DropForeignKey
ALTER TABLE "Brkt_Refund" DROP CONSTRAINT "Brkt_Refund_player_id_fkey";

-- DropForeignKey
ALTER TABLE "Brkt_Seed" DROP CONSTRAINT "Brkt_Seed_brkt_id_fkey";

-- DropForeignKey
ALTER TABLE "Tmnt" DROP CONSTRAINT "Tmnt_bowl_id_fkey";

-- DropForeignKey
ALTER TABLE "Tmnt" DROP CONSTRAINT "Tmnt_user_id_fkey";

-- DropIndex
DROP INDEX "Brkt_Refund_brkt_id_player_id_key";

-- DropIndex
DROP INDEX "Brkt_Seed_brkt_id_player_id_index_key";

-- AlterTable
ALTER TABLE "Bowl" ALTER COLUMN "id" SET DEFAULT concat('bwl_', replace(cast(gen_random_uuid() as text), '-', ''));

-- AlterTable
ALTER TABLE "Brkt" ALTER COLUMN "id" SET DEFAULT concat('brk_', replace(cast(gen_random_uuid() as text), '-', ''));

-- AlterTable
ALTER TABLE "Brkt_Entry" ALTER COLUMN "id" SET DEFAULT concat('bre_', replace(cast(gen_random_uuid() as text), '-', ''));

-- AlterTable
ALTER TABLE "Brkt_Refund" DROP CONSTRAINT "Brkt_Refund_pkey",
DROP COLUMN "brkt_id",
DROP COLUMN "id",
DROP COLUMN "player_id",
ADD COLUMN     "brkt_entry_id" TEXT NOT NULL,
ADD CONSTRAINT "Brkt_Refund_pkey" PRIMARY KEY ("brkt_entry_id");

-- AlterTable
ALTER TABLE "Brkt_Seed" DROP CONSTRAINT "Brkt_Seed_pkey",
DROP COLUMN "brkt_id",
DROP COLUMN "id",
DROP COLUMN "index",
ADD COLUMN     "one_brkt_id" TEXT NOT NULL,
ADD COLUMN     "seed" INTEGER NOT NULL,
ADD CONSTRAINT "Brkt_Seed_pkey" PRIMARY KEY ("one_brkt_id", "seed");

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
ALTER TABLE "Player" ALTER COLUMN "id" SET DEFAULT concat('ply_', replace(cast(gen_random_uuid() as text), '-', '')),
ALTER COLUMN "last_name" DROP NOT NULL,
ALTER COLUMN "lane" DROP NOT NULL,
ALTER COLUMN "position" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Pot" ALTER COLUMN "id" SET DEFAULT concat('pot_', replace(cast(gen_random_uuid() as text), '-', ''));

-- AlterTable
ALTER TABLE "Pot_Entry" ALTER COLUMN "id" SET DEFAULT concat('pen_', replace(cast(gen_random_uuid() as text), '-', ''));

-- AlterTable
ALTER TABLE "Squad" ADD COLUMN     "finalized" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "id" SET DEFAULT concat('sqd_', replace(cast(gen_random_uuid() as text), '-', ''));

-- AlterTable
ALTER TABLE "Tmnt" ALTER COLUMN "id" SET DEFAULT concat('tmt_', replace(cast(gen_random_uuid() as text), '-', ''));

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "id" SET DEFAULT concat('usr_', replace(cast(gen_random_uuid() as text), '-', ''));

-- DropTable
DROP TABLE "Brkt_Match";

-- CreateTable
CREATE TABLE "One_Brkt" (
    "id" TEXT NOT NULL DEFAULT concat('obk_', replace(cast(gen_random_uuid() as text), '-', '')),
    "brkt_id" TEXT NOT NULL,
    "bindex" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "One_Brkt_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "One_Brkt_brkt_id_bindex_key" ON "One_Brkt"("brkt_id", "bindex");

-- CreateIndex
CREATE UNIQUE INDEX "Brkt_Refund_brkt_entry_id_key" ON "Brkt_Refund"("brkt_entry_id");

-- CreateIndex
CREATE UNIQUE INDEX "Brkt_Seed_one_brkt_id_player_id_key" ON "Brkt_Seed"("one_brkt_id", "player_id");

-- AddForeignKey
ALTER TABLE "Tmnt" ADD CONSTRAINT "Tmnt_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Tmnt" ADD CONSTRAINT "Tmnt_bowl_id_fkey" FOREIGN KEY ("bowl_id") REFERENCES "Bowl"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Brkt_Refund" ADD CONSTRAINT "Brkt_Refund_brkt_entry_id_fkey" FOREIGN KEY ("brkt_entry_id") REFERENCES "Brkt_Entry"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "One_Brkt" ADD CONSTRAINT "One_Brkt_brkt_id_fkey" FOREIGN KEY ("brkt_id") REFERENCES "Brkt"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Brkt_Seed" ADD CONSTRAINT "Brkt_Seed_one_brkt_id_fkey" FOREIGN KEY ("one_brkt_id") REFERENCES "One_Brkt"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
