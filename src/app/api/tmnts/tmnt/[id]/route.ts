import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; 
import { ErrorCode, isValidBtDbId } from "@/lib/validation";
import { sanitizeTmnt, validateTmnt } from "@/app/api/tmnts/valildate";
import { tmntType } from "@/lib/types/types";
import { initTmnt } from "@/lib/db/initVals";
import { dateTo_UTC_yyyyMMdd, dateTo_yyyyMMdd, removeTimeFromISODateStr, startOfDayFromString } from "@/lib/dateTools";

// routes /api/tmnts/tmnt/:id

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    if (!isValidBtDbId(id, "tmt")) {
      return NextResponse.json({ error: "invalid request" }, { status: 404 });
    }
    const tmnt = await prisma.tmnt.findUnique({
      where: {
        id: id,
      },
      select: {
        id: true,
        tmnt_name: true,
        start_date: true,
        end_date: true,
        bowl_id: true,
        user_id: true,
        bowls: {
          select: {
            bowl_name: true,
            city: true,
            state: true,
            url: true,
          },
        },
      },  
    });
    if (!tmnt) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }
    return NextResponse.json({ tmnt }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Error getting tmnt" }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    if (!isValidBtDbId(id, "tmt")) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }
    const { tmnt_name, start_date_str, end_date_str, user_id, bowl_id } = await request.json();

    const toCheck: tmntType = {
      ...initTmnt,
      id,
      tmnt_name,
      start_date_str,
      end_date_str,
      user_id,
      bowl_id,
    };

    const toPut: tmntType = sanitizeTmnt(toCheck);
    const errCode = validateTmnt(toPut);
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
    const startDate = startOfDayFromString(toPut.start_date_str) as Date
    const endDate = startOfDayFromString(toPut.end_date_str) as Date    
    const tmnt = await prisma.tmnt.update({
      where: {
        id: id,
      },
      data: {
        tmnt_name: toPut.tmnt_name,
        start_date: startDate,
        end_date: endDate,
        // user_id: toPut.user_id, // not allowed to update user_id
        bowl_id: toPut.bowl_id,
      },
    });
    return NextResponse.json({ tmnt }, { status: 200 });
  } catch (error: any) {
    let errStatus: number;
    switch (error.code) {
      case "P2003":   // parent not found
        errStatus = 404;
        break;
      case "P2025":   // record not found
        errStatus = 404;
        break;
      default:
        errStatus = 500;
        break;
    }
    return NextResponse.json(
      { error: "Error putting tmnt" },
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
    if (!isValidBtDbId(id, "tmt")) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }

    const currentTmnt = await prisma.tmnt.findUnique({
      where: { id: id },
    });
    if (!currentTmnt) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }

    const json = await request.json();
    // populate toCheck with json
    const jsonProps = Object.getOwnPropertyNames(json);
    const toCheck: tmntType = {
      ...initTmnt,
      tmnt_name: currentTmnt.tmnt_name,
      start_date_str: dateTo_UTC_yyyyMMdd(currentTmnt.start_date),
      end_date_str: dateTo_UTC_yyyyMMdd(currentTmnt.end_date),
      user_id: currentTmnt.user_id,
      bowl_id: currentTmnt.bowl_id,
    };

    if (jsonProps.includes("tmnt_name")) {
      toCheck.tmnt_name = json.tmnt_name;
    }
    if (jsonProps.includes("start_date_str")) {
      toCheck.start_date_str = json.start_date_str; 
    }
    if (jsonProps.includes("end_date_str")) {
      toCheck.end_date_str = json.end_date_str;
    }
    if (jsonProps.includes("bowl_id")) {      
      toCheck.bowl_id = json.bowl_id;
    }
    if (jsonProps.includes("user_id")) {
      toCheck.user_id = json.user_id;
    }

    const toBePatched = sanitizeTmnt(toCheck);
    const errCode = validateTmnt(toBePatched);
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
      tmnt_name: "",
      start_date: null as Date | null,
      end_date: null as Date | null,
      bowl_id: "",
      user_id: "",
    };
    let gotEmptyStartDate = undefined;
    let gotEmptyEndDate = undefined;
    if (jsonProps.includes("tmnt_name")) {
      toPatch.tmnt_name = toBePatched.tmnt_name;
    }
    if (jsonProps.includes("start_date_str")) {
      toPatch.start_date = startOfDayFromString(toBePatched.start_date_str)      
      gotEmptyStartDate = '';
    }
    if (jsonProps.includes("end_date_str")) {
      toPatch.end_date = startOfDayFromString(toBePatched.end_date_str)      
      gotEmptyEndDate = '';
    }
    if (jsonProps.includes("bowl_id")) {
      toPatch.bowl_id = toBePatched.bowl_id;
    }
    if (jsonProps.includes("user_id")) {
      toPatch.user_id = toBePatched.user_id;
    }

    const tmnt = await prisma.tmnt.update({
      where: {
        id: id,
      },
      // remove data if not sent
      data: {
        tmnt_name: toPatch.tmnt_name || undefined,
        start_date: toPatch.start_date || gotEmptyStartDate,
        end_date: toPatch.end_date || gotEmptyEndDate,
        bowl_id: toPatch.bowl_id || undefined,
        // user_id: toPatch.user_id || undefined, // do not patch user_id
      },
    });
    return NextResponse.json({ tmnt }, { status: 200 });
  } catch (error: any) {
    let errStatus: number;
    switch (error.code) {
      case "P2003":   // parent not found
        errStatus = 404;
        break;
      case "P2025":   // record not found
        errStatus = 404;
        break;
      default:
        errStatus = 500;
        break;
    }
    return NextResponse.json(
      { error: "Error patching tmnt" },
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
    if (!isValidBtDbId(id, "tmt")) {
      return NextResponse.json({ error: "invalid request" }, { status: 404 });
    }

    const deleted = await prisma.tmnt.delete({
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
      { error: "Error deleting tmnt" },
      { status: errStatus }
    );
  }

}