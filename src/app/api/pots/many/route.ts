import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ErrorCode } from "@/lib/validation";
import { potType, potDataType, potCategoriesTypes } from "@/lib/types/types";
import { initPot } from "@/lib/db/initVals";
import { validatePots } from "../validate";

// routes /api/pots/many

export async function POST(request: NextRequest) {

  try {
    const pots: potType[] = await request.json();
    // sanitize and validate pots
    const validPots = await validatePots(pots); // need to use await! or else returns a promise
    if (validPots.errorCode !== ErrorCode.None) {
      return NextResponse.json({ error: "invalid data" }, { status: 422 });
    }
    // convert valid pots into potData to post
    const potsToPost: potDataType[] = []
    validPots.pots.forEach(pot => {
      potsToPost.push({
        id: pot.id,
        div_id: pot.div_id,
        squad_id: pot.squad_id,
        pot_type: pot.pot_type,
        fee: pot.fee,
        sort_order: pot.sort_order,
      })
    });      

    const prismaPots = await prisma.pot.createManyAndReturn({
      data: [...potsToPost]
    })
    // convert prismaPots to pots
    const manyPots: potType[] = [];
    prismaPots.map((pot) => {
      manyPots.push({
        ...initPot,
        id: pot.id,
        div_id: pot.div_id,
        squad_id: pot.squad_id,
        pot_type: pot.pot_type as potCategoriesTypes,
        fee: pot.fee + '',
        sort_order: pot.sort_order,
      })
    })
    return NextResponse.json({pots: manyPots}, { status: 201 });    
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
      { error: "error creating many pots" },
      { status: errStatus }
    );        
  } 
}
