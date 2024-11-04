"use client"
import React, { useState, ChangeEvent } from 'react'

const fruits = [
  {
    id: 1,
    name: 'Apple',
  },
  {
    id: 2,
    name: 'Banana',
  },
  {
    id: 3,
    name: 'Cherry',
  }
]

const numbers = [
  {
    id: 1,
    name: 'One',
  },
  {
    id: 2,
    name: 'Two',
  },
  {
    id: 3,
    name: 'Three',
  }
]

const myObj = {
  fruit: 'Apple',
  number: 'Two',
}

export const Form2: React.FC = () => {
  
  const [data, setFormData] = useState(myObj);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...data,
      [name]: value
    });
  }

  return (
    <>
      <div className="row g-3 mb-3">
        <div className="col-md-3">
          <label className='form-label'>Fruit</label>
          {fruits.map((fruit) => (
            <div className="form-check" key={fruit.id}>
              <input
                className="form-check-input"
                type="radio"
                name="fruit"
                id={`fruit${fruit.id}`}
                value={fruit.name}
                checked={data.fruit === fruit.name}
                onChange={handleChange}
              />
              <label
                className="form-check-label"
                htmlFor={`fruit${fruit.id}`}
              >
                {fruit.name}
              </label>
            </div>          
          ))}
        </div>    
        <div className="col-md-3">
          <label className='form-label'>Numbers</label>
          {numbers.map((number) => (
            <div className="form-check" key={number.id}>
              <input
                className="form-check-input"
                type="radio"
                name="number"
                id={`number${number.id}`}
                value={number.name}
                checked={data.number === number.name}
                onChange={handleChange}
              />
              <label
                className="form-check-label"
                htmlFor={`number${number.id}`}
              >
                {number.name}
              </label>
            </div>
          ))}          
        </div>        
      </div>
    </>
  )
}