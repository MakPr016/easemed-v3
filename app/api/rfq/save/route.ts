import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { documentId, title, deadline, data } = body

    if (!documentId || !title || !deadline) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: rfqData, error: rfqError } = await supabase
      .from('rfqs')
      .insert({
        id: documentId,
        user_id: user.id,
        title,
        deadline: new Date(deadline).toISOString(),
        status: 'draft',
        metadata: {
          ...data.metadata,
          item_count: data.line_items?.length || 0
          // parsing_stats removed as requested
        },
      })
      .select()
      .single()

    if (rfqError) {
      console.error('RFQ Insert Error:', rfqError)
      return NextResponse.json(
        { error: 'Failed to create RFQ record', details: rfqError.message },
        { status: 500 }
      )
    }

    const rawItems = data.line_items || []

    if (Array.isArray(rawItems) && rawItems.length > 0) {
      const lineItems = rawItems.map((item: any, index: number) => ({
        rfq_id: documentId,
        line_item_id: index + 1,
        inn_name: item.inn_name || 'Unknown',
        brand_name: item.brand_name || 'Generic',
        dosage: item.dosage || '',
        form: item.form || '',
        quantity: Number(item.quantity) || 0,
        unit_of_issue: item.form || item.unit || 'Unit',
        item_type: item.type || 'Medical Supplies'
      }))

      const { error: itemsError } = await supabase
        .from('rfq_line_items')
        .insert(lineItems)

      if (itemsError) {
        console.error('Line Items Insert Error:', itemsError)
        return NextResponse.json(
          { error: 'Saved RFQ but failed to save items', details: itemsError.message },
          { status: 500 }
        )
      }
    }

    return NextResponse.json({
      success: true,
      rfqId: documentId,
      itemCount: rawItems.length,
      message: 'RFQ saved successfully'
    })

  } catch (error: any) {
    console.error('Internal API Error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    )
  }
}