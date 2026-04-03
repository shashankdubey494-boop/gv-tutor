import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  MapPin,
  Mail,
  Phone,
  CheckCircle,
  ArrowRight,
  BookOpen,
  Wifi,
  Calendar,
  ShieldCheck,
  Star,
  Sparkles,
  MessageCircle,
} from "lucide-react";
import { handleApplyAsTutor } from "../utils/authHelper";
import { submitContactForm } from "../services/contactService";
import quietZonesImg from "../assets/quiet zones.jpeg";
import collaborativeTablesImg from "../assets/photogood.jpeg";
import individualPodsImg from "../assets/individual.jpeg";
import premiumTuitionImg from "../assets/individual.jpeg";
import premiumGroupImg from "../assets/WhatsApp Image 2026-02-12 at 4.41.12 PM.jpeg";

const libraryBullets = [
  "Distraction-free reading halls",
  "High-speed Wi-Fi & power outlets",
  "Open 7 days — early morning to night",
  "Affordable monthly membership plans",
];

const amenityFeatures = [
  {
    title: "Spacious reading halls",
    body: "Large, well-ventilated study halls with comfortable seating, natural lighting, and a strict no-noise policy.",
    icon: BookOpen,
  },
  {
    title: "High-speed Wi-Fi & power",
    body: "Free Wi-Fi and charging points at every seat so you never lose focus mid-session.",
    icon: Wifi,
    highlight: true,
  },
  {
    title: "Flexible monthly plans",
    body: "Morning, evening, or full-day memberships — pick what fits your routine and budget.",
    icon: Calendar,
  },
  {
    title: "Safe & supervised",
    body: "CCTV-monitored premises with a caretaker present at all times. Parents can trust the environment.",
    icon: ShieldCheck,
  },
];

const subjectChips = [
  "Mathematics",
  "Physics",
  "Chemistry",
  "Biology",
  "English",
  "Hindi",
  "Social Science",
  "JEE Preparation",
  "NEET Preparation",
  "CBSE & ICSE",
  "MP Board",
  "Computer Science",
];

const whyItems = [
  {
    title: "Verified & background-checked",
    body: "Every tutor passes ID and qualification checks before joining our platform.",
    icon: ShieldCheck,
  },
  {
    title: "Local to Bhopal",
    body: "Tutors near your neighbourhood for convenient, on-time sessions.",
    icon: MapPin,
  },
  {
    title: "Honest ratings & reviews",
    body: "Real reviews from parents and students to help you choose confidently.",
    icon: Star,
  },
  {
    title: "Direct contact, zero middlemen",
    body: "Reach tutors directly. No hidden fees. No surprises.",
    icon: MessageCircle,
  },
];

const testimonials = [
  {
    quote:
      "We found a maths tutor within a week. Sessions are punctual and my daughter’s confidence has improved.",
    name: "Priya S.",
    role: "Parent, Class 10",
    initial: "P",
    color: "from-violet-500 to-purple-600",
  },
  {
    quote:
      "The library is calm and the staff is helpful. Great place to prep for competitive exams.",
    name: "Rahul M.",
    role: "Library member, UPSC aspirant",
    initial: "R",
    color: "from-cyan-500 to-teal-600",
  },
  {
    quote:
      "GoodwillEdu made it easy to connect with parents. Payments and communication are straightforward.",
    name: "Anita K.",
    role: "Home tutor",
    initial: "A",
    color: "from-blue-500 to-indigo-600",
  },
];

