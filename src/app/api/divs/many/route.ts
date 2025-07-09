import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ErrorCode } from "@/lib/validation";
import { divDataType, divType, HdcpForTypes } from "@/lib/types/types";
import { initDiv } from "@/lib/db/initVals";
import { validateDivs } from "../validate";
import { getErrorStatus } from "../../errCodes";

// routes /api/divs/many

export async function POST(request: NextRequest) { 

  try {
    const divs: divType[] = await request.json();

    // sanitize and validate divs
    const validDivs = await validateDivs(divs); // need to use await! or else returns a promise
    if (validDivs.errorCode !== ErrorCode.None) {
      return NextResponse.json({ error: "invalid data" }, { status: 422 });
    }

    // convert valid divs into eventData to post
    const divsToPost: divDataType[] = []
    validDivs.divs.forEach(div => {
      divsToPost.push({
        id: div.id,
        tmnt_id: div.tmnt_id,
        div_name: div.div_name,
        hdcp_per: div.hdcp_per,
        hdcp_from: div.hdcp_from,
        int_hdcp: div.int_hdcp,
        hdcp_for: div.hdcp_for,
        sort_order: div.sort_order,
      })
    });

    const prismaDivs = await prisma.div.createManyAndReturn({
      data: [...divsToPost]
    })

    // convert prismaDivs to divs
    const manyDivs: divType[] = []
    prismaDivs.map((div) => {
      manyDivs.push({
        ...initDiv,
        id: div.id,
        tmnt_id: div.tmnt_id,
        div_name: div.div_name,
        hdcp_per: div.hdcp_per,
        hdcp_from: div.hdcp_from,
        int_hdcp: div.int_hdcp,
        hdcp_for: div.hdcp_for as HdcpForTypes,
        sort_order: div.sort_order,
      })
    })
    return NextResponse.json({divs: manyDivs}, { status: 201 });    
  } catch (err: any) {
    const errStatus = getErrorStatus(err.code);
    return NextResponse.json(
      { error: "error creating many divs" },
      { status: errStatus }
    );        
  } 
}