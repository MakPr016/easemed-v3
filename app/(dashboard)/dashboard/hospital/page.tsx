import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
    ArrowUpRight,
    FileText,
    ShoppingCart,
    Package,
    AlertCircle,
    TrendingDown,
    Clock,
    Pill,
    Laptop,
    Box,
    FlaskConical,
    Sparkles
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import DashboardContent from '@/components/hospital/dashboard-content'
import { headers } from 'next/headers'

async function getDashboardData() {
    try {
        const headersList = await headers()
        const cookie = headersList.get('cookie')
        
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
        const response = await fetch(`${baseUrl}/api/dashboard/hospital`, {
            cache: 'no-store',
            headers: {
                'Content-Type': 'application/json',
                ...(cookie && { 'Cookie': cookie }),
            },
        })

        if (!response.ok) {
            throw new Error('Failed to fetch dashboard data')
        }

        return await response.json()
    } catch (error) {
        console.error('Error fetching dashboard data:', error)
        return null
    }
}

export default async function HospitalDashboardPage() {
    const dashboardData = await getDashboardData()

    if (!dashboardData) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Card className="max-w-md">
                    <CardContent className="p-12 text-center">
                        <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">Failed to load dashboard</h3>
                        <p className="text-muted-foreground">Please try refreshing the page</p>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return <DashboardContent data={dashboardData} />
}
