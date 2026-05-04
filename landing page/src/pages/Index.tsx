import React from "react";
import { ContainerScroll } from "@/components/ui/container-scroll-animation";
import { motion } from "framer-motion";
import { Wind, Zap, FileText, Box, ArrowRight, Github, Menu, X } from "lucide-react";

const VIDEO_URL =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260210_031346_d87182fb-b0af-4273-84d1-c6fd17d6bf0f.mp4";

const APP_SCREENSHOT = "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1400&h=720&fit=crop&q=80";

const Logo = () => (
  <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Logo">
    <path
      d="M1.04356 6.35771L13.6437 0.666504L26.2438 6.35771V21.6423L13.6437 27.3335L1.04356 21.6423V6.35771ZM13.6437 3.6665L3.54356 8.21984V19.7802L13.6437 24.3335L23.7438 19.7802V8.21984L13.6437 3.6665Z"
      fill="white"
    />
  </svg>
);

const features = [
  {
    icon: <Box className="w-6 h-6" />,
    title: "Dynamic 3D Visualizer",
    description:
      "Real-time Three.js integration with interactive pressure zoning labels directly rendered on each building surface.",
  },
  {
    icon: <Zap className="w-6 h-6" />,
    title: "Real-Time Engine",
    description:
      "Instant calculation updates as inputs change, powered by a debounced reactive frontend and a blazingly fast FastAPI backend.",
  },
  {
    icon: <FileText className="w-6 h-6" />,
    title: "Professional Reports",
    description:
      "Generate high-quality PDF calculation reports and Excel data exports instantly, with comprehensive calculation traces for peer review.",
  },
  {
    icon: <Wind className="w-6 h-6" />,
    title: "Eurocode Compliant",
    description:
      "Strict adherence to EN 1991-1-4:2005 with validated calculations across all five terrain categories (0 through IV).",
  },
];

