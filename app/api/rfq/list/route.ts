import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
    try {
        const supabase = await createClient()

        const { data: { user }, error: userError } = await supabase.auth.getUser()
        if (userError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { searchParams } = new URL(request.url)
        const statusFilter = searchParams.get('status')

        let query = supabase
            .from('rfqs')
            .select('id, title, created_at, deadline, status, metadata')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })

        if (statusFilter && statusFilter !== 'all') {
            query = query.eq('status', statusFilter)
        }

        const { data: rfqs } = await query

        if (!rfqs) {
            return NextResponse.json({ error: 'Failed to fetch RFQs' }, { status: 500 })
        }

        const rfqIds = rfqs.map(rfq => rfq.id)

        const { data: itemCounts } = await supabase
            .from('rfq_line_items')
            .select('rfq_id')
            .in('rfq_id', rfqIds)

        const itemCountMap = itemCounts?.reduce((acc: Record<string, number>, item) => {
            acc[item.rfq_id] = (acc[item.rfq_id] || 0) + 1
            return acc
        }, {}) || {}

        const { count: totalCount } = await supabase
            .from('rfqs')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id)

        const { count: activeCount } = await supabase
            .from('rfqs')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id)
            .in('status', ['published', 'active'])

        const { data: allRfqs } = await supabase
            .from('rfqs')
            .select('metadata')
            .eq('user_id', user.id)

        const totalQuotations = allRfqs?.reduce((sum, rfq) => {
            return sum + (rfq.metadata?.quotation_count || 0)
        }, 0) || 0

        const avgQuotations = totalCount && totalCount > 0
            ? Math.round((totalQuotations / totalCount) * 10) / 10
            : 0

        const enrichedRfqs = (rfqs || []).map(rfq => ({
            ...rfq,
            itemCount: itemCountMap[rfq.id] || 0,
            quotationCount: rfq.metadata?.quotation_count || 0,
        }))

        return NextResponse.json({
            rfqs: enrichedRfqs,
            stats: {
                total: totalCount || 0,
                active: activeCount || 0,
                totalQuotations,
                avgQuotations
            }
        })

    } catch (error: any) {
        console.error('RFQ List API Error:', error)
        return NextResponse.json(
            { error: error.message || 'Internal Server Error' },
            { status: 500 }
        )
    }
}
