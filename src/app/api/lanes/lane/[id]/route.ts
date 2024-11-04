import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ErrorCode, isValidBtDbId } from "@/lib/validation";
import { validateLane, sanitizeLane } from "@/app/api/lanes/validate";
import { laneType } from "@/lib/types/types";
import { initLane } from "@/lib/db/initVals";

// routes /api/lanes/lane/:id

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
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
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
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
    if (errCode !== ErrorCode.None) {
      let errMsg: string;
      switch (errCode) {
        case ErrorCode.MissingData:
          errMsg = "missing data";
          break;
        case ErrorCode.InvalidData:
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
    let errStatus: number;
    switch (err.code) {
      case "P2002": // unique constraint
        errStatus = 409;
        break;
      case "P2003": // foreign key constraint
        errStatus = 409;
        break;
      case "P2025": // record not found
        errStatus = 404;
        break;
      default:
        errStatus = 500;
        break;
    }
    return NextResponse.json(
      { error: "error updating lane" },
      { status: errStatus }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
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
    if (errCode !== ErrorCode.None) {
      let errMsg: string;
      switch (errCode) {
        case ErrorCode.MissingData:
          errMsg = "missing data";
          break;
        case ErrorCode.InvalidData:
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
    let errStatus: number;
    switch (err.code) {
      case "P2002": // unique constraint
        errStatus = 422;
        break;
      case "P2003": // foreign key constraint
        errStatus = 422;
        break;
      case "P2025": // record not found
        errStatus = 404;
        break;
      default:
        errStatus = 500;
        break;
    }
    return NextResponse.json(
      { error: "error patching lane" },
      { status: errStatus }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    if (!isValidBtDbId(id, "lan")) {
      return NextResponse.json({ error: "invalid request" }, { status: 404 });
    }

    const deleted = await prisma.lane.delete({
      where: {
        id: id,
      },
    });
    return NextResponse.json({ deleted }, { status: 200 });
  } catch (err: any) {
    let errStatus: number;
    switch (err.code) {
      case "P2003": // parent has child rows
        errStatus = 409;
        break;
      case "P2025": // record not found
        errStatus = 404;
        break;
      default:
        errStatus = 500;
        break;
    }
    return NextResponse.json(
      { error: "error deleting lane" },
      { status: errStatus }
    );
  }
}
