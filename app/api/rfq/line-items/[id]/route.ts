import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
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

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!data || data.length === 0) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: data[0] })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
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