const Hero = () => {
  const navigate = useNavigate();
  const sliderImages = [
    { src: "/photogood.jpeg", position: "center" },
    { src: "/photogood1.jpeg", position: "center" },
    { src: "/photogood2.jpeg", position: "center" },
    { src: "/photogood3.jpeg", position: "top" },
    { src: individualPodsImg, position: "center" },
    { src: premiumTuitionImg, position: "center" },
    { src: premiumGroupImg, position: "center" },
  ];
  const missionCards = [
    {
      title: "Quiet Zones",
      img: quietZonesImg,
      glowClass: "from-cyan-500/35 via-blue-500/20 to-transparent",
    },
    {
      title: "Collaborative Tables",
      img: collaborativeTablesImg,
      glowClass: "from-violet-500/35 via-fuchsia-500/20 to-transparent",
    },
    {
      title: "Individual Pods",
      img: individualPodsImg,
      glowClass: "from-emerald-500/35 via-teal-500/20 to-transparent",
    },
  ];
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [activeSlide, setActiveSlide] = useState(0);
  const [activePolicy, setActivePolicy] = useState(null);

  const policyContent = {
    privacy: {
      title: "Privacy Policy",
      body: [
        "We collect only the information needed to provide tutoring services and respond to inquiries.",
        "Your contact details are used to communicate about classes, schedules, and support.",
        "We do not sell your personal information to third parties.",
      ],
    },
    terms: {
      title: "Terms of Service",
      body: [
        "By using our platform, you agree to provide accurate information and follow our community guidelines.",
        "Tutoring sessions are subject to availability and scheduling confirmation.",
        "We may update services or policies to improve quality and compliance.",
      ],
    },
    cookies: {
      title: "Cookie Policy",
      body: [
        "We use cookies to remember your preferences and improve site performance.",
        "You can control or delete cookies through your browser settings.",
        "Disabling cookies may affect some features of the website.",
      ],
    },
  };

  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.55 },
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % sliderImages.length);
    }, 3500);
    return () => clearInterval(interval);
  }, [sliderImages.length]);

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);
    try {
      await submitContactForm(formData);
      setSuccess(true);
      setFormData({ name: "", email: "", message: "" });
      setTimeout(() => setSuccess(false), 5000);
    } catch (err) {
      setError(err.message || "Failed to send message. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-900 text-white font-sans antialiased selection:bg-blue-500/20">
      <style>{`
        @keyframes heroBorderShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes footerFloat {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        @keyframes floatSlow {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(8px, -12px) scale(1.02); }
        }
        @keyframes blobFloat1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(40px, -30px) scale(1.08); }
          66% { transform: translate(-20px, 20px) scale(0.96); }
        }
        @keyframes blobFloat2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-35px, 40px) scale(1.12); }
        }
        @keyframes blobFloat3 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          40% { transform: translate(25px, 35px) scale(1.05); }
          80% { transform: translate(-15px, -25px) scale(0.95); }
        }
      `}</style>

      {/* Classic centered hero */}
      <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 pb-10 pt-24 sm:px-6 sm:pb-12 sm:pt-28 md:min-h-[82vh] md:pb-8 md:pt-20 lg:min-h-screen lg:pb-12 lg:pt-32">
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,#030712_0%,#0b1f63_45%,#76b8ff_82%,#ffffff_100%)]" />
        <div className="pointer-events-none absolute -top-24 left-[8%] h-[420px] w-[420px] rounded-full bg-blue-500/25 blur-[130px]" style={{ animation: "blobFloat1 16s ease-in-out infinite" }} />
        <div className="pointer-events-none absolute top-[30%] -right-[8%] h-[380px] w-[380px] rounded-full bg-indigo-400/25 blur-[120px]" style={{ animation: "blobFloat2 20s ease-in-out infinite" }} />
        <div className="pointer-events-none absolute bottom-[4%] left-[18%] h-[320px] w-[320px] rounded-full bg-sky-200/45 blur-[100px]" style={{ animation: "blobFloat3 22s ease-in-out infinite" }} />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_35%,rgba(59,130,246,0.22),transparent_65%)]" />

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="z-10 w-full max-w-6xl text-center"
        >
          <h1 className="mx-auto mb-6 max-w-6xl bg-gradient-to-b from-white to-blue-100 bg-clip-text pb-3 text-[clamp(2.9rem,6vw,5.6rem)] font-extrabold leading-[1.04] tracking-[-0.04em] text-transparent drop-shadow-[0_2px_12px_rgba(2,6,23,0.7)]">
            <span className="block sm:hidden">
              Connect with the <span className="bg-gradient-to-r from-cyan-200 to-indigo-100 bg-clip-text text-transparent">best tutors</span> in your area
            </span>
            <span className="hidden sm:block lg:hidden">
              Connecting students with <span className="bg-gradient-to-r from-cyan-200 to-indigo-100 bg-clip-text text-transparent">top home tutors</span> near you
            </span>
            <span className="hidden lg:block">
              Connecting students with the <br />
              <span className="bg-gradient-to-r from-cyan-200 to-indigo-100 bg-clip-text text-transparent">best home tutors</span> in your area
            </span>
          </h1>
          <p className="mx-auto mb-10 max-w-3xl px-2 text-base text-slate-100 sm:mb-12 sm:text-lg lg:text-xl drop-shadow-[0_1px_8px_rgba(2,6,23,0.6)]">
            Choose a trusted tutor for your learning needs or start earning as a home tutor today.
          </p>

          <div className="mx-auto grid w-full max-w-4xl gap-4 sm:gap-6 md:grid-cols-2">
            <motion.div
              whileHover={{ y: -5 }}
              className="rounded-[1.6rem] p-[1.5px] shadow-[0_24px_60px_rgba(6,182,212,0.15)]"
              style={{
                backgroundImage:
                  "linear-gradient(120deg, rgba(34,211,238,0.9), rgba(59,130,246,0.95), rgba(168,85,247,0.9), rgba(16,185,129,0.85), rgba(34,211,238,0.9))",
                backgroundSize: "250% 250%",
                animation: "heroBorderShift 7s linear infinite",
              }}
            >
              <div className="rounded-[calc(1.6rem-1.5px)] bg-slate-950/55 p-6 backdrop-blur-xl sm:p-8">
                <h3 className="mb-4 text-xl font-bold text-white sm:text-2xl">Find the right tutor</h3>
                <button
                  type="button"
                  onClick={() => navigate("/find-tutor")}
                  className="w-full rounded-xl bg-blue-600 py-4 font-semibold text-white shadow-lg shadow-blue-600/25 transition-all hover:bg-blue-500"
                >
                  Find Tutor
                </button>
              </div>
            </motion.div>
            <motion.div
              whileHover={{ y: -5 }}
              className="rounded-[1.6rem] p-[1.5px] shadow-[0_24px_60px_rgba(236,72,153,0.18)]"
              style={{
                backgroundImage:
                  "linear-gradient(120deg, rgba(236,72,153,0.92), rgba(168,85,247,0.92), rgba(34,211,238,0.88), rgba(244,63,94,0.9), rgba(236,72,153,0.92))",
                backgroundSize: "250% 250%",
                animation: "heroBorderShift 7s linear infinite reverse",
              }}
            >
              <div className="rounded-[calc(1.6rem-1.5px)] bg-slate-950/55 p-6 backdrop-blur-xl sm:p-8">
                <h3 className="mb-4 text-xl font-bold text-white sm:text-2xl">Become a home tutor</h3>
                <button
                  type="button"
                  onClick={async () => {
                    await handleApplyAsTutor(navigate);
                  }}
                  className="w-full rounded-xl bg-pink-600 py-4 font-semibold text-white shadow-lg shadow-pink-600/25 transition-all hover:bg-pink-500"
                >
                  Apply as Tutor
                </button>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* Library teaser — below hero */}
      <section className="-mt-px bg-gradient-to-b from-white via-[#d8e9ff] to-[#9ebce8] px-4 py-10 sm:px-6 sm:py-12">
        <div className="relative mx-auto max-w-4xl">
          <div
            className="absolute -inset-px rounded-3xl bg-gradient-to-r from-teal-400/15 via-emerald-400/10 to-cyan-400/15 blur-xl"
            style={{ animation: "floatSlow 10s ease-in-out infinite" }}
          />
          <div className="relative overflow-hidden rounded-3xl bg-slate-900/28 p-6 shadow-xl backdrop-blur-md sm:p-8">
            <div className="mb-3 flex items-center justify-center gap-2 text-xs font-semibold uppercase tracking-wider text-teal-700 sm:justify-start">
              <Sparkles className="h-4 w-4" />
              Study library
            </div>
            <h2 className="text-center text-2xl font-bold text-slate-900 sm:text-left sm:text-3xl">Become a library member</h2>
            <p className="mx-auto mt-3 max-w-2xl text-center text-slate-800 sm:mx-0 sm:text-left">
              A quiet, well-lit study space in Bhopal. Open 7 days. Monthly memberships available.
            </p>
            <ul className="mx-auto mt-6 max-w-xl space-y-2.5 sm:mx-0">
              {libraryBullets.map((line) => (
                <li key={line} className="flex items-start gap-3 text-sm text-slate-800">
                  <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-teal-500 shadow-[0_0_8px_rgba(20,184,166,0.4)]" />
                  {line}
                </li>
              ))}
            </ul>
            <div className="mt-8 flex justify-center sm:justify-start">
              <button
                type="button"
                onClick={() => navigate("/library")}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-teal-500 to-emerald-600 px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-teal-500/25 transition hover:opacity-95"
              >
                Explore library
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* —— MISSION —— */}
      <section className="bg-gradient-to-b from-[#9ebce8] via-[#7aa0d8] to-[#5f84c5] py-20 sm:py-24 md:py-16 lg:py-20 px-4 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <motion.div {...fadeIn} className="mb-14 text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Our Goodwill Ready &amp; Mission
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-base text-slate-100 sm:text-lg">
              Quiet spaces for focused reading and personalized tutoring that connects the brightest minds.
            </p>
          </motion.div>
          <div className="grid gap-6 sm:gap-8 md:grid-cols-2 xl:grid-cols-3">
            {missionCards.map((item, i) => (
              <motion.div
                key={item.title}
                whileHover={{ y: -6 }}
                transition={{ type: "spring", stiffness: 260, damping: 22 }}
                className="group mx-auto w-full max-w-sm text-center"
              >
                <div className="relative mb-6">
                  <div
                    className={`absolute inset-0 rounded-[2rem] bg-gradient-to-br ${item.glowClass} blur-2xl opacity-80 transition-opacity duration-500 group-hover:opacity-100`}
                  />
                  <div
                    className="relative aspect-square overflow-hidden rounded-[2rem] p-[2px] shadow-2xl transition-transform duration-500 group-hover:-rotate-1"
                    style={{
                      backgroundImage:
                        "linear-gradient(120deg, rgba(34,211,238,0.95), rgba(96,165,250,0.95), rgba(168,85,247,0.95), rgba(16,185,129,0.95), rgba(34,211,238,0.95))",
                      backgroundSize: "300% 300%",
                      animation: "heroBorderShift 6s ease-in-out infinite",
                    }}
                  >
                    <div className="h-full w-full rounded-[1.9rem] bg-slate-900/40 p-2">
                      <img
                        src={item.img}
                        alt={item.title}
                        className="h-full w-full rounded-[1.4rem] object-cover opacity-90 transition duration-500 group-hover:scale-105 group-hover:opacity-100"
                      />
                    </div>
                  </div>
                </div>
                <h4 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">{item.title}</h4>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* —— PREMIUM HOME TUITION —— */}
      <section className="bg-gradient-to-b from-[#5f84c5] via-[#466da8] to-[#35598e] py-12 sm:py-16">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-6 md:grid-cols-2 md:gap-12">
          <motion.div {...fadeIn}>
            <h2 className="text-3xl font-bold italic tracking-tight text-white sm:text-4xl">Premium home tuition</h2>
            <p className="mt-6 text-lg leading-relaxed text-slate-100">
              We bridge the gap between quality education and accessibility. Every student gets the attention they deserve — at home, on your schedule.
            </p>
            <div className="mt-8 space-y-4">
              {["Verified subject experts", "Flexible schedules", "Regular progress tracking"].map((text) => (
                <div key={text} className="flex items-center gap-3 text-slate-100">
                  <CheckCircle className="h-5 w-5 shrink-0 text-blue-300" />
                  <span>{text}</span>
                </div>
              ))}
            </div>
          </motion.div>
          <motion.div {...fadeIn} className="relative">
            <div className="absolute inset-0 rounded-[2rem] bg-blue-400/10 blur-3xl" />
            <div className="relative z-10 mx-auto aspect-[4/3] w-full max-w-xl overflow-hidden rounded-3xl shadow-2xl shadow-blue-500/10">
              <motion.img
                key={sliderImages[activeSlide].src}
                src={sliderImages[activeSlide].src}
                alt="Home tuition"
                className="h-full w-full object-cover"
                style={{ objectPosition: sliderImages[activeSlide].position }}
                initial={{ opacity: 0, scale: 1.02 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* —— AMENITIES / FEATURES —— */}
      <section className="bg-gradient-to-b from-[#35598e] via-[#2c4e83] to-[#264679] py-20 sm:py-24 md:py-16 lg:py-20 px-4 sm:px-6">
        <div className="mx-auto max-w-5xl">
          <motion.div {...fadeIn} className="mb-12 text-center">
            <span className="inline-flex rounded-full border border-cyan-300/45 bg-cyan-100/20 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-100">
              Spaces
            </span>
            <h2 className="mt-4 text-2xl font-bold text-white sm:text-3xl">Built for deep focus</h2>
            <p className="mx-auto mt-3 max-w-lg text-slate-200">Everything you need for productive study sessions.</p>
          </motion.div>
          <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
            {amenityFeatures.map((f) => (
              <motion.div
                key={f.title}
                {...fadeIn}
                whileHover={{ y: -2 }}
                className={`rounded-2xl bg-slate-900/35 p-6 transition-colors backdrop-blur-sm shadow-sm ${f.highlight
                  ? "border-cyan-300/60 shadow-[0_0_0_1px_rgba(6,182,212,0.15)] shadow-cyan-400/10"
                  : "border-transparent"
                  }`}
              >
                <div className="flex gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-cyan-200/60 bg-cyan-50">
                    <f.icon className="h-6 w-6 text-cyan-200" strokeWidth={1.75} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">{f.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-slate-200">{f.body}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* —— SUBJECTS —— */}
      <section className="bg-gradient-to-b from-[#264679] via-[#203f70] to-[#1f3a66] py-10 sm:py-14 px-4 sm:px-6">
        <div className="mx-auto max-w-4xl text-center">
          <motion.div {...fadeIn}>
            <span className="inline-flex rounded-full border border-blue-300/45 bg-blue-100/20 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-blue-100">
              Subjects
            </span>
            <h2 className="mt-5 text-3xl font-bold tracking-tight text-white sm:text-4xl">
              We cover{" "}
              <span className="bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">
                every subject
              </span>
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-slate-200">
              From school basics to competitive exam prep — find support for what matters to you.
            </p>
          </motion.div>
          <motion.div
            {...fadeIn}
            className="mt-8 flex flex-wrap justify-center gap-2.5 sm:gap-3"
          >
            {subjectChips.map((s) => (
              <span
                key={s}
                className="rounded-full bg-slate-900/40 px-4 py-2 text-sm font-medium text-slate-100 shadow-sm transition hover:bg-slate-900/55"
              >
                {s}
              </span>
            ))}
          </motion.div>
        </div>
      </section>

      {/* —— WHY GOODWILLEDU —— */}
      <section className="bg-gradient-to-b from-[#1f3a66] via-[#1c345c] to-[#192f53] py-10 sm:py-14 px-4 sm:px-6">
        <div className="mx-auto max-w-5xl">
          <motion.div {...fadeIn} className="mb-8 text-center sm:mb-10">
            <span className="inline-flex rounded-full border border-violet-300/45 bg-violet-100/20 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-violet-100">
              Why GoodwillEdu
            </span>
            <h2 className="mt-4 text-2xl font-bold text-white sm:text-3xl">
              The{" "}
              <span className="text-violet-200">trusted platform</span> for home tutoring
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-slate-200">
              Every tutor is carefully verified. Every student matters. Proudly local to Bhopal.
            </p>
          </motion.div>
          <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
            {whyItems.map((w) => {
              const Icon = w.icon;
              return (
                <motion.div
                  key={w.title}
                  {...fadeIn}
                  className="rounded-2xl bg-slate-900/35 p-4 shadow-sm backdrop-blur-sm sm:p-5"
                >
                  <div className="flex gap-3 sm:gap-4">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-violet-200/60 bg-violet-50">
                      <Icon className="h-5 w-5 text-violet-200" strokeWidth={1.75} aria-hidden />
                    </span>
                    <div>
                      <h3 className="font-semibold text-white">{w.title}</h3>
                      <p className="mt-2 text-sm leading-relaxed text-slate-200">{w.body}</p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* —— TESTIMONIALS —— */}
      <section className="bg-gradient-to-b from-[#192f53] via-[#162a4c] to-[#152646] py-10 sm:py-14 px-4 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <motion.div {...fadeIn} className="mb-8 text-center sm:mb-10">
            <h2 className="text-2xl font-bold text-white sm:text-3xl">
              What <span className="text-violet-200">our community</span> says
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-slate-200">
              Real words from students, parents, and tutors in Bhopal.
            </p>
          </motion.div>
          <div className="grid gap-6 md:grid-cols-3">
            {testimonials.map((t) => (
              <motion.div
                key={t.name}
                {...fadeIn}
                className="flex flex-col rounded-2xl bg-slate-900/35 p-6 shadow-lg shadow-slate-950/20 backdrop-blur-sm"
              >
                <div className="mb-4 flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="flex-1 text-sm leading-relaxed text-slate-100">&ldquo;{t.quote}&rdquo;</p>
                <div className="mt-6 flex items-center gap-3 border-t border-white/10 pt-4">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br ${t.color} text-sm font-bold text-white`}
                  >
                    {t.initial}
                  </div>
                  <div>
                    <p className="font-semibold text-white">{t.name}</p>
                    <p className="text-xs text-slate-300">{t.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* —— GET IN TOUCH (no map) —— */}
      <section className="bg-gradient-to-b from-[#152646] via-[#13223e] to-[#101d36] py-12 sm:py-16 px-4 sm:px-6">
        <div className="mx-auto max-w-5xl">
          <div className="overflow-hidden rounded-[1.75rem] bg-slate-900/35 shadow-2xl shadow-slate-950/20 backdrop-blur-sm">
            <div className="grid gap-0 lg:grid-cols-2">
              <div className="border-b border-white/10 p-6 sm:p-8 lg:border-b-0 lg:border-r lg:border-white/10">
                <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">Get in touch</h2>
                <p className="mt-2 text-sm text-slate-200">We&apos;ll respond as soon as we can.</p>

                {success && (
                  <div className="mt-6 rounded-xl border border-green-300/60 bg-green-50 p-4 text-sm text-green-700">
                    Your message has been sent. We&apos;ll get back to you soon.
                  </div>
                )}
                {error && (
                  <div className="mt-6 rounded-xl border border-red-300/60 bg-red-50 p-4 text-sm text-red-700">
                    {error}
                  </div>
                )}

                <form onSubmit={handleFormSubmit} className="mt-8 space-y-5">
                  <input
                    type="text"
                    placeholder="Full name *"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    disabled={loading}
                    className="w-full rounded-xl border border-white/15 bg-slate-900/35 p-4 text-white placeholder:text-slate-300 outline-none transition focus:ring-2 focus:ring-blue-400/45 disabled:opacity-50"
                  />
                  <input
                    type="email"
                    placeholder="Email *"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    disabled={loading}
                    className="w-full rounded-xl border border-white/15 bg-slate-900/35 p-4 text-white placeholder:text-slate-300 outline-none transition focus:ring-2 focus:ring-blue-400/45 disabled:opacity-50"
                  />
                  <textarea
                    placeholder="Your message *"
                    rows={4}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    required
                    disabled={loading}
                    className="w-full resize-none rounded-xl border border-white/15 bg-slate-900/35 p-4 text-white placeholder:text-slate-300 outline-none transition focus:ring-2 focus:ring-blue-400/45 disabled:opacity-50"
                  />
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-4 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:bg-blue-800"
                  >
                    {loading ? (
                      <>
                        <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        Sending…
                      </>
                    ) : (
                      "Send message"
                    )}
                  </button>
                </form>
              </div>

              <div className="relative flex flex-col justify-center bg-gradient-to-br from-slate-900/35 to-slate-900/15 p-8 sm:p-10">
                <div className="relative">
                  <h3 className="text-lg font-semibold text-white">Visit &amp; contact</h3>
                  <p className="mt-1 text-sm text-slate-200">Goodwill Group of Education — Bhopal</p>
                  <ul className="mt-8 space-y-5 text-sm text-slate-100">
                    <li className="flex gap-3">
                      <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-200/20 text-blue-200">
                        <MapPin className="h-4 w-4" />
                      </span>
                      <span>Neerja Nagar, Durgesh Vihar JK Road, Bhopal, Madhya Pradesh</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-200/20 text-blue-200">
                        <Phone className="h-4 w-4" />
                      </span>
                      <a href="tel:+919691569239" className="hover:text-blue-200">
                        +91 9691569239
                      </a>
                    </li>
                    <li className="flex gap-3">
                      <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-200/20 text-blue-200">
                        <Mail className="h-4 w-4" />
                      </span>
                      <a href="mailto:goodwill2404@gmail.com" className="break-all hover:text-blue-200">
                        goodwill2404@gmail.com
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER — unchanged structure, tighter typography */}
      <footer className="relative overflow-hidden border-t border-cyan-400/25 bg-gradient-to-br from-slate-800 via-[#0f172a] to-slate-900">
        <div className="absolute inset-0 opacity-80">
          <div className="absolute -top-20 left-0 h-64 w-64 rounded-full bg-cyan-400/14 blur-3xl" />
          <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-fuchsia-400/12 blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
          <div
            className="rounded-[2rem] p-[1.5px]"
            style={{
              backgroundImage:
                "linear-gradient(120deg, rgba(34,211,238,0.9), rgba(59,130,246,0.9), rgba(168,85,247,0.9), rgba(16,185,129,0.9), rgba(244,63,94,0.9), rgba(34,211,238,0.9))",
              backgroundSize: "300% 300%",
              animation: "heroBorderShift 8s linear infinite",
            }}
          >
            <div className="rounded-[calc(2rem-1.5px)] bg-[rgba(15,23,42,0.92)] px-5 py-8 backdrop-blur-xl sm:px-8 sm:py-10">
              <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
                <div className="md:col-span-2">
                  <div className="mb-4">
                    <span className="inline-flex items-center rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-cyan-300">
                      GoodwillEdu
                    </span>
                  </div>
                  <h3 className="mb-4 text-2xl font-bold text-white sm:text-3xl">Goodwill Group of Education</h3>
                  <p className="mb-6 max-w-2xl leading-relaxed text-gray-300">
                    Empowering students with quality education and personalized learning experiences. Your trusted partner in academic excellence and career development.
                  </p>
                  <div className="flex space-x-4">
                    <a
                      href="https://www.instagram.com/gv.library.as_/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg transition hover:scale-110"
                      style={{ animation: "footerFloat 4s ease-in-out infinite" }}
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
                      className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg transition hover:scale-110"
                      style={{ animation: "footerFloat 4.6s ease-in-out infinite" }}
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
                      className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg transition hover:scale-110"
                      style={{ animation: "footerFloat 5.2s ease-in-out infinite" }}
                      aria-label="WhatsApp"
                    >
                      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.149-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414-.074-.123-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                      </svg>
                    </a>
                  </div>
                </div>
                <div>
                  <h4 className="mb-4 text-lg font-semibold text-white">Quick links</h4>
                  <ul className="space-y-3">
                    <li>
                      <a href="/" className="text-gray-300 transition hover:text-cyan-400">
                        Home
                      </a>
                    </li>
                    <li>
                      <a href="/about" className="text-gray-300 transition hover:text-cyan-400">
                        About us
                      </a>
                    </li>
                    <li>
                      <a href="/library" className="text-gray-300 transition hover:text-cyan-400">
                        Library
                      </a>
                    </li>
                    <li>
                      <a href="/contact" className="text-gray-300 transition hover:text-cyan-400">
                        Contact
                      </a>
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="mb-4 text-lg font-semibold text-white">Contact info</h4>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-3 py-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-cyan-500/20">
                        <svg className="h-4 w-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <span className="text-sm text-gray-300">goodwill2404@gmail.com</span>
                    </div>
                    <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-3 py-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-cyan-500/20">
                        <svg className="h-4 w-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                      </div>
                      <span className="text-sm text-gray-300">+91 9691569239</span>
                    </div>
                    <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-3 py-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-cyan-500/20">
                        <svg className="h-4 w-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>
                      <span className="text-sm text-gray-300">Bhopal, Madhya Pradesh</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-8 border-t border-white/10 pt-6 sm:mt-10 sm:pt-8">
                <div className="grid grid-cols-1 items-center gap-4 md:grid-cols-3">
                  <p className="text-center text-sm text-gray-400 md:text-left">&copy; 2026 Goodwill Group of Education. All rights reserved.</p>
                  <p className="text-center text-sm text-gray-400">
                    Designed &amp; developed by{" "}
                    <a
                      href="https://shashankportfolio-omega.vercel.app/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-cyan-400 underline underline-offset-4 hover:text-cyan-300"
                    >
                      Shashank
                    </a>
                    .
                  </p>
                  <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 md:justify-end">
                    <button type="button" onClick={() => setActivePolicy("privacy")} className="text-sm text-gray-400 transition hover:text-cyan-400">
                      Privacy Policy
                    </button>
                    <button type="button" onClick={() => setActivePolicy("terms")} className="text-sm text-gray-400 transition hover:text-cyan-400">
                      Terms of Service
                    </button>
                    <button type="button" onClick={() => setActivePolicy("cookies")} className="text-sm text-gray-400 transition hover:text-cyan-400">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-6 backdrop-blur-sm">
          <div className="relative w-full max-w-xl rounded-2xl border border-white/10 bg-gray-900 p-8">
            <button
              type="button"
              onClick={() => setActivePolicy(null)}
              className="absolute right-4 top-4 text-gray-400 transition hover:text-white"
              aria-label="Close policy"
            >
              ×
            </button>
            <h3 className="mb-4 text-2xl font-bold">{policyContent[activePolicy].title}</h3>
            <div className="space-y-3 text-sm leading-relaxed text-gray-300">
              {policyContent[activePolicy].body.map((line, i) => (
                <p key={i}>{line}</p>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Hero;
