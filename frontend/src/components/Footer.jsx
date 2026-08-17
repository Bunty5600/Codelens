import { Link } from 'react-router-dom'
import { Code2, Github, Twitter, Linkedin, Heart, Briefcase } from 'lucide-react'

export default function Footer() {
  const year = new Date().getFullYear()

  const socialLinks = [
    { Icon: Github, href: 'https://github.com/Bunty5600', label: 'GitHub' },
    { Icon: Twitter, href: '#', label: 'Twitter' },
    { Icon: Linkedin, href: 'https://www.linkedin.com/in/bunty-bhainsa-75b6932a4?utm_source=share_via&utm_content=profile&utm_medium=member_android', label: 'LinkedIn' },
    { Icon: Briefcase, href: 'https://my-portfolio-weld-five-68.vercel.app/', label: 'Portfolio' }
  ]

  const navColumns = [
    { title: 'Product', links: ['Features', 'Pricing', 'Changelog', 'Roadmap'] },
    { title: 'Docs', links: ['Getting Started', 'API Ref', 'Examples', 'SDK'] },
    { title: 'Company', links: ['About', 'Blog', 'Careers', 'Contact'] },
  ]

  return (
    <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-600 dark:text-slate-400">
      <div className="max-w-6xl mx-auto px-6 py-14">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">

          {/* Brand */}
          <div className="col-span-2">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/30">
                <Code2 className="w-4 h-4 text-white" strokeWidth={2.5} />
              </div>
              <span className="font-display font-bold text-base text-slate-900 dark:text-slate-100">
                CodeLens AI
              </span>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed max-w-xs">
              AI-powered code complexity analysis. Write cleaner, more maintainable code — instantly.
            </p>

            {/* Social Links */}
            <div className="flex gap-2 mt-5">
              {socialLinks.map(({ Icon, href, label }, i) => (
                <a
                  key={i}
                  href={href}
                  target={href.startsWith('http') ? '_blank' : undefined}
                  rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
                  aria-label={label}
                  className="w-8 h-8 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center
                             hover:bg-slate-100 dark:hover:bg-slate-800 hover:border-emerald-400 dark:hover:border-emerald-400 transition-all text-slate-600 dark:text-slate-300"
                >
                  <Icon className="w-3.5 h-3.5" />
                </a>
              ))}
            </div>
          </div>

          {/* Navigation Columns */}
          {navColumns.map(col => (
            <div key={col.title}>
              <h4 className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-3">
                {col.title}
              </h4>
              <ul className="space-y-2">
                {col.links.map(l => (
                  <li key={l}>
                    <Link
                      to={`/${l.toLowerCase().replace(/\s+/g, '-')}`}
                      className="text-sm text-slate-500 dark:text-slate-400 hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors"
                    >
                      {l}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-200 dark:border-slate-800 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-slate-400 flex items-center gap-1">
            © {year} CodeLens AI. Made with <Heart className="w-3 h-3 text-red-400 fill-current inline" /> — Analyze smarter. Ship cleaner code.
          </p>
          <div className="flex gap-5">
            {['Privacy', 'Terms', 'Cookies'].map(l => (
              <Link
                key={l}
                to={`/${l.toLowerCase()}`}
                className="text-xs text-slate-400 hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors"
              >
                {l}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}