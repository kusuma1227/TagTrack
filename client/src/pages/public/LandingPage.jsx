import React from 'react';
import { Link } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';

const steps = [
  {
    icon: '📦',
    title: 'Register Your Item',
    desc: 'Add your valuable belongings to TagTrack. Each item gets a unique Tag ID and QR code you can print and attach.',
  },
  {
    icon: '🔖',
    title: 'Tag It',
    desc: 'Print the generated QR code and attach it to your item — on your laptop bag, wallet, keys, or luggage tag.',
  },
  {
    icon: '🔍',
    title: 'If Lost — Mark It',
    desc: 'If you lose your item, mark it as Lost in your dashboard. It becomes searchable on the public finder page.',
  },
  {
    icon: '🤝',
    title: 'Finder Reports It',
    desc: 'Whoever finds it scans the QR code (or types the Tag ID). They submit a found report — no account needed.',
  },
  {
    icon: '✅',
    title: 'Verify Ownership',
    desc: "You submit a claim with proof. A Verification Officer reviews it and approves the return.",
  },
  {
    icon: '🏠',
    title: 'Secure Return',
    desc: 'The handover is recorded securely and your item is marked Returned. The whole journey is tracked.',
  },
];

const LandingPage = () => {
  const { isAuthenticated, user } = useAuth();

  const getDashboardLink = () => {
    if (!user) return '/dashboard';
    if (user.role === 'admin') return '/admin/dashboard';
    if (user.role === 'officer') return '/officer/dashboard';
    return '/dashboard';
  };

  return (
    <div className="min-h-screen">
      {/* ── Hero Section ───────────────────────────────────────────────────── */}
      <section className="bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-1.5 text-sm font-medium mb-6">
              <span>🏷️</span>
              <span>Smart Lost-Item Recovery Platform</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight mb-6">
              Never Lose Your
              <span className="block text-amber-300">Valuables Forever</span>
            </h1>
            <p className="text-lg md:text-xl text-indigo-100 mb-10 leading-relaxed">
              TagTrack gives every item a digital identity. Register your belongings,
              generate a QR tag, and if they go missing — we help bring them back.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {isAuthenticated ? (
                <Link to={getDashboardLink()} className="btn-primary text-base py-3 px-8 bg-white text-indigo-700 hover:bg-indigo-50">
                  Go to Dashboard →
                </Link>
              ) : (
                <>
                  <Link to="/register" className="btn-primary text-base py-3 px-8 bg-white text-indigo-700 hover:bg-indigo-50">
                    Get Started Free
                  </Link>
                  <Link to="/scan" className="btn-secondary text-base py-3 px-8 border-white/30 text-white hover:bg-white/10">
                    🔍 I Found an Item
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── How It Works ───────────────────────────────────────────────────── */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">How TagTrack Works</h2>
            <p className="text-gray-500 text-lg max-w-xl mx-auto">
              A simple, verified, end-to-end recovery process for your lost belongings.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {steps.map((step, i) => (
              <div key={i} className="card p-6 hover:shadow-md transition-shadow">
                <div className="text-3xl mb-4">{step.icon}</div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-bold text-indigo-600 bg-indigo-50 rounded-full w-6 h-6 flex items-center justify-center">
                    {i + 1}
                  </span>
                  <h3 className="font-semibold text-gray-900">{step.title}</h3>
                </div>
                <p className="text-sm text-gray-500 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Section ────────────────────────────────────────────────────── */}
      <section className="bg-indigo-50 py-16">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Found someone's lost item?
          </h2>
          <p className="text-gray-500 mb-8">
            You don't need an account. Just enter the Tag ID or scan the QR code.
          </p>
          <Link to="/scan" className="btn-primary text-base py-3 px-10">
            🔍 Report a Found Item
          </Link>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────────────────── */}
      <footer className="bg-white border-t border-gray-200 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} TagTrack — Smart Digital Lost-Item Recovery Platform
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
