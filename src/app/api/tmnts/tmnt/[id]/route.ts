import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; 
import { isValidBtDbId } from "@/lib/validation/validation";
import { ErrorCode } from "@/lib/enums/enums";
import { sanitizeTmnt, validateTmnt } from "@/lib/validation/tmnts/valildate";
import type { tmntType } from "@/lib/types/types";
import { blankTmnt, initTmnt } from "@/lib/db/initVals";
import { dateTo_UTC_yyyyMMdd, startOfDayFromString, todayStr } from "@/lib/dateTools";
import { getErrorStatus, standardCatchReturn } from "@/app/api/apiCatch";
import { tmntDataForPrisma } from "../../tmntDataForPrisma";

// routes /api/tmnts/tmnt/:id

export async function GET(
  request: Request,
	{ params }: { params: Promise<{ id: string }> }
) { 
  try {
    const { id } = await params;
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
        bowl: {
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
    return standardCatchReturn(error, "error getting tmnt");
  }
}

export async function PUT(
  request: Request,
	{ params }: { params: Promise<{ id: string }> }
) { 
  try {
    const { id } = await params;
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

    const prismaToPut = tmntDataForPrisma(toPut);
    if (!prismaToPut) {
      return NextResponse.json({ error: "invalid data" }, { status: 422 });
    }
    const tmnt = await prisma.tmnt.update({
      where: {
        id: id,
      },
      data: {
        tmnt_name: prismaToPut.tmnt_name,
        start_date: prismaToPut.start_date,
        end_date: prismaToPut.end_date,
        // user_id: prismaToPut.user_id, // not allowed to update user_id
        bowl_id: prismaToPut.bowl_id,
      },
    });
    return NextResponse.json({ tmnt }, { status: 200 });
  } catch (error) {
    return standardCatchReturn(error, "error putting tmnt");
  }
}

export async function PATCH(
  request: Request,
	{ params }: { params: Promise<{ id: string }> }
) { 
  try {
    const { id } = await params;
    if (!isValidBtDbId(id, "tmt")) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }

    // fake data that will pass sanitation and validation
    const fakeTmnt = {
      ...initTmnt,
      id,
      user_id: "usr_00000000000000000000000000000000",
      tmnt_name: "Gold Pin",
      bowl_id: "bwl_00000000000000000000000000000000",
      start_date_str: todayStr,
      end_date_str: todayStr,
    }

    // populate toCheck with fake data 
    const toCheck: tmntType = {
      ...initTmnt, 
      id, 
      user_id: fakeTmnt.user_id,
      tmnt_name: fakeTmnt.tmnt_name,
      bowl_id: fakeTmnt.bowl_id,
      start_date_str: fakeTmnt.start_date_str,
      end_date_str: fakeTmnt.end_date_str,
    }

    const json = await request.json();
    // re-populate toCheck with json data, only for fields that are in json
    const jsonProps = Object.getOwnPropertyNames(json);
    let gotDataToPatch = false;
    if (jsonProps.includes("tmnt_name")) {
      toCheck.tmnt_name = json.tmnt_name;
      gotDataToPatch = true;
    }
    if (jsonProps.includes("start_date_str")) {
      toCheck.start_date_str = json.start_date_str; 
      gotDataToPatch = true;
    }
    if (jsonProps.includes("end_date_str")) {
      toCheck.end_date_str = json.end_date_str;
      gotDataToPatch = true;
    }
    if (jsonProps.includes("bowl_id")) {      
      toCheck.bowl_id = json.bowl_id;
      gotDataToPatch = true;
    }
    // if (jsonProps.includes("user_id")) {
    //   toCheck.user_id = json.user_id;
    // }

    if (!gotDataToPatch) {
      return NextResponse.json({ error: "no data to patch" }, { status: 400 });
    }

    const toBePatched = sanitizeTmnt(toCheck);
    const errCode = validateTmnt(toBePatched);
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
      tmnt_name: "",
      start_date: null as Date | null,
      end_date: null as Date | null,
      bowl_id: "",
      user_id: "",
    };
    // const toPatch = {
    //   ...blankTmnt,
    // }
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
  } catch (error) {
    return standardCatchReturn(error, "error patching tmnt");
  }
}

export async function DELETE(
  request: Request,
	{ params }: { params: Promise<{ id: string }> }
) { 
  try {
    const { id } = await params;
    if (!isValidBtDbId(id, "tmt")) {
      return NextResponse.json({ error: "invalid request" }, { status: 404 });
    }

    const result = await prisma.tmnt.deleteMany({
      where: {
        id: id,
      },
    });
    return NextResponse.json({ count: result.count }, { status: 200 });
  } catch (error) {
    return standardCatchReturn(error, "error deleting tmnt");
  }

}