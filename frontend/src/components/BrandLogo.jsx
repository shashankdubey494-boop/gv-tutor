export default function BrandLogo({
  className = "",
  imageClassName = "",
  padded = true,
}) {
  return (
    <div
      className={`inline-flex items-center justify-center rounded-2xl border border-white/12 bg-slate-950/72 shadow-[0_14px_34px_rgba(2,6,23,0.34)] backdrop-blur-md ${
        padded ? "px-3 py-2" : ""
      } ${className}`}
    >
      <img
        src="/logo.png"
        alt="Goodwill Tutor Logo"
        className={`h-10 sm:h-12 w-auto object-contain drop-shadow-[0_2px_10px_rgba(15,23,42,0.55)] ${imageClassName}`}
      />
    </div>
  );
}
