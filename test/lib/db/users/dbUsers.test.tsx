import { prismaMock } from "../../../../singleton";
import { findUserByEmail, findUserById } from "@/lib/db/users/users";
import { mockPrismaUsers } from "../../../mocks/tmnts/twoDivs/mockUsers";

// in @/lib/db/users.ts, make sure to use correct prisma client
// import { prisma } from "@/lib/prisma"  // for production & developemnt
// import prisma from '../../../test/client'  // for testing
//
// switch the prisma client back after testing  

describe('users.tsx', () => { 

  describe('findUserByEmail', () => { 
    // do NOT test if findUserByEmail finds the user,
    // test if findUserByEmail uses prisma findUnique
    // test if email is checked and valid
    it('should return user data when found by searching by email', async () => {
      prismaMock.user.findUnique.mockResolvedValue(mockPrismaUsers[1]);
      const foundUser = await findUserByEmail('john.doe@example.com');
      expect(foundUser).toEqual(mockPrismaUsers[1]);
      expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'john.doe@example.com' }
      })
    })
    it('should return null when no data to search', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);
      const foundUser = await findUserByEmail('john.doe@example.com');
      expect(foundUser).toBeNull();
      expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'john.doe@example.com' }
      })
    })
    it('should return null when empty email passed in', async () => {
      prismaMock.user.findUnique.mockResolvedValue(mockPrismaUsers[0]);
      const foundUser = await findUserByEmail('');
      expect(foundUser).toBeNull();
      expect(prismaMock.user.findUnique).not.toHaveBeenCalledWith({
        where: { email: '' }
      })
    })
    it('should return null when invalid email passed in', async () => { 
      prismaMock.user.findUnique.mockResolvedValue(mockPrismaUsers[0]);
      const foundUser = await findUserByEmail('john.doeexample.com');
      expect(foundUser).toBeNull();
      expect(prismaMock.user.findUnique).not.toHaveBeenCalledWith({
        where: { email: 'john.doeexample.com' }
      })
    })
    it('should return null if email is too long', async () => {
      prismaMock.user.findUnique.mockResolvedValue(mockPrismaUsers[0]);
      const foundUser = await findUserByEmail('john.doe123456789012345678901234567890@example.com');
      expect(foundUser).toBeNull();
      expect(prismaMock.user.findUnique).not.toHaveBeenCalledWith({
        where: { email: 'john.doe123456789012345678901234567890@example.com' }
      })
    })
    it('should return error when network or server issues cause a request failure', async () => {
      prismaMock.user.findUnique.mockRejectedValue(new Error('Network Error'));
      try {
        const foundUser = await findUserByEmail('john.doe@example.com');
        expect(foundUser).toEqual({});
      } catch (error: any) {
        expect(error.message).toEqual('Network Error');
      }
    })

  })

  describe('findUserById', () => { 
    // do NOT test if findUserById finds the user,
    // test if findUserById uses prisma findUnique
    // test if id is checked and valid

    it('should return user data when found by searching by id', async () => {
      prismaMock.user.findUnique.mockResolvedValue(mockPrismaUsers[0]);
      const foundUser = await findUserById('usr_a24894ed10c5dd835d5cbbfea7ac6dca');
      expect(foundUser).toEqual(mockPrismaUsers[0]);
      expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'usr_a24894ed10c5dd835d5cbbfea7ac6dca' }
      })
    })
    it('should return null when no data to search', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);
      const foundUser = await findUserById('usr_a24894ed10c5dd835d5cbbfea7ac6dca');
      expect(foundUser).toBeNull();
      expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'usr_a24894ed10c5dd835d5cbbfea7ac6dca' }
      })
    })
    it('should return null when empty id passed in', async () => {
      prismaMock.user.findUnique.mockResolvedValue(mockPrismaUsers[0]);
      const foundUser = await findUserById('');
      expect(foundUser).toBeNull();
      expect(prismaMock.user.findUnique).not.toHaveBeenCalledWith({
        where: { id: '' }
      })
    })
    // dont need to test if id is too long
    // error check isValidBtDbId() in findUserById() will do that
    it('should return null when invalid id passed in', async () => {
      prismaMock.user.findUnique.mockResolvedValue(mockPrismaUsers[0]);
      const foundUser = await findUserById('bwl_a24894ed10c5dd835d5cbbfea7ac6dca');
      expect(foundUser).toBeNull();
      expect(prismaMock.user.findUnique).not.toHaveBeenCalledWith({
        where: { id: 'bwl_a24894ed10c5dd835d5cbbfea7ac6dca' }
      })
    })    
    it('should return error when network or server issues cause a request failure', async () => {
      prismaMock.user.findUnique.mockRejectedValue(new Error('Network Error'));
      try {
        const foundUser = await findUserById('usr_a24894ed10c5dd835d5cbbfea7ac6dca');
        expect(foundUser).toEqual({});
      } catch (error: any) {
        expect(error.message).toEqual('Network Error');
      }
    })
  })
})