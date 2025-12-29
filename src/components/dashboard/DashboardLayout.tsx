import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth';
import { useCredits } from '@/hooks/useCredits';
import { 
  Sparkles, 
  LayoutDashboard, 
  Target, 
  Wand2, 
  History, 
  Settings, 
  LogOut,
  Coins,
  ChevronLeft,
  FileText,
  RefreshCw,
  PenTool,
  Briefcase,
  ExternalLink
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
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface DashboardLayoutProps {
  children: ReactNode;
}

const navItems = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/dashboard/detect', label: 'AI Detector', icon: Target },
  { href: '/dashboard/humanize', label: 'Humanizer', icon: Wand2 },
  { href: '/dashboard/paraphrase', label: 'Paraphraser', icon: RefreshCw },
  { href: '/dashboard/summarize', label: 'Summarizer', icon: FileText },
  { href: '/dashboard/improve-writing', label: 'Writing Improver', icon: PenTool },
  { href: '/dashboard/history', label: 'History', icon: History },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
];

const externalLinks = [
  { href: 'https://createresume.tech', label: 'Career Tools', icon: Briefcase, description: 'Resume, CV, LinkedIn & more' },
];

function DashboardSidebar() {
  const { user, signOut } = useAuth();
  const { credits } = useCredits();
  const location = useLocation();
  const { state, toggleSidebar, isMobile, setOpenMobile } = useSidebar();
  const isCollapsed = state === 'collapsed';

  const handleNavClick = () => {
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      {/* Header with Logo */}
      <SidebarHeader className="border-b border-sidebar-border">
        <Link to="/" className="flex items-center gap-2 px-2 py-3 hover:opacity-80 transition-opacity">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5 text-primary-foreground" />
          </div>
          {!isCollapsed && (
            <span className="font-bold text-lg text-sidebar-foreground truncate">
              HumanizeAI
            </span>
          )}
        </Link>
      </SidebarHeader>

      {/* Credits Section */}
      <div className="px-2 py-3 border-b border-sidebar-border">
        {isCollapsed ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center justify-center p-2 bg-sidebar-accent rounded-lg cursor-default">
                <Coins className="w-5 h-5 text-warning" />
              </div>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>Credits: {credits}</p>
            </TooltipContent>
          </Tooltip>
        ) : (
          <div className="flex items-center gap-3 px-3 py-3 bg-sidebar-accent rounded-lg">
            <Coins className="w-5 h-5 text-warning shrink-0" />
            <div className="min-w-0">
              <p className="text-xs text-sidebar-foreground/70">Credits</p>
              <p className="font-semibold text-sidebar-foreground">{credits}</p>
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <SidebarContent>
        <SidebarMenu className="px-2 py-2">
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
                      ? 'bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary hover:text-sidebar-primary-foreground' 
                      : ''
                  }
                >
                  <Link to={item.href} onClick={handleNavClick}>
                    <item.icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>

        {/* External Links Section */}
        <div className="px-2 py-2 border-t border-sidebar-border mt-2">
          {!isCollapsed && (
            <p className="px-3 py-2 text-xs font-semibold text-sidebar-foreground/50 uppercase tracking-wider">
              Partner Tools
            </p>
          )}
          <SidebarMenu>
            {externalLinks.map((link) => (
              <SidebarMenuItem key={link.href}>
                <SidebarMenuButton
                  asChild
                  tooltip={`${link.label} - ${link.description}`}
                  className="hover:bg-sidebar-accent"
                >
                  <a 
                    href={link.href} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    onClick={handleNavClick}
                    className="flex items-center gap-2"
                  >
                    <link.icon className="w-5 h-5 text-primary" />
                    <span className="font-medium flex-1">{link.label}</span>
                    <ExternalLink className="w-3 h-3 text-muted-foreground" />
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </div>
      </SidebarContent>

      {/* Footer with User Info */}
      <SidebarFooter className="border-t border-sidebar-border">
        {/* User Info */}
        {isCollapsed ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center justify-center p-2">
                <div className="w-8 h-8 rounded-full bg-sidebar-accent flex items-center justify-center">
                  <span className="text-sm font-medium text-sidebar-foreground">
                    {user?.email?.charAt(0).toUpperCase()}
                  </span>
                </div>
              </div>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>{user?.email}</p>
            </TooltipContent>
          </Tooltip>
        ) : (
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-8 h-8 rounded-full bg-sidebar-accent flex items-center justify-center shrink-0">
              <span className="text-sm font-medium text-sidebar-foreground">
                {user?.email?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-sidebar-foreground truncate">
                {user?.email}
              </p>
            </div>
          </div>
        )}

        {/* Sign Out Button */}
        <SidebarMenu className="px-2">
          <SidebarMenuItem>
            <SidebarMenuButton 
              tooltip="Sign Out"
              onClick={() => signOut()}
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

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen flex w-full">
        <DashboardSidebar />
        <SidebarInset className="flex-1">
          {/* Mobile header with trigger */}
          <header className="md:hidden sticky top-0 z-50 flex h-14 items-center gap-2 border-b bg-background px-4">
            <SidebarTrigger className="-ml-1" />
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-primary flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-bold text-foreground">HumanizeAI</span>
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
