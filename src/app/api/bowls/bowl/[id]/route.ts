import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { bowlType } from "@/lib/types/types";
import { initBowl } from "@/lib/db/initVals";
import { ErrorCode, isValidBtDbId } from "@/lib/validation";
import { sanitizeBowl, validateBowl } from "../../validate";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
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
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    if (!isValidBtDbId(id, "bwl")) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }

    const { bowl_name, city, state, url } = await req.json();
    const toCheck: bowlType = {
      ...initBowl,
      bowl_name,
      city,
      state,
      url,
    };

    const toPut = sanitizeBowl(toCheck);
    const errCode = validateBowl(toPut);
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
    
    const bowl = await prisma.bowl.update({
      where: {
        id: id,
      },
      data: {
        bowl_name: toPut.bowl_name,
        city: toPut.city,
        state: toPut.state,
        url: toPut.url,
      },
    });
    return NextResponse.json({ bowl }, { status: 200 });
  } catch (error: any) {
    let errStatus: number;
    switch (error.code) {
      case "P2003": // parent row not found
        errStatus = 404;
        break;
      case "P2025": // record not found
        errStatus = 404;
        break;
      default:
        errStatus = 500;
        break;
    }
    return NextResponse.json(
      { error: "Error putting bowl" },
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
    if (errCode !== ErrorCode.None) {
      let errMsg: string;
      switch (errCode as ErrorCode) {
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
  } catch (error: any) {
    let errStatus: number;
    switch (error.code) {
      case "P2003": // parent row not found
        errStatus = 404;
        break;
      case "P2025": // record not found
        errStatus = 404;
        break;
      default:
        errStatus = 500;
        break;
    }
    return NextResponse.json(
      { error: "Error patching bowl" },
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
    if (!isValidBtDbId(id, "bwl")) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }
    const deleted = await prisma.bowl.delete({
      where: {
        id: id,
      },
    });
    return NextResponse.json({ deleted }, { status: 200 });
  } catch (error: any) {
    let errStatus: number;
    switch (error.code) {
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
      { error: "Error deleting bowl" },
      { status: errStatus }
    );
  }
}
