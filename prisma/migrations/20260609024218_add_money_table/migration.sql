-- CreateEnum
CREATE TYPE "MoneyDescrip" AS ENUM ('ENTRIES', 'PRIZEFUND', 'LINEAGE', 'EXPENSES', 'ADDED', 'OTHER');

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
ALTER TABLE "One_Brkt" ALTER COLUMN "id" SET DEFAULT concat('obk_', replace(cast(gen_random_uuid() as text), '-', ''));

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
CREATE TABLE "Money" (
    "id" TEXT NOT NULL DEFAULT concat('pri_', replace(cast(gen_random_uuid() as text), '-', '')),
    "event_id" TEXT NOT NULL,
    "squad_id" TEXT NOT NULL,
    "div_id" TEXT NOT NULL,
    "descrip" "MoneyDescrip" NOT NULL,
    "amount" DECIMAL(9,2) NOT NULL,
    "pot_id" TEXT,
    "brkt_id" TEXT,
    "elim_id" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Money_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payout" (
    "id" TEXT NOT NULL DEFAULT concat('pay_', replace(cast(gen_random_uuid() as text), '-', '')),
    "money_id" TEXT NOT NULL,
    "fee" DECIMAL(9,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Payout_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Money" ADD CONSTRAINT "Money_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Money" ADD CONSTRAINT "Money_squad_id_fkey" FOREIGN KEY ("squad_id") REFERENCES "Squad"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Money" ADD CONSTRAINT "Money_div_id_fkey" FOREIGN KEY ("div_id") REFERENCES "Div"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Money" ADD CONSTRAINT "Money_pot_id_fkey" FOREIGN KEY ("pot_id") REFERENCES "Pot"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Money" ADD CONSTRAINT "Money_brkt_id_fkey" FOREIGN KEY ("brkt_id") REFERENCES "Brkt"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Money" ADD CONSTRAINT "Money_elim_id_fkey" FOREIGN KEY ("elim_id") REFERENCES "Elim"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddConstraint - only one can be set of: pot_id, brkt_id, elim_id. all null is OK
ALTER TABLE "Money"
ADD CONSTRAINT "Money_only_one_source_check"
CHECK (
  (CASE WHEN "pot_id" IS NOT NULL THEN 1 ELSE 0 END) +
  (CASE WHEN "brkt_id" IS NOT NULL THEN 1 ELSE 0 END) +
  (CASE WHEN "elim_id" IS NOT NULL THEN 1 ELSE 0 END)
  <= 1
);

-- AddForeignKey
ALTER TABLE "Payout" ADD CONSTRAINT "Payout_money_id_fkey" FOREIGN KEY ("money_id") REFERENCES "Money"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

