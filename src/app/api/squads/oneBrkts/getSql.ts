import { isValidBtDbId } from "@/lib/validation/validation";

export const getSquadOneBrktsAndSeedsSQL = (squadId: string) => {
  if (!isValidBtDbId(squadId, "sqd")) return '';
  const squadOneBrktsAndSeedsSQL =
    `SELECT ` +
    `public."One_Brkt".id as one_brkt_id, ` +
    `public."One_Brkt".brkt_id, ` +
    `public."One_Brkt".bindex, ` +
    `public."Brkt_Seed".seed, ` +
    `public."Brkt_Seed".player_id ` +
    `FROM public."One_Brkt" ` +
    `INNER JOIN public."Brkt_Seed" ON "Brkt_Seed".one_brkt_id = "One_Brkt".id ` +
    `INNER JOIN public."Brkt" ON "Brkt".id = "One_Brkt".brkt_id ` +
    `WHERE "squad_id" = '${squadId}' ` + 
    `ORDER BY brkt_id, bindex, one_brkt_id, seed`
  return squadOneBrktsAndSeedsSQL
}