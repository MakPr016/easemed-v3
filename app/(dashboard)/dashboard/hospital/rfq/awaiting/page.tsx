import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AwaitingRFQsClient from './client'

interface AwaitingRFQ {
    id: string
    title: string
    created_at: string
    deadline: string
    status: string
    metadata: any
}

export default async function AwaitingRFQsPage() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        redirect('/login')
    }

    // Fetch all published/awaiting RFQs for this user
    const { data: rfqs, count: totalCount } = await supabase
        .from('rfqs')
        .select(`
            id, title, created_at, deadline, status, metadata
        `, { count: 'exact' })
        .eq('user_id', user.id)
        .in('status', ['published'])
        .order('created_at', { ascending: false })

    // Get quotation counts from metadata
    const totalQuotations = rfqs?.reduce((sum: number, rfq: AwaitingRFQ) => {
        return sum + (rfq.metadata?.quotation_count || 0)
    }, 0) || 0

    return (
        <AwaitingRFQsClient
            rfqs={rfqs || []}
            stats={{
                total: totalCount || 0,
                totalQuotations
            }}
        />
    )
}
