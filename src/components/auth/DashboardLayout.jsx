import { Link, useLocation, Outlet } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { useAuth } from "@/components/auth/AuthContext";
import { 
  Users, 
  Home, 
  User, 
  Zap,
  GraduationCap,
  Network,
  Settings,
  LogOut
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const navigationItems = [
  {
    title: "Dashboard",
    url: createPageUrl("Dashboard"),
    icon: Home,
  },
  {
    title: "Six Degrees",
    url: createPageUrl("SixDegrees"),
    icon: Network,
  },
  {
    title: "Roommates",
    url: createPageUrl("Roommates"),
    icon: Users,
  },
  {
    title: "Amplify Your Ask",
    url: createPageUrl("Boost"),
    icon: Zap,
  },
];

export default function DashboardLayout() {
  const location = useLocation();
  const { logout, user } = useAuth();

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-slate-50 via-blue-50/30 to-orange-50/20">
        <style>{`
          :root {
            --uf-orange: #FA4616;
            --uf-blue: #0021A5;
            --uf-orange-light: #FF6B35;
            --uf-blue-light: #1E40AF;
          }
        `}</style>
        
        <Sidebar className="border-r border-slate-200/60 bg-white/80 backdrop-blur-xl">
          <SidebarHeader className="border-b border-slate-200/60 p-6">
            <Link to={createPageUrl("Home")} className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-[var(--uf-orange)] to-[var(--uf-orange-light)] rounded-xl flex items-center justify-center shadow-lg">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-slate-900 text-lg">College Fast Forward</h2>
                <p className="text-xs text-slate-500 font-medium">UF Professional Network</p>
              </div>
            </Link>
          </SidebarHeader>
          
          <SidebarContent className="p-3">
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu className="space-y-1">
                  {navigationItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton 
                        asChild 
                        className={`hover:bg-slate-100/80 hover:text-[var(--uf-blue)] transition-all duration-300 rounded-xl py-3 px-4 group ${
                          location.pathname === item.url 
                            ? 'bg-gradient-to-r from-[var(--uf-blue)]/10 to-[var(--uf-orange)]/5 text-[var(--uf-blue)] border border-[var(--uf-blue)]/20' 
                            : 'text-slate-600'
                        }`}
                      >
                        <Link to={item.url} className="flex items-center gap-3">
                          <item.icon className={`w-5 h-5 transition-transform duration-300 group-hover:scale-110 ${
                            location.pathname === item.url ? 'text-[var(--uf-blue)]' : ''
                          }`} />
                          <span className="font-semibold">{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter className="border-t border-slate-200/60 p-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-100/80 cursor-pointer transition-colors">
                  <div className="w-10 h-10 bg-gradient-to-br from-slate-200 to-slate-300 rounded-full flex items-center justify-center font-bold text-slate-700">
                    {user?.full_name?.split(' ').map(n => n[0]).join('') || 'U'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-900 text-sm truncate">{user?.full_name || 'Gator'}</p>
                    <p className="text-xs text-slate-500 truncate">{user?.headline || 'Edit your profile'}</p>
                  </div>
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 mb-2" align="end" side="top">
                <DropdownMenuItem asChild>
                  <Link to={createPageUrl("Profile")} className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem disabled>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarFooter>
        </Sidebar>

        <div className="flex-1 flex flex-col">
          <header className="lg:hidden p-4 border-b border-slate-200/60 bg-white/80 backdrop-blur-xl sticky top-0 z-30">
            <SidebarTrigger className="p-2 -ml-2" />
          </header>
          <main className="flex-1 w-full">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}