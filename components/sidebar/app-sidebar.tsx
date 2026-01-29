// components/sidebar/app-sidebar.tsx
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
    XCircle
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

const hospitalMenuItems = [
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
            { title: 'Awaiting Bids', url: '/dashboard/hospital/rfq?status=awaiting_bids', icon: Clock },
            { title: 'Under Review', url: '/dashboard/hospital/rfq?status=under_review', icon: ShoppingCart },
            { title: 'Awarded', url: '/dashboard/hospital/rfq?status=awarded', icon: CheckCircle2 },
            { title: 'Closed', url: '/dashboard/hospital/rfq?status=closed', icon: XCircle },
        ],
    },
    {
        title: 'Quotations',
        icon: ShoppingCart,
        url: '/dashboard/hospital/quotations',
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
        title: 'Inventory',
        icon: Package,
        url: '/dashboard/hospital/inventory',
    },
    {
        title: 'Analytics',
        icon: BarChart3,
        url: '/dashboard/hospital/analytics',
    },
    {
        title: 'Settings',
        icon: Settings,
        url: '/dashboard/hospital/settings',
    },
]

const vendorMenuItems = [
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

    // Check if a path is active, including query parameters
    const isPathActive = (url: string) => {
        if (url.includes('?')) {
            return pathname + window.location.search === url
        }
        return pathname === url
    }

    return (
        <Sidebar>
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <Link href={userType === 'hospital' ? '/dashboard/hospital' : '/dashboard/vendor'}>
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
                                                        <item.icon className="h-4 w-4" />
                                                        <span>{item.title}</span>
                                                        <ChevronDown className="ml-auto h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-180" />
                                                    </SidebarMenuButton>
                                                </CollapsibleTrigger>
                                                <CollapsibleContent>
                                                    <SidebarMenuSub>
                                                        {item.items.map((subItem) => (
                                                            <SidebarMenuSubItem key={subItem.title}>
                                                                <SidebarMenuSubButton
                                                                    asChild
                                                                    isActive={pathname.startsWith(subItem.url.split('?')[0])}
                                                                >
                                                                    <Link href={subItem.url}>
                                                                        {'icon' in subItem && subItem.icon && <subItem.icon className="h-3 w-3 mr-2" />}
                                                                        <span>{subItem.title}</span>
                                                                    </Link>
                                                                </SidebarMenuSubButton>
                                                            </SidebarMenuSubItem>
                                                        ))}
                                                    </SidebarMenuSub>
                                                </CollapsibleContent>
                                            </SidebarMenuItem>
                                        </Collapsible>
                                    ) : (
                                        <SidebarMenuItem>
                                            <SidebarMenuButton asChild isActive={pathname === item.url}>
                                                <Link href={item.url}>
                                                    <item.icon className="h-4 w-4" />
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
