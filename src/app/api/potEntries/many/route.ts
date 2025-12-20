import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ErrorCode } from "@/lib/validation";
import { potEntryDataType, potEntryType } from "@/lib/types/types";
import { validatePotEntries } from "../validate";
import { getErrorStatus } from "../../errCodes";
import { potEntryDataForPrisma } from "../dataForPrisma";

// routes /api/divEntries/many

export async function POST(request: NextRequest) {
   
  try {
    const potEntries: potEntryType[] = await request.json();
    if (Array.isArray(potEntries) && potEntries.length === 0) {
      return NextResponse.json({ count: 0 }, { status: 200 });
    }
    // sanitize and validate divEntries
    const validPotEntries = await validatePotEntries(potEntries); // need to use await! or else returns a promise
    if (validPotEntries.errorCode !== ErrorCode.None) {
      return NextResponse.json({ error: "invalid data" }, { status: 422 });
    }
    // convert valid potEntries into potEntryData to post
    const potEntriesToPost: potEntryDataType[] = validPotEntries.potEntries
      .map(potEntry => potEntryDataForPrisma(potEntry))
      .filter(potEntry => potEntry !== null) as potEntryDataType[]; 
    const result = await prisma.pot_Entry.createMany({
      data: potEntriesToPost,
      skipDuplicates: false, // or true if you want to silently skip existing rows
    })
    return NextResponse.json({ count: result.count }, { status: 201 });
  } catch (err: any) {
    const errStatus = getErrorStatus(err.code);
    return NextResponse.json(
      { error: "error creating many potEntries" },
      { status: errStatus }
    );        
  } 
}

// export async function PUT(request: NextRequest) { 

//   try {
//     const tePotEntries: tmntEntryPotEntryType[] = await request.json();
//     const validPotEntries = await validatePotEntries(tePotEntries as potEntryType[]); // need to use await! or else returns a promise
//     if (validPotEntries.errorCode !== ErrorCode.None) {
//       return NextResponse.json({ error: "invalid data" }, { status: 422 });
//     }

//     const validTePotEntries: tmntEntryPotEntryType[] = [];
//     validPotEntries.potEntries.forEach((potEntry) => {
//       const foundPotEntry = tePotEntries.find((p) => p.pot_id === potEntry.pot_id && p.player_id === potEntry.player_id);
//       if (foundPotEntry) {
//         const vtePotEntry = {
//           ...potEntry,
//           eType: foundPotEntry.eType,
//         }
//         validTePotEntries.push(vtePotEntry);
//       }
//     })

//     if (validTePotEntries.length === 0) {
//       return NextResponse.json({ error: "invalid data" }, { status: 422 });
//     }

//     const potEntriesToUpdate = validTePotEntries.filter((potEntry) => potEntry.eType === "u");    
//     const updateManySQL = (potEntriesToUpdate.length > 0)
//       ? getUpdateManySQL(potEntriesToUpdate)
//       : "";
    
//     const potEntriesToInsert = validTePotEntries.filter((potEntry) => potEntry.eType === "i");
//     const insertManySQL = (potEntriesToInsert.length > 0)
//       ? getInsertManySQL(potEntriesToInsert)
//       : "";
    
//     const potEntriesToDelete = validTePotEntries.filter((potEntry) => potEntry.eType === "d");
//     const deleteManySQL = (potEntriesToDelete.length > 0)
//       ? getDeleteManySQL(potEntriesToDelete)
//       : "";

//     const [updates, inserts, deletes] = await prisma.$transaction([
//       prisma.$executeRawUnsafe(updateManySQL),
//       prisma.$executeRawUnsafe(insertManySQL),
//       prisma.$executeRawUnsafe(deleteManySQL),      
//     ])

//     const updateInfo = { updates: updates, inserts: inserts, deletes: deletes };    
//     return NextResponse.json({updateInfo}, { status: 200 });
//   } catch (err: any) {
//     const errStatus = getErrorStatus(err.code);
//     return NextResponse.json(
//       { error: "error updating many potEntries" },
//       { status: errStatus }
//     );
//   }    
// }