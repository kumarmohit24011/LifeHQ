import { MainNav } from '@/components/app/main-nav';
import { UserNav } from '@/components/app/user-nav';
import { LifeHQLogo } from '@/components/app/logo';
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarInset,
  SidebarTrigger,
  SidebarProvider,
} from '@/components/ui/sidebar';
import { AppProvider } from '@/context/app-context';
import { AuthProvider, AuthGuard } from '@/context/auth-context';
import { SyncButton } from '@/components/app/sync-button';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <AuthGuard>
        <AppProvider>
          <SidebarProvider>
            <Sidebar>
              <SidebarHeader>
                <div className="p-2 flex items-center gap-2">
                  <LifeHQLogo />
                  <h1 className="text-xl font-semibold">LifeHQ</h1>
                </div>
              </SidebarHeader>
              <SidebarContent>
                <MainNav />
              </SidebarContent>
            </Sidebar>
            <SidebarInset>
              <header className="flex h-14 items-center gap-4 border-b bg-background px-4 lg:h-[60px] lg:px-6 sticky top-0 z-30">
                <SidebarTrigger className="md:hidden" />
                <div className="w-full flex-1" />
                <SyncButton />
                <UserNav />
              </header>
              <main className="flex-1 p-4 sm:p-6">{children}</main>
            </SidebarInset>
          </SidebarProvider>
        </AppProvider>
      </AuthGuard>
    </AuthProvider>
  );
}
