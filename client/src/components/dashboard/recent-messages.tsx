import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User } from "lucide-react";
import { Link } from "wouter";

export default function RecentMessages() {
  const { user } = useAuth();

  const { data: messages = [], isLoading } = useQuery({
    queryKey: ['/api/messages'],
    enabled: !!user,
  });

  const formatTimeAgo = (date: string) => {
    const now = new Date();
    const messageDate = new Date(date);
    const diffInMinutes = Math.floor((now.getTime() - messageDate.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} hours ago`;
    return `${Math.floor(diffInMinutes / 1440)} days ago`;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Messages</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-start space-x-3 p-3 animate-pulse">
                <div className="w-8 h-8 bg-muted rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-2/3"></div>
                  <div className="h-3 bg-muted rounded w-full"></div>
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
    <Card data-testid="recent-messages">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Recent Messages</CardTitle>
          <Link href="/chat">
            <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80" data-testid="button-open-chat">
              Open Chat →
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        {messages.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">No recent messages</p>
            <Link href="/chat">
              <Button variant="outline" size="sm">Start Conversation</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {messages.slice(0, 3).map((message: any) => (
              <div 
                key={message.id} 
                className="flex items-start space-x-3 p-3 hover:bg-secondary/50 rounded-lg transition-colors cursor-pointer"
                data-testid={`message-${message.id}`}
              >
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <p className="text-sm font-medium text-foreground" data-testid="text-sender-name">
                      {message.senderName || 'Unknown User'}
                    </p>
                    {!message.isRead && (
                      <span className="w-2 h-2 bg-primary rounded-full"></span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground truncate" data-testid="text-message-preview">
                    {message.content.length > 50 ? `${message.content.substring(0, 50)}...` : message.content}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1" data-testid="text-message-time">
                    {formatTimeAgo(message.createdAt)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
