import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ErrorCode } from "@/lib/validation";
import { divDataType, divType, HdcpForTypes } from "@/lib/types/types";
import { validateDivs } from "../validate";
import { getErrorStatus } from "../../errCodes";
import { divDataForPrisma } from "../dataForPrisma";

// routes /api/divs/many

export async function POST(request: NextRequest) { 

  try {
    const divs: divType[] = await request.json();
    if (Array.isArray(divs) && divs.length === 0) {
      return NextResponse.json({ count: 0 }, { status: 200 });
    }
    // sanitize and validate divs
    const validDivs = validateDivs(divs); // need to use await! or else returns a promise
    if (validDivs.errorCode !== ErrorCode.None) {
      return NextResponse.json({ error: "invalid data" }, { status: 422 });
    }

    // convert valid divs into divData to post
    const divsToPost: divDataType[] = validDivs.divs
      .map(div => divDataForPrisma(div))
      .filter((data): data is divDataType => data !== null);

    // const divsToPost: divDataType[] = []
    // validDivs.divs.forEach(div => {
    //   divsToPost.push({
    //     id: div.id,
    //     tmnt_id: div.tmnt_id,
    //     div_name: div.div_name,
    //     hdcp_per: div.hdcp_per,
    //     hdcp_from: div.hdcp_from,
    //     int_hdcp: div.int_hdcp,
    //     hdcp_for: div.hdcp_for,
    //     sort_order: div.sort_order,
    //   })
    // });

    const result = await prisma.div.createMany({
      data: divsToPost,
      skipDuplicates: false, // or true if you want to silently skip existing rows
    })
    return NextResponse.json({ count: result.count }, { status: 201 });
  } catch (err: any) {
    const errStatus = getErrorStatus(err.code);
    return NextResponse.json(
      { error: "error creating many divs" },
      { status: errStatus }
    );        
  } 
}