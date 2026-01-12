import { FaWhatsapp } from "react-icons/fa";

export default function Contact() {
  return (
    <div style={{ padding: 32, color: "#c02222ff" }}>
      <h1>Contact Us</h1>
      <p>We’re happy to help you. Reach out anytime.</p>

      <p><b>Phone:</b> +91 7975854927</p>
      <p><b>Email:</b> knshivakumar@motera.in</p>
      <p><b>Working Hours:</b> 9:30 AM – 7:30 PM</p>

      <a
        href="https://wa.me/917975854927"
        target="_blank"
        rel="noreferrer"
        style={{ color: "#25D366", fontSize: 20 }}
      >
        <FaWhatsapp /> Chat on WhatsApp
      </a>
    </div>
  );
}
