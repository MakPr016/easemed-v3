'use server'

export async function processRFQ(formData: FormData) {
    try {
        // 1. Upload to FastAPI
        const uploadRes = await fetch('http://127.0.0.1:5001/api/upload', {
            method: 'POST',
            body: formData, // Send the same formData containing the 'file'
        });

        if (!uploadRes.ok) throw new Error('Upload to FastAPI failed');
        const { document_id } = await uploadRes.json();

        // 2. Parse with FastAPI
        const parseRes = await fetch(`http://127.0.0.1:5001/api/parse/${document_id}`, {
            method: 'POST'
        });

        if (!parseRes.ok) throw new Error('Parsing failed');
        const parseResult = await parseRes.json();

        return { success: true, documentId: document_id, items: parseResult.data.line_items };
    } catch (error) {
        console.error(error);
        return { success: false, error: 'Processing failed' };
    }
}
