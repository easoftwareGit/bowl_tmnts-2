import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isValidBtDbId } from "@/lib/validation/validation";
import { ErrorCode } from "@/lib/enums/enums";
import type { tmntFullType } from "@/lib/types/types";
import { tmntFullDataForPrisma } from "../../dataForPrisma";
import { getErrorStatus } from "@/app/api/errCodes";

import { SquadStage } from "@prisma/client";
import { sanitizeFullTmnt, validateFullTmnt } from "@/lib/validation/tmnts/full/validate";

// routes /api/tmnts/fullEntries/:id

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!isValidBtDbId(id, "tmt")) {
      return NextResponse.json({ error: "invalid request" }, { status: 404 });
    }
    const tmntFullEntriesData: tmntFullType = await request.json();
    const toPut = sanitizeFullTmnt(tmntFullEntriesData); 
    // validate tmnt full entries data
    const validationResult = validateFullTmnt(toPut);
    if (
      validationResult.errorCode !== ErrorCode.NONE ||
      id !== toPut.tmnt.id
    ) {
      return NextResponse.json(
        { error: "validation failed", details: validationResult },
        { status: 422 }
      );
    }

    const squads = toPut.squads;
    if (!squads || squads.length === 0) {
      return NextResponse.json(
        { error: "missing squad data" },
        { status: 422 }
      );
    }
    const squadId = squads[0].id;
    if (!isValidBtDbId(squadId, "sqd")) {
      return NextResponse.json(
        { error: "invalid squad id" },
        { status: 422 }
      );
    }

    // 1 - convert tmntData to prisma data
    const prismaTmntFullEntriesData = tmntFullDataForPrisma(toPut);
    if (!prismaTmntFullEntriesData) {
      return NextResponse.json(
        { error: "invalid tmnt data" },
        { status: 404 }
      );
    }

    // 1.1 - set stage date
    const stageDate = new Date();
    const stageDateStr = stageDate.toISOString(); // app sets stage date    
    const stage = prismaTmntFullEntriesData.stageData;

    // run replace - delete/create many in one transaction
    // Use Prisma interactive transaction (tx callback) because:
    // T1) We must read brkt IDs inside the transaction and use them for dependent deletes.
    // T2) We perform multiple sequential deletes/inserts that must commit/rollback together.
    // T3) We have conditional/looped writes (brktEntries with refunds).    
    const result = await prisma.$transaction(async (tx) => {
      // 2 - delete data in database
      // 2a - deleting player data also deletes divEntries, potEntries,
      // elimEntries and brktEntries
      await tx.player.deleteMany({ where: { squad_id: squadId } });
      // deleting oneBrkt data also deletes brktSeeds
      // need to break up the one_brkt delete into 2 parts
      // 2b - get all brkts for this squad
      const brkts = await tx.brkt.findMany({
        where: { squad_id: squadId },
        select: { id: true },
      });
      const brktIds = brkts.map((brkt) => brkt.id);
      // 2c - delete one_brkt data
      await tx.one_Brkt.deleteMany({
        where: { brkt_id: { in: brktIds } },
      });

      // 3 replace data with edited data
      await tx.player.createMany({
        data: prismaTmntFullEntriesData.playersData,
      });
      await tx.div_Entry.createMany({
        data: prismaTmntFullEntriesData.divEntriesData,
      });
      await tx.pot_Entry.createMany({
        data: prismaTmntFullEntriesData.potEntriesData,
      });
      await tx.elim_Entry.createMany({
        data: prismaTmntFullEntriesData.elimEntriesData,
      });
      // 3a - update stage
      const updatedStage = await tx.stage.update({
        where: { id: stage.id },
        data: {
          // squad_id: stage.squad_id, // no change needed to squad id
          stage: stage.stage,
          stage_set_at: stageDateStr,
          stage_override_enabled: stage.stage_override_enabled,
          scores_started_at: (stage.stage && stage.stage === SquadStage.SCORES) ? stageDateStr : null,
          stage_override_at: (stage.stage_override_enabled) ? stageDateStr : null,
          stage_override_reason: stage.stage_override_reason,
        },
      })

      // brktEntries has 1-1 child data in brktRefunds.
      // cannot use createMany for brktEntries w/ refunds
      // so split brktEntries into 2 groups: w/o refunds and w/ refunds
      // 3b1 - filter brktEntries w/o refunds and with refunds
      const beNoRefunds = toPut.brktEntries.filter(
        (brktEntry) => !brktEntry.num_refunds || brktEntry.num_refunds <= 0
      );
      const beYesRefunds = toPut.brktEntries.filter(
        (brktEntry) =>
          brktEntry.num_refunds != null && brktEntry.num_refunds > 0
      );
      // 3b2 - create brktEntries w/o refunds
      await tx.brkt_Entry.createMany({
        data: beNoRefunds.map((be) => ({
          id: be.id,
          brkt_id: be.brkt_id,
          player_id: be.player_id,
          num_brackets: be.num_brackets,
          time_stamp: new Date(be.time_stamp), // Convert to Date object
        })),
      });
      // 3b3 - create brktEntries w/ refunds
      for (const be of beYesRefunds) {
        await tx.brkt_Entry.create({
          data: {
            id: be.id,
            brkt_id: be.brkt_id,
            player_id: be.player_id,
            num_brackets: be.num_brackets,
            time_stamp: new Date(be.time_stamp),
            brkt_refunds: {
              create: {
                num_refunds: be.num_refunds!,
              },
            },
          },
          include: { brkt_refunds: true },
        });
      }
      await tx.one_Brkt.createMany({
        data: prismaTmntFullEntriesData.oneBrktsData,
      });
      await tx.brkt_Seed.createMany({
        data: prismaTmntFullEntriesData.brktSeedsData,
      });

      return { success: true, stage: updatedStage };
    });
    return NextResponse.json(result, { status: 200 });
  } catch (err: any) {
    const errStatus = getErrorStatus(err.code);
    return NextResponse.json(
      { error: "Error replacing tmnt entries data" },
      { status: errStatus }
    );
  }
}
