import { ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { 
  LayoutDashboard, 
  DollarSign, 
  Users, 
  Bot, 
  Settings, 
  LogOut,
  Shield,
  CreditCard,
  ChevronLeft
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
  SidebarRail,
  useSidebar,
} from '@/components/ui/sidebar';

interface AdminLayoutProps {
  children: ReactNode;
}

const navItems = [
  { href: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/admin/pricing', icon: DollarSign, label: 'Pricing' },
  { href: '/admin/users', icon: Users, label: 'Users' },
  { href: '/admin/models', icon: Bot, label: 'AI Models' },
  { href: '/admin/payments', icon: CreditCard, label: 'Payments' },
  { href: '/admin/settings', icon: Settings, label: 'Settings' },
];

function AdminSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const { state, toggleSidebar, isMobile, setOpenMobile } = useSidebar();
  const isCollapsed = state === 'collapsed';

  const handleSignOut = async () => {
    await signOut();
    navigate('/admin-auth');
  };

  const handleNavClick = () => {
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  return (
    <Sidebar collapsible="icon" className="border-r border-border bg-card">
      {/* Header with Logo */}
      <SidebarHeader className="border-b border-border">
        <Link to="/admin" className="flex items-center gap-2 px-2 py-3" onClick={handleNavClick}>
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
            <Shield className="w-4 h-4 text-primary-foreground" />
          </div>
          {!isCollapsed && (
            <span className="font-bold text-lg text-foreground truncate">
              Admin Panel
            </span>
          )}
        </Link>
      </SidebarHeader>

      {/* Navigation */}
      <SidebarContent>
        <SidebarMenu className="px-2 py-4">
          {navItems.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  asChild
                  isActive={isActive}
                  tooltip={item.label}
                  className={
                    isActive 
                      ? 'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground' 
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }
                >
                  <Link to={item.href} onClick={handleNavClick}>
                    <item.icon className="w-4 h-4" />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarContent>

      {/* Footer */}
      <SidebarFooter className="border-t border-border">
        {/* Sign Out Button */}
        <SidebarMenu className="px-2 py-2">
          <SidebarMenuItem>
            <SidebarMenuButton 
              tooltip="Sign Out"
              onClick={handleSignOut}
              className="text-muted-foreground hover:text-foreground"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>

        {/* Collapse Toggle Button */}
        {!isMobile && (
          <div className="px-2 pt-2">
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-center"
              onClick={toggleSidebar}
            >
              <ChevronLeft className={`w-4 h-4 transition-transform duration-200 ${isCollapsed ? 'rotate-180' : ''}`} />
              {!isCollapsed && <span className="ml-2">Collapse</span>}
            </Button>
          </div>
        )}
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}

export function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen flex w-full bg-background">
        <AdminSidebar />
        <SidebarInset className="flex-1 overflow-auto">
          {/* Mobile header with trigger */}
          <header className="md:hidden sticky top-0 z-50 flex h-14 items-center gap-2 border-b bg-background px-4">
            <SidebarTrigger className="-ml-1" />
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-primary flex items-center justify-center">
                <Shield className="w-3 h-3 text-primary-foreground" />
              </div>
              <span className="font-bold text-foreground">Admin Panel</span>
            </div>
          </header>
          <main className="flex-1">
            <div className="p-6 lg:p-8">
              {children}
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
