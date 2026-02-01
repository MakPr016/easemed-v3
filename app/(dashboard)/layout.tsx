'use client'

import { useEffect } from 'react'
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/sidebar/app-sidebar'
import { Separator } from '@/components/ui/separator'

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    useEffect(() => {
        const originalError = console.error
        console.error = (...args) => {
            if (
                typeof args[0] === 'string' &&
                (args[0].includes('aria-controls') ||
                    args[0].includes('Hydration') ||
                    args[0].includes('data-active') ||
                    args[0].includes('radix'))
            ) {
                return
            }
            originalError.call(console, ...args)
        }

        return () => {
            console.error = originalError
        }
    }, [])

    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
                <main className="flex flex-1 flex-col">
                    <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-2 border-b bg-background px-4">
                        <SidebarTrigger className="-ml-1" />
                        <Separator orientation="vertical" className="mr-2 h-4" />
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">Dashboard</span>
                        </div>
                    </header>
                    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
                        {children}
                    </div>
                </main>
            </SidebarInset>
        </SidebarProvider>
    )
}
