'use client'

import * as React from 'react'
import {
    Building2,
    FileText,
    LayoutDashboard,
    Package,
    Settings,
    ShoppingCart,
    Users,
    BarChart3,
    Bell,
    LogOut,
    ChevronDown,
    Upload,
    Clock,
    CheckCircle2,
    Eye,
    Award,
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

interface MenuItem {
    title: string;
    url: string;
    icon?: React.ElementType;
    items?: MenuItem[];
}

const hospitalMenuItems: MenuItem[] = [
    {
        title: 'Dashboard',
        icon: LayoutDashboard,
        url: '/dashboard/hospital',
    },
    {
        title: 'RFQs',
        icon: FileText,
        url: '/dashboard/hospital/rfq',
        items: [
            { title: 'All RFQs', url: '/dashboard/hospital/rfq', icon: FileText },
            { title: 'Create RFQ', url: '/dashboard/hospital/rfq/upload', icon: Upload },
            { title: 'Awaiting Responses', url: '/dashboard/hospital/rfq/[id]/awaiting', icon: Clock },
            { title: 'Under Review', url: '/dashboard/hospital/rfq/[id]/under-review', icon: Eye },
            { title: 'Awarded', url: '/dashboard/hospital/rfq/[id]/awarded', icon: Award },
            { title: 'Closed', url: '/dashboard/hospital/rfq/[id]/closed', icon: CheckCircle2 },
        ],
    },
    {
        title: 'Orders',
        icon: Package,
        url: '/dashboard/hospital/orders',
        items: [
            { title: 'All Orders', url: '/dashboard/hospital/orders' },
            { title: 'Pending', url: '/dashboard/hospital/orders?status=pending' },
            { title: 'In Transit', url: '/dashboard/hospital/orders?status=in_transit' },
            { title: 'Delivered', url: '/dashboard/hospital/orders?status=delivered' },
        ],
    },
    {
        title: 'Vendors',
        icon: Users,
        url: '/dashboard/hospital/vendors',
        items: [
            { title: 'All Vendors', url: '/dashboard/hospital/vendors' },
            { title: 'Verified', url: '/dashboard/hospital/vendors?status=verified' },
            { title: 'Pending Approval', url: '/dashboard/hospital/vendors?status=pending' },
        ],
    },
    {
        title: 'Settings',
        icon: Settings,
        url: '/dashboard/hospital/settings',
    },
]

const vendorMenuItems: MenuItem[] = [
    {
        title: 'Dashboard',
        icon: LayoutDashboard,
        url: '/dashboard/vendor',
    },
    {
        title: 'Available RFQs',
        icon: FileText,
        url: '/dashboard/vendor/rfq',
        items: [
            { title: 'All RFQs', url: '/dashboard/vendor/rfq' },
            { title: 'New', url: '/dashboard/vendor/rfq?status=new' },
            { title: 'Expiring Soon', url: '/dashboard/vendor/rfq?expiring=true' },
        ],
    },
    {
        title: 'My Quotations',
        icon: ShoppingCart,
        url: '/dashboard/vendor/quotations',
        items: [
            { title: 'All Quotations', url: '/dashboard/vendor/quotations' },
            { title: 'Pending', url: '/dashboard/vendor/quotations?status=pending' },
            { title: 'Accepted', url: '/dashboard/vendor/quotations?status=accepted' },
            { title: 'Rejected', url: '/dashboard/vendor/quotations?status=rejected' },
        ],
    },
    {
        title: 'Orders',
        icon: Package,
        url: '/dashboard/vendor/orders',
        items: [
            { title: 'Active Orders', url: '/dashboard/vendor/orders' },
            { title: 'Pending Delivery', url: '/dashboard/vendor/orders?status=pending' },
            { title: 'Completed', url: '/dashboard/vendor/orders?status=completed' },
        ],
    },
    {
        title: 'Catalog',
        icon: Package,
        url: '/dashboard/vendor/catalog',
    },
    {
        title: 'Customers',
        icon: Building2,
        url: '/dashboard/vendor/customers',
    },
    {
        title: 'Performance',
        icon: BarChart3,
        url: '/dashboard/vendor/performance',
    },
    {
        title: 'Settings',
        icon: Settings,
        url: '/dashboard/vendor/settings',
    },
]

interface AppSidebarProps {
    userType?: 'hospital' | 'vendor'
    user?: {
        name: string
        email: string
        organization: string
        avatar?: string
    }
}

export function AppSidebar({ userType = 'hospital', user }: AppSidebarProps) {
    const pathname = usePathname()
    const router = useRouter()
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
                                    <Settings className="h-4 w-4 mr-2" />
                                    Settings
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => router.push(`/dashboard/${userType}/notifications`)}>
                                    <Bell className="h-4 w-4 mr-2" />
                                    Notifications
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    className="text-destructive"
                                    onClick={() => router.push('/login')}
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
