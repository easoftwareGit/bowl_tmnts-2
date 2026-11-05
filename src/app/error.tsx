"use client";

import { useEffect } from "react";
import { Button } from "react-bootstrap";

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div role="alert">
      <h1>
        Error <span aria-hidden="true">😧</span>
      </h1>
      <p>Something went wrong!</p>
      <Button variant="warning" onClick={reset}>
        Try Again
      </Button>
    </div>
  );
}
