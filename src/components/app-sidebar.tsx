"use client";

import * as React from "react";
import { Link } from "react-router";

import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import {
  ShelvingUnit,
  LayoutDashboardIcon,
  PackageIcon,
  ReceiptIcon,
} from "lucide-react";

const data = {
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: <LayoutDashboardIcon />,
    },
    {
      title: "Inventory",
      url: "#",
      icon: <PackageIcon />,
      isActive: true,
      items: [
        { title: "Products", url: "/products" },
        { title: "Stock History", url: "/inventory-movements" },
        { title: "Categories", url: "/categories" },
        { title: "Brands", url: "/brands" },
      ],
    },
    {
      title: "Invoices",
      url: "#",
      icon: <ReceiptIcon />,
      isActive: true,
      items: [
        { title: "Invoices", url: "/invoices" },
        { title: "Payment Platforms", url: "/payment-platforms" },
      ],
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" render={<Link to="/dashboard" />}>
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                <ShelvingUnit className="size-4" />
              </div>
              <div className="flex flex-col gap-0.5 leading-none">
                <span className="font-medium">POS Frontend</span>
                <span className="text-xs">Code Test</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
