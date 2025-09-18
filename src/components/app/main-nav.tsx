"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ClipboardList, CalendarDays, FileText } from 'lucide-react';
import { SidebarMenu, SidebarMenuItem, SidebarMenuButton } from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/tasks', label: 'Tasks', icon: ClipboardList },
  { href: '/timetable', label: 'Timetable', icon: CalendarDays },
  { href: '/notes', label: 'Notes', icon: FileText },
];

export function MainNav() {
  const pathname = usePathname();

  return (
    <nav className="p-2">
      <SidebarMenu>
        {navItems.map((item) => (
          <SidebarMenuItem key={item.href}>
            <Link href={item.href} passHref legacyBehavior>
              <SidebarMenuButton
                isActive={pathname.startsWith(item.href)}
                tooltip={item.label}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.label}</span>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </nav>
  );
}
