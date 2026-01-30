import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { rfq_id, line_item_id, inn_name, brand_name, dosage, form, unit_of_issue, quantity } = body

    if (!rfq_id || line_item_id === undefined) {
      return NextResponse.json({ error: 'Missing rfq_id or line_item_id' }, { status: 400 })
    }

    const supabase = await createClient()

    const { data, error } = await supabase
      .from('rfq_line_items')
      .insert({
        rfq_id,
        line_item_id,
        inn_name,
        brand_name,
        dosage,
        form,
        unit_of_issue,
        quantity,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
