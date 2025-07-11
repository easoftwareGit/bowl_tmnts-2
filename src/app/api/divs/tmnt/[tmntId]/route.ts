import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isValidBtDbId } from "@/lib/validation";

// routes /api/divs/tmnt/:tmntId

export async function GET(
  request: Request,
  { params }: { params: Promise<{ tmntId: string }> }
) {
  try {
    const { tmntId } = await params;
    // check if id is a valid tmnt id
    if (!isValidBtDbId(tmntId, 'tmt')) {
      return NextResponse.json(
        { error: "not found" },
        { status: 404 }
      );        
    }
    const divs = await prisma.div.findMany({
      where: {
        tmnt_id: tmntId
      },
      orderBy: {
        sort_order: 'asc'
      }
    })    
    // no matching rows is ok
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
  { params }: { params: Promise<{ tmntId: string }> }
) {
  try {
    const { tmntId } = await params;
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