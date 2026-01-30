import { NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'

const FASTAPI_URL = process.env.NEXT_PUBLIC_FASTAPI_URL || 'http://localhost:5001'

function isValidLineItem(item: any): boolean {
  if (!item.inn_name) return false
  
  const innNameWords = item.inn_name.trim().split(/\s+/)
  
  if (innNameWords.length > 10) {
    console.log('❌ Rejected (too long):', item.inn_name, `(${innNameWords.length} words)`)
    return false
  }
  
  const suspiciousPatterns = [
    /evaluation method/i,
    /submission/i,
    /quotation/i,
    /deadline/i,
    /contract/i,
    /vendors/i,
    /post-qualification/i,
    /compliance/i,
    /requirements as specified/i,
    /general conditions/i,
    /completeness of offer/i,
    /earliest delivery/i,
  ]
  
  for (const pattern of suspiciousPatterns) {
    if (pattern.test(item.inn_name)) {
      console.log('❌ Rejected (suspicious pattern):', item.inn_name)
      return false
    }
  }
  
  if (item.dosage === 'N/A' && item.form === 'Tablet' && !item.brand_name) {
    console.log('❌ Rejected (invalid format):', item.inn_name)
    return false
  }
  
  console.log('✅ Valid item:', item.inn_name)
  return true
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ documentId: string }> }
) {
  try {
    const { documentId } = await params

    console.log('Calling FastAPI:', `${FASTAPI_URL}/api/parse/${documentId}`)

    const response = await fetch(`${FASTAPI_URL}/api/parse/${documentId}`, {
      method: 'POST',
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Parse failed')
    }

    const apiResponse = await response.json()
    
    // Save original response
    const logsDir = join(process.cwd(), 'logs')
    await mkdir(logsDir, { recursive: true })
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const originalLogPath = join(logsDir, `fastapi-response-${documentId}-${timestamp}.json`)
    await writeFile(originalLogPath, JSON.stringify(apiResponse, null, 2))
    
    console.log('📄 Original FastAPI response saved to:', originalLogPath)

    const data = apiResponse.data || apiResponse

    const rawLineItems = data.line_items || data.lineitems || []
    console.log(`\n📊 Total items from FastAPI: ${rawLineItems.length}`)
    
    const validLineItems = rawLineItems.filter(isValidLineItem)
    console.log(`✅ Valid items after filtering: ${validLineItems.length}`)
    console.log(`❌ Rejected items: ${rawLineItems.length - validLineItems.length}\n`)

    // Save filtered response
    const filteredResponse = {
      metadata: data.metadata,
      lineitems: validLineItems,
      vendorrequirements: data.vendor_requirements,
      deliveryrequirements: data.delivery_requirements,
      evaluationcriteria: data.evaluation_criteria,
      stats: {
        total: rawLineItems.length,
        valid: validLineItems.length,
        rejected: rawLineItems.length - validLineItems.length,
      }
    }

    const filteredLogPath = join(logsDir, `fastapi-response-${documentId}-${timestamp}-filtered.json`)
    await writeFile(filteredLogPath, JSON.stringify(filteredResponse, null, 2))
    
    console.log('✅ Filtered response saved to:', filteredLogPath)

    return NextResponse.json(filteredResponse)
  } catch (error: any) {
    console.error('Parse error:', error)
    return NextResponse.json(
      { error: error.message || 'Parse failed' },
      { status: 500 }
    )
  }
}
