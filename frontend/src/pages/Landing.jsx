import { Link } from 'react-router-dom'
import {
  ArrowRight, GitBranch, BarChart2, Shield, Zap,
  CheckCircle, ChevronRight, Star, TrendingUp, Users, Code
} from 'lucide-react'
import { useEffect, useRef } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

const FEATURES = [
  {
    icon: GitBranch,
    title: 'Cyclomatic Complexity',
    desc: 'Measure independent paths through your code. Instantly flag functions that are too hard to test or maintain.',
    color: 'text-emerald-500',
    bg: 'bg-emerald-50 dark:bg-emerald-900/20',
    glow: 'hover:shadow-emerald-500/20',
  },
  {
    icon: BarChart2,
    title: 'Halstead Metrics',
    desc: "Quantify vocabulary, volume, and effort using operators and operands — predict bugs before they bite.",
    color: 'text-purple-500',
    bg: 'bg-purple-50 dark:bg-purple-900/20',
    glow: 'hover:shadow-purple-500/20',
  },
  {
    icon: Shield,
    title: 'Maintainability Index',
    desc: 'A composite 0–100 score blending complexity, volume, and LOC to show exactly how maintainable your code is.',
    color: 'text-blue-500',
    bg: 'bg-blue-50 dark:bg-blue-900/20',
    glow: 'hover:shadow-blue-500/20',
  },
  {
    icon: Zap,
    title: 'AI Refactor Insights',
    desc: 'Context-aware suggestions that tell you not just what is wrong — but exactly how to fix it.',
    color: 'text-yellow-500',
    bg: 'bg-yellow-50 dark:bg-yellow-900/20',
    glow: 'hover:shadow-yellow-500/20',
  },
]

const STATS =  [
  { label: 'AST Analysis',           value: 'Python', icon: Code },
  { label: 'Metrics Calculated',     value: '10+',    icon: GitBranch },
  { label: 'Authentication',         value: 'JWT',    icon: Users },
  { label: 'Analysis Speed',         value: '<1s',    icon: TrendingUp },
]

const TESTIMONIALS = [
  {
    name: 'Python AST Analysis',
    role: 'Core Engine',
    text: 'Parses source code into Abstract Syntax Trees and extracts structural information for deeper code analysis.'
  },
  {
    name: 'Complexity Metrics',
    role: 'Code Quality',
    text: 'Calculates Cyclomatic Complexity, Halstead Metrics, and Maintainability Index to identify risky code.'
  },
  {
    name: 'Future Roadmap',
    role: 'Coming Soon',
    text: 'GitHub Repository Analysis, AI Refactoring Suggestions, PDF Export Reports, and VS Code Extension.'
  },
]

// ── Animated score dial ───────────────────────────────────────────────────────
function ScoreDial({ value, max, label, color, delay = 0 }) {
  const circleRef = useRef(null)
  const radius = 46
  const circumference = 2 * Math.PI * radius

  useEffect(() => {
    const timer = setTimeout(() => {
      if (circleRef.current) {
        const pct = Math.min(value / max, 1)
        circleRef.current.style.strokeDashoffset = String(circumference * (1 - pct))
      }
    }, delay + 300)
    return () => clearTimeout(timer)
  }, [value, max, circumference, delay])

  return (
    <div className="relative w-28 h-28 flex flex-col items-center justify-center">
      <svg className="absolute inset-0" width="112" height="112" viewBox="0 0 112 112">
        {/* Track */}
        <circle cx="56" cy="56" r={radius} fill="none" stroke="currentColor"
          className="text-slate-200 dark:text-slate-800" strokeWidth="8" />
        {/* Progress */}
        <circle
          ref={circleRef}
          cx="56" cy="56" r={radius} fill="none"
          stroke={color} strokeWidth="8" strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference}
          transform="rotate(-90 56 56)"
          style={{ transition: `stroke-dashoffset 1.6s cubic-bezier(0.34,1.56,0.64,1)` }}
        />
      </svg>
      <span className="relative z-10 text-xl font-bold text-slate-900 dark:text-white leading-none">{value}</span>
      <span className="relative z-10 text-[10px] text-slate-500 dark:text-slate-400 text-center max-w-[72px] leading-tight mt-1">{label}</span>
    </div>
  )
}

