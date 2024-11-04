"use client"

import { Button } from "react-bootstrap";

interface ErrorPageProps {
  error: Error;
  reset: () => void;
}

export default function Error({error, reset}: ErrorPageProps ) {
  return (
    <div>
      <h1>Error 😧</h1>
      <p>Something went wrong!</p>
      <Button className="btn btn-warning" onClick={reset}>Try Again</Button>
    </div>
  )
}