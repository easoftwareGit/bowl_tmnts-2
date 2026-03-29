/*
  Warnings:

  - A unique constraint covering the columns `[squad_id]` on the table `Stage` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterEnum
ALTER TYPE "SquadStage" ADD VALUE 'ERROR';

-- AlterTable
ALTER TABLE "Bowl" ALTER COLUMN "id" SET DEFAULT concat('bwl_', replace(cast(gen_random_uuid() as text), '-', '')),
ALTER COLUMN "bowl_name" SET DATA TYPE TEXT,
ALTER COLUMN "city" SET DATA TYPE TEXT,
ALTER COLUMN "state" SET DATA TYPE TEXT,
ALTER COLUMN "url" SET DATA TYPE TEXT;

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
ALTER TABLE "One_Brkt" ALTER COLUMN "id" SET DEFAULT concat('obk_', replace(cast(gen_random_uuid() as text), '-', ''));

-- AlterTable
ALTER TABLE "Player" ALTER COLUMN "id" SET DEFAULT concat('ply_', replace(cast(gen_random_uuid() as text), '-', '')),
ALTER COLUMN "first_name" SET DATA TYPE TEXT,
ALTER COLUMN "last_name" SET DATA TYPE TEXT,
ALTER COLUMN "usbc" SET DATA TYPE TEXT,
ALTER COLUMN "position" SET DATA TYPE TEXT;

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
ALTER TABLE "User" ALTER COLUMN "id" SET DEFAULT concat('usr_', replace(cast(gen_random_uuid() as text), '-', '')),
ALTER COLUMN "email" SET DATA TYPE TEXT,
ALTER COLUMN "first_name" SET DATA TYPE TEXT,
ALTER COLUMN "last_name" SET DATA TYPE TEXT,
ALTER COLUMN "phone" SET DATA TYPE TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Stage_squad_id_key" ON "Stage"("squad_id");
