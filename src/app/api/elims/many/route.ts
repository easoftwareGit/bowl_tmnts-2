import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ErrorCode } from "@/lib/validation";
import { elimType, elimDataType } from "@/lib/types/types";
import { initElim } from "@/lib/db/initVals";
import { validateElims } from "../validate";

// routes /api/elims/many

export async function POST(request: NextRequest) {

  try {
    const elims: elimType[] = await request.json();
    // sanitize and validate elims
    const validElims = await validateElims(elims); // need to use await! or else returns a promise
    if (validElims.errorCode !== ErrorCode.None) {
      return NextResponse.json({ error: "invalid data" }, { status: 422 });
    }
    // convert valid pots into potData to post
    const elimsToPost: elimDataType[] = []
    validElims.elims.forEach(elim => {
      elimsToPost.push({
        id: elim.id,
        div_id: elim.div_id,
        squad_id: elim.squad_id,
        start: elim.start,
        games: elim.games,
        fee: elim.fee,
        sort_order: elim.sort_order
      })
    });      

    const prismaElims = await prisma.elim.createManyAndReturn({
      data: [...elimsToPost]
    })
    // convert prismaElims to elims
    const manyElims: elimType[] = [];
    prismaElims.map((elim) => {
      manyElims.push({
        ...initElim,
        id: elim.id,
        div_id: elim.div_id,
        squad_id: elim.squad_id,
        start: elim.start,
        games: elim.games,
        fee: elim.fee + '',
        sort_order: elim.sort_order,
      })
    })
    return NextResponse.json({elims: manyElims}, { status: 201 });    
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
      { error: "error creating many elims" },
      { status: errStatus }
    );        
  } 
}