import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileUp, MessageSquare, Calendar, AlertTriangle, Video, ExternalLink } from "lucide-react";

export default function ActivityFeed() {
  const { user } = useAuth();

  const { data: activityLogs = [], isLoading } = useQuery({
    queryKey: ['/api/activity-logs'],
    queryFn: () => fetch('/api/activity-logs').then(res => res.json()),
    enabled: !!user,
  });

  const getActivityIcon = (action: string) => {
    switch (action) {
      case 'submit':
      case 'upload':
        return FileUp;
      case 'post':
      case 'reply':
        return MessageSquare;
      case 'schedule':
      case 'create':
        return Calendar;
      case 'conflict':
        return AlertTriangle;
      case 'video':
        return Video;
      default:
        return FileUp;
    }
  };

  const getActivityColor = (action: string) => {
    switch (action) {
      case 'submit':
      case 'upload':
        return 'primary';
      case 'post':
      case 'reply':
        return 'chart-4';
      case 'schedule':
      case 'create':
        return 'chart-3';
      case 'conflict':
        return 'chart-2';
      case 'video':
        return 'chart-5';
      default:
        return 'primary';
    }
  };

  const formatTimeAgo = (date: string) => {
    const now = new Date();
    const activityDate = new Date(date);
    const diffInMinutes = Math.floor((now.getTime() - activityDate.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} hours ago`;
    return `${Math.floor(diffInMinutes / 1440)} days ago`;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-start space-x-3 p-3 animate-pulse">
                <div className="w-8 h-8 bg-muted rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-3 bg-muted rounded w-1/4"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card data-testid="activity-feed">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Recent Activity</CardTitle>
          <div className="flex space-x-2">
            <Button variant="ghost" size="sm" data-testid="button-filter-activity">
              Filter
            </Button>
            <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80" data-testid="button-view-all-activity">
              View All →
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {activityLogs.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No recent activity</p>
          </div>
        ) : (
          <div className="space-y-4">
            {activityLogs.slice(0, 5).map((activity: any) => {
              const IconComponent = getActivityIcon(activity.action);
              const color = getActivityColor(activity.action);
              
              return (
                <div 
                  key={activity.id} 
                  className="flex items-start space-x-3 p-3 hover:bg-secondary/50 rounded-lg transition-colors"
                  data-testid={`activity-${activity.id}`}
                >
                  <div className={`w-8 h-8 bg-${color}/10 rounded-full flex items-center justify-center flex-shrink-0`}>
                    <IconComponent className={`w-4 h-4 text-${color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground" data-testid="text-activity-description">
                      {activity.details?.description || `${activity.action} on ${activity.entityType}`}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1" data-testid="text-activity-time">
                      {formatTimeAgo(activity.createdAt)}
                    </p>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="p-1 text-muted-foreground hover:text-foreground"
                    data-testid="button-view-activity-details"
                  >
                    <ExternalLink className="w-3 h-3" />
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
