"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  LayoutDashboard,
  Building2,
  Building,
  MapPin,
  CreditCard,
  TrendingUp,
  Users,
  Settings,
  MessageSquare,
  AlertTriangle,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from "@/components/ui/sidebar";

const mainNav = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { title: "Propriétés", href: "/properties", icon: Building2 },
  { title: "Agences", href: "/agencies", icon: Building },
  { title: "Villes", href: "/cities", icon: MapPin },
  { title: "Messages", href: "/messages", icon: MessageSquare },
];

const financeNav = [
  { title: "Paiements", href: "/payments", icon: CreditCard },
  { title: "En retard", href: "/payments/overdue", icon: AlertTriangle },
  { title: "Rapports", href: "/financial", icon: TrendingUp },
];

const adminNav = [
  { title: "Utilisateurs", href: "/users", icon: Users },
  { title: "Paramètres", href: "/settings", icon: Settings },
];

function NavItem({
  item,
  pathname,
}: {
  item: { title: string; href: string; icon: React.ComponentType<{ className?: string }> };
  pathname: string;
}) {
  const isActive =
    item.href === "/dashboard"
      ? pathname === "/dashboard"
      : pathname.startsWith(item.href);

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        isActive={isActive}
        render={<Link href={item.href} />}
      >
        <item.icon className="h-5 w-5" />
        <span>{item.title}</span>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

export function AppSidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "ADMIN";

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-[#EBEBEB] px-6 py-5">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#FF385C]">
            <Building2 className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold text-[#222222]">Adama</span>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNav.map((item) => (
                <NavItem key={item.href} item={item} pathname={pathname} />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Finance</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {financeNav.map((item) => (
                <NavItem key={item.href} item={item} pathname={pathname} />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {isAdmin && (
          <SidebarGroup>
            <SidebarGroupLabel>Administration</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {adminNav.map((item) => (
                  <NavItem key={item.href} item={item} pathname={pathname} />
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="border-t border-[#EBEBEB] p-4">
        <div className="text-xs text-[#6A6A6A]">
          {session?.user?.name ?? "—"} · {session?.user?.role ?? ""}
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
