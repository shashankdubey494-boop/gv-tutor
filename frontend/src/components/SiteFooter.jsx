import { useState } from "react";
import { Link } from "react-router-dom";

const policyContent = {
  privacy: {
    title: "Privacy Policy",
    body: [
      "We collect only the information needed to provide tutoring services and respond to inquiries.",
      "Your contact details are used to communicate about classes, schedules, and support.",
      "We do not sell your personal information to third parties."
    ]
  },
  terms: {
    title: "Terms of Service",
    body: [
      "By using our platform, you agree to provide accurate information and follow our community guidelines.",
      "Tutoring sessions are subject to availability and scheduling confirmation.",
      "We may update services or policies to improve quality and compliance."
    ]
  },
  cookies: {
    title: "Cookie Policy",
    body: [
      "We use cookies to remember your preferences and improve site performance.",
      "You can control or delete cookies through your browser settings.",
      "Disabling cookies may affect some features of the website."
    ]
  }
};

export default function SiteFooter() {
  const [activePolicy, setActivePolicy] = useState(null);

  return (
    <>
      <footer className="relative overflow-hidden">
        <style>{`
          @keyframes siteFooterBorderShift {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }

          @keyframes siteFooterFloat {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-8px); }
          }
        `}</style>

        <div className="absolute inset-0 opacity-90">
          <div className="absolute -top-16 left-10 h-64 w-64 rounded-full bg-cyan-200/45 blur-3xl" />
          <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-fuchsia-200/40 blur-3xl" />
          <div className="absolute top-1/3 right-1/3 h-48 w-48 rounded-full bg-amber-200/35 blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 pb-6 sm:px-6 lg:px-8">
          <div
            className="rounded-[2rem] p-[1.5px]"
            style={{
              backgroundImage:
                "linear-gradient(120deg, rgba(34,211,238,0.92), rgba(59,130,246,0.9), rgba(168,85,247,0.9), rgba(16,185,129,0.88), rgba(244,114,182,0.88), rgba(34,211,238,0.92))",
              backgroundSize: "300% 300%",
              animation: "siteFooterBorderShift 8s linear infinite"
            }}
          >
            <div className="rounded-[calc(2rem-1.5px)] bg-white/85 backdrop-blur-xl px-5 py-8 text-slate-900 sm:px-8 sm:py-10">
              <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
                <div className="col-span-1 md:col-span-2">
                  <div className="mb-4">
                    <span className="inline-flex items-center rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-cyan-700">
                      GoodwillEdu
                    </span>
                  </div>
                  <h3 className="mb-4 text-2xl font-bold sm:text-3xl">Goodwill Group of Education</h3>
                  <p className="mb-6 max-w-2xl leading-relaxed text-slate-600">
                    Empowering students with quality education and personalized learning experiences.
                    Your trusted partner in academic excellence and career development.
                  </p>
                  <div className="flex space-x-4">
                    <a
                      href="https://www.instagram.com/gv.library.as_/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg transition-transform duration-300 hover:scale-110"
                      style={{ animation: "siteFooterFloat 4s ease-in-out infinite" }}
                      aria-label="Instagram"
                    >
                      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zM5.838 12a6.162 6.162 0 1112.324 0 6.162 6.162 0 01-12.324 0zM12 16a4 4 0 110-8 4 4 0 010 8zm4.965-10.405a1.44 1.44 0 112.881.001 1.44 1.44 0 01-2.881-.001z" />
                      </svg>
                    </a>
                    <a
                      href="https://www.facebook.com/amit.sahu.71513#"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg transition-transform duration-300 hover:scale-110"
                      style={{ animation: "siteFooterFloat 4.6s ease-in-out infinite" }}
                      aria-label="Facebook"
                    >
                      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                      </svg>
                    </a>
                    <a
                      href="https://wa.me/919691569239"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg transition-transform duration-300 hover:scale-110"
                      style={{ animation: "siteFooterFloat 5.2s ease-in-out infinite" }}
                      aria-label="WhatsApp"
                    >
                      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.149-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414-.074-.123-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                      </svg>
                    </a>
                  </div>
                </div>

                <div>
                  <h4 className="mb-4 text-lg font-semibold text-slate-900">Quick Links</h4>
                  <ul className="space-y-3">
                    <li><Link to="/" className="text-slate-600 transition-colors duration-300 hover:text-cyan-600">Home</Link></li>
                    <li><Link to="/about" className="text-slate-600 transition-colors duration-300 hover:text-cyan-600">About Us</Link></li>
                    <li><Link to="/library" className="text-slate-600 transition-colors duration-300 hover:text-cyan-600">Library</Link></li>
                    <li><Link to="/contact" className="text-slate-600 transition-colors duration-300 hover:text-cyan-600">Contact</Link></li>
                  </ul>
                </div>

                <div>
                  <h4 className="mb-4 text-lg font-semibold text-slate-900">Contact Info</h4>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 rounded-2xl border border-cyan-100 bg-white/75 px-3 py-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-cyan-100">
                        <svg className="h-4 w-4 text-cyan-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <span className="text-sm text-slate-700">goodwill2404@gmail.com</span>
                    </div>
                    <div className="flex items-center gap-3 rounded-2xl border border-cyan-100 bg-white/75 px-3 py-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-cyan-100">
                        <svg className="h-4 w-4 text-cyan-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                      </div>
                      <span className="text-sm text-slate-700">+91 9691569239</span>
                    </div>
                    <div className="flex items-center gap-3 rounded-2xl border border-cyan-100 bg-white/75 px-3 py-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-cyan-100">
                        <svg className="h-4 w-4 text-cyan-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>
                      <span className="text-sm text-slate-700">Bhopal, Madhya Pradesh</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-12 border-t border-slate-200 pt-8">
                <div className="grid grid-cols-1 items-center gap-4 md:grid-cols-3">
                  <p className="text-center text-sm text-slate-500 md:text-left">
                    &copy; 2026 Goodwill Group of Education. All rights reserved.
                  </p>
                  <p className="text-center text-sm text-slate-500">
                    Designed & Developed by{" "}
                    <a
                      href="https://shashankportfolio-omega.vercel.app/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-cyan-700 underline underline-offset-4 transition-colors duration-300 hover:text-cyan-600"
                    >
                      Shashank
                    </a>
                    .
                  </p>
                  <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 md:justify-end">
                    <button
                      type="button"
                      onClick={() => setActivePolicy("privacy")}
                      className="text-sm text-slate-500 transition-colors duration-300 hover:text-cyan-600"
                    >
                      Privacy Policy
                    </button>
                    <button
                      type="button"
                      onClick={() => setActivePolicy("terms")}
                      className="text-sm text-slate-500 transition-colors duration-300 hover:text-cyan-600"
                    >
                      Terms of Service
                    </button>
                    <button
                      type="button"
                      onClick={() => setActivePolicy("cookies")}
                      className="text-sm text-slate-500 transition-colors duration-300 hover:text-cyan-600"
                    >
                      Cookie Policy
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {activePolicy && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-6 backdrop-blur-sm">
          <div className="relative w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-8 text-slate-900 shadow-2xl">
            <button
              type="button"
              onClick={() => setActivePolicy(null)}
              className="absolute right-4 top-4 text-slate-400 transition-colors hover:text-slate-700"
              aria-label="Close policy"
            >
              X
            </button>
            <h3 className="mb-4 text-2xl font-bold">{policyContent[activePolicy].title}</h3>
            <div className="space-y-3 text-sm leading-relaxed text-slate-600">
              {policyContent[activePolicy].body.map((line) => (
                <p key={line}>{line}</p>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
