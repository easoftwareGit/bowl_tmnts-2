import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { bowlType } from "@/lib/types/types";
import { initBowl } from "@/lib/db/initVals";
import { isValidBtDbId } from "@/lib/validation/validation";
import { ErrorCode } from "@/lib/enums/enums";
import { sanitizeBowl, validateBowl } from "../../../../../lib/validation/bowls/validate";
import { getErrorStatus, standardCatchReturn } from "@/app/api/apiCatch";
import { init } from "next/dist/compiled/webpack/webpack";

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
    return standardCatchReturn(error, "error getting bowl");    
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
  } catch (error) {
    return standardCatchReturn(error, "error upserting bowl");
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

    const fakeBowl = {
      ...initBowl,      
      id: "bwl_00000000000000000000000000000000",
      bowl_name: "Fake Lanes",
      city: "Faveville",
      state: "CA",
      url: "http://fakelanes.com",
    }

    // populate toCheck with fake data 
    const toCheck: bowlType = {
      ...initBowl,
      id: fakeBowl.id,
      bowl_name: fakeBowl.bowl_name,
      city: fakeBowl.city,
      state: fakeBowl.state,
      url: fakeBowl.url,
    };

    const json = await request.json();
    // re-populate toCheck with json data, only for fields that are in json
    const jsonProps = Object.getOwnPropertyNames(json);   
    let gotDataToPatch = false;

    if (jsonProps.includes("bowl_name")) {
      toCheck.bowl_name = json.bowl_name;
      gotDataToPatch = true;
    }
    if (jsonProps.includes("city")) {
      toCheck.city = json.city;
      gotDataToPatch = true;
    }
    if (jsonProps.includes("state")) {
      toCheck.state = json.state;
      gotDataToPatch = true;
    }
    if (jsonProps.includes("url")) {
      toCheck.url = json.url;
      gotDataToPatch = true;
    }

    if (!gotDataToPatch) {
      return NextResponse.json({ error: "no data to patch" }, { status: 400 });
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
  } catch (error) {
    return standardCatchReturn(error, "error patching bowl");
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
  } catch (error) {
    return standardCatchReturn(error, "error deleting bowl");
  }
}
