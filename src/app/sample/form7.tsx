"use client";
import React, { useState } from "react";
import { findUserByEmail, findUserById } from "@/lib/db/users/users";
import { User } from '@prisma/client'

const initUser = {
  id: "",
  email: "",
  first_name: "",
  last_name: "",
  phone: "",
  role: 'USER',
  password_hash: "",
  createdAt: new Date(),
  updatedAt: new Date(),
}

// user id's 
//  "usr_5bcefb5d314fff1ff5da6521a2fa7bde"
//  "usr_516a113083983234fc316e31fb695b85",
//  "usr_5735c309d480323662da31e13c35b91e", 

export const Form7: React.FC = () => {
  const [user, setUser] = useState(initUser)
  const [email, setEmail] = useState("")
  const [userId, setUserId] = useState("")

  const findByEmail = async () => {
    const foundUser = await findUserByEmail(email) as User
    if (foundUser && Object.keys(foundUser).length > 0) { 
      setUser({
        ...foundUser,
        phone: foundUser.phone ?? "",
        password_hash: foundUser.password_hash ?? "",
      })
    } else {
      setUser(initUser)
    }
  }

  const findById = async () => {
    const foundUser = await findUserById(userId) as User
    if (foundUser && Object.keys(foundUser).length > 0) { 
      setUser({
        ...foundUser,
        phone: foundUser.phone ?? "",
        password_hash: foundUser.password_hash ?? "",
      })
    } else {
      setUser(initUser)
    }
  }

  return (
    <>
      <h3>Find User</h3>
      <div className="row g-3 mb-3">
        <div className="col-md-3">
          <label className='form-label' htmlFor="email">Email</label>
          <input
            className="form-control"
            id="email"
            name="email"
            type="text"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>   
        <div className="col-md-3">
          <button onClick={findByEmail}>By email</button>
        </div>   
        <div className="col-md-3">
          <label className='form-label' htmlFor="id">Id</label>
          <input
            className="form-control"
            id="id"
            name="id"
            type="text"
            value={userId }
            onChange={(e) => setUserId(e.target.value)}
          />
        </div>   
        <div className="col-md-3">
          <button onClick={findById}>By id</button>
        </div>
      </div>
      <div className="row g-3 mb-3">
        <div className="col-md-3">
          <label className='form-label' htmlFor="first_name">First Name</label>
          <input 
            className="form-control"
            id="first_name"
            name="first_name"
            type="text"
            value={user.first_name}
            disabled
          />
        </div>
        <div className="col-md-3">
          <label className='form-label' htmlFor="last_name">Last Name</label>
          <input 
            className="form-control"
            id="last_name"
            name="last_name"
            type="text"
            value={user.last_name}
            disabled
          />
        </div>
        <div className="col-md-3">
          <label className='form-label' htmlFor="phone">Phone</label>
          <input 
            className="form-control"
            id="phone"
            name="phone"
            type="text"
            value={user.phone}
            disabled
          />
        </div>
        <div className="col-md-3">
          <label className='form-label' htmlFor="role">Role</label>
          <input 
            className="form-control"
            id="role"
            name="rolw"
            type="text"
            value={user.role}
            disabled
          />
        </div>
      </div>
    </>
  )
}
