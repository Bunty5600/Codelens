import { Link } from 'react-router-dom'
import { Code2, Github, Twitter, Linkedin, Heart } from 'lucide-react'

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
      <div className="max-w-6xl mx-auto px-6 py-14">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">

          {/* Brand */}
          <div className="col-span-2">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/30">
                <Code2 className="w-4 h-4 text-white" strokeWidth={2.5} />
              </div>
              <span className="font-display font-bold text-base">CodeLens AI</span>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed max-w-xs">
              AI-powered code complexity analysis. Write cleaner, more maintainable code — instantly.
            </p>
            <div className="flex gap-2 mt-5">
              {[
                { Icon: Github,   href: 'https://github.com/Bunty5600' },
                { Icon: Twitter,  href: '#' },
                { Icon: Linkedin, href: 'https://www.linkedin.com/in/bunty-bhainsa-75b6932a4?utm_source=share_via&utm_content=profile&utm_medium=member_android' },
              ].map(({ Icon, href }, i) => (
                <a key={i} href={href}
                  className="w-8 h-8 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center
                             hover:bg-slate-100 dark:hover:bg-slate-800 hover:border-emerald-400 transition-all">
                  <Icon className="w-3.5 h-3.5" />
                </a>
              ))}
            </div>
          </div>

          {/* Columns */}
          {[
            { title: 'Product',  links: ['Features', 'Pricing', 'Changelog', 'Roadmap'] },
            { title: 'Docs',     links: ['Getting Started', 'API Ref', 'Examples', 'SDK'] },
            { title: 'Company',  links: ['About', 'Blog', 'Careers', 'Contact'] },
          ].map(col => (
            <div key={col.title}>
              <h4 className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-3">{col.title}</h4>
              <ul className="space-y-2">
                {col.links.map(l => (
                  <li key={l}>
                    <a href="#" className="text-sm text-slate-500 dark:text-slate-400 hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors">
                      {l}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-slate-200 dark:border-slate-800 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-slate-400 flex items-center gap-1">
            © {year} CodeLens AI. Made with <Heart className="w-3 h-3 text-red-400 fill-current" /> CodeLens AI — Analyze smarter. Ship cleaner code..
          </p>
          <div className="flex gap-5">
            {['Privacy', 'Terms', 'Cookies'].map(l => (
              <a key={l} href="#" className="text-xs text-slate-400 hover:text-emerald-500 transition-colors">{l}</a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}