import { User } from "@prisma/client";

export const initPrismaUser: User = {
  id: "",  
  email: "",  
  password_hash: "",  
  first_name: "",
  last_name: "",
  phone: "",
  role: 'USER',
  failed_pwd_attempts: 0,
  pwd_locked_until: null,
  createdAt: new Date(),
  updatedAt: new Date(),
}