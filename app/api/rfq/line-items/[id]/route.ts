// app/api/rfq/line-items/[id]/route.ts

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

interface Params {
  id: string
}

// 1. Update the context type to Promise<Params>
export async function PUT(request: Request, context: { params: Promise<Params> }) {
  try {
    // 2. Await the params
    const { id } = await context.params
    
    const body = await request.json()
    const { inn_name, brand_name, dosage, form, unit_of_issue, quantity } = body

    const supabase = await createClient()

    const { data, error } = await supabase
      .from('rfq_line_items')
      .update({
        inn_name,
        brand_name,
        dosage,
        form,
        unit_of_issue,
        quantity,
      })
      .eq('id', id)
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

export async function DELETE(request: Request, context: { params: Promise<Params> }) {
  try {
    // 2. Await the params
    const { id } = await context.params

    const supabase = await createClient()

    const { error } = await supabase
      .from('rfq_line_items')
      .delete()
      .eq('id', id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}