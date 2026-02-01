import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import HospitalRFQClient from './client'

export default async function HospitalRFQPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  // Await searchParams for Next.js 15 compatibility
  const params = await searchParams
  const statusFilter = params.status || 'all'

  let rfqsQuery = supabase
    .from('rfqs')
    .select(`
      id, title, created_at, deadline, status, metadata
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (statusFilter !== 'all') {
    rfqsQuery = rfqsQuery.eq('status', statusFilter)
  }

  const { data: rfqs } = await rfqsQuery

  const rfqIds = rfqs?.map((rfq: any) => rfq.id) || []

  // Only fetch line items if we have RFQs
  let itemCountMap: Record<string, number> = {}
  if (rfqIds.length > 0) {
    const { data: lineItems } = await supabase
      .from('rfq_line_items')
      .select('rfq_id')
      .in('rfq_id', rfqIds)

    itemCountMap = lineItems?.reduce((acc: Record<string, number>, item: any) => {
      acc[item.rfq_id] = (acc[item.rfq_id] || 0) + 1
      return acc
    }, {} as Record<string, number>) || {}
  }

  // Get total count across all statuses (not filtered)
  const { count: totalCount } = await supabase
    .from('rfqs')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)

  // Get active (published) count
  const { count: activeCount } = await supabase
    .from('rfqs')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('status', 'published')

  // Get all RFQs to calculate quotation stats
  const { data: allRfqs } = await supabase
    .from('rfqs')
    .select('metadata')
    .eq('user_id', user.id)

  const totalQuotations = allRfqs?.reduce((sum: number, rfq: any) => sum + (rfq.metadata?.quotation_count || 0), 0) || 0
  const avgQuotations = totalCount && totalCount > 0 ? Math.round(totalQuotations / totalCount * 10) / 10 : 0

  const enrichedRfqs = (rfqs || []).map((rfq: any) => ({
    ...rfq,
    createdAt: rfq.created_at,
    itemCount: itemCountMap[rfq.id] || 0,
    quotationCount: rfq.metadata?.quotation_count || 0,
    category: rfq.metadata?.category || 'Medical Supplies',
    budget: rfq.metadata?.budget || '€25,000'
  }))

  return (
    <HospitalRFQClient
      rfqs={enrichedRfqs}
      stats={{
        total: totalCount || 0,
        active: activeCount || 0,
        totalQuotations,
        avgQuotations
      }}
      statusFilter={statusFilter}
    />
  )
}