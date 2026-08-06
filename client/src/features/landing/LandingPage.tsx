import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Sparkles, PlayCircle, Music, Move, MonitorPlay, Activity, Scissors, GraduationCap, Clock, Users } from 'lucide-react'

export function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0f111a] text-slate-300 selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Navigation */}
      <header className="sticky top-0 z-50 border-b border-white/5 bg-[#0f111a]/80 px-6 py-4 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-2 text-white">
            <Sparkles className="size-6 text-indigo-400" />
            <span className="text-xl font-bold tracking-widest uppercase">Viva Academy</span>
          </div>

          <nav className="hidden items-center gap-8 md:flex text-sm font-medium">
            <a href="#videos" className="transition-colors hover:text-white">Videos</a>
            <a href="#achievements" className="transition-colors hover:text-white">Achievements</a>
            <a href="#contact" className="transition-colors hover:text-white">Contact</a>
            <Link to="/enquiry" className="transition-colors hover:text-white">Enquiry</Link>
            <Link to="/login" className="transition-colors hover:text-white">Login</Link>
          </nav>

          <Link
            to="/enquiry"
            className="rounded-full bg-indigo-200 px-6 py-2 text-sm font-bold text-indigo-950 transition-transform hover:scale-105"
          >
            JOIN NOW
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative px-6 pt-32 pb-40 text-center">
        {/* Subtle Background Glow */}
        <div className="absolute left-1/2 top-1/2 -z-10 h-[400px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-500/20 blur-[120px]"></div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="mx-auto max-w-4xl"
        >
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-indigo-300 backdrop-blur-md">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-orange-400 opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-orange-500"></span>
            </span>
            Welcome to Viva Academy
          </div>
          
          <h1 className="text-5xl font-black leading-tight tracking-tight sm:text-7xl lg:text-8xl">
            Ignite Your <br />
            <span className="bg-gradient-to-r from-indigo-300 via-purple-300 to-orange-300 bg-clip-text text-transparent">Creative Spark</span>
          </h1>
          
          <p className="mx-auto mt-8 max-w-2xl text-lg text-slate-400">
            Master the arts of Dance, Yoga, Art, Craft, Music, Tuition, Abacus, Drawing, and Aari Work in a modern, inspiring environment.
          </p>
          
          <div className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-6">
            <a
              href="#explore"
              className="rounded-full bg-indigo-200 px-8 py-3.5 text-sm font-bold text-indigo-950 transition-all hover:scale-105 hover:bg-white"
            >
              EXPLORE COURSES &rarr;
            </a>
            <button className="flex items-center gap-2 rounded-full border border-white/20 bg-transparent px-8 py-3.5 text-sm font-bold text-white transition-all hover:bg-white/10">
              <PlayCircle className="size-5" />
              WATCH VIDEO
            </button>
          </div>
        </motion.div>
      </section>

      {/* Explore Disciplines */}
      <section id="explore" className="px-6 py-24">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
            <div className="max-w-2xl">
              <h2 className="text-3xl font-bold text-white sm:text-4xl">Explore Disciplines</h2>
              <p className="mt-4 text-slate-400">
                Discover a world of creative possibilities. Our expert-led courses are designed to nurture your talent at any skill level.
              </p>
            </div>
            <a href="#" className="text-sm font-bold text-indigo-400 hover:text-indigo-300 transition-colors">
              VIEW ALL &rarr;
            </a>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Music Production */}
            <div className="group flex flex-col rounded-2xl bg-[#1a1d29] p-8 transition-colors hover:bg-[#202433]">
              <div className="mb-6 flex items-start justify-between">
                <div className="flex size-12 items-center justify-center rounded-full bg-white/5 text-slate-300 transition-colors group-hover:bg-indigo-500/20 group-hover:text-indigo-300">
                  <Music className="size-5" />
                </div>
                <span className="rounded-full bg-white/5 px-3 py-1 text-xs font-medium text-slate-400">Audio</span>
              </div>
              <h3 className="mb-3 text-xl font-bold text-white">Music Production</h3>
              <p className="mb-8 flex-1 text-sm leading-relaxed text-slate-400">
                Learn composition, mixing, and mastering from industry professionals.
              </p>
              <a href="#" className="text-xs font-bold uppercase tracking-wider text-indigo-400">
                Learn More &gt;
              </a>
            </div>

            {/* Contemporary Dance */}
            <div className="group flex flex-col rounded-2xl bg-[#1a1d29] p-8 transition-colors hover:bg-[#202433]">
              <div className="mb-6 flex items-start justify-between">
                <div className="flex size-12 items-center justify-center rounded-full bg-white/5 text-slate-300 transition-colors group-hover:bg-indigo-500/20 group-hover:text-indigo-300">
                  <Move className="size-5" />
                </div>
                <span className="rounded-full bg-white/5 px-3 py-1 text-xs font-medium text-slate-400">Movement</span>
              </div>
              <h3 className="mb-3 text-xl font-bold text-white">Contemporary Dance</h3>
              <p className="mb-8 flex-1 text-sm leading-relaxed text-slate-400">
                Express yourself through fluid movement and modern choreographic techniques.
              </p>
              <a href="#" className="text-xs font-bold uppercase tracking-wider text-indigo-400">
                Learn More &gt;
              </a>
            </div>

            {/* Digital Art */}
            <div className="group flex flex-col rounded-2xl bg-[#1a1d29] p-8 transition-colors hover:bg-[#202433]">
              <div className="mb-6 flex items-start justify-between">
                <div className="flex size-12 items-center justify-center rounded-full bg-white/5 text-slate-300 transition-colors group-hover:bg-indigo-500/20 group-hover:text-indigo-300">
                  <MonitorPlay className="size-5" />
                </div>
                <span className="rounded-full bg-white/5 px-3 py-1 text-xs font-medium text-slate-400">Visual</span>
              </div>
              <h3 className="mb-3 text-xl font-bold text-white">Digital Art</h3>
              <p className="mb-8 flex-1 text-sm leading-relaxed text-slate-400">
                Master digital illustration, concept art, and visual storytelling.
              </p>
              <a href="#" className="text-xs font-bold uppercase tracking-wider text-indigo-400">
                Learn More &gt;
              </a>
            </div>

            {/* Vinyasa Yoga */}
            <div className="group flex flex-col rounded-2xl bg-[#1a1d29] p-8 transition-colors hover:bg-[#202433]">
              <div className="mb-6 flex items-start justify-between">
                <div className="flex size-12 items-center justify-center rounded-full bg-white/5 text-slate-300 transition-colors group-hover:bg-indigo-500/20 group-hover:text-indigo-300">
                  <Activity className="size-5" />
                </div>
                <span className="rounded-full bg-white/5 px-3 py-1 text-xs font-medium text-slate-400">Wellness</span>
              </div>
              <h3 className="mb-3 text-xl font-bold text-white">Vinyasa Yoga</h3>
              <p className="mb-8 flex-1 text-sm leading-relaxed text-slate-400">
                Connect breath with movement in our dynamic flowing sequences.
              </p>
              <a href="#" className="text-xs font-bold uppercase tracking-wider text-indigo-400">
                Learn More &gt;
              </a>
            </div>

            {/* Aari Work - Spans 2 columns */}
            <div className="group flex flex-col overflow-hidden rounded-2xl bg-[#1a1d29] md:col-span-2 md:flex-row transition-colors hover:bg-[#202433]">
              <div className="flex flex-1 flex-col p-8 md:p-10">
                <div className="mb-6">
                  <div className="flex size-12 items-center justify-center rounded-full bg-white/5 text-slate-300 transition-colors group-hover:bg-indigo-500/20 group-hover:text-indigo-300">
                    <Scissors className="size-5" />
                  </div>
                </div>
                <span className="mb-3 self-start rounded-full bg-white/5 px-3 py-1 text-xs font-medium text-slate-400">
                  Featured Program
                </span>
                <h3 className="mb-4 text-2xl font-bold text-white sm:text-3xl">Advanced Craft & Aari Work</h3>
                <p className="mb-8 flex-1 text-sm leading-relaxed text-slate-400">
                  An intensive masterclass in traditional techniques meets modern design. Perfect for aspiring textile artists and fashion designers looking to elevate their craft.
                </p>
                <button className="self-start rounded-full bg-white/10 px-6 py-2 text-xs font-bold uppercase tracking-wider text-white transition-colors hover:bg-white/20">
                  VIEW SYLLABUS
                </button>
              </div>
              <div className="h-64 w-full md:h-auto md:w-2/5">
                <img
                  src="/aari-work.png"
                  alt="Aari Embroidery Work"
                  className="size-full object-cover opacity-80 mix-blend-luminosity transition-all duration-500 group-hover:scale-105 group-hover:opacity-100 group-hover:mix-blend-normal"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Viva */}
      <section id="about" className="bg-[#12151f] px-6 py-24">
        <div className="mx-auto max-w-7xl text-center">
          <h2 className="mb-4 text-3xl font-bold text-white sm:text-4xl">Why Choose Viva</h2>
          <p className="mx-auto mb-16 max-w-2xl text-slate-400">
            We blend structured methodology with unbridled creativity to provide an unparalleled learning experience.
          </p>

          <div className="grid grid-cols-1 gap-12 sm:grid-cols-3">
            <div className="flex flex-col items-center">
              <div className="mb-6 flex size-16 items-center justify-center rounded-2xl bg-white/5">
                <GraduationCap className="size-7 text-indigo-400" />
              </div>
              <h3 className="mb-3 text-lg font-bold text-white">Expert Mentors</h3>
              <p className="text-sm leading-relaxed text-slate-400">
                Learn directly from active industry professionals who bring real-world experience to every session.
              </p>
            </div>
            
            <div className="flex flex-col items-center">
              <div className="mb-6 flex size-16 items-center justify-center rounded-2xl bg-white/5">
                <Clock className="size-7 text-indigo-400" />
              </div>
              <h3 className="mb-3 text-lg font-bold text-white">Flexible Learning</h3>
              <p className="text-sm leading-relaxed text-slate-400">
                Our hybrid model allows you to balance in-studio practice with remote theoretical sessions at your own pace.
              </p>
            </div>

            <div className="flex flex-col items-center">
              <div className="mb-6 flex size-16 items-center justify-center rounded-2xl bg-white/5">
                <Users className="size-7 text-indigo-400" />
              </div>
              <h3 className="mb-3 text-lg font-bold text-white">Creative Community</h3>
              <p className="text-sm leading-relaxed text-slate-400">
                Join a vibrant ecosystem of interdisciplinary creators. Collaborate, share, and grow together.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 bg-[#0f111a] px-6 py-12">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 sm:flex-row">
          <div className="flex items-center gap-2 text-white">
            <Sparkles className="size-5 text-indigo-400" />
            <span className="font-bold tracking-widest uppercase">Viva Academy</span>
          </div>
          <p className="text-xs text-slate-500">&copy; {new Date().getFullYear()} Viva Creative Academy. All rights reserved.</p>
          <div className="flex items-center gap-6 text-xs font-medium text-slate-400">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-white transition-colors">Careers</a>
            <a href="#" className="hover:text-white transition-colors">Contact Us</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
