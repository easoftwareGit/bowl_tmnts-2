import { User } from "@prisma/client"
import { initPrismaUser } from "@/lib/db/initVals"

export const mockPrismaUsers: User[] = [
  { 
    ...initPrismaUser,
    id: "usr_a24894ed10c5dd835d5cbbfea7ac6dca",
    email: "eric@email.com",
    first_name: "Eric",
    last_name: "Johnson",
    phone: "+18005551234",
    role: 'DIRECTOR',
  },
  {
    ...initPrismaUser,
    id: "usr_5bcefb5d314fff1ff5da6521a2fa7bde",
    email: "john.doe@example.com",      
    first_name: "John",
    last_name: "Doe",
    phone: "800-555-1234",
    role: "ADMIN",
    password_hash: "$2b$12$C16ySjxkx1krojAMpoVZ3.v/pHt4ZtvDEBOXVGe4AUdPM0K/M4teq",
  },  
  {
    ...initPrismaUser,
    id: "usr_5bcefb5d314fff1ff5da6521a2fa7bdf",
    email: "jane.doe@example.com",      
    first_name: "Jane",
    last_name: "Doe",
    phone: "800-555-4321",
    role: "USER",
    password_hash: "$2b$12$C16ySjxkx1krojAMpoVZ3.v/pHt4ZtvDEBOXVGe4AUdPM0K/M4teq",
  }  
]