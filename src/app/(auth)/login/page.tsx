import { Suspense } from "react";
import { LoginForm } from "./loginForm";

export default function LoginPage() {
  return (
    <div className="d-flex flex-column min-vh-100 justify-content-center align-items-center">
      <div className="shadow p-3 m-5 rounded-3">
        <h2 className="mb-3">Login</h2>
        {/* LoginForm reads the URL with useSearchParams(), which needs a
            Suspense boundary so the rest of the page can be prerendered */}
        <Suspense fallback={null}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}