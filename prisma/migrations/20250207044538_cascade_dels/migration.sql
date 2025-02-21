-- DropForeignKey
ALTER TABLE "Brkt" DROP CONSTRAINT "Brkt_div_id_fkey";

-- DropForeignKey
ALTER TABLE "Brkt" DROP CONSTRAINT "Brkt_squad_id_fkey";

-- DropForeignKey
ALTER TABLE "Brkt_Entry" DROP CONSTRAINT "Brkt_Entry_brkt_id_fkey";

-- DropForeignKey
ALTER TABLE "Brkt_Entry" DROP CONSTRAINT "Brkt_Entry_player_id_fkey";

-- DropForeignKey
ALTER TABLE "Div" DROP CONSTRAINT "Div_tmnt_id_fkey";

-- DropForeignKey
ALTER TABLE "Div_Entry" DROP CONSTRAINT "Div_Entry_div_id_fkey";

-- DropForeignKey
ALTER TABLE "Div_Entry" DROP CONSTRAINT "Div_Entry_player_id_fkey";

-- DropForeignKey
ALTER TABLE "Div_Entry" DROP CONSTRAINT "Div_Entry_squad_id_fkey";

-- DropForeignKey
ALTER TABLE "Elim" DROP CONSTRAINT "Elim_div_id_fkey";

-- DropForeignKey
ALTER TABLE "Elim" DROP CONSTRAINT "Elim_squad_id_fkey";

-- DropForeignKey
ALTER TABLE "Elim_Entry" DROP CONSTRAINT "Elim_Entry_elim_id_fkey";

-- DropForeignKey
ALTER TABLE "Elim_Entry" DROP CONSTRAINT "Elim_Entry_player_id_fkey";

-- DropForeignKey
ALTER TABLE "Game" DROP CONSTRAINT "Game_player_id_fkey";

-- DropForeignKey
ALTER TABLE "Lane" DROP CONSTRAINT "Lane_squad_id_fkey";

-- DropForeignKey
ALTER TABLE "Player" DROP CONSTRAINT "Player_squad_id_fkey";

-- DropForeignKey
ALTER TABLE "Pot" DROP CONSTRAINT "Pot_div_id_fkey";

-- DropForeignKey
ALTER TABLE "Pot" DROP CONSTRAINT "Pot_squad_id_fkey";

-- DropForeignKey
ALTER TABLE "Pot_Entry" DROP CONSTRAINT "Pot_Entry_player_id_fkey";

-- DropForeignKey
ALTER TABLE "Pot_Entry" DROP CONSTRAINT "Pot_Entry_pot_id_fkey";

-- DropForeignKey
ALTER TABLE "Squad" DROP CONSTRAINT "Squad_event_id_fkey";

-- DropForeignKey
ALTER TABLE "Tmnt" DROP CONSTRAINT "Tmnt_bowl_id_fkey";

-- DropForeignKey
ALTER TABLE "Tmnt" DROP CONSTRAINT "Tmnt_user_id_fkey";

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

-- AddForeignKey
ALTER TABLE "Tmnt" ADD CONSTRAINT "Tmnt_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Tmnt" ADD CONSTRAINT "Tmnt_bowl_id_fkey" FOREIGN KEY ("bowl_id") REFERENCES "Bowl"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Div" ADD CONSTRAINT "Div_tmnt_id_fkey" FOREIGN KEY ("tmnt_id") REFERENCES "Tmnt"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Squad" ADD CONSTRAINT "Squad_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Lane" ADD CONSTRAINT "Lane_squad_id_fkey" FOREIGN KEY ("squad_id") REFERENCES "Squad"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Pot" ADD CONSTRAINT "Pot_div_id_fkey" FOREIGN KEY ("div_id") REFERENCES "Div"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Pot" ADD CONSTRAINT "Pot_squad_id_fkey" FOREIGN KEY ("squad_id") REFERENCES "Squad"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Brkt" ADD CONSTRAINT "Brkt_div_id_fkey" FOREIGN KEY ("div_id") REFERENCES "Div"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Brkt" ADD CONSTRAINT "Brkt_squad_id_fkey" FOREIGN KEY ("squad_id") REFERENCES "Squad"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Elim" ADD CONSTRAINT "Elim_div_id_fkey" FOREIGN KEY ("div_id") REFERENCES "Div"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Elim" ADD CONSTRAINT "Elim_squad_id_fkey" FOREIGN KEY ("squad_id") REFERENCES "Squad"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Player" ADD CONSTRAINT "Player_squad_id_fkey" FOREIGN KEY ("squad_id") REFERENCES "Squad"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Div_Entry" ADD CONSTRAINT "Div_Entry_squad_id_fkey" FOREIGN KEY ("squad_id") REFERENCES "Squad"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Div_Entry" ADD CONSTRAINT "Div_Entry_div_id_fkey" FOREIGN KEY ("div_id") REFERENCES "Div"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Div_Entry" ADD CONSTRAINT "Div_Entry_player_id_fkey" FOREIGN KEY ("player_id") REFERENCES "Player"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Pot_Entry" ADD CONSTRAINT "Pot_Entry_pot_id_fkey" FOREIGN KEY ("pot_id") REFERENCES "Pot"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Pot_Entry" ADD CONSTRAINT "Pot_Entry_player_id_fkey" FOREIGN KEY ("player_id") REFERENCES "Player"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Brkt_Entry" ADD CONSTRAINT "Brkt_Entry_brkt_id_fkey" FOREIGN KEY ("brkt_id") REFERENCES "Brkt"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Brkt_Entry" ADD CONSTRAINT "Brkt_Entry_player_id_fkey" FOREIGN KEY ("player_id") REFERENCES "Player"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Elim_Entry" ADD CONSTRAINT "Elim_Entry_elim_id_fkey" FOREIGN KEY ("elim_id") REFERENCES "Elim"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Elim_Entry" ADD CONSTRAINT "Elim_Entry_player_id_fkey" FOREIGN KEY ("player_id") REFERENCES "Player"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Game" ADD CONSTRAINT "Game_player_id_fkey" FOREIGN KEY ("player_id") REFERENCES "Player"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
