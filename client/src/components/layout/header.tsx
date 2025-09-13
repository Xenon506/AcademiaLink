import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useQuery } from "@tanstack/react-query";
import { Menu, Search, Bell, Mail } from "lucide-react";

export default function Header() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");

  const { data: unreadNotifications = 0 } = useQuery({
    queryKey: ['/api/notifications/unread-count'],
    enabled: !!user,
  });

  const toggleSidebar = () => {
    const sidebar = document.querySelector('[data-testid="sidebar"]');
    if (sidebar) {
      sidebar.classList.toggle('sidebar-mobile-hidden');
    }
  };

  const getRoleTitle = (role: string) => {
    switch (role) {
      case 'faculty':
        return 'Faculty Dashboard';
      case 'student':
        return 'Student Dashboard';
      case 'admin':
        return 'Admin Dashboard';
      case 'ta':
        return 'Teaching Assistant Dashboard';
      default:
        return 'Dashboard';
    }
  };

  return (
    <header className="bg-card border-b border-border px-6 py-4 flex items-center justify-between" data-testid="header">
      <div className="flex items-center space-x-4">
        <Button
          variant="ghost"
          size="sm"
          className="md:hidden text-muted-foreground hover:text-foreground"
          onClick={toggleSidebar}
          data-testid="button-mobile-menu"
        >
          <Menu className="w-5 h-5" />
        </Button>
        <div>
          <h2 className="text-2xl font-semibold text-foreground" data-testid="text-dashboard-title">
            {user ? getRoleTitle(user.role || '') : 'Dashboard'}
          </h2>
          <p className="text-sm text-muted-foreground">
            Welcome back! Here's your activity overview
          </p>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        {/* Search Bar */}
        <div className="hidden md:flex relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            type="text"
            placeholder="Search courses, students, documents..."
            className="w-80 pl-10 pr-4 py-2"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            data-testid="input-global-search"
          />
        </div>

        {/* Quick Actions */}
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            className="p-2 text-muted-foreground hover:text-foreground hover:bg-secondary"
            data-testid="button-mobile-search"
          >
            <Search className="w-4 h-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            className="relative p-2 text-muted-foreground hover:text-foreground hover:bg-secondary"
            data-testid="button-notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadNotifications > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-destructive-foreground text-xs flex items-center justify-center rounded-full" data-testid="badge-notification-count">
                {unreadNotifications > 9 ? '9+' : unreadNotifications}
              </span>
            )}
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            className="p-2 text-muted-foreground hover:text-foreground hover:bg-secondary"
            data-testid="button-messages"
          >
            <Mail className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}
