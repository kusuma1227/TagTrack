import React from 'react';
import { Link } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import useScrollReveal from '../../hooks/useScrollReveal';

const LandingPage = () => {
  const { isAuthenticated, user } = useAuth();

  // Scroll reveal observers for each section
  const [featuresRef, featuresVisible] = useScrollReveal({ threshold: 0.1 });
  const [howItWorksRef, howItWorksVisible] = useScrollReveal({ threshold: 0.1 });
  const [smartTagRef, smartTagVisible] = useScrollReveal({ threshold: 0.1 });
  const [statsRef, statsVisible] = useScrollReveal({ threshold: 0.1 });
  const [ctaRef, ctaVisible] = useScrollReveal({ threshold: 0.15 });
  const [footerRef, footerVisible] = useScrollReveal({ threshold: 0.05 });

  const getDashboardLink = () => {
    if (!user) return '/dashboard';
    if (user.role === 'admin') return '/admin/dashboard';
    if (user.role === 'officer') return '/officer/dashboard';
    return '/dashboard';
  };

  const features = [
    {
      title: 'Secure & Private',
      description: 'Your contact data is protected. Personal phone numbers and email stay confidential.',
      icon: (
        <svg className="w-6 h-6 text-[#8B5CF6]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      ),
      glow: 'from-violet-50 to-purple-100 border-[#DDD3F5] text-[#8B5CF6]',
      badge: 'Protected',
      cardBg: 'bg-[#F3EEFF] border-[#DDD3F5] hover:border-[#8B5CF6]/50',
    },
    {
      title: 'Fast Recovery',
      description: 'Quick and easy process for finders to scan and initiate safe returns without app installs.',
      icon: (
        <svg className="w-6 h-6 text-[#EC4899]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      glow: 'from-pink-50 to-rose-100 border-[#FBCFE8] text-[#EC4899]',
      badge: 'Rapid Scan',
      cardBg: 'bg-[#FFF0F7] border-[#FBCFE8] hover:border-[#EC4899]/50',
    },
    {
      title: 'Verified Ownership',
      description: 'Prevents false claims with unique cryptographic collision-safe Tag IDs and officer review.',
      icon: (
        <svg className="w-6 h-6 text-[#10B981]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      glow: 'from-emerald-50 to-teal-100 border-[#A7F3D0] text-[#10B981]',
      badge: 'Authentic',
      cardBg: 'bg-[#ECFDF5] border-[#A7F3D0] hover:border-[#10B981]/50',
    },
    {
      title: 'Universal Access',
      description: 'Works seamlessly anywhere, anytime across smartphones, tablets, and computers.',
      icon: (
        <svg className="w-6 h-6 text-[#F97316]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      ),
      glow: 'from-amber-50 to-orange-100 border-[#FED7AA] text-[#F97316]',
      badge: 'Multi-Device',
      cardBg: 'bg-[#FFF4E8] border-[#FED7AA] hover:border-[#F97316]/50',
    },
  ];

  const steps = [
    {
      step: '01',
      title: 'Register Item',
      desc: 'Add your item details to generate a unique digital tag & QR code.',
      icon: '📦',
      accent: 'border-[#DDD3F5] text-[#8B5CF6] bg-[#EEE7FF]',
      cardBg: 'bg-white border-[#E9DFFF] hover:border-[#8B5CF6]/50',
      stepText: 'text-[#8B5CF6]',
    },
    {
      step: '02',
      title: 'Report Found',
      desc: 'Found an item? Scan the QR code or enter the Tag ID instantly.',
      icon: '🔍',
      accent: 'border-[#FBCFE8] text-[#EC4899] bg-[#FFF0F7]',
      cardBg: 'bg-white border-[#E9DFFF] hover:border-[#EC4899]/50',
      stepText: 'text-[#EC4899]',
    },
    {
      step: '03',
      title: 'Verify Owner',
      desc: 'Officer reviews proof and verifies digital ownership credentials.',
      icon: '🛡️',
      accent: 'border-[#FED7AA] text-[#F97316] bg-[#FFF4E8]',
      cardBg: 'bg-white border-[#E9DFFF] hover:border-[#F97316]/50',
      stepText: 'text-[#F97316]',
    },
    {
      step: '04',
      title: 'Secure Return',
      desc: 'The handover is safely coordinated and recorded in the system.',
      icon: '🤝',
      accent: 'border-[#A7F3D0] text-[#10B981] bg-[#ECFDF5]',
      cardBg: 'bg-white border-[#E9DFFF] hover:border-[#10B981]/50',
      stepText: 'text-[#10B981]',
    },
  ];

  const stats = [
    { label: 'Tag ID Uniqueness', value: '100%', highlight: 'Collision-Free IDs', color: 'from-[#8B5CF6] to-[#A855F7]' },
    { label: 'QR Scan Speed', value: '< 1s', highlight: 'Instant Lookup', color: 'from-[#A855F7] to-[#EC4899]' },
    { label: 'Scanner Support', value: 'Universal', highlight: 'Any Smartphone Camera', color: 'from-[#EC4899] to-[#F97316]' },
    { label: 'Platform Uptime', value: '99.9%', highlight: 'Cloud Hosted', color: 'from-[#F97316] to-[#10B981]' },
  ];

  return (
    <div className="relative min-h-screen bg-[#F8F7FF] text-[#18151F] overflow-hidden page-transition">

      {/* ── Ambient Background Lighting ────────────────────────────────────── */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-5%] left-[10%] w-[550px] h-[550px] rounded-full bg-gradient-to-tr from-[#8B5CF6]/10 via-[#A855F7]/8 to-transparent blur-[120px] animate-pulse-glow" />
        <div className="absolute top-[30%] right-[-5%] w-[600px] h-[600px] rounded-full bg-gradient-to-bl from-[#EC4899]/10 via-[#8B5CF6]/8 to-transparent blur-[140px] animate-pulse-glow" style={{ animationDelay: '1.5s' }} />
        <div className="absolute bottom-[10%] left-[-5%] w-[600px] h-[600px] rounded-full bg-gradient-to-tr from-[#F97316]/8 via-[#8B5CF6]/6 to-transparent blur-[130px]" />
      </div>

      <div className="relative z-10">

        {/* ══════════════════════════════════════════════════════════════════════
            HERO SECTION
        ══════════════════════════════════════════════════════════════════════ */}
        <section id="hero" className="pt-12 pb-20 lg:pt-20 lg:pb-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">

            {/* Left Column: Hero Content */}
            <div className="lg:col-span-7 text-center lg:text-left space-y-6">

              {/* 1. Badge */}
              <div
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-[#DDD3F5] shadow-soft-sm animate-slide-up opacity-0"
                style={{ animationDelay: '100ms', animationFillMode: 'forwards' }}
              >
                <span className="w-2 h-2 rounded-full bg-[#EC4899] animate-ping" />
                <span className="text-xs font-bold tracking-wide uppercase bg-clip-text text-transparent bg-gradient-to-r from-[#8B5CF6] to-[#EC4899]">
                  Smart Tracking • Secure • Reliable
                </span>
              </div>

              {/* 2. Main Heading */}
              <h1
                className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#18151F] leading-[1.15] animate-slide-up opacity-0"
                style={{ animationDelay: '200ms', animationFillMode: 'forwards' }}
              >
                Lost Something? <br />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#8B5CF6] via-[#A855F7] to-[#EC4899]">
                  TagTrack
                </span>{' '}
                Helps You <br />
                <span className="text-[#18151F]">Bring It Back.</span>
              </h1>

              {/* 3. Description */}
              <p
                className="text-base sm:text-lg text-[#5B5568] max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal animate-slide-up opacity-0"
                style={{ animationDelay: '300ms', animationFillMode: 'forwards' }}
              >
                TagTrack is a smart digital platform that gives your belongings a unique identity. Generate printable QR tags, report lost items, and manage verified, secure returns effortlessly.
              </p>

              {/* 4. CTA Buttons with Stagger */}
              <div
                className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-2 animate-slide-up opacity-0"
                style={{ animationDelay: '400ms', animationFillMode: 'forwards' }}
              >
                {isAuthenticated ? (
                  <Link
                    to={getDashboardLink()}
                    className="btn-primary text-base py-3.5 px-8 flex items-center justify-center gap-2 group"
                  >
                    <span>Go to Dashboard</span>
                    <span className="group-hover:translate-x-1 transition-transform duration-200">→</span>
                  </Link>
                ) : (
                  <Link
                    to="/register"
                    className="btn-primary text-base py-3.5 px-8 flex items-center justify-center gap-2 group"
                  >
                    <span>Register Your Item</span>
                    <span className="group-hover:translate-x-1 transition-transform duration-200">→</span>
                  </Link>
                )}

                <Link
                  to="/scan"
                  className="btn-secondary text-base py-3.5 px-8 flex items-center justify-center gap-2"
                >
                  <span>🔍</span>
                  <span>Find a Lost Item</span>
                </Link>
              </div>

              {/* 5. Trust Indicators */}
              <div
                className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-[#5B5568] font-medium animate-slide-up opacity-0"
                style={{ animationDelay: '500ms', animationFillMode: 'forwards' }}
              >
                <div className="flex items-center gap-2">
                  <span className="text-[#8B5CF6] font-extrabold text-sm">✓</span>
                  <span>No Special App Needed</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[#EC4899] font-extrabold text-sm">✓</span>
                  <span>Instant QR Generation</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[#10B981] font-extrabold text-sm">✓</span>
                  <span>Privacy-Safe Handover</span>
                </div>
              </div>
            </div>

            {/* Right Column: 3D Smart Key with Key-Ring + Barcode + Smartphone Visual */}
            <div
              className="lg:col-span-5 relative flex items-center justify-center animate-slide-up opacity-0"
              style={{ animationDelay: '350ms', animationFillMode: 'forwards' }}
            >

              {/* Ambient Glow Aura */}
              <div className="absolute w-72 h-72 sm:w-96 sm:h-96 rounded-full bg-gradient-to-tr from-[#8B5CF6]/20 via-[#A855F7]/15 to-[#EC4899]/20 blur-3xl animate-pulse-glow" />

              {/* Hero Visual Composite Container */}
              <div className="relative w-full max-w-lg flex flex-col sm:flex-row items-center justify-center gap-4">

                {/* ── 1. Physical 3D Smart Key / Tracker ── */}
                <div className="relative w-full max-w-[280px] sm:max-w-[290px] animate-float-slow z-20">

                  {/* Physical Metallic Split Key-Ring */}
                  <div className="metallic-keyring" title="Steel Key-Ring Loop">
                    <div className="w-8 h-8 rounded-full border-2 border-slate-300 bg-slate-900 shadow-inner flex items-center justify-center">
                      <div className="w-2.5 h-2.5 rounded-full bg-[#A855F7] shadow-[0_0_8px_#A855F7]" />
                    </div>
                  </div>

                  {/* 3D Smart Tag Device Chassis (Dark purple edge for high contrast + white face) */}
                  <div className="smart-tag-3d-chassis pt-6">

                    {/* Top Device Header Bar */}
                    <div className="flex items-center justify-between mb-4 pb-2.5 border-b border-purple-500/20">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-[#8B5CF6] to-[#EC4899] p-[1px] shadow-sm">
                          <div className="w-full h-full bg-[#18151F] rounded-[5px] flex items-center justify-center text-[10px] font-black text-pink-300">
                            TT
                          </div>
                        </div>
                        <div>
                          <div className="text-[10px] font-black tracking-wider text-white">TAGTRACK KEY</div>
                          <div className="text-[9px] text-[#EC4899] font-mono font-bold tracking-wider">ID: TT-A3F2K9</div>
                        </div>
                      </div>

                      <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-[9px] font-bold text-emerald-300">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                        Active
                      </span>
                    </div>

                    {/* ── High-Contrast White Ceramic Faceplate ── */}
                    <div className="surface-white-tag p-3.5 text-center relative overflow-hidden group">

                      {/* Animated Violet/Pink Laser Scanline */}
                      <div className="scanner-laser animate-laser-scan z-20" />

                      {/* QR Code Graphic Frame */}
                      <div className="relative p-1.5 bg-white rounded-xl inline-block shadow-sm z-10 transition-transform duration-300 group-hover:scale-105">
                        <svg
                          className="w-28 h-28 sm:w-32 sm:h-32 mx-auto"
                          viewBox="0 0 100 100"
                          fill="#18151F"
                        >
                          <rect width="100" height="100" fill="#ffffff" />
                          {/* Finder Eyes */}
                          <rect x="10" y="10" width="26" height="26" fill="#18151F" rx="3" />
                          <rect x="14" y="14" width="18" height="18" fill="#ffffff" rx="1.5" />
                          <rect x="18" y="18" width="10" height="10" fill="#8B5CF6" rx="1" />

                          <rect x="64" y="10" width="26" height="26" fill="#18151F" rx="3" />
                          <rect x="68" y="14" width="18" height="18" fill="#ffffff" rx="1.5" />
                          <rect x="72" y="18" width="10" height="10" fill="#A855F7" rx="1" />

                          <rect x="10" y="64" width="26" height="26" fill="#18151F" rx="3" />
                          <rect x="14" y="68" width="18" height="18" fill="#ffffff" rx="1.5" />
                          <rect x="18" y="72" width="10" height="10" fill="#EC4899" rx="1" />

                          {/* Data Matrix */}
                          <rect x="42" y="12" width="6" height="6" fill="#18151F" />
                          <rect x="52" y="12" width="6" height="14" fill="#A855F7" />
                          <rect x="42" y="24" width="16" height="6" fill="#18151F" />
                          <rect x="12" y="42" width="14" height="6" fill="#18151F" />
                          <rect x="32" y="42" width="6" height="16" fill="#8B5CF6" />
                          <rect x="44" y="40" width="12" height="12" fill="#18151F" rx="1" />
                          <rect x="62" y="42" width="16" height="6" fill="#EC4899" />
                          <rect x="82" y="42" width="8" height="16" fill="#18151F" />
                          <rect x="12" y="52" width="6" height="6" fill="#A855F7" />
                          <rect x="22" y="52" width="6" height="6" fill="#18151F" />
                          <rect x="44" y="58" width="16" height="6" fill="#18151F" />
                          <rect x="66" y="54" width="8" height="14" fill="#18151F" />
                          <rect x="42" y="68" width="8" height="8" fill="#8B5CF6" />
                          <rect x="56" y="70" width="14" height="6" fill="#F43F5E" />
                          <rect x="42" y="82" width="18" height="6" fill="#18151F" />
                          <rect x="66" y="82" width="22" height="6" fill="#EC4899" />
                        </svg>
                      </div>

                      {/* ── Barcode & Identification Strip ── */}
                      <div className="mt-2.5 pt-2 border-t border-slate-200 bg-[#F8F7FF] rounded-lg p-1.5">
                        <div className="flex justify-center items-center gap-[2px] h-6 overflow-hidden mb-1 px-1">
                          <span className="w-[2px] h-full bg-slate-900" />
                          <span className="w-[1px] h-full bg-slate-900" />
                          <span className="w-[3px] h-full bg-slate-900" />
                          <span className="w-[1px] h-full bg-transparent" />
                          <span className="w-[2px] h-full bg-slate-900" />
                          <span className="w-[4px] h-full bg-slate-900" />
                          <span className="w-[1px] h-full bg-transparent" />
                          <span className="w-[2px] h-full bg-[#8B5CF6]" />
                          <span className="w-[1px] h-full bg-slate-900" />
                          <span className="w-[3px] h-full bg-slate-900" />
                          <span className="w-[1px] h-full bg-transparent" />
                          <span className="w-[2px] h-full bg-slate-900" />
                          <span className="w-[1px] h-full bg-slate-900" />
                          <span className="w-[4px] h-full bg-[#EC4899]" />
                          <span className="w-[2px] h-full bg-slate-900" />
                          <span className="w-[1px] h-full bg-transparent" />
                          <span className="w-[3px] h-full bg-slate-900" />
                          <span className="w-[2px] h-full bg-slate-900" />
                        </div>
                        <span className="font-mono text-[10px] font-extrabold text-[#18151F] tracking-[0.2em] block text-center">
                          TT-A3F2K9
                        </span>
                      </div>
                    </div>

                    {/* Bottom Specs Chip */}
                    <div className="mt-3 flex items-center justify-between text-[9px] text-slate-300 bg-black/40 p-2 rounded-xl border border-purple-500/20">
                      <span className="text-slate-400">Item: <strong className="text-white">MacBook Pro</strong></span>
                      <span className="text-[#EC4899] font-mono font-bold">DIGITAL SMART TAG</span>
                    </div>
                  </div>
                </div>

                {/* ── 2. Smartphone Visual Frame ── */}
                <div className="hidden sm:block relative w-[200px] sm:w-[215px] phone-scanner-frame animate-float-reverse -ml-8 sm:-ml-10 z-10">

                  {/* Phone Speaker Notch */}
                  <div className="w-12 h-1 bg-slate-300 rounded-full mx-auto mb-2" />

                  {/* Phone Screen Viewport */}
                  <div className="rounded-[20px] bg-[#F8F7FF] p-3 border border-[#E9DFFF] relative overflow-hidden">

                    {/* Phone Header */}
                    <div className="flex items-center justify-between text-[9px] text-[#5B5568] mb-2 pb-1.5 border-b border-[#E9DFFF]">
                      <span className="font-bold text-[#18151F]">Scan QR Code</span>
                      <span className="text-[#EC4899] text-xs">⚡</span>
                    </div>

                    {/* Camera Viewfinder with Corner Brackets */}
                    <div className="relative p-3 rounded-xl bg-white border border-[#DDD3F5] flex flex-col items-center justify-center my-1 shadow-sm">

                      {/* Viewfinder Neon Corner Brackets */}
                      <div className="absolute top-1.5 left-1.5 w-3 h-3 border-t-2 border-l-2 border-[#EC4899]" />
                      <div className="absolute top-1.5 right-1.5 w-3 h-3 border-t-2 border-r-2 border-[#EC4899]" />
                      <div className="absolute bottom-1.5 left-1.5 w-3 h-3 border-b-2 border-l-2 border-[#EC4899]" />
                      <div className="absolute bottom-1.5 right-1.5 w-3 h-3 border-b-2 border-r-2 border-[#EC4899]" />

                      {/* Scanning Beam inside Phone */}
                      <div className="scanner-laser-green animate-laser-scan z-20" />

                      {/* Mini QR target */}
                      <div className="p-1 bg-white rounded-lg shadow-sm">
                        <svg className="w-16 h-16" viewBox="0 0 100 100" fill="#18151F">
                          <rect width="100" height="100" fill="#ffffff" />
                          <rect x="10" y="10" width="26" height="26" fill="#18151F" rx="2" />
                          <rect x="14" y="14" width="18" height="18" fill="#ffffff" rx="1" />
                          <rect x="18" y="18" width="10" height="10" fill="#10B981" rx="1" />
                          <rect x="64" y="10" width="26" height="26" fill="#18151F" rx="2" />
                          <rect x="68" y="14" width="18" height="18" fill="#ffffff" rx="1" />
                          <rect x="72" y="18" width="10" height="10" fill="#8B5CF6" rx="1" />
                          <rect x="10" y="64" width="26" height="26" fill="#18151F" rx="2" />
                          <rect x="14" y="68" width="18" height="18" fill="#ffffff" rx="1" />
                          <rect x="18" y="72" width="10" height="10" fill="#EC4899" rx="1" />
                          <rect x="42" y="12" width="6" height="6" fill="#18151F" />
                          <rect x="52" y="12" width="6" height="14" fill="#A855F7" />
                          <rect x="42" y="40" width="14" height="14" fill="#18151F" rx="1" />
                          <rect x="62" y="52" width="16" height="6" fill="#10B981" />
                          <rect x="42" y="82" width="24" height="6" fill="#18151F" />
                        </svg>
                      </div>

                      <span className="text-[8px] font-mono text-[#8B5CF6] font-bold mt-1.5">ALIGN QR CODE</span>
                    </div>

                    {/* Status Pill in Phone */}
                    <div className="mt-2 p-1.5 rounded-lg bg-[#ECFDF5] border border-[#A7F3D0] flex items-center justify-center gap-1 text-[#10B981] text-[9px] font-bold">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
                      <span>Item Found • Verified</span>
                    </div>
                  </div>
                </div>

                {/* ── 3. Floating Micro Info Badges ── */}
                <div className="hidden lg:flex absolute -top-4 -right-2 px-3 py-1.5 rounded-xl bg-white border border-[#FBCFE8] shadow-soft-md items-center gap-2 animate-float-subtle z-30">
                  <span className="text-[#EC4899] text-xs font-bold">✓</span>
                  <span className="text-[10px] font-bold text-[#18151F]">Ownership Verified</span>
                </div>

                <div className="hidden lg:flex absolute -bottom-5 left-0 px-3 py-1.5 rounded-xl bg-white border border-[#DDD3F5] shadow-soft-md items-center gap-2 animate-float z-30">
                  <span className="text-[#8B5CF6] text-xs">🛡️</span>
                  <span className="text-[10px] font-bold text-[#18151F]">Secure Recovery</span>
                </div>

              </div>
            </div>

          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════════════
            FEATURE STRIP (Light Colorful Cards)
        ══════════════════════════════════════════════════════════════════════ */}
        <section id="features" ref={featuresRef} className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className={`text-center max-w-3xl mx-auto mb-12 reveal ${featuresVisible ? 'active' : ''}`}>
            <h2 className="text-xs font-bold tracking-widest text-[#8B5CF6] uppercase mb-2">Core Capabilities</h2>
            <p className="text-2xl sm:text-3xl font-extrabold text-[#18151F]">
              Engineered for Seamless Recovery
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((item, index) => (
              <div
                key={index}
                className={`group relative p-6 rounded-[22px] ${item.cardBg} border shadow-soft-sm transition-all duration-300 hover:shadow-soft-md hover:-translate-y-1.5 reveal delay-${(index + 1) * 100} ${featuresVisible ? 'active' : ''}`}
              >
                {/* Top Icon with Accent Glow */}
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-white border border-white/80 flex items-center justify-center group-hover:scale-110 shadow-sm transition-all duration-300">
                    {item.icon}
                  </div>
                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border bg-white ${item.glow}`}>
                    {item.badge}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-[#18151F] mb-2 group-hover:text-[#8B5CF6] transition-colors duration-200">
                  {item.title}
                </h3>
                <p className="text-sm text-[#5B5568] leading-relaxed font-normal">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════════════
            HOW IT WORKS
        ══════════════════════════════════════════════════════════════════════ */}
        <section id="how-it-works" ref={howItWorksRef} className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-[#E9DFFF]">
          <div className={`text-center max-w-3xl mx-auto mb-16 reveal ${howItWorksVisible ? 'active' : ''}`}>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EEE7FF] border border-[#DDD3F5] text-[#8B5CF6] text-xs font-semibold mb-3">
              <span>⚡</span>
              <span>Intuitive Workflow</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#18151F] tracking-tight">
              Simple Steps. <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#8B5CF6] via-[#EC4899] to-[#F97316]">Safe Returns.</span>
            </h2>
            <p className="text-[#5B5568] text-sm sm:text-base mt-3">
              A transparent, 4-step verified recovery journey from lost to returned.
            </p>
          </div>

          <div className="relative">

            {/* Connecting Line */}
            <div
              className={`hidden lg:block absolute top-1/2 left-[10%] right-[10%] h-[2px] -translate-y-6 bg-gradient-to-r from-[#8B5CF6] via-[#EC4899] via-[#F97316] to-[#10B981] pointer-events-none transition-opacity duration-1000 ${
                howItWorksVisible ? 'opacity-40' : 'opacity-0'
              }`}
            />

            {/* 4 Process Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10">
              {steps.map((step, idx) => (
                <div
                  key={idx}
                  className={`relative p-6 rounded-[22px] ${step.cardBg} border shadow-soft-sm transition-all duration-300 hover:shadow-soft-lg hover:-translate-y-2 flex flex-col justify-between reveal delay-${(idx + 1) * 100} ${
                    howItWorksVisible ? 'active' : ''
                  }`}
                >
                  <div>
                    {/* Circular Number Icon */}
                    <div className="flex items-center justify-between mb-5">
                      <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center text-xl shadow-soft-sm transition-transform duration-300 hover:scale-110 ${step.accent}`}>
                        <span>{step.icon}</span>
                      </div>
                      <span className="text-2xl font-black font-mono text-[#DDD3F5] select-none">
                        {step.step}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-[#18151F] mb-2">{step.title}</h3>
                    <p className="text-sm text-[#5B5568] leading-relaxed font-normal">
                      {step.desc}
                    </p>
                  </div>

                  <div className={`mt-4 pt-3 border-t border-slate-100 text-[11px] ${step.stepText} font-bold`}>
                    Step {idx + 1} of 4
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════════════
            SMART QR TAG SHOWCASE SECTION
        ══════════════════════════════════════════════════════════════════════ */}
        <section id="smart-tag" ref={smartTagRef} className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="rounded-[28px] bg-white border border-[#E9DFFF] p-8 sm:p-12 lg:p-16 shadow-soft-lg relative overflow-hidden">

            {/* Subtle Ambient Background */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-[#8B5CF6]/5 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#EC4899]/5 rounded-full blur-3xl pointer-events-none" />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">

              {/* Left Side: Smart Tag / QR Visual */}
              <div className={`lg:col-span-5 flex justify-center reveal-left ${smartTagVisible ? 'active' : ''}`}>
                <div className="relative w-full max-w-sm p-6 rounded-3xl bg-[#F3EEFF] border border-[#DDD3F5] shadow-soft-md text-center transition-all duration-300 hover:border-[#8B5CF6]/50 animate-float-slow">

                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-[#DDD3F5] text-[#8B5CF6] text-xs font-bold mb-4">
                    <span>🏷️</span>
                    <span>High-Resolution Digital Tag</span>
                  </div>

                  {/* QR Image Box on Crisp White Card */}
                  <div className="p-4 bg-white rounded-2xl shadow-soft-md inline-block mb-4 relative transition-transform duration-300 hover:scale-105 border border-[#E9DFFF]">
                    <svg className="w-40 h-40" viewBox="0 0 100 100" fill="#18151F">
                      <rect width="100" height="100" fill="#ffffff" />
                      <rect x="10" y="10" width="26" height="26" fill="#18151F" rx="2" />
                      <rect x="14" y="14" width="18" height="18" fill="#ffffff" rx="1" />
                      <rect x="18" y="18" width="10" height="10" fill="#8B5CF6" rx="1" />
                      <rect x="64" y="10" width="26" height="26" fill="#18151F" rx="2" />
                      <rect x="68" y="14" width="18" height="18" fill="#ffffff" rx="1" />
                      <rect x="72" y="18" width="10" height="10" fill="#A855F7" rx="1" />
                      <rect x="10" y="64" width="26" height="26" fill="#18151F" rx="2" />
                      <rect x="14" y="68" width="18" height="18" fill="#ffffff" rx="1" />
                      <rect x="18" y="72" width="10" height="10" fill="#EC4899" rx="1" />
                      <rect x="42" y="12" width="6" height="6" fill="#18151F" />
                      <rect x="52" y="12" width="6" height="14" fill="#A855F7" />
                      <rect x="42" y="24" width="16" height="6" fill="#18151F" />
                      <rect x="12" y="42" width="14" height="6" fill="#18151F" />
                      <rect x="32" y="42" width="6" height="16" fill="#EC4899" />
                      <rect x="44" y="40" width="12" height="12" fill="#18151F" rx="1" />
                      <rect x="62" y="42" width="16" height="6" fill="#18151F" />
                      <rect x="82" y="42" width="8" height="16" fill="#18151F" />
                      <rect x="42" y="68" width="8" height="8" fill="#18151F" />
                      <rect x="56" y="70" width="14" height="6" fill="#8B5CF6" />
                      <rect x="42" y="82" width="18" height="6" fill="#18151F" />
                      <rect x="66" y="82" width="22" height="6" fill="#EC4899" />
                    </svg>
                  </div>

                  <div className="font-mono text-sm font-extrabold text-[#18151F] tracking-widest bg-white py-2 px-4 rounded-xl border border-[#DDD3F5] mb-2 shadow-soft-sm">
                    TT-2M6AJM
                  </div>
                  <span className="text-[11px] text-[#5B5568] block">Printable tag for luggage, laptops, and valuables</span>
                </div>
              </div>

              {/* Right Side: Copy & Bullet Highlights */}
              <div className={`lg:col-span-7 space-y-6 text-left reveal-right ${smartTagVisible ? 'active' : ''}`}>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFF0F7] border border-[#FBCFE8] text-[#EC4899] text-xs font-bold">
                  <span>✨</span>
                  <span>Zero Battery • Zero Maintenance</span>
                </div>

                <h2 className="text-3xl sm:text-4xl font-extrabold text-[#18151F] tracking-tight">
                  Smart Digital Tag
                </h2>

                <p className="text-[#5B5568] text-base sm:text-lg leading-relaxed font-normal">
                  Each registered item receives a unique digital identity with a QR code. Scan it from any phone to access secure, verified recovery information.
                </p>

                <div className="space-y-3 pt-2">
                  <div className="flex items-start gap-3 group">
                    <div className="w-5 h-5 rounded-full bg-[#EEE7FF] text-[#8B5CF6] flex items-center justify-center text-xs font-bold mt-0.5 group-hover:scale-110 transition-transform duration-200">
                      ✓
                    </div>
                    <span className="text-sm text-[#5B5568]">
                      <strong className="text-[#18151F]">Universal Scanner Support:</strong> Works with standard smartphone camera apps without installing extra software.
                    </span>
                  </div>

                  <div className="flex items-start gap-3 group">
                    <div className="w-5 h-5 rounded-full bg-[#FFF0F7] text-[#EC4899] flex items-center justify-center text-xs font-bold mt-0.5 group-hover:scale-110 transition-transform duration-200">
                      ✓
                    </div>
                    <span className="text-sm text-[#5B5568]">
                      <strong className="text-[#18151F]">Privacy First:</strong> Personal phone numbers and home addresses remain protected and confidential.
                    </span>
                  </div>

                  <div className="flex items-start gap-3 group">
                    <div className="w-5 h-5 rounded-full bg-[#FFF4E8] text-[#F97316] flex items-center justify-center text-xs font-bold mt-0.5 group-hover:scale-110 transition-transform duration-200">
                      ✓
                    </div>
                    <span className="text-sm text-[#5B5568]">
                      <strong className="text-[#18151F]">Printable & Downloadable:</strong> Export high-resolution PNG tags to stick on luggage, laptops, and keys.
                    </span>
                  </div>
                </div>

                <div className="pt-4">
                  <Link
                    to="/scan"
                    className="btn-primary text-sm py-3 px-6"
                  >
                    Learn More & Try Scanner →
                  </Link>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════════════
            HIGHLIGHTS & METRICS
        ══════════════════════════════════════════════════════════════════════ */}
        <section ref={statsRef} className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, i) => (
              <div
                key={i}
                className={`p-6 rounded-[22px] bg-white border border-[#E9DFFF] shadow-soft-sm text-center hover:border-[#8B5CF6]/50 hover:shadow-soft-md transition-all duration-300 hover:-translate-y-1 reveal delay-${(i + 1) * 100} ${
                  statsVisible ? 'active' : ''
                }`}
              >
                <div className={`text-3xl sm:text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r ${stat.color} font-mono mb-1`}>
                  {stat.value}
                </div>
                <div className="text-xs font-bold text-[#18151F] uppercase tracking-wider mb-1">
                  {stat.label}
                </div>
                <div className="text-[11px] text-[#5B5568] font-medium">
                  {stat.highlight}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════════════
            FINAL CTA
        ══════════════════════════════════════════════════════════════════════ */}
        <section id="about" ref={ctaRef} className="py-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center">
          <div className={`relative rounded-[32px] p-10 sm:p-16 bg-gradient-to-b from-[#F3EEFF] via-white to-[#FFF0F7] border border-[#E9DFFF] shadow-soft-xl overflow-hidden reveal ${ctaVisible ? 'active' : ''}`}>

            <div className="relative z-10 space-y-6">
              <h2 className="text-3xl sm:text-5xl font-extrabold text-[#18151F] tracking-tight leading-tight">
                Because Your <br className="hidden sm:inline" />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#8B5CF6] via-[#A855F7] to-[#EC4899]">
                  Items Matter.
                </span>
              </h2>

              <p className="text-[#5B5568] text-base sm:text-lg max-w-xl mx-auto leading-relaxed font-normal">
                Join TagTrack today to create digital tags for your valuable belongings. Never let a lost item stay lost.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                {isAuthenticated ? (
                  <Link
                    to={getDashboardLink()}
                    className="btn-primary text-base py-3.5 px-8"
                  >
                    Go to Your Dashboard →
                  </Link>
                ) : (
                  <Link
                    to="/register"
                    className="btn-primary text-base py-3.5 px-8"
                  >
                    Register Your Item
                  </Link>
                )}

                <Link
                  to="/scan"
                  className="btn-secondary text-base py-3.5 px-8"
                >
                  🔍 Find a Lost Item
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════════════
            FOOTER
        ══════════════════════════════════════════════════════════════════════ */}
        <footer ref={footerRef} className={`border-t border-[#E9DFFF] bg-white py-14 px-4 sm:px-6 lg:px-8 reveal ${footerVisible ? 'active' : ''}`}>
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10 mb-10">

            {/* Col 1: Brand */}
            <div className="md:col-span-2 space-y-4">
              <Link to="/" className="flex items-center gap-3 group">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#8B5CF6] to-[#EC4899] p-[1.5px] group-hover:scale-105 transition-transform duration-200">
                  <div className="w-full h-full bg-white rounded-[6px] flex items-center justify-center">
                    <span className="font-extrabold text-xs text-[#8B5CF6]">TT</span>
                  </div>
                </div>
                <span className="font-extrabold text-xl text-[#18151F]">
                  Tag<span className="bg-clip-text text-transparent bg-gradient-to-r from-[#8B5CF6] to-[#EC4899]">Track</span>
                </span>
              </Link>
              <p className="text-xs sm:text-sm text-[#5B5568] max-w-md leading-relaxed">
                TagTrack: A Smart Digital Lost-Item Recovery, Ownership Verification and Secure Return Management Platform.
              </p>
              <div className="text-xs text-[#777080]">
                Designed for high security, instant QR lookup, and safe ownership verification.
              </div>
            </div>

            {/* Col 2: Navigation Links */}
            <div>
              <h4 className="text-xs font-bold text-[#18151F] uppercase tracking-wider mb-4">Platform</h4>
              <ul className="space-y-2.5 text-xs text-[#5B5568]">
                <li><a href="#hero" className="hover:text-[#8B5CF6] transition-colors duration-200">Home</a></li>
                <li><a href="#how-it-works" className="hover:text-[#8B5CF6] transition-colors duration-200">How It Works</a></li>
                <li><a href="#features" className="hover:text-[#8B5CF6] transition-colors duration-200">Features</a></li>
                <li><a href="#smart-tag" className="hover:text-[#8B5CF6] transition-colors duration-200">Smart QR Tag</a></li>
                <li><Link to="/scan" className="hover:text-[#8B5CF6] transition-colors duration-200">Find Item Scanner</Link></li>
              </ul>
            </div>

            {/* Col 3: Authentication & Account */}
            <div>
              <h4 className="text-xs font-bold text-[#18151F] uppercase tracking-wider mb-4">Account</h4>
              <ul className="space-y-2.5 text-xs text-[#5B5568]">
                {isAuthenticated ? (
                  <>
                    <li><Link to={getDashboardLink()} className="hover:text-[#8B5CF6] transition-colors duration-200">Dashboard</Link></li>
                    <li><Link to="/items/register" className="hover:text-[#8B5CF6] transition-colors duration-200">Register Item</Link></li>
                  </>
                ) : (
                  <>
                    <li><Link to="/login" className="hover:text-[#8B5CF6] transition-colors duration-200">Sign In</Link></li>
                    <li><Link to="/register" className="hover:text-[#8B5CF6] transition-colors duration-200">Create Account</Link></li>
                    <li><Link to="/scan" className="hover:text-[#8B5CF6] transition-colors duration-200">Public Finder Search</Link></li>
                  </>
                )}
              </ul>
            </div>

          </div>

          <div className="max-w-7xl mx-auto pt-8 border-t border-[#E9DFFF] flex flex-col sm:flex-row items-center justify-between text-xs text-[#777080] gap-4">
            <p>© {new Date().getFullYear()} TagTrack Platform. All rights reserved.</p>
            <p>Secure Digital Ownership & Recovery</p>
          </div>
        </footer>

      </div>
    </div>
  );
};

export default LandingPage;
