import { ContactForm } from "./contactForm";

export default function RegisterPage() {
  return (
    <div className="d-flex flex-column min-vh-100 align-items-center">
      <div className="shadow p-3 m-5 rounded-3">
        <h2 className="mb-3">Contact</h2>
        <ContactForm />
      </div>
    </div>
  );
}
