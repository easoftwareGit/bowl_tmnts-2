import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ErrorCode, isValidBtDbId } from "@/lib/validation";
import { sanitizeDiv, validateDiv, validIntHdcp } from "../../validate";
import { divType, HdcpForTypes } from "@/lib/types/types";
import { initDiv } from "@/lib/db/initVals";

// routes /api/divs/:id

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    if (!isValidBtDbId(id, "div")) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }
    const gotDiv = await prisma.div.findUnique({
      where: {
        id: id,
      },
    });
    if (!gotDiv) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }
    // add in hdcp_per_str
    const div = {
      ...gotDiv,
      hdcp_per_str: (gotDiv.hdcp_per * 100).toFixed(2),
    };
    return NextResponse.json({ div }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: "error getting div" }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    if (!isValidBtDbId(id, "div")) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }

    const {
      tmnt_id,
      div_name,
      hdcp_per,
      hdcp_from,
      int_hdcp,
      hdcp_for,
      sort_order,
    } = await request.json();
    const toCheck: divType = {
      ...initDiv,
      tmnt_id,
      div_name,
      hdcp_per,
      hdcp_from,
      hdcp_for,
      int_hdcp,
      sort_order,
    };

    const toPut = sanitizeDiv(toCheck);
    const errCode = validateDiv(toPut);
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

    // NO hdcp_per_str in data object
    const putDiv = await prisma.div.update({
      where: {
        id: id,
      },
      data: {
        // tmnt_id: toPut.tmnt_id, do not update tmnt_id
        div_name: toPut.div_name,
        hdcp_per: toPut.hdcp_per,
        hdcp_from: toPut.hdcp_from,
        int_hdcp: toPut.int_hdcp,
        hdcp_for: toPut.hdcp_for,
        sort_order: toPut.sort_order,
      },
    });
    // add in hdcp_per_str
    const div = {
      ...putDiv,
      hdcp_per_str: (putDiv.hdcp_per * 100).toFixed(2),
    };
    return NextResponse.json({ div }, { status: 200 });
  } catch (err: any) {
    let errStatus: number;
    switch (err.code) {
      case "P2002": // unique constraint
        errStatus = 404;
        break;
      case "P2003": // foreign key constraint
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
      { error: "error updating div" },
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
    if (!isValidBtDbId(id, "div")) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }

    const currentDiv = await prisma.div.findUnique({
      where: {
        id: id,
      },
    });    
    if (!currentDiv) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }

    const json = await request.json();
    // populate toCheck with json
    const jsonProps = Object.getOwnPropertyNames(json);    
    const toCheck: divType = {
      ...initDiv,
      tmnt_id: currentDiv.tmnt_id, 
      div_name: currentDiv.div_name,
      hdcp_per: currentDiv.hdcp_per,
      hdcp_from: currentDiv.hdcp_from,
      int_hdcp: currentDiv.int_hdcp,
      hdcp_for: currentDiv.hdcp_for as HdcpForTypes,
      sort_order: currentDiv.sort_order,
    };

    let gotDataToPatch = false;
    if (jsonProps.includes("div_name")) {
      toCheck.div_name = json.div_name;
      gotDataToPatch = true;
    }
    if (jsonProps.includes("hdcp_per")) {
      toCheck.hdcp_per = json.hdcp_per;
      gotDataToPatch = true;
    }
    if (jsonProps.includes("hdcp_from")) {
      toCheck.hdcp_from = json.hdcp_from;
      gotDataToPatch = true;
    }
    if (jsonProps.includes("int_hdcp")) {
      toCheck.int_hdcp = json.int_hdcp;
      gotDataToPatch = true;
    }
    if (jsonProps.includes("hdcp_for")) {
      toCheck.hdcp_for = json.hdcp_for;
      gotDataToPatch = true;
    }
    if (jsonProps.includes("sort_order")) {
      toCheck.sort_order = json.sort_order;
      gotDataToPatch = true;
    }

    if (!gotDataToPatch) {
      return NextResponse.json({ div: currentDiv }, { status: 200 });
    }
    const toBePatched = sanitizeDiv(toCheck);
    const errCode = validateDiv(toBePatched);
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

    let gotIntHdcp = undefined;    
    const toPatch = {
      ...initDiv,
      tmnt_id: "",
    };
    if (jsonProps.includes("div_name")) {
      toPatch.div_name = toBePatched.div_name;
    }
    if (jsonProps.includes("hdcp_per")) {
      // DO NOT add hdcp_per_str
      toPatch.hdcp_per = toBePatched.hdcp_per;
    }
    if (jsonProps.includes("hdcp_from")) {
      toPatch.hdcp_from = toBePatched.hdcp_from;
    }
    if (jsonProps.includes("int_hdcp")) {
      toPatch.int_hdcp = toBePatched.int_hdcp;
      gotIntHdcp = toPatch.int_hdcp;
    }
    if (jsonProps.includes("hdcp_for")) {
      toPatch.hdcp_for = toBePatched.hdcp_for;
    }
    if (jsonProps.includes("sort_order")) {
      toPatch.sort_order = toBePatched.sort_order;
    }

    const patchDiv = await prisma.div.update({
      where: {
        id: id,
      },
      // remove data if not sent
      data: {
        // tmnt_id: toPatch.tmnt_id || undefined, // do not patch tmnt_id
        div_name: toPatch.div_name || undefined,
        hdcp_per: toPatch.hdcp_per || undefined,
        hdcp_from: toPatch.hdcp_from || undefined,
        int_hdcp: toPatch.int_hdcp || gotIntHdcp,
        hdcp_for: toPatch.hdcp_for || undefined,
        sort_order: toPatch.sort_order || undefined,
      },
    });
    const div = {
      ...patchDiv,
      hdcp_per_str: (patchDiv.hdcp_per * 100).toFixed(2),
    };
    return NextResponse.json({ div }, { status: 200 });
  } catch (err: any) {
    let errStatus: number;
    switch (err.code) {
      case "P2002": // unique constraint
        errStatus = 404;
        break;
      case "P2003": // foreign key constraint
        errStatus = 404;
        break;
      default:
        errStatus = 500;
        break;
    }
    return NextResponse.json(
      { error: "error patching div" },
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
    if (!isValidBtDbId(id, "div")) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }

    const deletedDiv = await prisma.div.delete({
      where: {
        id: id,
      },
    });
    // add in hdcp_per_str
    const deleted = {
      ...deletedDiv,
      hdcp_per_str: (deletedDiv.hdcp_per * 100).toFixed(2),
    };
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
      { error: "error deleting div" },
      { status: errStatus }
    );
  }
}