// ── 3D tilt card wrapper ──────────────────────────────────────────────────────
function TiltCard({ children, className = '' }) {
  const ref = useRef(null)

  const handleMove = (e) => {
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width  - 0.5
    const y = (e.clientY - rect.top)  / rect.height - 0.5
    el.style.transform = `perspective(600px) rotateY(${x * 10}deg) rotateX(${-y * 10}deg) translateZ(4px)`
  }

  const handleLeave = () => {
    if (ref.current) ref.current.style.transform = 'perspective(600px) rotateY(0) rotateX(0) translateZ(0)'
  }

  return (
    <div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      className={className}
      style={{ transition: 'transform 0.15s ease', willChange: 'transform' }}
    >
      {children}
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────
export default function Landing() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden py-24 md:py-36">

        {/* 3D Floating orbs */}
        <div className="absolute inset-0 -z-10 pointer-events-none" aria-hidden="true">
          {/* Large emerald orb */}
          <div
            className="absolute -top-24 -left-16 w-[380px] h-[380px] rounded-full opacity-[0.15]"
            style={{
              background: 'radial-gradient(circle at 35% 35%, #34d399, #059669 50%, #065f46)',
              boxShadow: 'inset -24px -24px 48px rgba(0,0,0,0.3), inset 12px 12px 24px rgba(255,255,255,0.2)',
              animation: 'orbFloat1 9s ease-in-out infinite',
            }}
          />
          {/* Medium purple orb */}
          <div
            className="absolute top-16 -right-12 w-[220px] h-[220px] rounded-full opacity-[0.18]"
            style={{
              background: 'radial-gradient(circle at 35% 35%, #a78bfa, #7c3aed 50%, #4c1d95)',
              boxShadow: 'inset -14px -14px 28px rgba(0,0,0,0.3), inset 7px 7px 14px rgba(255,255,255,0.2)',
              animation: 'orbFloat2 11s ease-in-out infinite',
            }}
          />
          {/* Small cyan orb */}
          <div
            className="absolute bottom-24 left-12 w-[160px] h-[160px] rounded-full opacity-[0.16]"
            style={{
              background: 'radial-gradient(circle at 35% 35%, #67e8f9, #0891b2 50%, #164e63)',
              boxShadow: 'inset -10px -10px 20px rgba(0,0,0,0.3), inset 5px 5px 10px rgba(255,255,255,0.2)',
              animation: 'orbFloat3 13s ease-in-out infinite',
            }}
          />
        </div>

        <style>{`
          @keyframes orbFloat1 {
            0%,100% { transform: translate(0,0) rotate(0deg); }
            33%      { transform: translate(24px,-32px) rotate(5deg); }
            66%      { transform: translate(-16px,22px) rotate(-3deg); }
          }
          @keyframes orbFloat2 {
            0%,100% { transform: translate(0,0) rotate(0deg); }
            33%      { transform: translate(-28px,18px) rotate(-4deg); }
            66%      { transform: translate(12px,-22px) rotate(6deg); }
          }
          @keyframes orbFloat3 {
            0%,100% { transform: translate(0,0) rotate(0deg); }
            33%      { transform: translate(18px,-12px) rotate(3deg); }
            66%      { transform: translate(-22px,28px) rotate(-5deg); }
          }
          @keyframes terminalFloat {
            0%,100% { transform: perspective(1200px) rotateX(4deg) rotateY(-2deg) translateY(0); }
            50%      { transform: perspective(1200px) rotateX(2deg) rotateY(-1deg) translateY(-10px); }
          }
          @keyframes badgePulse {
            0%,100% { opacity:1; transform:scale(1); }
            50%      { opacity:0.5; transform:scale(0.8); }
          }
        `}</style>

        <div className="max-w-4xl mx-auto px-6 text-center">

          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 px-4 py-1.5 rounded-full text-sm font-semibold mb-8 animate-fade-up">
            <span
              className="w-2 h-2 rounded-full bg-emerald-500"
              style={{ animation: 'badgePulse 2s infinite' }}
            />
            Python Static Analysis Platform
          </div>

          {/* Headline */}
          <h1 className="text-5xl md:text-7xl font-display font-extrabold leading-[1.05] tracking-tight text-slate-900 dark:text-white animate-fade-up delay-100 mb-6">
            Understand your{' '}
            <span
              className="text-transparent bg-clip-text"
              style={{ backgroundImage: 'linear-gradient(135deg, #10b981, #3b82f6, #8b5cf6)' }}
            >
              code complexity
            </span>{' '}
            instantly
          </h1>

          <p className="text-lg md:text-xl text-slate-500 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed animate-fade-up delay-200 mb-10">
            AI-powered analysis of cyclomatic complexity, Halstead metrics, and maintainability index.
            Paste code or upload a project — get insights in seconds.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 animate-fade-up delay-300">
            <Link
              to="/signup"
              className="btn-primary text-base px-7 py-3 w-full sm:w-auto"
              style={{ boxShadow: '0 4px 16px rgba(16,185,129,0.35), 0 1px 4px rgba(0,0,0,0.12)' }}
            >
              Get Started Free <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to="#features" className="btn-secondary text-base px-7 py-3 w-full sm:w-auto">
              Learn More <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <p className="text-sm text-slate-400 mt-6 animate-fade-up delay-400">
            No credit card required · Free tier available
          </p>
        </div>

        {/* 3D Terminal */}
        <div className="max-w-3xl mx-auto px-6 mt-16 animate-fade-up delay-500">
          <div
            className="card overflow-hidden"
            style={{
              boxShadow: '0 40px 80px rgba(0,0,0,0.2), 0 16px 32px rgba(0,0,0,0.1), 0 2px 6px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.08)',
              animation: 'terminalFloat 6s ease-in-out infinite',
              border: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            {/* Title bar */}
            <div className="flex items-center gap-1.5 px-4 py-3 bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
              <span className="w-3 h-3 rounded-full bg-red-400" />
              <span className="w-3 h-3 rounded-full bg-yellow-400" />
              <span className="w-3 h-3 rounded-full bg-emerald-400" />
              <span className="ml-3 text-xs text-slate-400 font-mono">analyzer.py — CodeLens AI</span>
            </div>
            {/* Body */}
            <pre className="text-xs md:text-sm font-mono p-6 bg-slate-950 text-slate-300 overflow-x-auto leading-relaxed">
{`\u001b[90m# ComplexIQ Analysis Result\u001b[0m`}
              {'\n'}<span style={{color:'#34d399'}}>✓</span>{` Cyclomatic Complexity: `}<span style={{color:'#fbbf24'}}>12</span><span style={{color:'#6b7280'}}>  → Moderate (refactor suggested)</span>
              {'\n'}<span style={{color:'#34d399'}}>✓</span>{` Halstead Volume:       `}<span style={{color:'#60a5fa'}}>847.3</span>
              {'\n'}<span style={{color:'#34d399'}}>✓</span>{` Maintainability Index: `}<span style={{color:'#34d399'}}>68/100</span><span style={{color:'#6b7280'}}> → Acceptable</span>
              {'\n'}<span style={{color:'#34d399'}}>✓</span>{` Lines of Code:         `}<span style={{color:'#c084fc'}}>234</span>
              {'\n'}
              {'\n'}<span style={{color:'#fbbf24'}}>⚠</span>{'  High complexity in '}<span style={{color:'#f87171'}}>process_data()</span>{' — consider splitting'}
              {'\n'}<span style={{color:'#34d399'}}>✓</span>{'  Analysis complete in '}<span style={{color:'#e2e8f0'}}>0.38s</span>
            </pre>
          </div>
        </div>
      </section>

      {/* ── Stats ─────────────────────────────────────────────────────────── */}
      <section className="py-16 border-y border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/30">
        <div className="max-w-4xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
          {STATS.map(({ label, value, icon: Icon }) => (
            <div key={label} className="text-center">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center mx-auto mb-3">
                <Icon className="w-5 h-5 text-emerald-500" />
              </div>
              <p className="text-3xl font-display font-bold text-slate-900 dark:text-white">{value}</p>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Score Dials ───────────────────────────────────────────────────── */}
      <section className="py-16 max-w-3xl mx-auto px-6">
        <p className="text-center text-sm text-slate-400 dark:text-slate-500 mb-10 uppercase tracking-widest font-semibold">
          Live analysis snapshot
        </p>
        <div className="flex flex-wrap justify-center gap-10">
          <ScoreDial value={68}  max={100}  label="Maintainability Index" color="#10b981" delay={0}   />
          <ScoreDial value={12}  max={30}   label="Cyclomatic Complexity" color="#fbbf24" delay={200} />
          <ScoreDial value={847} max={1000} label="Halstead Volume"       color="#60a5fa" delay={400} />
          <ScoreDial value={234} max={500}  label="Lines of Code"         color="#a78bfa" delay={600} />
        </div>
      </section>

      {/* ── Features ──────────────────────────────────────────────────────── */}
      <section id="features" className="py-24 max-w-6xl mx-auto px-6">
        <div className="text-center mb-14">
          <p className="text-sm font-semibold text-emerald-500 uppercase tracking-widest mb-3">Features</p>
          <h2 className="text-4xl md:text-5xl font-display font-bold text-slate-900 dark:text-white">
            Everything you need to<br className="hidden md:block" /> ship quality code
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {FEATURES.map(({ icon: Icon, title, desc, color, bg, glow }) => (
            <TiltCard
              key={title}
              className={`card p-6 group cursor-default hover:shadow-xl ${glow} transition-shadow duration-300`}
            >
              {/* Shine overlay */}
              <div
                className="absolute inset-0 rounded-[inherit] pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.06) 0%, transparent 60%)' }}
              />
              <div className={`w-11 h-11 rounded-xl ${bg} flex items-center justify-center mb-4 relative`}
                style={{ boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.2), 0 2px 8px rgba(0,0,0,0.06)' }}
              >
                <Icon className={`w-5 h-5 ${color}`} />
              </div>
              <h3 className="font-display font-bold text-lg mb-2 text-slate-900 dark:text-white">{title}</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{desc}</p>
              <div className="flex items-center gap-1 mt-4 text-sm font-medium text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity">
                Learn more <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </TiltCard>
          ))}
        </div>
      </section>

      {/* ── Testimonials ──────────────────────────────────────────────────── */}
      <section className="py-20 bg-slate-50 dark:bg-slate-900/30 border-y border-slate-200 dark:border-slate-800">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-3xl font-display font-bold text-center mb-12 text-slate-900 dark:text-white">
            More.....
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map(({ name, role, text }) => (
              <TiltCard
                key={name}
                className="card p-6 hover:shadow-lg transition-shadow duration-1200"
              >
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-5">"{text}"</p>
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">{name}</p>
                  <p className="text-xs text-slate-400">{role}</p>
                </div>
              </TiltCard>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA banner ────────────────────────────────────────────────────── */}
      <section className="py-24 max-w-3xl mx-auto px-6 text-center relative">
        {/* Glow blob behind CTA */}
        <div
          className="absolute inset-0 -z-10 pointer-events-none"
          aria-hidden="true"
          style={{
            background: 'radial-gradient(ellipse 60% 40% at 50% 50%, rgba(16,185,129,0.12), transparent)',
          }}
        />
        <h2 className="text-4xl md:text-5xl font-display font-bold mb-5 text-slate-900 dark:text-white">
          Ready to clean up your codebase?
        </h2>
        <p className="text-lg text-slate-500 dark:text-slate-400 mb-8">
          Start analyzing in 60 seconds. No setup. No credit card.
        </p>
        <Link
          to="/signup"
          className="btn-primary text-base px-8 py-3.5 inline-flex"
          style={{ boxShadow: '0 4px 20px rgba(16,185,129,0.4), 0 1px 4px rgba(0,0,0,0.1)' }}
        >
          Start for Free <ArrowRight className="w-4 h-4" />
        </Link>
      </section>

      <Footer />
    </div>
  )
}