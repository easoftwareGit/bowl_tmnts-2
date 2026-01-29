import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ErrorCode, isValidBtDbId } from "@/lib/validation/validation";
import { tmntFullType } from "@/lib/types/types";
import { tmntFullDataForPrisma } from "../../dataForPrisma";
import { getErrorStatus } from "@/app/api/errCodes";
import { validateFullTmnt } from "../../full/validate";

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
    // validate tmnt full entries data
    const validationResult = validateFullTmnt(tmntFullEntriesData);
    if (
      validationResult.errorCode !== ErrorCode.NONE ||
      id !== tmntFullEntriesData.tmnt.id
    ) {
      return NextResponse.json(
        { error: "validation failed", details: validationResult },
        { status: 422 }
      );
    }
    if (
      tmntFullEntriesData.squads &&
      tmntFullEntriesData.squads.length === 0 &&
      !isValidBtDbId(tmntFullEntriesData.squads[0].id, "sqd")
    ) {
      return NextResponse.json(
        { error: "invalid squad id" },
        { status: 422 }
      );
    }
    const squadId = tmntFullEntriesData.squads[0].id; // only 1 squad for now
    // run replace - delete/create many in one transaction
    const result = await prisma.$transaction(async (tx) => {
      // 1 - delete data in database
      // 1a - deleting player data also deletes divEntries, potEntries,
      // elimEntries and brktEntries
      await tx.player.deleteMany({ where: { squad_id: squadId } });
      // deleting oneBrkt data also deletes brktSeeds
      // need to break up the one_brkt delete into 2 parts
      // 1b - get all brkts for this squad
      const brkts = await tx.brkt.findMany({
        where: { squad_id: squadId },
        select: { id: true },
      });
      const brktIds = brkts.map((brkt) => brkt.id);
      // 1c - delete one_brkt data
      await tx.one_Brkt.deleteMany({
        where: { brkt_id: { in: brktIds } },
      });

      // 2 - convert tmntData to prisma data
      const prismaTmntFullEntriesData =
        tmntFullDataForPrisma(tmntFullEntriesData);
      if (!prismaTmntFullEntriesData) {
        return NextResponse.json(
          { error: "invalid tmnt data" },
          { status: 404 }
        );
      }

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
      // brktEntries has 1-1 child data in brktRefunds.
      // cannot use createMany for brktEntries w/ refunds
      // so split brktEntries into 2 groups: w/o refunds and w/ refunds
      // 3d1 - filter brktEntries w/o refunds and with refunds
      const beNoRefunds = tmntFullEntriesData.brktEntries.filter(
        (brktEntry) => !brktEntry.num_refunds || brktEntry.num_refunds <= 0
      );
      const beYesRefunds = tmntFullEntriesData.brktEntries.filter(
        (brktEntry) =>
          brktEntry.num_refunds != null && brktEntry.num_refunds > 0
      );
      // 3d2 - create brktEntries w/o refunds
      await tx.brkt_Entry.createMany({
        data: beNoRefunds.map((be) => ({
          id: be.id,
          brkt_id: be.brkt_id,
          player_id: be.player_id,
          num_brackets: be.num_brackets,
          time_stamp: new Date(be.time_stamp), // Convert to Date object
        })),
      });
      // 3d3 - create brktEntries w/ refunds
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

      return { success: true };
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
