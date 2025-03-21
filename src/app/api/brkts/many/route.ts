import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ErrorCode } from "@/lib/validation";
import { brktType, brktDataType } from "@/lib/types/types";
import { validateBrkts } from "../validate";
import { calcFSA } from "@/lib/currency/fsa";

// routes /api/brkts/many

export async function POST(request: NextRequest) {

  try {
    const brkts: brktType[] = await request.json();
    // sanitize and validate brkts
    const validBrkts = await validateBrkts(brkts); // need to use await! or else returns a promise
    if (validBrkts.errorCode !== ErrorCode.None) {
      return NextResponse.json({ error: "invalid data" }, { status: 422 });
    }
    // convert valid brkts into brktData to post
    const brktsToPost: brktDataType[] = []
    validBrkts.brkts.forEach(brkt => {
      brktsToPost.push({
        id: brkt.id,
        div_id: brkt.div_id,
        squad_id: brkt.squad_id,
        fee: brkt.fee,
        start: brkt.start,
        games: brkt.games,
        players: brkt.players,
        first: brkt.first,
        second: brkt.second,
        admin: brkt.admin,        
        sort_order: brkt.sort_order
      })
    });      

    const prismaBrkts = await prisma.brkt.createManyAndReturn({
      data: [...brktsToPost]
    })
    // add fsa
    const manyBrkts = prismaBrkts.map((brkt) => ({
      ...brkt,
      fsa: calcFSA(brkt.first, brkt.second, brkt.admin),      
    }))
    return NextResponse.json({brkts: manyBrkts}, { status: 201 });    
  } catch (err: any) {
    let errStatus: number
    switch (err.code) {
      case 'P2002': // Unique constraint
        errStatus = 409 
        break;
      case 'P2003': // parent not found
        errStatus = 404
        break;    
      default:
        errStatus = 500
        break;
    }
    return NextResponse.json(
      { error: "error creating many brkts" },
      { status: errStatus }
    );        
  } 
}