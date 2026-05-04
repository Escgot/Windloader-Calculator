import { useState } from "react";
import { ChevronDown, Menu, X } from "lucide-react";

const VIDEO_URL =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260210_031346_d87182fb-b0af-4273-84d1-c6fd17d6bf0f.mp4";

const Logo = () => (
  <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Future logo">
    <path
      d="M1.04356 6.35771L13.6437 0.666504L26.2438 6.35771V21.6423L13.6437 27.3335L1.04356 21.6423V6.35771ZM13.6437 3.6665L3.54356 8.21984V19.7802L13.6437 24.3335L23.7438 19.7802V8.21984L13.6437 3.6665Z"
      fill="white"
    />
  </svg>
);

const Hero = () => {
  const [open, setOpen] = useState(false);

  return (
    <section className="relative min-h-screen w-full overflow-hidden">
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 h-full w-full object-cover"
      >
        <source src={VIDEO_URL} type="video/mp4" />
      </video>

      {/* Navbar */}
      <nav className="relative z-20 flex w-full items-center justify-between px-6 py-4 lg:px-[120px]">
        <div className="flex items-center gap-10">
          <a href="#" className="flex items-center gap-2">
            <Logo />
            <span className="font-manrope text-[16px] font-semibold text-white">Datacore</span>
          </a>
          <ul className="hidden items-center gap-8 lg:flex">
            {["Home", "Services", "Reviews", "Contact us"].map((item) => (
              <li key={item}>
                <a
                  href="#"
                  className="flex items-center gap-1 font-manrope text-[14px] font-medium text-white transition-opacity hover:opacity-80"
                >
                  {item}
                  {item === "Services" && <ChevronDown size={14} />}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div className="hidden items-center gap-3 lg:flex">
          <button className="rounded-lg border border-[#d4d4d4] bg-white px-4 py-2 font-manrope text-[14px] font-semibold text-[#171717] transition-colors hover:bg-neutral-100">
            Sign In
          </button>
          <button className="rounded-lg bg-brand-purple px-4 py-2 font-manrope text-[14px] font-semibold text-[#fafafa] shadow-md shadow-black/20 transition-colors hover:bg-[#8a4dff]">
            Get Started
          </button>
        </div>

        <button
          className="lg:hidden"
          onClick={() => setOpen(true)}
          aria-label="Open menu"
        >
          <Menu className="text-white" size={28} />
        </button>
      </nav>

      {/* Mobile overlay */}
      {open && (
        <div className="fixed inset-0 z-50 flex flex-col bg-black p-6 lg:hidden">
          <div className="flex items-center justify-between">
            <Logo />
            <button onClick={() => setOpen(false)} aria-label="Close menu">
              <X className="text-white" size={28} />
            </button>
          </div>
          <ul className="mt-12 flex flex-col gap-6">
            {["Home", "Services", "Reviews", "Contact us"].map((item) => (
              <li key={item}>
                <a href="#" className="font-manrope text-2xl font-medium text-white">
                  {item}
                </a>
              </li>
            ))}
          </ul>
          <div className="mt-auto flex flex-col gap-3">
            <button className="rounded-lg border border-[#d4d4d4] bg-white px-4 py-3 font-manrope text-[14px] font-semibold text-[#171717]">
              Sign In
            </button>
            <button className="rounded-lg bg-brand-purple px-4 py-3 font-manrope text-[14px] font-semibold text-[#fafafa]">
              Get Started
            </button>
          </div>
        </div>
      )}

      {/* Hero content */}
      <div className="relative z-10 mt-32 flex flex-col items-center px-6 text-center">
        <div
          className="flex h-[38px] items-center gap-2 rounded-[10px] border px-2 backdrop-blur"
          style={{
            backgroundColor: "rgba(85,80,110,0.4)",
            borderColor: "rgba(164,132,215,0.5)",
          }}
        >
          <span className="rounded-[6px] bg-brand-purple px-2 py-0.5 font-cabin text-[12px] font-medium text-white">
            New
          </span>
          <span className="font-cabin text-[14px] font-medium text-white">
            Say Hello to Datacore v3.2
          </span>
        </div>

        <h1 className="mt-8 max-w-[1000px] font-serif text-5xl leading-[1.1] text-white md:text-7xl lg:text-[96px]">
          Book your perfect stay instantly{" "}
          <em className="italic px-1">and</em> hassle-free
        </h1>

        <p className="mt-6 max-w-[662px] font-inter text-[18px] font-normal text-white/70">
          Discover handpicked hotels, resorts, and stays across your favorite
          destinations. Enjoy exclusive deals, fast booking, and 24/7 support.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <button className="rounded-[10px] bg-brand-purple px-6 py-3 font-cabin text-[16px] font-medium text-white transition-colors hover:bg-[#8a4dff]">
            Book a Free Demo
          </button>
          <button className="rounded-[10px] bg-brand-dark px-6 py-3 font-cabin text-[16px] font-medium text-[#f6f7f9] transition-colors hover:bg-[#3a3158]">
            Get Started Now
          </button>
        </div>
      </div>
    </section>
  );
};

export default Hero;
