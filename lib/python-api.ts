const FASTAPI_URL = process.env.NEXT_PUBLIC_FASTAPI_URL || 'http://localhost:5001'

export async function uploadPDF(file: File) {
  const formData = new FormData()
  formData.append('file', file)

  const res = await fetch(`${FASTAPI_URL}/api/upload`, {
    method: 'POST',
    body: formData,
  })

  if (!res.ok) throw new Error('Upload failed')
  return res.json()
}

export async function parsePDF(documentId: string) {
  const res = await fetch(`${FASTAPI_URL}/api/parse/${documentId}`, {
    method: 'POST',
  })

  if (!res.ok) throw new Error('Parsing failed')
  return res.json()
}

export async function matchMedicines(items: any[], preferences: string[] = []) {
  const res = await fetch(`${FASTAPI_URL}/api/match-all`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ items, preferences }),
  })

  if (!res.ok) throw new Error('Matching failed')
  return res.json()
}