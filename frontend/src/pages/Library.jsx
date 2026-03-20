import { useState } from "react";
import { motion } from "framer-motion";
import quietZonesImg from "../assets/quiet zones.jpeg";
import collaborativeTablesImg from "../assets/photogood.jpeg";
import SiteFooter from "../components/SiteFooter";

const libraryCards = [
  {
    id: "jk-road",
    name: "GV Library",
    location: "JK Road, Bhopal",
    status: "Active Branch",
    image: quietZonesImg,
    summary: "A disciplined study environment for students who want consistency, quiet, and focused seat time.",
    details: [
      "This branch is positioned as a calm academic space for reading, revision, and long study sessions with minimum distraction.",
      "It can be presented to users as the ideal choice for students who want silent study desks, routine-based preparation, and a clean learning atmosphere."
    ],
    features: ["Silent seating", "Study-friendly environment", "Routine-based self study"]
  },
  {
    id: "branch-two",
    name: "GV Library",
    location: "Second Branch Location",
    status: "Branch Structure Ready",
    image: collaborativeTablesImg,
    summary: "A second GV Library card ready for your next location, with the same structure and a separate branch identity.",
    details: [
      "This card is intentionally structured so you can replace the location and branch-specific content when you finalize the second library address.",
      "The page layout is already ready for a multi-branch presentation, so adding future details will be straightforward."
    ],
    features: ["Clickable branch card", "Location-specific content", "Expandable for future branch updates"]
  }
];

export default function Library() {
  const [activeLibrary, setActiveLibrary] = useState(libraryCards[0].id);
  const selectedLibrary = libraryCards.find((card) => card.id === activeLibrary) || libraryCards[0];

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#fefcf7_0%,#f7fbff_32%,#fff8fb_100%)] pt-28 text-slate-900">
      <div className="pointer-events-none absolute inset-x-0 top-24 overflow-hidden">
        <motion.div
          animate={{ x: [0, 28, 0], y: [0, -16, 0] }}
          transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }}
          className="absolute left-[6%] top-12 h-44 w-44 rounded-full bg-cyan-200/35 blur-3xl"
        />
        <motion.div
          animate={{ x: [0, -32, 0], y: [0, 18, 0] }}
          transition={{ duration: 13, repeat: Infinity, ease: "easeInOut" }}
          className="absolute right-[8%] top-4 h-52 w-52 rounded-full bg-amber-200/35 blur-3xl"
        />
        <motion.div
          animate={{ x: [0, 12, 0], y: [0, 24, 0] }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
          className="absolute left-1/2 top-48 h-32 w-32 -translate-x-1/2 rounded-full bg-sky-200/25 blur-2xl"
        />
      </div>

      <div className="max-w-7xl mx-auto space-y-10 px-4 pb-20">
        <section className="relative overflow-hidden rounded-[2rem] border border-cyan-200/70 bg-gradient-to-br from-white via-cyan-50/80 to-amber-50/70 px-6 py-12 sm:px-10 sm:py-14 shadow-[0_30px_80px_rgba(59,130,246,0.10)]">
          <div className="absolute -top-20 left-0 h-64 w-64 rounded-full bg-cyan-300/30 blur-3xl" />
          <div className="absolute bottom-0 right-0 h-64 w-64 rounded-full bg-amber-300/25 blur-3xl" />
          <div className="relative z-10 max-w-4xl">
            <span className="inline-flex items-center rounded-full border border-cyan-300 bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-cyan-700">
              GV Library Network
            </span>
            <h1 className="mt-5 text-4xl sm:text-5xl font-bold tracking-tight text-slate-900">
              Show users both GV Library branches with a cleaner, more product-style layout.
            </h1>
            <p className="mt-4 max-w-3xl text-slate-600 text-lg leading-relaxed">
              Each branch now appears as a clickable card with its own detail panel, so visitors can quickly compare locations and understand what each library offers.
            </p>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-3">
          {[
            { label: "Branches", value: "2 GV Library cards ready" },
            { label: "Experience", value: "Quiet, guided study atmosphere" },
            { label: "Format", value: "Clickable branch comparison" }
          ].map((item, index) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: index * 0.08 }}
              whileHover={{ y: -4 }}
              className="rounded-[1.4rem] border border-white/80 bg-white/80 px-5 py-5 shadow-[0_18px_40px_rgba(15,23,42,0.05)] backdrop-blur-sm"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-700">{item.label}</p>
              <p className="mt-3 text-lg font-semibold text-slate-900">{item.value}</p>
            </motion.div>
          ))}
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.08fr_1.42fr]">
          <div className="space-y-4">
            {libraryCards.map((card) => {
              const isActive = activeLibrary === card.id;
              return (
                <button
                  key={card.id}
                  type="button"
                  onClick={() => setActiveLibrary(card.id)}
                  className={`w-full overflow-hidden rounded-[1.6rem] border text-left transition-all duration-300 ${
                    isActive
                      ? "border-cyan-300 bg-gradient-to-br from-white via-cyan-50 to-amber-50 shadow-[0_20px_60px_rgba(34,211,238,0.14)]"
                      : "border-slate-200/80 bg-white/80 hover:border-cyan-300 hover:bg-white shadow-[0_18px_40px_rgba(15,23,42,0.05)]"
                  }`}
                >
                  <div className="h-44 overflow-hidden border-b border-slate-200/80">
                    <img src={card.image} alt={card.location} className="h-full w-full object-cover" />
                  </div>
                  <div className="p-6">
                    <span className="text-xs uppercase tracking-[0.22em] text-cyan-700">{card.status}</span>
                    <h2 className="mt-3 text-2xl font-semibold text-slate-900">{card.name}</h2>
                    <p className="mt-1 text-slate-500">{card.location}</p>
                    <p className="mt-4 text-slate-600 leading-relaxed">{card.summary}</p>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="overflow-hidden rounded-[1.8rem] border border-cyan-200/70 bg-gradient-to-br from-white via-cyan-50/70 to-amber-50/70 shadow-[0_24px_80px_rgba(59,130,246,0.10)]">
            <div className="grid lg:grid-cols-[1.05fr_1fr]">
              <div className="min-h-[300px] border-b border-cyan-100 lg:border-b-0 lg:border-r overflow-hidden">
                <img
                  src={selectedLibrary.image}
                  alt={selectedLibrary.location}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="p-6 sm:p-8">
                <span className="inline-flex rounded-full border border-cyan-300 bg-white/85 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-cyan-700">
                  {selectedLibrary.status}
                </span>
                <h3 className="mt-4 text-3xl font-bold text-slate-900">{selectedLibrary.name}</h3>
                <p className="mt-2 text-slate-500 text-lg">{selectedLibrary.location}</p>
                <p className="mt-4 text-slate-600 text-lg leading-relaxed">{selectedLibrary.summary}</p>

                <div className="mt-6 space-y-4 text-slate-600">
                  {selectedLibrary.details.map((paragraph) => (
                    <p key={paragraph} className="leading-relaxed">
                      {paragraph}
                    </p>
                  ))}
                </div>

                <div className="mt-8 grid gap-3">
                  {selectedLibrary.features.map((feature) => (
                    <div
                      key={feature}
                      className="rounded-2xl border border-cyan-100 bg-white/85 px-4 py-3 text-slate-700 shadow-sm"
                    >
                      {feature}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      <SiteFooter />
    </div>
  );
}
