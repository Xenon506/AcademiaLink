import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { 
  GraduationCap, 
  BarChart3, 
  User, 
  MessageSquare, 
  Calendar, 
  CheckSquare, 
  FolderOpen, 
  MessageCircle, 
  AlertTriangle, 
  Bell,
  HelpCircle,
  Settings,
  LogOut
} from "lucide-react";

export default function Sidebar() {
  const [location] = useLocation();
  const { user } = useAuth();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const { data: unreadCount = 0 } = useQuery({
    queryKey: ['/api/messages/unread-count'],
    enabled: !!user,
  });

  const { data: notifications = [] } = useQuery({
    queryKey: ['/api/notifications'],
    enabled: !!user,
  });

  const unreadNotifications = notifications.filter((n: any) => !n.isRead).length;

  const navigationItems = [
    {
      name: 'Dashboard',
      href: '/',
      icon: BarChart3,
      active: location === '/'
    },
    {
      name: 'Profile Management',
      href: '/profile',
      icon: User,
      active: location === '/profile'
    },
    {
      name: 'Discussion Forums',
      href: '/forums',
      icon: MessageSquare,
      active: location === '/forums',
      badge: unreadCount > 0 ? unreadCount : null
    },
    {
      name: 'Calendar & Timeline',
      href: '/calendar',
      icon: Calendar,
      active: location === '/calendar'
    },
    {
      name: 'Projects & Seminars',
      href: '/projects',
      icon: CheckSquare,
      active: location === '/projects',
      badge: 3,
      badgeVariant: 'destructive' as const
    },
    {
      name: 'Document Repository',
      href: '/documents',
      icon: FolderOpen,
      active: location === '/documents'
    },
    {
      name: 'Real-Time Chat',
      href: '/chat',
      icon: MessageCircle,
      active: location === '/chat',
      indicator: true
    },
    {
      name: 'Conflict Detector',
      href: '/conflicts',
      icon: AlertTriangle,
      active: location === '/conflicts'
    },
    {
      name: 'Analytics Dashboard',
      href: '/analytics',
      icon: BarChart3,
      active: location === '/analytics'
    }
  ];

  const systemItems = [
    {
      name: 'Notifications',
      href: '/notifications',
      icon: Bell,
      active: location === '/notifications',
      badge: unreadNotifications > 0 ? unreadNotifications : null
    },
    {
      name: 'Help & FAQs',
      href: '/help',
      icon: HelpCircle,
      active: location === '/help'
    },
    {
      name: 'Settings',
      href: '/settings',
      icon: Settings,
      active: location === '/settings'
    }
  ];

  const handleLogout = () => {
    window.location.href = '/api/logout';
  };

  return (
    <div className={`w-64 bg-sidebar border-r border-sidebar-border flex flex-col transition-transform duration-300 ${isMobileOpen ? '' : 'sidebar-mobile-hidden'} md:translate-x-0`} data-testid="sidebar">
      {/* Logo and User Profile */}
      <div className="p-6 border-b border-sidebar-border">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-sidebar-primary rounded-lg flex items-center justify-center">
            <GraduationCap className="w-6 h-6 text-sidebar-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-sidebar-foreground">SIP Portal</h1>
            <p className="text-sm text-muted-foreground">Academic Hub</p>
          </div>
        </div>
        
        {/* User Profile Card */}
        <div className="bg-sidebar-accent rounded-lg p-3">
          <div className="flex items-center space-x-3">
            {user?.profileImageUrl ? (
              <img 
                src={user.profileImageUrl} 
                alt="User profile" 
                className="w-10 h-10 rounded-full object-cover"
                data-testid="img-user-profile"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-sidebar-primary/10 flex items-center justify-center">
                <User className="w-6 h-6 text-sidebar-primary" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-sidebar-foreground truncate" data-testid="text-user-name">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-xs text-muted-foreground truncate" data-testid="text-user-role">
                {user?.role ? `${user.role.charAt(0).toUpperCase() + user.role.slice(1)}${user.department ? ` - ${user.department}` : ''}` : 'Loading...'}
              </p>
            </div>
            <Badge variant="secondary" className="text-xs" data-testid="badge-user-role">
              {user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)}
            </Badge>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto scrollbar-hide">
        <div className="space-y-1">
          {navigationItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <Button
                variant={item.active ? "default" : "ghost"}
                className={`w-full justify-start ${item.active ? 'bg-sidebar-primary text-sidebar-primary-foreground' : 'text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground'}`}
                data-testid={`nav-${item.name.toLowerCase().replace(/\s+/g, '-')}`}
              >
                <item.icon className="w-5 h-5 mr-3" />
                <span className="flex-1 text-left">{item.name}</span>
                {item.badge && (
                  <Badge variant={item.badgeVariant || "secondary"} className="ml-auto text-xs">
                    {item.badge}
                  </Badge>
                )}
                {item.indicator && (
                  <span className="ml-auto w-2 h-2 bg-chart-3 rounded-full animate-pulse"></span>
                )}
              </Button>
            </Link>
          ))}
        </div>

        <div className="pt-4 mt-4 border-t border-sidebar-border">
          <p className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">System</p>
          <div className="space-y-1">
            {systemItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={item.active ? "default" : "ghost"}
                  className={`w-full justify-start ${item.active ? 'bg-sidebar-primary text-sidebar-primary-foreground' : 'text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground'}`}
                  data-testid={`system-${item.name.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  <item.icon className="w-5 h-5 mr-3" />
                  <span className="flex-1 text-left">{item.name}</span>
                  {item.badge && (
                    <Badge variant="secondary" className="ml-auto text-xs">
                      {item.badge}
                    </Badge>
                  )}
                </Button>
              </Link>
            ))}
          </div>
        </div>
      </nav>

      {/* Bottom Actions */}
      <div className="p-4 border-t border-sidebar-border">
        <Button 
          variant="ghost" 
          className="w-full justify-start text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent"
          onClick={handleLogout}
          data-testid="button-logout"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sign Out
        </Button>
      </div>
    </div>
  );
}
