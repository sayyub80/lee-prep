'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  MessageSquare,
  Zap,
  Users,
  UserPlus,
  LogOut,
  Shield
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

const navSections = [
  {
    title: 'Overview',
    items: [
      { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, color: 'text-sky-500' },
    ]
  },
  {
    title: 'Content Management',
    items: [
      { href: '/admin/groups', label: 'Manage Groups', icon: MessageSquare, color: 'text-indigo-500' },
      { href: '/admin/challenges', label: 'Manage Challenges', icon: Zap, color: 'text-amber-500' },
    ]
  },
  {
    title: 'User Management',
    items: [
        { href: '/admin/users', label: 'All Users', icon: Users, color: 'text-green-500' },
        { href: '/admin/add-admin', label: 'Add Admin', icon: UserPlus, color: 'text-red-500' },
    ]
  }
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <div className="min-h-[calc(100vh-80px)] flex">
      <aside className="w-64 flex-shrink-0 border-r bg-muted/40 hidden lg:flex flex-col">
        <div className="flex-grow p-4">
          <nav className="flex flex-col space-y-1">
            {navSections.map((section) => (
              <div key={section.title} className="py-2">
                <h2 className="px-3 mb-2 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                  {section.title}
                </h2>
                {section.items.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground',
                      pathname === item.href && 'bg-accent text-primary'
                    )}
                  >
                    <item.icon className={cn("h-4 w-4", item.color)} />
                    <span>{item.label}</span>
                  </Link>
                ))}
              </div>
            ))}
          </nav>
        </div>
        <div className="p-4 border-t">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                        <AvatarImage src={user?.avatar} />
                        <AvatarFallback>{user?.name?.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                        <span className="text-sm font-medium">{user?.name}</span>
                        <span className="text-xs text-muted-foreground -mt-1">{user?.email}</span>
                    </div>
                </div>
                <button onClick={() => logout()} title="Logout">
                    <LogOut className="h-4 w-4 text-muted-foreground hover:text-foreground"/>
                </button>
            </div>
        </div>
      </aside>

      {/* --- MODIFICATION: Added more padding for a better look --- */}
      <main className="flex-1 p-8 lg:p-10 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}