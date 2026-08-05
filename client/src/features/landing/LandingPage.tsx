import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { BookOpen, GraduationCap, Users, ArrowRight, CheckCircle2 } from 'lucide-react'
import { useAuth } from '@/auth/AuthContext'
import { Button } from '@/components/ui/Button'

export function LandingPage() {
  const { user } = useAuth()

  return (
    <div className="min-h-screen bg-slate-50 selection:bg-brand-500/20 selection:text-brand-900">
      {/* Navigation Bar */}
      <header className="sticky top-0 z-50 border-b border-zinc-200/50 bg-white/70 px-6 py-4 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-2">
            <GraduationCap className="size-8 text-brand-600" />
            <span className="text-xl font-bold tracking-tight text-slate-900">Viva Academy</span>
          </div>

          <nav className="hidden items-center gap-8 md:flex">
            <a href="#about" className="text-sm font-medium text-slate-600 transition-colors hover:text-brand-600">
              About
            </a>
            <a href="#features" className="text-sm font-medium text-slate-600 transition-colors hover:text-brand-600">
              Features
            </a>
            <Link to="/register" className="text-sm font-medium text-slate-600 transition-colors hover:text-brand-600">
              Enquiry
            </Link>
          </nav>

          <div className="flex items-center gap-4">
            {user ? (
              <Link to="/dashboard">
                <Button variant="primary">Go to Dashboard</Button>
              </Link>
            ) : (
              <>
                <Link to="/login" className="hidden text-sm font-medium text-slate-600 transition-colors hover:text-brand-600 sm:block">
                  Log in
                </Link>
                <Link to="/register">
                  <Button variant="primary">Enquiry</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-24 pb-32">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-brand-500 opacity-20 blur-[100px]"></div>
        
        <div className="relative mx-auto max-w-7xl px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="mx-auto max-w-4xl text-5xl font-bold tracking-tight text-slate-900 sm:text-7xl">
              Elevate Your Learning with <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-purple-600">Viva Academy</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-600">
              Join thousands of students achieving their dreams. We provide world-class education, expert teachers, and a modern learning environment tailored for your success.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link to="/register">
                <Button size="lg" className="gap-2">
                  Get Started <ArrowRight className="size-4" />
                </Button>
              </Link>
              <a href="#about" className="text-sm font-semibold leading-6 text-slate-900 transition-colors hover:text-brand-600">
                Learn more <span aria-hidden="true">→</span>
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-white sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:text-center">
            <h2 className="text-base font-semibold leading-7 text-brand-600">Learn Faster</h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Everything you need to succeed
            </p>
            <p className="mt-6 text-lg leading-8 text-slate-600">
              Our academy offers a comprehensive suite of tools and courses designed to give you the best educational experience possible.
            </p>
          </div>
          <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
            <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
              {[
                {
                  name: 'Expert Teachers',
                  description: 'Learn from industry professionals with years of real-world experience.',
                  icon: Users,
                },
                {
                  name: 'Comprehensive Courses',
                  description: 'Access a wide variety of courses tailored to fit your specific goals.',
                  icon: BookOpen,
                },
                {
                  name: 'Modern Curriculum',
                  description: 'Stay ahead of the curve with our constantly updated course material.',
                  icon: CheckCircle2,
                },
              ].map((feature, index) => (
                <motion.div
                  key={feature.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="flex flex-col"
                >
                  <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-slate-900">
                    <div className="flex size-10 items-center justify-center rounded-lg bg-brand-600">
                      <feature.icon className="size-6 text-white" aria-hidden="true" />
                    </div>
                    {feature.name}
                  </dt>
                  <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-slate-600">
                    <p className="flex-auto">{feature.description}</p>
                  </dd>
                </motion.div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 py-12">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
            <div className="flex items-center gap-2">
              <GraduationCap className="size-6 text-brand-500" />
              <span className="text-lg font-semibold text-white">Viva Academy</span>
            </div>
            <p className="text-sm leading-5 text-slate-400">
              &copy; {new Date().getFullYear()} Viva Academy. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
