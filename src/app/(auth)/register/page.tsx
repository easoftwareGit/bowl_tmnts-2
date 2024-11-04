import { RegisterForm } from "./form";

export default function RegisterPage() {
  return (
    <div className="d-flex flex-column min-vh-100 justify-content-center align-items-center">
      <div className="shadow p-3 m-5 rounded-3">
        <h2 className="mb-3">Create your Account</h2>
        <RegisterForm />
      </div>
    </div>
  );
}
