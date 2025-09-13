import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, MessageSquare, Settings, MessageCircle } from "lucide-react";
import { Link } from "wouter";

export default function CourseOverview() {
  const { user } = useAuth();

  const { data: courses = [], isLoading } = useQuery({
    queryKey: ['/api/courses'],
    enabled: !!user,
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Active Courses</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="border border-border rounded-lg p-4 animate-pulse">
                <div className="space-y-3">
                  <div className="h-5 bg-muted rounded w-2/3"></div>
                  <div className="h-4 bg-muted rounded w-full"></div>
                  <div className="h-4 bg-muted rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card data-testid="course-overview">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Active Courses</CardTitle>
          <Link href="/courses">
            <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80">
              View All →
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        {courses.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">No courses found</p>
            <Button variant="outline" data-testid="button-browse-courses">
              Browse Courses
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {courses.slice(0, 3).map((course: any) => (
              <div 
                key={course.id} 
                className="border border-border rounded-lg p-4 hover:border-primary/50 transition-colors"
                data-testid={`course-card-${course.id}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h4 className="font-medium text-foreground" data-testid="text-course-name">
                        {course.name}
                      </h4>
                      <Badge 
                        variant={course.status === 'active' ? 'default' : 'secondary'}
                        className="text-xs"
                        data-testid="badge-course-status"
                      >
                        {course.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3" data-testid="text-course-details">
                      {course.code} • {course.semester} {course.year}
                    </p>
                    
                    <div className="flex items-center space-x-4 text-sm">
                      <span className="flex items-center text-muted-foreground">
                        <Calendar className="w-4 h-4 mr-1" />
                        <span data-testid="text-next-deadline">Next assignment due soon</span>
                      </span>
                      <span className="flex items-center text-muted-foreground">
                        <MessageSquare className="w-4 h-4 mr-1" />
                        <span data-testid="text-unread-messages">New messages</span>
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="p-2 text-muted-foreground hover:text-foreground hover:bg-secondary"
                      data-testid="button-course-chat"
                    >
                      <MessageCircle className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="p-2 text-muted-foreground hover:text-foreground hover:bg-secondary"
                      data-testid="button-course-settings"
                    >
                      <Settings className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
