import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ErrorCode, isValidBtDbId } from "@/lib/validation/validation";
import { validateLane, sanitizeLane } from "@/lib/validation/lanes/validate";
import { laneType } from "@/lib/types/types";
import { initLane } from "@/lib/db/initVals";
import { getErrorStatus } from "@/app/api/errCodes";

// routes /api/lanes/lane/:id

export async function GET(
  request: Request,
	{ params }: { params: Promise<{ id: string }> }
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
  } catch (err: any) {
    return NextResponse.json({ error: "error getting lane" }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
	{ params }: { params: Promise<{ id: string }> }
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
  } catch (err: any) {
    const errStatus = getErrorStatus(err.code);
    return NextResponse.json(
      { error: "error updating lane" },
      { status: errStatus }
    );
  }
}

export async function PATCH(
  request: Request,
	{ params }: { params: Promise<{ id: string }> }
) { 
  try {
    const { id } = await params;
    if (!isValidBtDbId(id, "lan")) {
      return NextResponse.json({ error: "invalid request" }, { status: 404 });
    }

    const json = await request.json();
    // populate toCheck with json
    const jsonProps = Object.getOwnPropertyNames(json);
    
    const currentLane = await prisma.lane.findUnique({
      where: {
        id: id,
      },
    });    
    if (!currentLane) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }

    const toCheck: laneType = {
      ...initLane,
      lane_number: currentLane.lane_number,
      squad_id: currentLane.squad_id,
    };

    if (jsonProps.includes("lane_number")) {
      toCheck.lane_number = json.lane_number;
    }
    if (jsonProps.includes("squad_id")) {
      toCheck.squad_id = json.squad_id;
    }

    const toBePatched = sanitizeLane(toCheck);
    const errCode = validateLane(toBePatched);
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
      squad_id: "", 
    };
    if (jsonProps.includes("lane_number")) {
      toPatch.lane_number = toBePatched.lane_number;
    }
    if (jsonProps.includes("squad_id")) {
      toPatch.squad_id = toBePatched.squad_id;
    }
    const lane = await prisma.lane.update({
      where: {
        id: id,
      },
      data: {
        lane_number: toPatch.lane_number || undefined,
        // squad_id: toPatch.squad_id || undefined, // do not patch squad_id
      },
    });

    return NextResponse.json({ lane }, { status: 200 });
  } catch (err: any) {
    const errStatus = getErrorStatus(err.code);
    return NextResponse.json(
      { error: "error patching lane" },
      { status: errStatus }
    );
  }
}

export async function DELETE(
  request: Request,
	{ params }: { params: Promise<{ id: string }> }
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
  } catch (err: any) {
    const errStatus = getErrorStatus(err.code);
    return NextResponse.json(
      { error: "error deleting lane" },
      { status: errStatus }
    );
  }
}
