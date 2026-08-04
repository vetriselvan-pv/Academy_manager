import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { BookOpen, ClipboardList, GraduationCap, MapPin, Plus, Users } from 'lucide-react'
import { branchesApi } from '@/api/branches.api'
import { enrollmentsApi } from '@/api/enrollments.api'
import { studentsApi } from '@/api/students.api'
import { teachersApi } from '@/api/teachers.api'
import { useAuth } from '@/auth/AuthContext'
import { isStudent, isSuperAdmin, isTeacher } from '@/auth/permissions'
import { Badge } from '@/components/ui/Badge'
import { Card, CardBody } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
import { PageHeader } from '@/components/ui/PageHeader'
import { StatCard } from '@/components/ui/StatCard'
import { CATEGORY_LABELS } from '@/types/enums'
import { EnrollmentStatus } from '@/types/enums'
import { refLabel } from '@/types/models'

export function DashboardPage() {
  const { user } = useAuth()
  if (!user) return null

  if (isSuperAdmin(user)) return <SuperAdminDashboard />
  if (isTeacher(user)) return <TeacherDashboard />
  return <StudentDashboard />
}

function SuperAdminDashboard() {
  const { data: branches, isLoading: branchesLoading } = useQuery({
    queryKey: ['branches'],
    queryFn: () => branchesApi.list(),
  })
  const { data: teachers, isLoading: teachersLoading } = useQuery({
    queryKey: ['teachers', { branch: undefined }],
    queryFn: () => teachersApi.list(),
  })
  const { data: students, isLoading: studentsLoading } = useQuery({
    queryKey: ['students', { branch: undefined }],
    queryFn: () => studentsApi.list(),
  })
  const { data: enrollments, isLoading: enrollmentsLoading } = useQuery({
    queryKey: ['enrollments', {}],
    queryFn: () => enrollmentsApi.list(),
  })

  const isLoading = branchesLoading || teachersLoading || studentsLoading || enrollmentsLoading
  const activeEnrollments = enrollments?.filter((e) => e.status === EnrollmentStatus.ACTIVE) ?? []

  return (
    <div>
      <PageHeader title="Dashboard" description="Institution-wide overview across every branch." />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Branches" value={isLoading ? '—' : (branches?.length ?? 0)} icon={MapPin} tone="brand" />
        <StatCard
          label="Active teachers"
          value={isLoading ? '—' : (teachers?.filter((t) => t.isActive).length ?? 0)}
          icon={Users}
          tone="amber"
        />
        <StatCard
          label="Active students"
          value={isLoading ? '—' : (students?.filter((s) => s.isActive).length ?? 0)}
          icon={GraduationCap}
          tone="green"
        />
        <StatCard label="Active enrollments" value={isLoading ? '—' : activeEnrollments.length} icon={ClipboardList} tone="slate" />
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <QuickLink to="/branches" icon={MapPin} label="Create a branch" />
        <QuickLink to="/courses/manage" icon={BookOpen} label="Create a course" />
        <QuickLink to="/teachers" icon={Users} label="Create a teacher" />
      </div>
    </div>
  )
}

function TeacherDashboard() {
  const { user } = useAuth()
  const teacher = isTeacher(user) ? user : null

  const { data: students, isLoading: studentsLoading } = useQuery({
    queryKey: ['students', { branch: undefined }],
    queryFn: () => studentsApi.list(),
    enabled: !!teacher,
  })
  const { data: enrollments, isLoading: enrollmentsLoading } = useQuery({
    queryKey: ['enrollments', {}],
    queryFn: () => enrollmentsApi.list(),
    enabled: !!teacher,
  })

  const activeEnrollments = enrollments?.filter((e) => e.status === EnrollmentStatus.ACTIVE) ?? []

  return (
    <div>
      <PageHeader
        title={`Welcome back, ${teacher?.name.split(' ')[0] ?? ''}`}
        description="Here's what's happening at your branch."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          label="Students in your branch(es)"
          value={studentsLoading ? '—' : (students?.length ?? 0)}
          icon={GraduationCap}
          tone="green"
        />
        <StatCard
          label="Active enrollments"
          value={enrollmentsLoading ? '—' : activeEnrollments.length}
          icon={ClipboardList}
          tone="brand"
        />
        <StatCard label="Your branches" value={teacher?.branches.length ?? 0} icon={MapPin} tone="amber" />
      </div>

      <Card className="mt-6">
        <CardBody>
          <h3 className="mb-3 text-sm font-semibold text-slate-900">Your branches</h3>
          <div className="flex flex-wrap gap-2">
            {teacher?.branches.map((branch) => (
              <Badge key={typeof branch === 'string' ? branch : branch._id} tone="slate">
                {refLabel(branch)}
              </Badge>
            ))}
          </div>
        </CardBody>
      </Card>
    </div>
  )
}

function StudentDashboard() {
  const { user } = useAuth()
  const student = isStudent(user) ? user : null

  const { data: enrollments, isLoading } = useQuery({
    queryKey: ['enrollments', {}],
    queryFn: () => enrollmentsApi.list(),
    enabled: !!student,
  })

  const activeEnrollments = enrollments?.filter((e) => e.status === EnrollmentStatus.ACTIVE) ?? []

  return (
    <div>
      <PageHeader
        title={`Welcome, ${student?.name.split(' ')[0] ?? ''}`}
        description="Your enrolled courses at a glance."
        actions={
          <Link
            to="/courses"
            className="inline-flex h-9.5 items-center gap-1.5 rounded-lg bg-brand-600 px-4 text-sm font-medium text-white hover:bg-brand-700"
          >
            <Plus className="size-4" /> Browse courses
          </Link>
        }
      />

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="h-32 animate-pulse rounded-xl bg-slate-100" />
          ))}
        </div>
      ) : activeEnrollments.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="You have no active enrollments"
          description="Browse the course catalog and enroll to get started."
          action={
            <Link to="/courses" className="text-sm font-medium text-brand-600 hover:text-brand-700">
              Browse courses →
            </Link>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {activeEnrollments.map((enrollment) => {
            const course = typeof enrollment.course === 'string' ? null : enrollment.course
            return (
              <Card key={enrollment._id}>
                <CardBody className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-slate-900">{refLabel(enrollment.course)}</h3>
                    {course && <Badge tone="brand">{CATEGORY_LABELS[course.category]}</Badge>}
                  </div>
                  <p className="text-sm text-slate-500">Teacher: {enrollment.teacher ? refLabel(enrollment.teacher) : 'Unassigned'}</p>
                  <p className="text-sm text-slate-500">Batch: {enrollment.batchTiming || 'Not scheduled yet'}</p>
                </CardBody>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}

function QuickLink({ to, icon: Icon, label }: { to: string; icon: typeof MapPin; label: string }) {
  return (
    <Link
      to={to}
      className="flex items-center gap-3 rounded-xl border border-dashed border-slate-300 bg-white p-4 text-sm font-medium text-slate-600 hover:border-brand-400 hover:text-brand-700"
    >
      <span className="flex size-9 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
        <Icon className="size-4" />
      </span>
      {label}
    </Link>
  )
}
