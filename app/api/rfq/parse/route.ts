import { NextRequest, NextResponse } from 'next/server'

const FLASK_API = process.env.FLASK_PARSER_URL || 'http://localhost:5001/api'

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData()
        const file = formData.get('file') as File

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 })
        }

        const flaskFormData = new FormData()
        flaskFormData.append('file', file)

        const uploadResponse = await fetch(`${FLASK_API}/upload`, {
            method: 'POST',
            body: flaskFormData,
        })

        if (!uploadResponse.ok) {
            throw new Error('Upload to parser failed')
        }

        const uploadData = await uploadResponse.json()
        const documentId = uploadData.document_id

        const parseResponse = await fetch(`${FLASK_API}/parse/${documentId}`, {
            method: 'POST',
        })

        if (!parseResponse.ok) {
            throw new Error('Parsing failed')
        }

        const parsedData = await parseResponse.json()

        return NextResponse.json({
            success: true,
            documentId,
            data: parsedData.data
        })

    } catch (error) {
        console.error('Parse error:', error)
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to parse RFQ' },
            { status: 500 }
        )
    }
}
