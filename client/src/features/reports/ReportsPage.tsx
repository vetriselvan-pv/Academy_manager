import { useQuery } from '@tanstack/react-query'
import { CheckCircle2, ClipboardList, GraduationCap, Wallet, XCircle } from 'lucide-react'
import { enrollmentsApi } from '@/api/enrollments.api'
import { studentsApi } from '@/api/students.api'
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
import { PageHeader } from '@/components/ui/PageHeader'
import { StatCard } from '@/components/ui/StatCard'
import { formatCurrency } from '@/lib/utils'
import { EnrollmentStatus } from '@/types/enums'
import { refLabel } from '@/types/models'

export function ReportsPage() {
  const { data: enrollments, isLoading: enrollmentsLoading } = useQuery({
    queryKey: ['enrollments', {}],
    queryFn: () => enrollmentsApi.list(),
  })
  const { data: students, isLoading: studentsLoading } = useQuery({
    queryKey: ['students', { branch: undefined }],
    queryFn: () => studentsApi.list(),
  })

  const isLoading = enrollmentsLoading || studentsLoading

  const allEnrollments = enrollments ?? []
  const activeEnrollments = allEnrollments.filter((e) => e.status === EnrollmentStatus.ACTIVE)
  const completedEnrollments = allEnrollments.filter((e) => e.status === EnrollmentStatus.COMPLETED)
  const cancelledEnrollments = allEnrollments.filter((e) => e.status === EnrollmentStatus.CANCELLED)
  const totalFeesCollected = allEnrollments.reduce((sum, e) => sum + (e.feePaid || 0), 0)

  const courseCounts = new Map<string, number>()
  for (const enrollment of allEnrollments) {
    const label = refLabel(enrollment.course)
    courseCounts.set(label, (courseCounts.get(label) ?? 0) + 1)
  }
  const courseBreakdown = Array.from(courseCounts.entries())
    .map(([course, count]) => ({ course, count }))
    .sort((a, b) => b.count - a.count)

  const totalEnrollments = allEnrollments.length
  const activePct = totalEnrollments ? (activeEnrollments.length / totalEnrollments) * 100 : 0
  const completedPct = totalEnrollments ? (completedEnrollments.length / totalEnrollments) * 100 : 0
  const cancelledPct = totalEnrollments ? (cancelledEnrollments.length / totalEnrollments) * 100 : 0

  return (
    <div>
      <PageHeader title="Reports" description="A quick snapshot of enrollment and fee activity across your branch(es)." />
      <p className="-mt-4 mb-6 text-xs text-slate-400">
        First-version report, composed from enrollment and student data. Dedicated reporting endpoints and richer
        breakdowns are expected to land on the backend later.
      </p>

      {isLoading ? (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="h-24 animate-pulse rounded-xl bg-slate-100" />
            ))}
          </div>
          <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div className="h-64 animate-pulse rounded-xl bg-slate-100" />
            <div className="h-64 animate-pulse rounded-xl bg-slate-100" />
          </div>
        </>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <StatCard label="Total students" value={students?.length ?? 0} icon={GraduationCap} tone="green" />
            <StatCard label="Active enrollments" value={activeEnrollments.length} icon={ClipboardList} tone="brand" />
            <StatCard label="Completed enrollments" value={completedEnrollments.length} icon={CheckCircle2} tone="slate" />
            <StatCard label="Cancelled enrollments" value={cancelledEnrollments.length} icon={XCircle} tone="amber" />
            <StatCard label="Fees collected" value={formatCurrency(totalFeesCollected)} icon={Wallet} tone="green" />
          </div>

          {totalEnrollments === 0 ? (
            <div className="mt-6">
              <EmptyState
                icon={ClipboardList}
                title="No enrollment data yet"
                description="Once students start enrolling in courses, breakdowns by course and status will appear here."
              />
            </div>
          ) : (
            <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Enrollments by course</CardTitle>
                </CardHeader>
                <CardBody className="space-y-4">
                  {courseBreakdown.map(({ course, count }) => {
                    const pct = totalEnrollments ? (count / totalEnrollments) * 100 : 0
                    return (
                      <div key={course}>
                        <div className="mb-1 flex items-center justify-between text-sm">
                          <span className="font-medium text-slate-700">{course}</span>
                          <span className="text-slate-400">{count}</span>
                        </div>
                        <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
                          <div className="h-full rounded-full bg-brand-500" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    )
                  })}
                </CardBody>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Active vs cancelled</CardTitle>
                </CardHeader>
                <CardBody className="space-y-4">
                  <div className="flex h-3 w-full overflow-hidden rounded-full bg-slate-100">
                    {activeEnrollments.length > 0 && (
                      <div className="h-full bg-emerald-500" style={{ width: `${activePct}%` }} />
                    )}
                    {completedEnrollments.length > 0 && (
                      <div className="h-full bg-amber-500" style={{ width: `${completedPct}%` }} />
                    )}
                    {cancelledEnrollments.length > 0 && (
                      <div className="h-full bg-rose-500" style={{ width: `${cancelledPct}%` }} />
                    )}
                  </div>
                  <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
                    <LegendItem colorClassName="bg-emerald-500" label="Active" value={activeEnrollments.length} />
                    <LegendItem colorClassName="bg-amber-500" label="Completed" value={completedEnrollments.length} />
                    <LegendItem colorClassName="bg-rose-500" label="Cancelled" value={cancelledEnrollments.length} />
                  </div>
                </CardBody>
              </Card>
            </div>
          )}
        </>
      )}
    </div>
  )
}

function LegendItem({ colorClassName, label, value }: { colorClassName: string; label: string; value: number }) {
  return (
    <div className="flex items-center gap-2">
      <span className={`size-2.5 rounded-full ${colorClassName}`} />
      <span className="text-slate-500">{label}</span>
      <span className="font-medium text-slate-900">{value}</span>
    </div>
  )
}
