import { connection } from "next/server";
import { isBetaRegistrationOpen } from "@/lib/auth/registration";
import { RegisterForm } from "./registerForm";
import { RegistrationClosed } from "./registrationClosed";

export default async function RegisterPage() {
  // Render per request so REGISTRATION_MODE is read at runtime, not frozen at build
  await connection();
  const isOpen = isBetaRegistrationOpen();

  return (
    <div className="d-flex flex-column min-vh-100 justify-content-center align-items-center">
      <div className="shadow p-3 m-5 rounded-3">
        {isOpen ? (
          <>
            <h2 className="mb-3">Create your Account</h2>
            <RegisterForm />
          </>
        ) : (
          <RegistrationClosed />
        )}
      </div>
    </div>
  );
}