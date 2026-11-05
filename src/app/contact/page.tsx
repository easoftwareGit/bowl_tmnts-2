import { ContactForm } from "./contactForm";

export default function ContactPage() {
  return (
    <div className="d-flex flex-column grow align-items-center">
      <div className="shadow p-3 m-3 rounded-3">
        <h1 className="mb-3 h2">Contact</h1>
        <ContactForm />
      </div>
    </div>
  );
}
