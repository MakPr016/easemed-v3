import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()

    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, organization_name, role')
      .eq('id', user.id)
      .single()

    const { count: completedCount } = await supabase
      .from('rfqs')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('status', 'completed')

    const { count: activeCount } = await supabase
      .from('rfqs')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .in('status', ['shipped', 'in_transit'])

    const { count: biddingCount } = await supabase
      .from('rfqs')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('status', 'published')

    const { count: pendingCount } = await supabase
      .from('rfqs')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('status', 'pending_review')

    const { data: latestBidding } = await supabase
      .from('rfqs')
      .select('id, title, created_at, deadline, metadata')
      .eq('user_id', user.id)
      .eq('status', 'published')
      .order('created_at', { ascending: false })
      .limit(5)

    const { data: activeOrders } = await supabase
      .from('rfqs')
      .select('id, title, created_at, deadline, status, metadata')
      .eq('user_id', user.id)
      .in('status', ['shipped', 'in_transit', 'processing', 'approved'])
      .order('created_at', { ascending: false })
      .limit(5)

    return NextResponse.json({
      user: {
        name: profile?.full_name || user.email?.split('@')[0] || 'User',
        organization: profile?.organization_name || '',
        role: profile?.role || 'hospital'
      },
      stats: {
        completed: completedCount || 0,
        active: activeCount || 0,
        bidding: biddingCount || 0,
        pending: pendingCount || 0
      },
      latestBidding: latestBidding || [],
      activeOrders: activeOrders || []
    })

  } catch (error: any) {
    console.error('Dashboard API Error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    )
  }
}
