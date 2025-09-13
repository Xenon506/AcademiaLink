import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Book, Users, Clock, MessageSquare } from "lucide-react";

export default function QuickStats() {
  const { user } = useAuth();

  const { data: userStats, isLoading } = useQuery({
    queryKey: ['/api/analytics/user-stats'],
    enabled: !!user,
  });

  const { data: courses = [] } = useQuery({
    queryKey: ['/api/courses'],
    enabled: !!user,
  });

  const stats = [
    {
      label: user?.role === 'faculty' ? 'Active Courses' : 'Enrolled Courses',
      value: courses.length || 0,
      change: '+2 this semester',
      icon: Book,
      color: 'primary'
    },
    {
      label: user?.role === 'faculty' ? 'Total Students' : 'Course Materials',
      value: userStats?.studentsCount || userStats?.materialsCount || 0,
      change: '+15 this week',
      icon: Users,
      color: 'chart-2'
    },
    {
      label: user?.role === 'faculty' ? 'Pending Reviews' : 'Assignments Due',
      value: userStats?.pendingReviews || userStats?.assignmentsDue || 0,
      change: '5 urgent',
      icon: Clock,
      color: 'accent'
    },
    {
      label: 'Forum Messages',
      value: userStats?.forumMessages || 0,
      change: '+12 today',
      icon: MessageSquare,
      color: 'chart-4'
    }
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="space-y-3">
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-8 bg-muted rounded w-1/2"></div>
                <div className="h-3 bg-muted rounded w-2/3"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6" data-testid="quick-stats">
      {stats.map((stat, index) => (
        <Card key={index} className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground" data-testid={`stat-label-${index}`}>
                  {stat.label}
                </p>
                <p className="text-2xl font-bold text-foreground" data-testid={`stat-value-${index}`}>
                  {stat.value}
                </p>
                <p className="text-xs text-chart-3 mt-1" data-testid={`stat-change-${index}`}>
                  {stat.change}
                </p>
              </div>
              <div className={`w-12 h-12 bg-${stat.color}/10 rounded-lg flex items-center justify-center`}>
                <stat.icon className={`w-6 h-6 text-${stat.color}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
