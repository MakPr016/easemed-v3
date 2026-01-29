'use client'

import * as React from 'react'
import {
    ChevronDown,
    LogOut,
    Bell,
    Settings as SettingsIcon,
} from 'lucide-react'

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
} from '@/components/ui/sidebar'
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { hospitalMenuItems, vendorMenuItems } from '@/lib/constants'
import { useUser } from '@/lib/contexts/user-context'

export function AppSidebar() {
    const pathname = usePathname()
    const router = useRouter()
    const { user, userType, logout } = useUser()

    const menuItems = userType === 'hospital' ? hospitalMenuItems : vendorMenuItems

    const defaultUser = {
        name: user?.name || 'John Doe',
        email: user?.email || 'john@hospital.com',
        organization: user?.organization || 'General Hospital',
        avatar: user?.avatar,
    }

    const getRfqIdFromPath = () => {
        const match = pathname.match(/\/rfq\/([^\/]+)/)
        return match ? match[1] : null
    }

    const getResolvedUrl = (url: string) => {
        if (url.includes('[id]')) {
            const rfqId = getRfqIdFromPath()
            if (rfqId) {
                return url.replace('[id]', rfqId)
            }
            return url
        }
        return url
    }

    const isLinkDisabled = (url: string) => {
        if (url.includes('[id]')) {
            const rfqId = getRfqIdFromPath()
            return !rfqId
        }
        return false
    }

    const isPathActive = (url: string) => {
        const resolvedUrl = getResolvedUrl(url)
        if (resolvedUrl.includes('?')) {
            if (typeof window !== 'undefined') {
                return pathname + window.location.search === resolvedUrl
            }
            return pathname === resolvedUrl.split('?')[0]
        }
        return pathname === resolvedUrl
    }

    const handleLogout = () => {
        logout()
        router.push('/login')
    }

    return (
        <Sidebar>
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <Link href={userType === 'hospital' ? '/dashboard/hospital' : '/dashboard/vendor'} prefetch={false}>
                            <div className="flex items-center gap-2 px-2 py-4 cursor-pointer hover:opacity-80 transition-opacity">
                                <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                                    <span className="text-primary-foreground font-bold text-lg">E</span>
                                </div>
                                <span className="text-xl font-bold">EaseMed</span>
                            </div>
                        </Link>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>
                        {userType === 'hospital' ? 'Hospital Portal' : 'Vendor Portal'}
                    </SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {menuItems.map((item) => (
                                <React.Fragment key={item.title}>
                                    {item.items ? (
                                        <Collapsible
                                            defaultOpen={pathname.startsWith(item.url)}
                                            className="group/collapsible"
                                        >
                                            <SidebarMenuItem>
                                                <CollapsibleTrigger asChild>
                                                    <SidebarMenuButton>
                                                        {item.icon && typeof item.icon === 'function' && <item.icon className="h-4 w-4" />}
                                                        <span>{item.title}</span>
                                                        <ChevronDown className="ml-auto h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-180" />
                                                    </SidebarMenuButton>
                                                </CollapsibleTrigger>
                                                <CollapsibleContent>
                                                    <SidebarMenuSub>
                                                        {item.items.map((subItem) => {
                                                            const disabled = isLinkDisabled(subItem.url)
                                                            const resolvedUrl = getResolvedUrl(subItem.url)

                                                            return (
                                                                <SidebarMenuSubItem key={subItem.title}>
                                                                    <SidebarMenuSubButton
                                                                        asChild={!disabled}
                                                                        isActive={!disabled && isPathActive(subItem.url)}
                                                                        className={disabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''}
                                                                    >
                                                                        {disabled ? (
                                                                            <div className="flex items-center">
                                                                                {'icon' in subItem && subItem.icon && <subItem.icon className="h-3 w-3 mr-2" />}
                                                                                <span>{subItem.title}</span>
                                                                            </div>
                                                                        ) : (
                                                                            <Link href={resolvedUrl} prefetch={false}>
                                                                                {'icon' in subItem && subItem.icon && <subItem.icon className="h-3 w-3 mr-2" />}
                                                                                <span>{subItem.title}</span>
                                                                            </Link>
                                                                        )}
                                                                    </SidebarMenuSubButton>
                                                                </SidebarMenuSubItem>
                                                            )
                                                        })}
                                                    </SidebarMenuSub>
                                                </CollapsibleContent>
                                            </SidebarMenuItem>
                                        </Collapsible>
                                    ) : (
                                        <SidebarMenuItem>
                                            <SidebarMenuButton asChild isActive={pathname === item.url}>
                                                <Link href={item.url} prefetch={false}>
                                                    {item.icon && typeof item.icon === 'function' && <item.icon className="h-4 w-4" />}
                                                    <span>{item.title}</span>
                                                </Link>
                                            </SidebarMenuButton>
                                        </SidebarMenuItem>
                                    )}
                                </React.Fragment>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>

            <SidebarFooter>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <SidebarMenuButton className="h-auto py-3">
                                    <Avatar className="h-8 w-8">
                                        <AvatarImage src={defaultUser.avatar} alt={defaultUser.name} />
                                        <AvatarFallback>{defaultUser.name.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex flex-col items-start flex-1 text-left">
                                        <span className="text-sm font-medium">{defaultUser.name}</span>
                                        <span className="text-xs text-muted-foreground truncate max-w-37.5">
                                            {defaultUser.organization}
                                        </span>
                                    </div>
                                    <ChevronDown className="h-4 w-4 ml-auto" />
                                </SidebarMenuButton>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56">
                                <DropdownMenuItem onClick={() => router.push(`/dashboard/${userType}/settings`)}>
                                    <SettingsIcon className="h-4 w-4 mr-2" />
                                    Settings
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => router.push(`/dashboard/${userType}/notifications`)}>
                                    <Bell className="h-4 w-4 mr-2" />
                                    Notifications
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    className="text-destructive"
                                    onClick={handleLogout}
                                >
                                    <LogOut className="h-4 w-4 mr-2" />
                                    Logout
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    )
}
