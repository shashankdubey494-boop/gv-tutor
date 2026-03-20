import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, MapPin, Phone } from "lucide-react";
import { submitContactForm } from "../services/contactService";
import SiteFooter from "../components/SiteFooter";

const contactHighlights = [
  {
    title: "Fast Response",
    description: "We review contact requests quickly so students and parents can move forward without delay."
  },
  {
    title: "Guided Support",
    description: "Whether you need home tutoring, coaching, or library details, we help you find the right fit."
  },
  {
    title: "Direct Communication",
    description: "Reach our team through email, phone, or the contact form for clear next steps."
  }
];

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSubmitted(false);

    try {
      const fullMessage = formData.subject
        ? `Subject: ${formData.subject}\n\n${formData.message}`
        : formData.message;

      await submitContactForm({
        name: formData.name,
        email: formData.email,
        message: fullMessage
      });

      setSubmitted(true);
      setFormData({ name: "", email: "", subject: "", message: "" });
      setTimeout(() => setSubmitted(false), 5000);
    } catch (err) {
      setError(err.message || "Failed to send message. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#fefcf7_0%,#f7fbff_32%,#fff8fb_100%)] pt-28 text-slate-900">
      <div className="pointer-events-none absolute inset-x-0 top-24 overflow-hidden">
        <motion.div
          animate={{ x: [0, 34, 0], y: [0, -18, 0] }}
          transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }}
          className="absolute left-[8%] top-12 h-44 w-44 rounded-full bg-cyan-200/35 blur-3xl"
        />
        <motion.div
          animate={{ x: [0, -24, 0], y: [0, 24, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          className="absolute right-[10%] top-4 h-56 w-56 rounded-full bg-fuchsia-200/30 blur-3xl"
        />
        <motion.div
          animate={{ x: [0, 12, 0], y: [0, 18, 0] }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
          className="absolute left-1/2 top-44 h-28 w-28 -translate-x-1/2 rounded-full bg-amber-200/30 blur-2xl"
        />
      </div>

      <div className="max-w-7xl mx-auto space-y-10 px-4 pb-20">
        <section className="relative overflow-hidden rounded-[2rem] border border-cyan-200/70 bg-gradient-to-br from-white via-cyan-50/80 to-fuchsia-50/70 px-6 py-12 sm:px-10 sm:py-14 shadow-[0_30px_80px_rgba(14,165,233,0.10)]">
          <div className="absolute -top-20 right-0 h-64 w-64 rounded-full bg-cyan-300/30 blur-3xl" />
          <div className="absolute bottom-0 left-0 h-64 w-64 rounded-full bg-fuchsia-300/25 blur-3xl" />
          <div className="relative z-10 max-w-4xl">
            <span className="inline-flex items-center rounded-full border border-cyan-300 bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-cyan-700">
              Contact GoodwillEdu
            </span>
            <h1 className="mt-5 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
              Let&apos;s make it easy for students and families to reach you.
            </h1>
            <p className="mt-4 max-w-3xl text-lg leading-relaxed text-slate-600">
              This page now matches the same light, polished feel as About and Library, while keeping the contact flow simple and clear.
            </p>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-3">
          {contactHighlights.map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: index * 0.08 }}
              whileHover={{ y: -4 }}
              className="rounded-[1.4rem] border border-white/80 bg-white/80 px-5 py-5 shadow-[0_18px_40px_rgba(15,23,42,0.05)] backdrop-blur-sm"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-700">{item.title}</p>
              <p className="mt-3 leading-relaxed text-slate-600">{item.description}</p>
            </motion.div>
          ))}
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[1.8rem] border border-cyan-200/70 bg-gradient-to-br from-white via-cyan-50/70 to-fuchsia-50/60 p-6 shadow-[0_24px_80px_rgba(14,165,233,0.10)] sm:p-8">
            <h2 className="text-3xl font-bold text-slate-900">Send us a message</h2>
            <p className="mt-3 text-slate-600">
              Have questions? Share your details and we&apos;ll get back to you as soon as possible.
            </p>

            {submitted ? (
              <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-4 text-emerald-700">
                Thank you for your message. We&apos;ll get back to you soon.
              </div>
            ) : null}

            {error ? (
              <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-4 text-rose-700">
                {error}
              </div>
            ) : null}

            <form onSubmit={handleSubmit} className="mt-8 space-y-4">
              <input
                type="text"
                name="name"
                placeholder="Your Name *"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full rounded-xl border border-cyan-100 bg-white/85 px-4 py-3 text-slate-900 outline-none transition focus:border-cyan-300 focus:ring-2 focus:ring-cyan-200"
              />

              <input
                type="email"
                name="email"
                placeholder="Your Email *"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full rounded-xl border border-cyan-100 bg-white/85 px-4 py-3 text-slate-900 outline-none transition focus:border-cyan-300 focus:ring-2 focus:ring-cyan-200"
              />

              <input
                type="text"
                name="subject"
                placeholder="Subject *"
                value={formData.subject}
                onChange={handleChange}
                required
                className="w-full rounded-xl border border-cyan-100 bg-white/85 px-4 py-3 text-slate-900 outline-none transition focus:border-cyan-300 focus:ring-2 focus:ring-cyan-200"
              />

              <textarea
                name="message"
                placeholder="Your Message *"
                value={formData.message}
                onChange={handleChange}
                required
                rows="6"
                className="w-full resize-none rounded-xl border border-cyan-100 bg-white/85 px-4 py-3 text-slate-900 outline-none transition focus:border-cyan-300 focus:ring-2 focus:ring-cyan-200"
              />

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-500 to-fuchsia-500 py-3 font-semibold text-white shadow-lg shadow-cyan-500/20 transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? (
                  <>
                    <div className="h-5 w-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    Sending...
                  </>
                ) : (
                  "Send Message"
                )}
              </button>
            </form>
          </div>

          <div className="space-y-6">
            <div className="rounded-[1.8rem] border border-cyan-200/70 bg-gradient-to-br from-white via-cyan-50/70 to-amber-50/70 p-6 shadow-[0_24px_80px_rgba(59,130,246,0.10)] sm:p-8">
              <h2 className="text-2xl font-bold text-slate-900">Other Ways to Reach Us</h2>
              <div className="mt-6 space-y-4">
                <div className="flex items-start gap-4 rounded-2xl border border-cyan-100 bg-white/80 px-4 py-4 shadow-sm">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-100 text-cyan-700">
                    <Mail size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-700">Email</p>
                    <p className="mt-1 text-slate-700">goodwill2404@gmail.com</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 rounded-2xl border border-cyan-100 bg-white/80 px-4 py-4 shadow-sm">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-100 text-cyan-700">
                    <Phone size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-700">Phone</p>
                    <p className="mt-1 text-slate-700">+91 9691569239</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 rounded-2xl border border-cyan-100 bg-white/80 px-4 py-4 shadow-sm">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-100 text-cyan-700">
                    <MapPin size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-700">Address</p>
                    <p className="mt-1 text-slate-700">Neerja Nagar, Durgesh Vihar JK Road, Bhopal, Madhya Pradesh 462022</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="overflow-hidden rounded-[1.8rem] border border-cyan-200/70 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
              <div className="border-b border-cyan-100 px-6 py-5">
                <h3 className="text-xl font-bold text-slate-900">Visit Our Location</h3>
                <p className="mt-1 text-slate-600">A direct map view for students and families planning a visit.</p>
              </div>
              <div className="relative min-h-[320px] bg-slate-100">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3667.8325432673!2d77.4129!3d23.2599!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x397c428f8e7e6e9b%3A0x5c8b9c8b9c8b9c8b!2sNeerja+Nagar%2C+Durgesh+Vihar+JK+Road%2C+Bhopal%2C+Madhya+Pradesh+462022!5e0!3m2!1sen!2sin!4v1634567890123!5m2!1sen!2sin"
                  className="absolute inset-0 h-full w-full"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                />
              </div>
            </div>
          </div>
        </section>
      </div>

      <SiteFooter />
    </div>
  );
}
