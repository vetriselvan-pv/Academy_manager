import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Clock, IndianRupee } from 'lucide-react'
import { coursesApi } from '@/api/courses.api'
import { formatCurrency } from '@/lib/utils'

export function InfiniteCourseMarquee() {
  const { data: coursesData, isLoading } = useQuery({
    queryKey: ['public-courses'],
    queryFn: () => coursesApi.list({ isActive: true, limit: 10 }),
  })

  const courses = coursesData?.data ?? []

  if (isLoading || courses.length === 0) {
    return null
  }

  // Duplicate courses to create an infinite scroll effect
  const marqueeItems = [...courses, ...courses, ...courses, ...courses]

  return (
    <div className="relative flex overflow-x-hidden bg-brand-900 py-12">
      {/* Gradients for fade effect on edges */}
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-32 bg-gradient-to-r from-brand-900 to-transparent"></div>
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-32 bg-gradient-to-l from-brand-900 to-transparent"></div>

      <motion.div
        className="flex min-w-full shrink-0 gap-6 px-6"
        animate={{
          x: ['0%', '-50%'],
        }}
        transition={{
          duration: 30, // Adjust speed
          ease: 'linear',
          repeat: Infinity,
        }}
      >
        {marqueeItems.map((course, idx) => (
          <div
            key={`${course._id}-${idx}`}
            className="flex w-72 flex-col justify-between rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md"
          >
            <div>
              <div className="mb-2 inline-flex items-center rounded-full bg-brand-500/20 px-2.5 py-0.5 text-xs font-medium text-brand-200 ring-1 ring-inset ring-brand-500/30">
                {course.category?.name || 'Course'}
              </div>
              <h3 className="text-lg font-semibold tracking-tight text-white line-clamp-2">
                {course.name}
              </h3>
            </div>
            <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-4 text-sm text-brand-100">
              <div className="flex items-center gap-1.5">
                <Clock className="size-4 opacity-70" />
                <span>{course.durationMonths}mo</span>
              </div>
              <div className="flex items-center gap-1.5 font-medium">
                <span>{formatCurrency(course.fee)}</span>
              </div>
            </div>
          </div>
        ))}
      </motion.div>
    </div>
  )
}
