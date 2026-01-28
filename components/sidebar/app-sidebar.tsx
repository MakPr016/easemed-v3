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
    ChevronDown
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
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

const hospitalMenuItems = [
    {
        title: 'Dashboard',
        icon: LayoutDashboard,
        url: '/dashboard',
    },
    {
        title: 'RFQs',
        icon: FileText,
        url: '/rfqs',
        items: [
            { title: 'All RFQs', url: '/rfqs' },
            { title: 'Create RFQ', url: '/rfqs/create' },
            { title: 'Drafts', url: '/rfqs/drafts' },
            { title: 'Active', url: '/rfqs/active' },
            { title: 'Closed', url: '/rfqs/closed' },
        ],
    },
    {
        title: 'Bids',
        icon: ShoppingCart,
        url: '/bids',
    },
    {
        title: 'Vendors',
        icon: Users,
        url: '/vendors',
    },
    {
        title: 'Inventory',
        icon: Package,
        url: '/inventory',
    },
    {
        title: 'Analytics',
        icon: BarChart3,
        url: '/analytics',
    },
    {
        title: 'Settings',
        icon: Settings,
        url: '/settings',
    },
]

const vendorMenuItems = [
    {
        title: 'Dashboard',
        icon: LayoutDashboard,
        url: '/dashboard',
    },
    {
        title: 'Opportunities',
        icon: FileText,
        url: '/opportunities',
    },
    {
        title: 'My Bids',
        icon: ShoppingCart,
        url: '/bids',
        items: [
            { title: 'All Bids', url: '/bids' },
            { title: 'Pending', url: '/bids/pending' },
            { title: 'Won', url: '/bids/won' },
            { title: 'Lost', url: '/bids/lost' },
        ],
    },
    {
        title: 'Catalog',
        icon: Package,
        url: '/catalog',
    },
    {
        title: 'Customers',
        icon: Building2,
        url: '/customers',
    },
    {
        title: 'Performance',
        icon: BarChart3,
        url: '/performance',
    },
    {
        title: 'Settings',
        icon: Settings,
        url: '/settings',
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
    const menuItems = userType === 'hospital' ? hospitalMenuItems : vendorMenuItems

    const defaultUser = {
        name: user?.name || 'John Doe',
        email: user?.email || 'john@hospital.com',
        organization: user?.organization || 'General Hospital',
        avatar: user?.avatar,
    }

    return (
        <Sidebar>
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <div className="flex items-center gap-2 px-2 py-4">
                            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                                <span className="text-primary-foreground font-bold text-lg">E</span>
                            </div>
                            <span className="text-xl font-bold">EaseMed</span>
                        </div>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>Menu</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {menuItems.map((item) => (
                                <React.Fragment key={item.title}>
                                    {item.items ? (
                                        <Collapsible defaultOpen={pathname.startsWith(item.url)} className="group/collapsible">
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
                                                                <SidebarMenuSubButton asChild isActive={pathname === subItem.url}>
                                                                    <Link href={subItem.url}>
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
                                        <span className="text-xs text-muted-foreground">{defaultUser.organization}</span>
                                    </div>
                                    <ChevronDown className="h-4 w-4 ml-auto" />
                                </SidebarMenuButton>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56">
                                <DropdownMenuItem>
                                    <Bell className="h-4 w-4 mr-2" />
                                    Notifications
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                    <Settings className="h-4 w-4 mr-2" />
                                    Settings
                                </DropdownMenuItem>
                                <DropdownMenuItem className="text-destructive">
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
