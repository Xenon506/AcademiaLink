import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function UpcomingEvents() {
  const { user } = useAuth();

  const { data: events = [], isLoading } = useQuery({
    queryKey: ['/api/events'],
    queryFn: () => {
      const today = new Date();
      const nextWeek = new Date();
      nextWeek.setDate(today.getDate() + 7);
      
      return fetch(`/api/events?startDate=${today.toISOString()}&endDate=${nextWeek.toISOString()}`)
        .then(res => res.json());
    },
    enabled: !!user,
  });

  const getEventColor = (index: number) => {
    const colors = ['primary', 'accent', 'chart-4', 'chart-3'];
    return colors[index % colors.length];
  };

  const formatEventTime = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const today = new Date();
    
    const isToday = start.toDateString() === today.toDateString();
    const isTomorrow = start.toDateString() === new Date(today.getTime() + 24 * 60 * 60 * 1000).toDateString();
    
    let datePrefix = '';
    if (isToday) datePrefix = 'Today, ';
    else if (isTomorrow) datePrefix = 'Tomorrow, ';
    else datePrefix = start.toLocaleDateString() + ', ';
    
    return `${datePrefix}${start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Events</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-start space-x-3 p-3 animate-pulse">
                <div className="w-2 h-2 bg-muted rounded-full mt-2"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-2/3"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                  <div className="h-3 bg-muted rounded w-1/3"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card data-testid="upcoming-events">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Upcoming Events</CardTitle>
          <Link href="/calendar">
            <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80" data-testid="button-view-calendar">
              View Calendar →
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        {events.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">No upcoming events</p>
            <Link href="/calendar">
              <Button variant="outline" size="sm">Schedule Event</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {events.slice(0, 4).map((event: any, index: number) => {
              const color = getEventColor(index);
              
              return (
                <div 
                  key={event.id} 
                  className={`flex items-start space-x-3 p-3 bg-${color}/10 rounded-lg`}
                  data-testid={`event-${event.id}`}
                >
                  <div className={`w-2 h-2 bg-${color} rounded-full mt-2 flex-shrink-0`}></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground" data-testid="text-event-title">
                      {event.title}
                    </p>
                    <p className="text-xs text-muted-foreground" data-testid="text-event-time">
                      {formatEventTime(event.startDate, event.endDate)}
                    </p>
                    {event.location && (
                      <p className="text-xs text-muted-foreground" data-testid="text-event-location">
                        {event.location}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
