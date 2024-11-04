"use server"
// these functions need to be in a file with "use server" at the top
// prima is a server only, using these functions without the "use server" 
// directive in a client file will cause an error. 

import { prisma } from "@/lib/prisma"  // for production & developemnt
// import prisma from '../../../../test/client'  // for testing

import { isEmail, isValidBtDbId, maxEmailLength } from "@/lib/validation";
import { User } from '@prisma/client'

/**
 * finds one user by searching for a matching email address
 *
 * @param {string} email - user's email
 * @return {Object|null} Object = User's data; mull = user not found
 */
export async function findUserByEmail(email: string): Promise<User | null> {
  try {
    // validate email
    if (!email || !isEmail(email) || email.length > maxEmailLength) {
      return null;
    }
    // find user in database by matching email
    const user = await prisma.user.findUnique({
      where: {
        email: email,
      },
    });    
    return (user) ? user : null;
  } catch (err) {
    if (err instanceof Error) {
      throw Error(err.message)
    } else {
      throw Error('error finding user')
    }
  }
}

/**
 * finds one user by searching for a matching id
 *
 * @param {string} id - user's email
 * @return {Object|null} Object = User's data; mull = user not found
 */
export async function findUserById(id: string): Promise<User | null> {
  try {
    // validate the id as a user id
    if (!isValidBtDbId(id, 'usr')) {
      return null;
    }
    // find user in database by matching id
    const user = await prisma.user.findUnique({
      where: {
        id: id,
      },
    });    
    return (user) ? user : null;
  } catch (err) {
    if (err instanceof Error) {
      throw Error(err.message)
    } else {
      throw Error('error finding user')
    }
  }
}