const Index = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  return (
    <div className="bg-[#0f172a] min-h-screen overflow-x-hidden">
      {/* Hero Section with Video Background */}
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

        {/* Video overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0f172a]/40 via-[#0f172a]/60 to-[#0f172a]" />

        {/* Navbar */}
        <nav className="relative z-20 flex w-full items-center justify-between px-6 py-5 lg:px-[120px]">
          <div className="flex items-center gap-10">
            <a href="/" className="flex items-center gap-2">
              <Logo />
              <span className="font-manrope text-[16px] font-semibold text-white">
                Wind Load Engine
              </span>
            </a>
            <ul className="hidden items-center gap-8 lg:flex">
              {["Features", "API Docs", "GitHub"].map((item) => (
                <li key={item}>
                  <a
                    href={item === "API Docs" ? "/docs" : item === "GitHub" ? "https://github.com/Escgot/Windloader-Calculator" : "#features"}
                    target={item === "GitHub" ? "_blank" : undefined}
                    rel={item === "GitHub" ? "noopener noreferrer" : undefined}
                    className="flex items-center gap-1 font-manrope text-[14px] font-medium text-white transition-opacity hover:opacity-80"
                  >
                    {item}
                    {item === "GitHub" && <Github size={14} className="ml-1" />}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="hidden items-center gap-3 lg:flex">
            <a
              href="https://github.com/Escgot/Windloader-Calculator"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg border border-[#d4d4d4] bg-white px-4 py-2 font-manrope text-[14px] font-semibold text-[#171717] transition-colors hover:bg-neutral-100"
            >
              View Source
            </a>
            <a
              href="/app"
              className="rounded-lg bg-[#3b82f6] px-4 py-2 font-manrope text-[14px] font-semibold text-[#fafafa] shadow-md shadow-black/20 transition-colors hover:bg-[#2563eb]"
            >
              Launch App
            </a>
          </div>

          <button
            className="lg:hidden text-white"
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Open menu"
          >
            <Menu size={28} />
          </button>
        </nav>

        {/* Mobile overlay */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 flex flex-col bg-[#0f172a] p-6 lg:hidden">
            <div className="flex items-center justify-between">
              <Logo />
              <button onClick={() => setMobileMenuOpen(false)} aria-label="Close menu">
                <X className="text-white" size={28} />
              </button>
            </div>
            <ul className="mt-12 flex flex-col gap-6">
              {["Features", "API Docs", "GitHub"].map((item) => (
                <li key={item}>
                  <a href="#" className="font-manrope text-2xl font-medium text-white">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
            <div className="mt-auto flex flex-col gap-3">
              <a
                href="https://github.com/Escgot/Windloader-Calculator"
                className="rounded-lg border border-[#d4d4d4] bg-white px-4 py-3 font-manrope text-[14px] font-semibold text-[#171717] text-center"
              >
                View Source
              </a>
              <a
                href="/app"
                className="rounded-lg bg-[#3b82f6] px-4 py-3 font-manrope text-[14px] font-semibold text-[#fafafa] text-center"
              >
                Launch App
              </a>
            </div>
          </div>
        )}

        {/* Hero content */}
        <div className="relative z-10 mt-24 md:mt-32 flex flex-col items-center px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex h-[38px] items-center gap-2 rounded-[10px] border px-3 backdrop-blur"
            style={{
              backgroundColor: "rgba(85,80,110,0.4)",
              borderColor: "rgba(164,132,215,0.5)",
            }}
          >
            <span className="rounded-[6px] bg-[#3b82f6] px-2 py-0.5 font-inter text-[12px] font-medium text-white">
              v2.0
            </span>
            <span className="font-inter text-[14px] font-medium text-white">
              EN 1991-1-4:2005 Eurocode 1 Compliant
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="mt-8 max-w-[1000px] font-serif text-5xl leading-[1.1] text-white md:text-7xl lg:text-[96px]"
          >
            Calculate wind loads{" "}
            <em className="italic">instantly</em>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="mt-6 max-w-[662px] font-inter text-[18px] font-normal text-white/70"
          >
            A professional-grade engineering engine that translates complex
            structural wind load codes into clean, robust, and lightning-fast
            software. Stop wrestling with spreadsheets.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.45 }}
            className="mt-8 flex flex-col gap-3 sm:flex-row"
          >
            <a
              href="/app"
              className="group rounded-[10px] bg-[#3b82f6] px-6 py-3 font-manrope text-[16px] font-medium text-white transition-colors hover:bg-[#2563eb] flex items-center gap-2"
            >
              Start Calculating
              <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
            </a>
            <a
              href="/docs"
              target="_blank"
              className="rounded-[10px] bg-[#1e293b]/80 border border-white/10 backdrop-blur px-6 py-3 font-manrope text-[16px] font-medium text-[#f6f7f9] transition-colors hover:bg-[#334155]"
            >
              Explore the API
            </a>
          </motion.div>
        </div>
      </section>

      {/* Scroll Animation Section - App Showcase */}
      <section className="relative">
        <ContainerScroll
          titleComponent={
            <div className="mb-4">
              <p className="text-sm md:text-base font-manrope text-[#3b82f6] font-semibold tracking-wider uppercase mb-4">
                Premium Dashboard
              </p>
              <h2 className="text-4xl md:text-[5rem] font-serif font-normal text-white leading-none">
                Engineering,{" "}
                <em className="italic text-white/80">visualized.</em>
              </h2>
            </div>
          }
        >
          <img
            src={APP_SCREENSHOT}
            alt="Wind Load Calculator Dashboard"
            className="mx-auto rounded-2xl object-cover h-full w-full object-left-top"
            draggable={false}
          />
        </ContainerScroll>
      </section>

      {/* Features Grid */}
      <section id="features" className="relative py-24 px-6 lg:px-[120px]">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <p className="text-sm font-manrope text-[#3b82f6] font-semibold tracking-wider uppercase mb-4">
              Features
            </p>
            <h2 className="font-serif text-4xl md:text-6xl text-white">
              Precision meets <em className="italic">design</em>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-[#1e293b] border border-white/5 rounded-2xl p-8 hover:border-white/10 transition-all group"
              >
                <div className="w-12 h-12 rounded-xl bg-[#3b82f6]/10 flex items-center justify-center text-[#3b82f6] mb-6 group-hover:bg-[#3b82f6]/20 transition-colors">
                  {feature.icon}
                </div>
                <h3 className="font-manrope text-xl font-semibold text-white mb-3">
                  {feature.title}
                </h3>
                <p className="text-white/60 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 lg:px-[120px]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto text-center"
        >
          <h2 className="font-serif text-4xl md:text-6xl text-white mb-6">
            Ready to transform <br />
            <em className="italic">your workflow?</em>
          </h2>
          <p className="text-white/60 text-lg mb-10 max-w-lg mx-auto">
            Join structural engineers who have already automated their wind load
            calculations. Start now — it's free.
          </p>
          <a
            href="/app"
            className="group inline-flex items-center gap-2 rounded-[10px] bg-[#3b82f6] px-8 py-4 font-manrope text-[16px] font-semibold text-white transition-colors hover:bg-[#2563eb]"
          >
            Launch Workspace
            <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
          </a>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 px-6 lg:px-[120px]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Logo />
            <span className="font-manrope text-sm font-semibold text-white">
              Wind Load Engine
            </span>
          </div>
          <p className="text-white/40 text-sm">
            © 2024 Built for Civil Engineers & Software Architects.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
