import { LoginForm } from "./form";

export default function LoginPage() {
  return (
    <div className="d-flex flex-column min-vh-100 justify-content-center align-items-center">
      <div className="shadow p-3 m-5 rounded-3">
        <h2 className="mb-3">Login</h2>
        <LoginForm />
      </div>
    </div>
  );
}