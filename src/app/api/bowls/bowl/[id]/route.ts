import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { bowlType } from "@/lib/types/types";
import { initBowl } from "@/lib/db/initVals";
import { isValidBtDbId } from "@/lib/validation/validation";
import { ErrorCode } from "@/lib/enums/enums";
import { sanitizeBowl, validateBowl } from "../../../../../lib/validation/bowls/validate";
import { getErrorStatus } from "@/app/api/errCodes";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!isValidBtDbId(id, "bwl")) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }

    const bowl = await prisma.bowl.findUnique({
      where: {
        id: id,
      },
    });
    if (!bowl) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }
    return NextResponse.json({ bowl }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Error getting bowl" }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!isValidBtDbId(id, "bwl")) {
      return NextResponse.json({ error: "Invalid bowl id" }, { status: 404 });
    }
    
    const { bowl_name, city, state, url } = await req.json();
    const toCheck: bowlType = {
      ...initBowl,
      id,
      bowl_name,
      city,
      state,
      url,
    };

    const toPut = sanitizeBowl(toCheck);
    const errCode = validateBowl(toPut);
    if (errCode !== ErrorCode.NONE) {
      const errorMessages = {
        [ErrorCode.MISSING_DATA]: "missing data",
        [ErrorCode.INVALID_DATA]: "invalid data",
        [ErrorCode.OTHER_ERROR]: "unknown error",
      };
      return NextResponse.json(
        { error: errorMessages[errCode as keyof typeof errorMessages] },
        { status: 422 }
      );      
    }
    const bowl = await prisma.bowl.upsert({
      where: { id },
      update: {
        bowl_name: toPut.bowl_name,
        city: toPut.city,
        state: toPut.state,
        url: toPut.url,
      },
      create: {
        id,
        bowl_name: toPut.bowl_name,
        city: toPut.city,
        state: toPut.state,
        url: toPut.url,
      },
    });

    return NextResponse.json({ bowl }, { status: 200 });
  } catch (err: any) {
    const errStatus = getErrorStatus(err.code);
    return NextResponse.json(
      { error: "Error upserting bowl" },
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
    if (!isValidBtDbId(id, "bwl")) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }

    const currentBowl = await prisma.bowl.findUnique({
      where: {
        id: id,
      },
    });    
    if (!currentBowl) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }

    const json = await request.json();
    // populate toCheck with json
    const jsonProps = Object.getOwnPropertyNames(json);
    const toCheck: bowlType = {
      ...initBowl,
      bowl_name: currentBowl.bowl_name,
      city: currentBowl.city,
      state: currentBowl.state,
      url: currentBowl.url,
    };

    if (jsonProps.includes("bowl_name")) {
      toCheck.bowl_name = json.bowl_name;
    }
    if (jsonProps.includes("city")) {
      toCheck.city = json.city;
    }
    if (jsonProps.includes("state")) {
      toCheck.state = json.state;
    }
    if (jsonProps.includes("url")) {
      toCheck.url = json.url;
    }

    const toBePatched = sanitizeBowl(toCheck);
    const errCode = validateBowl(toBePatched);
    if (errCode !== ErrorCode.NONE) {
      let errMsg: string;
      switch (errCode as ErrorCode) {
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
      bowl_name: '',
      city: '',
      state: '',
      url: '',
    }
    if (jsonProps.includes("bowl_name")) {
      toPatch.bowl_name = toBePatched.bowl_name
    }
    if (jsonProps.includes("city")) {
      toPatch.city = toBePatched.city
    }
    if (jsonProps.includes("state")) {
      toPatch.state = toBePatched.state
    }
    if (jsonProps.includes("url")) {
      toPatch.url = toBePatched.url
    }
    const bowl = await prisma.bowl.update({
      where: {
        id: id,
      },
      // remove data if not sent
      data: {
        bowl_name: toPatch.bowl_name || undefined,
        city: toPatch.city || undefined,
        state: toPatch.state || undefined,
        url: toPatch.url || undefined,
      },
    });
    return NextResponse.json({ bowl }, { status: 200 });
  } catch (err: any) {
    const errStatus = getErrorStatus(err.code);
    return NextResponse.json(
      { error: "Error patching bowl" },
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
    if (!isValidBtDbId(id, "bwl")) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }
    const result = await prisma.bowl.deleteMany({
      where: {
        id: id,
      },
    });
    return NextResponse.json({ count: result.count }, { status: 200 });
  } catch (err: any) {
    const errStatus = getErrorStatus(err.code);
    return NextResponse.json(
      { error: "Error deleting bowl" },
      { status: errStatus }
    );
  }
}
