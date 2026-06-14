import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isValidBtDbId } from "@/lib/validation/validation";
import { ErrorCode } from "@/lib/enums/enums";
import { validateLane, sanitizeLane } from "@/lib/validation/lanes/validate";
import type { laneType } from "@/lib/types/types";
import { initLane } from "@/lib/db/initVals";
import { standardCatchReturn } from "@/app/api/apiCatch";

// routes /api/lanes/lane/:id

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    if (!isValidBtDbId(id, "lan")) {
      return NextResponse.json({ error: "invalid request" }, { status: 404 });
    }
    const lane = await prisma.lane.findUnique({
      where: {
        id: id,
      },
    });
    if (!lane) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }
    return NextResponse.json({ lane }, { status: 200 });
  } catch (error) {
    return standardCatchReturn(error, "error getting lane");
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    if (!isValidBtDbId(id, "lan")) {
      return NextResponse.json({ error: "invalid request" }, { status: 404 });
    }

    const { lane_number, squad_id } = await request.json();
    const toCheck: laneType = {
      ...initLane,
      lane_number,
      squad_id,
    };

    const toPut = sanitizeLane(toCheck);
    const errCode = validateLane(toPut);
    if (errCode !== ErrorCode.NONE) {
      let errMsg: string;
      switch (errCode) {
        case ErrorCode.MISSING_DATA:
          errMsg = "missing data";
          break;
        case ErrorCode.INVALID_DATA:
          errMsg = "invalid data";
          break;
        default:
          errMsg = "unknown error";
          break;
      }
      return NextResponse.json({ error: errMsg }, { status: 422 });
    }

    const lane = await prisma.lane.update({
      where: {
        id: id,
      },
      data: {
        lane_number: toPut.lane_number,
        // squad_id: toPut.squad_id, // do not update squad_id
      },
    });
    return NextResponse.json({ lane }, { status: 200 });
  } catch (error) {
    return standardCatchReturn(error, "error updating lane");
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    if (!isValidBtDbId(id, "lan")) {
      return NextResponse.json({ error: "invalid request" }, { status: 404 });
    }

    // fake data that will pass sanitation and validation
    const fakeLane = {
      ...initLane,
      id,
      lane_number: 1,
      squad_id: "sqd_00000000000000000000000000000000",
      in_use: true,
    };
    // populate toCheck with fake data
    const toCheck: laneType = {
      ...initLane,
      id,
      lane_number: fakeLane.lane_number,
      squad_id: fakeLane.squad_id,
      in_use: fakeLane.in_use,
    };

    const json = await request.json();
    // re-populate toCheck with json data, only for fields that are in json
    const jsonProps = Object.getOwnPropertyNames(json);
    let gotDataToPatch = false;
    if (jsonProps.includes("lane_number")) {
      toCheck.lane_number = json.lane_number;
      gotDataToPatch = true;
    }
    if (jsonProps.includes("in_use")) {
      toCheck.in_use = json.in_use;
      gotDataToPatch = true;
    }
    if (!gotDataToPatch) {
      return NextResponse.json({ error: "no data to patch" }, { status: 400 });
    }

    const toBePatched = sanitizeLane(toCheck);
    let errCode = validateLane(toBePatched);
    if (
      errCode === ErrorCode.NONE &&
      jsonProps.includes("in_use") &&
      toCheck.in_use !== toBePatched.in_use
    ) {
      errCode = ErrorCode.INVALID_DATA;
    }
    if (errCode !== ErrorCode.NONE) {
      let errMsg: string;
      switch (errCode) {
        case ErrorCode.MISSING_DATA:
          errMsg = "missing data";
          break;
        case ErrorCode.INVALID_DATA:
          errMsg = "invalid data";
          break;
        default:
          errMsg = "unknown error";
          break;
      }
      return NextResponse.json({ error: errMsg }, { status: 422 });
    }

    const toPatch = {
      lane_number: null as number | null,
      in_use: null as boolean | null,
    };
    let setInUse = false;
    if (jsonProps.includes("lane_number")) {
      toPatch.lane_number = toBePatched.lane_number;
    }
    if (jsonProps.includes("in_use")) {
      setInUse = true;
      toPatch.in_use = toBePatched.in_use;
    }

    const data: {
      lane_number?: number;
      in_use?: boolean;
    } = {};

    if (jsonProps.includes("lane_number")) {
      data.lane_number = toBePatched.lane_number;
    }

    if (jsonProps.includes("in_use")) {
      data.in_use = toBePatched.in_use;
    }

    const lane = await prisma.lane.update({
      where: { id },
      data,
    });

    // const lane = await prisma.lane.update({
    //   where: {
    //     id: id,
    //   },
    //   data: {
    //     // squad_id: toPatch.squad_id || undefined, // do not patch squad_id
    //     lane_number: toPatch.lane_number || undefined,
    //     in_use: setInUse ? toPatch.in_use : undefined,
    //   },
    // });

    return NextResponse.json({ lane }, { status: 200 });
  } catch (error) {
    return standardCatchReturn(error, "error patching lane");
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    if (!isValidBtDbId(id, "lan")) {
      return NextResponse.json({ error: "invalid request" }, { status: 404 });
    }

    const result = await prisma.lane.deleteMany({
      where: {
        id: id,
      },
    });
    return NextResponse.json({ count: result.count }, { status: 200 });
  } catch (error) {
    return standardCatchReturn(error, "error deleting lane");
  }
}
