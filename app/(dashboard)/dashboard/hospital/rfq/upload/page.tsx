'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Upload, FileText, X, CheckCircle2, Loader2 } from 'lucide-react'

export default function RFQUploadPage() {
    const router = useRouter()
    const [file, setFile] = useState<File | null>(null)
    const [dragActive, setDragActive] = useState(false)
    const [uploading, setUploading] = useState(false)
    const [rfqData, setRfqData] = useState({
        title: '',
        description: '',
        deadline: '',
    })

    const handleDrag = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true)
        } else if (e.type === 'dragleave') {
            setDragActive(false)
        }
    }, [])

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setDragActive(false)

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            setFile(e.dataTransfer.files[0])
        }
    }, [])

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0])
        }
    }

    const handleRemoveFile = () => {
        setFile(null)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!file) return

        setUploading(true)

        try {
            // TODO: Upload file and call ML parsing API
            const formData = new FormData()
            formData.append('file', file)
            formData.append('title', rfqData.title)
            formData.append('description', rfqData.description)
            formData.append('deadline', rfqData.deadline)

            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 2000))

            // Mock RFQ ID after successful upload
            const rfqId = 'rfq-' + Date.now()

            // Navigate to review page
            router.push(`/dashboard/hospital/rfq/${rfqId}/review`)
        } catch (error) {
            console.error('Upload error:', error)
        } finally {
            setUploading(false)
        }
    }

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes'
        const k = 1024
        const sizes = ['Bytes', 'KB', 'MB', 'GB']
        const i = Math.floor(Math.log(bytes) / Math.log(k))
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Upload RFQ</h1>
                <p className="text-muted-foreground">
                    Upload your RFQ document and our AI will extract all requirements
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Basic Information</CardTitle>
                        <CardDescription>
                            Provide basic details about your RFQ
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="title">RFQ Title *</Label>
                            <Input
                                id="title"
                                placeholder="e.g., Medical Supplies Q1 2026"
                                value={rfqData.title}
                                onChange={(e) => setRfqData({ ...rfqData, title: e.target.value })}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                placeholder="Additional details about this procurement request..."
                                rows={4}
                                value={rfqData.description}
                                onChange={(e) => setRfqData({ ...rfqData, description: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="deadline">Submission Deadline *</Label>
                            <Input
                                id="deadline"
                                type="datetime-local"
                                value={rfqData.deadline}
                                onChange={(e) => setRfqData({ ...rfqData, deadline: e.target.value })}
                                required
                            />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Upload RFQ Document</CardTitle>
                        <CardDescription>
                            Supported formats: PDF, Excel (.xlsx, .xls), Word (.docx, .doc)
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {!file ? (
                            <div
                                className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${dragActive
                                        ? 'border-primary bg-primary/5'
                                        : 'border-border hover:border-primary/50'
                                    }`}
                                onDragEnter={handleDrag}
                                onDragLeave={handleDrag}
                                onDragOver={handleDrag}
                                onDrop={handleDrop}
                            >
                                <div className="flex flex-col items-center gap-4">
                                    <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                                        <Upload className="h-8 w-8 text-primary" />
                                    </div>
                                    <div>
                                        <p className="text-lg font-medium">
                                            Drag and drop your file here
                                        </p>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            or click to browse
                                        </p>
                                    </div>
                                    <Input
                                        type="file"
                                        id="file-upload"
                                        className="hidden"
                                        accept=".pdf,.xlsx,.xls,.docx,.doc"
                                        onChange={handleFileChange}
                                    />
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => document.getElementById('file-upload')?.click()}
                                    >
                                        Browse Files
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div className="border rounded-lg p-4">
                                <div className="flex items-start gap-4">
                                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                                        <FileText className="h-6 w-6 text-primary" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium truncate">{file.name}</p>
                                        <p className="text-sm text-muted-foreground">
                                            {formatFileSize(file.size)}
                                        </p>
                                    </div>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        onClick={handleRemoveFile}
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <div className="flex items-center justify-between">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.back()}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        disabled={!file || !rfqData.title || !rfqData.deadline || uploading}
                        className="gap-2"
                    >
                        {uploading ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Processing...
                            </>
                        ) : (
                            <>
                                <CheckCircle2 className="h-4 w-4" />
                                Upload & Parse
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </div>
    )
}
