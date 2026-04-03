import { motion } from "framer-motion";
import { ArrowLeft, CheckCircle2, Phone, PlayCircle, Sparkles } from "lucide-react";
import { Link, Navigate, useParams } from "react-router-dom";
import SiteFooter from "../components/SiteFooter";
import { aboutShowcases } from "../data/showcaseContent";

export default function AboutDetail() {
  const { slug } = useParams();
  const item = aboutShowcases.find((entry) => entry.slug === slug);

  if (!item) {
    return <Navigate to="/about" replace />;
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#fffdf6_0%,#effaf6_40%,#fff4fb_100%)] pt-28 md:pt-20 lg:pt-28 text-slate-900">
      <div className="pointer-events-none absolute inset-x-0 top-24 overflow-hidden">
        <motion.div
          animate={{ x: [0, 28, 0], y: [0, -22, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          className="absolute left-[8%] top-10 h-44 w-44 rounded-full bg-cyan-200/35 blur-3xl"
        />
        <motion.div
          animate={{ x: [0, -24, 0], y: [0, 18, 0] }}
          transition={{ duration: 13, repeat: Infinity, ease: "easeInOut" }}
          className="absolute right-[8%] top-0 h-52 w-52 rounded-full bg-fuchsia-200/35 blur-3xl"
        />
      </div>

      <div className="mx-auto max-w-7xl space-y-10 px-4 pb-20 md:space-y-8 md:pb-14 lg:space-y-10 lg:pb-20">
        <section className="relative overflow-hidden rounded-[2.2rem] border border-amber-200/80 bg-gradient-to-br from-[#fff9ef] via-[#fff8d6] to-[#ffeef6] shadow-[0_38px_110px_rgba(251,191,36,0.22),0_16px_40px_rgba(236,72,153,0.12)] backdrop-blur-sm">
          <div className="grid gap-0 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="relative min-h-[400px] overflow-hidden">
              <picture className="block h-full w-full">
                <source media="(min-width: 1024px)" srcSet={item.imageDesktop || item.image} />
                <img src={item.image} alt={item.eyebrow} className="h-full w-full object-cover object-center" />
              </picture>
              <div className="absolute left-6 top-6">
                <Link
                  to="/about"
                  className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/15 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm"
                >
                  <ArrowLeft size={16} />
                  Back to About
                </Link>
              </div>
            </div>

            <div className="bg-white/82 p-6 sm:p-8 lg:p-10">
              <span className="inline-flex items-center gap-2 rounded-full border border-rose-300 bg-rose-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-rose-700">
                <Sparkles size={14} />
                {item.eyebrow}
              </span>
              <h1 className="mt-5 text-4xl font-bold tracking-tight sm:text-5xl">{item.title}</h1>
              <p className="mt-4 text-lg leading-relaxed text-slate-600">{item.subtitle}</p>

              <div className="mt-8 grid gap-3">
                {item.heroPoints.map((point) => (
                  <div
                    key={point}
                    className="flex items-start gap-3 rounded-2xl border border-amber-200/80 bg-gradient-to-r from-white to-amber-50/70 px-4 py-4 shadow-[0_12px_30px_rgba(251,191,36,0.14)]"
                  >
                    <CheckCircle2 className="mt-0.5 text-rose-600" size={18} />
                    <p className="text-slate-700">{point}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {(item.slug === "home-tutor" || item.slug === "coaching") ? (
          <section className="rounded-[2rem] border border-emerald-200/80 bg-gradient-to-r from-emerald-50 via-cyan-50 to-rose-50 p-6 shadow-[0_26px_80px_rgba(16,185,129,0.16)] sm:p-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <span className="inline-flex items-center gap-2 rounded-full border border-emerald-300 bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-emerald-700">
                  <Phone size={14} />
                  {item.slug === "coaching" ? "Contact Coaching Team" : "Contact Home Tutor Team"}
                </span>
                <h2 className="mt-4 text-3xl font-bold text-slate-900">
                  {item.slug === "coaching"
                    ? "Talk to us for coaching admission and batch guidance"
                    : "Talk to us and get the right tutor quickly"}
                </h2>
                <p className="mt-3 max-w-2xl text-lg leading-relaxed text-slate-700">
                  {item.slug === "coaching"
                    ? "Contact Goodwill Coaching for admission, batch timing, subject planning, and fee guidance. Our team will help you choose the right batch and start quickly."
                    : "Connect with Goodwill Home Tutor for tutor matching, subject planning, and schedule support for your child. Our team will guide you with the next best step."}
                </p>
              </div>

              <div className="grid w-full gap-3 sm:max-w-md">
                <a
                  href="tel:+919691569239"
                  className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-5 py-3 font-semibold text-white shadow-lg shadow-emerald-500/25 transition hover:translate-y-[-1px]"
                >
                  Call: +91 9691569239
                </a>
                <a
                  href="https://wa.me/919691569239"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 px-5 py-3 font-semibold text-white shadow-lg shadow-cyan-500/25 transition hover:translate-y-[-1px]"
                >
                  WhatsApp Now
                </a>
                <Link
                  to="/contact"
                  className="inline-flex items-center justify-center rounded-xl border border-emerald-300 bg-white/85 px-5 py-3 font-semibold text-emerald-700 transition hover:bg-white"
                >
                  Open Contact Page for Admission
                </Link>
              </div>
            </div>
          </section>
        ) : null}

        <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
          <div className="rounded-[2rem] border border-rose-200/80 bg-gradient-to-br from-[#fffefb] via-[#ffeef8] to-[#fff5cf] p-6 shadow-[0_34px_100px_rgba(236,72,153,0.18),0_14px_35px_rgba(251,191,36,0.16)] sm:p-8">
            <h2 className="text-2xl font-bold">Detail Story Structure</h2>
            <div className="mt-6 space-y-6">
              {item.sections.map((section) => (
                <div key={section.heading} className="rounded-[1.5rem] border border-rose-100/80 bg-white p-5 shadow-[0_14px_38px_rgba(236,72,153,0.10)]">
                  <h3 className="text-xl font-semibold text-slate-900">{section.heading}</h3>
                  <p className="mt-3 leading-relaxed text-slate-600">{section.content}</p>
                </div>
              ))}
            </div>
            <div className="mt-6 rounded-[1.5rem] border border-amber-200/80 bg-gradient-to-br from-amber-50 via-rose-50 to-white p-5 shadow-[0_14px_34px_rgba(251,191,36,0.15)]">
              <h3 className="text-xl font-semibold text-slate-900">What You Get Here</h3>
              <p className="mt-3 leading-relaxed text-slate-600">
                This section gives a quick decision summary so parents and students can understand the support model, study structure, and expected outcomes before contacting the team.
              </p>
              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                {item.heroPoints.slice(0, 4).map((point) => (
                  <div
                    key={`summary-${point}`}
                    className="rounded-xl border border-amber-100 bg-white/85 px-3 py-2 text-sm font-medium text-slate-700"
                  >
                    {point}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-[2rem] border border-emerald-200/80 bg-gradient-to-br from-white via-emerald-50/65 to-teal-50/65 p-6 shadow-[0_28px_85px_rgba(16,185,129,0.18)]">
              <h2 className="text-2xl font-bold">Quick Highlights</h2>
              <div className="mt-5 grid gap-4">
                {item.featureCards.map((card) => (
                  <div key={card.title} className="rounded-[1.4rem] border border-emerald-100/80 bg-gradient-to-br from-white to-emerald-50/70 p-5 shadow-[0_10px_24px_rgba(16,185,129,0.11)]">
                    <h3 className="text-lg font-semibold text-slate-900">{card.title}</h3>
                    <p className="mt-2 leading-relaxed text-slate-600">{card.description}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[2rem] border border-amber-200/80 bg-gradient-to-br from-white via-amber-50/70 to-orange-50/70 p-6 shadow-[0_30px_88px_rgba(251,191,36,0.19)]">
              <h2 className="text-2xl font-bold">Metrics Snapshot</h2>
              <div className="mt-5 grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
                {item.metrics.map((metric) => (
                  <div key={metric.label} className="rounded-2xl border border-amber-100 bg-gradient-to-r from-amber-50 to-rose-50 px-4 py-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-700">{metric.label}</p>
                    <p className="mt-2 text-lg font-semibold text-slate-900">{metric.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-[2rem] border border-cyan-200/80 bg-gradient-to-br from-white via-cyan-50/55 to-fuchsia-50/45 p-6 shadow-[0_30px_90px_rgba(14,165,233,0.13)] sm:p-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-2xl font-bold">Gallery</h2>
              <p className="mt-2 text-slate-600">A modern gallery section ready for service images, teaching moments, and atmosphere shots.</p>
            </div>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {item.gallery.map((image, index) => (
              <motion.div
                key={`${item.slug}-${index}`}
                whileHover={{ y: -4, scale: 1.01 }}
                className="overflow-hidden rounded-[1.6rem] border border-cyan-100 bg-slate-50 shadow-[0_14px_34px_rgba(14,165,233,0.13)]"
              >
                <img
                  src={image}
                  alt={`${item.eyebrow} gallery ${index + 1}`}
                  className={`h-72 w-full ${
                    item.slug === "coaching" && index === 1
                      ? "bg-white object-contain p-2"
                      : "object-cover"
                  }`}
                />
              </motion.div>
            ))}
          </div>
        </section>

        <section className="rounded-[2rem] border border-violet-200/80 bg-gradient-to-br from-[#fffefc] via-[#f0fbff] to-[#fff0fb] p-6 shadow-[0_30px_92px_rgba(139,92,246,0.16),0_12px_30px_rgba(14,165,233,0.11)] sm:p-8">
          <div className="grid gap-6 lg:grid-cols-[1fr_1.15fr]">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-violet-300 bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-violet-700">
                <PlayCircle size={14} />
                Video Section
              </span>
              <h2 className="mt-4 text-3xl font-bold">{item.videoTitle}</h2>
              <p className="mt-3 text-lg leading-relaxed text-slate-600">{item.videoDescription}</p>
            </div>

            {item.videoUrl ? (
              <div className="overflow-hidden rounded-[1.6rem] border border-white/80 bg-white shadow-sm">
                <iframe
                  src={item.videoUrl}
                  title={`${item.eyebrow} video`}
                  className="aspect-video w-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            ) : item.videoFile ? (
              <div className="overflow-hidden rounded-[1.6rem] border border-white/80 bg-white shadow-sm">
                <video
                  src={item.videoFile}
                  controls
                  className="aspect-video w-full object-cover"
                  playsInline
                />
              </div>
            ) : (
              <div className="flex aspect-video items-center justify-center rounded-[1.6rem] border border-dashed border-cyan-300 bg-white/70 p-8 text-center">
                <div>
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-cyan-100 text-cyan-700">
                    <PlayCircle size={28} />
                  </div>
                  <h3 className="mt-4 text-xl font-semibold text-slate-900">Video placeholder ready</h3>
                  <p className="mt-2 max-w-md text-slate-600">
                    Add a tutor intro, teaching walkthrough, classroom explanation, or testimonial video here later without changing the page layout.
                  </p>
                </div>
              </div>
            )}
          </div>
        </section>

      </div>

      <SiteFooter />
    </div>
  );
}
