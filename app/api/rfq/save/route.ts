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

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('Saving RFQ:', { documentId, title, deadline, user_id: user.id })

    // Save RFQ metadata
    const { data: rfqData, error: rfqError } = await supabase
      .from('rfqs')
      .insert({
        id: documentId,
        user_id: user.id, // ✅ Changed from hospital_id to user_id
        title,
        deadline: new Date(deadline).toISOString(),
        status: 'draft',
        metadata: data.metadata || {},
      })
      .select()
      .single()

    if (rfqError) {
      console.error('RFQ insert error:', rfqError)
      return NextResponse.json(
        { error: 'Failed to save RFQ', details: rfqError.message },
        { status: 500 }
      )
    }

    console.log('RFQ saved successfully:', rfqData)

    // Save line items
    const requirements = data.line_items || data.lineitems || []
    
    if (requirements && Array.isArray(requirements) && requirements.length > 0) {
      const lineItems = requirements.map((item: any) => ({
        rfq_id: documentId,
        line_item_id: item.line_item_id || item.lineitemid || 0,
        inn_name: item.inn_name || item.innname || '',
        brand_name: item.brand_name || item.brandname || '',
        dosage: item.dosage || '',
        form: item.form || '',
        quantity: item.quantity || 0,
        unit_of_issue: item.unit_of_issue || item.unitofissue || '',
      }))

      console.log('Saving line items:', lineItems.length)

      const { error: itemsError } = await supabase
        .from('rfq_line_items')
        .insert(lineItems)

      if (itemsError) {
        console.error('Line items insert error:', itemsError)
        return NextResponse.json(
          { error: 'Failed to save line items', details: itemsError.message },
          { status: 500 }
        )
      } else {
        console.log('Line items saved successfully:', lineItems.length)
      }
    }

    return NextResponse.json({
      success: true,
      rfq_id: documentId,
      message: 'RFQ saved successfully',
      line_items_count: requirements.length,
    })

  } catch (error: any) {
    console.error('Save error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
