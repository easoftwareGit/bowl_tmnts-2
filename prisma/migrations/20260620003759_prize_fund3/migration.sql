/*
  Warnings:

  - You are about to drop the column `money_id` on the `Prize_Fund` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Prize_Fund" DROP CONSTRAINT "Prize_Fund_money_id_fkey";

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
ALTER TABLE "Prize_Fund" DROP COLUMN "money_id",
ADD COLUMN     "elim_id" TEXT,
ADD COLUMN     "event_id" TEXT,
ADD COLUMN     "pot_id" TEXT,
ALTER COLUMN "id" SET DEFAULT concat('prf_', replace(cast(gen_random_uuid() as text), '-', ''));

-- AlterTable
ALTER TABLE "Squad" ALTER COLUMN "id" SET DEFAULT concat('sqd_', replace(cast(gen_random_uuid() as text), '-', ''));

-- AlterTable
ALTER TABLE "Stage" ALTER COLUMN "id" SET DEFAULT concat('stg_', replace(cast(gen_random_uuid() as text), '-', ''));

-- AlterTable
ALTER TABLE "Tmnt" ALTER COLUMN "id" SET DEFAULT concat('tmt_', replace(cast(gen_random_uuid() as text), '-', ''));

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "id" SET DEFAULT concat('usr_', replace(cast(gen_random_uuid() as text), '-', ''));

-- AddForeignKey
ALTER TABLE "Prize_Fund" ADD CONSTRAINT "Prize_Fund_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Prize_Fund" ADD CONSTRAINT "Prize_Fund_pot_id_fkey" FOREIGN KEY ("pot_id") REFERENCES "Pot"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Prize_Fund" ADD CONSTRAINT "Prize_Fund_elim_id_fkey" FOREIGN KEY ("elim_id") REFERENCES "Elim"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- Constraints
ALTER TABLE "Prize_Fund"
ADD CONSTRAINT "Prize_Fund_exactly_one_parent"
CHECK (
  (
    CASE WHEN event_id IS NOT NULL THEN 1 ELSE 0 END +
    CASE WHEN pot_id IS NOT NULL THEN 1 ELSE 0 END +
    CASE WHEN elim_id IS NOT NULL THEN 1 ELSE 0 END
  ) = 1
);