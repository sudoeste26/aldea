"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  UserCheck,
  Building2,
  DoorOpen,
  FileText,
  BarChart3,
  Mail,
  ShieldCheck,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

const navItems = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard, exact: true },
  { label: "Investidores", href: "/admin/investidores", icon: UserCheck },
  { label: "Empreendimentos", href: "/admin/empreendimentos", icon: Building2 },
  { label: "Unidades", href: "/admin/unidades", icon: DoorOpen },
  { label: "Propostas", href: "/admin/propostas", icon: FileText },
  { label: "Relatórios", href: "/admin/relatorios", icon: BarChart3 },
  { label: "E-mails", href: "/admin/emails", icon: Mail },
  { label: "Usuários", href: "/admin/usuarios", icon: Users },
  { label: "Auditoria", href: "/admin/auditoria", icon: ShieldCheck },
];

interface SidebarProps {
  userName: string;
  userEmail: string;
}

export function Sidebar({ userName, userEmail }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <aside className="flex h-screen w-64 flex-col bg-sidebar text-white fixed left-0 top-0 z-30">
      {/* Logo */}
      <div className="flex items-center px-6 py-5 border-b border-white/10">
        <span className="text-2xl font-black tracking-tighter text-brand">ALDEA</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const isActive = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-brand text-white"
                  : "text-white/60 hover:bg-white/10 hover:text-white"
              )}
            >
              <item.icon className="h-4 w-4 flex-shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* User footer */}
      <div className="border-t border-white/10 px-4 py-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand text-white text-xs font-bold flex-shrink-0">
            {userName
              .split(" ")
              .slice(0, 2)
              .map((n) => n[0])
              .join("")
              .toUpperCase()}
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-medium text-white truncate">{userName}</p>
            <p className="text-xs text-white/50 truncate">{userEmail}</p>
          </div>
        </div>
        <button
          onClick={handleSignOut}
          className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-white/60 hover:bg-white/10 hover:text-white transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Sair
        </button>
      </div>
    </aside>
  );
}
