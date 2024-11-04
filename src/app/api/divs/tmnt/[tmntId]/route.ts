import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isValidBtDbId } from "@/lib/validation";

// routes /api/divs/tmnt/:tmntId

export async function GET(
  request: Request,
  { params }: { params: { tmntId: string } }
) {   
  try {
    const tmntId = params.tmntId;
    // check if id is a valid tmnt id
    if (!isValidBtDbId(tmntId, 'tmt')) {
      return NextResponse.json(
        { error: "not found" },
        { status: 404 }
      );        
    }
    const gotDivs = await prisma.div.findMany({
      where: {
        tmnt_id: tmntId
      },
      orderBy: {
        sort_order: 'asc'
      }
    })    
    // no matching rows is ok

    // add in hdcp_per_str
    const divs = gotDivs.map(gotDiv => ({
      ...gotDiv,
      hdcp_per_str: (gotDiv.hdcp_per * 100).toFixed(2)
    }))
    return NextResponse.json({divs}, {status: 200});    
  } catch (err: any) {
    return NextResponse.json(
      { error: "error getting divs for event" },
      { status: 500 }
    );        
  } 
}

export async function DELETE(
  request: Request,
  { params }: { params: { tmntId: string } }
) {   
  try {
    const tmntId = params.tmntId;
    // check if tmntId is a valid tmnt id
    if (!isValidBtDbId(tmntId, 'tmt')) {
      return NextResponse.json(
        { error: "not found" },
        { status: 404 }
      );        
    }
    const deleted = await prisma.div.deleteMany({
      where: {
        tmnt_id: tmntId,
      },
    });    
    return NextResponse.json({ deleted }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json(
      { error: "error getting divs for tmnt" },
      { status: 500 }
    );        
  } 
}