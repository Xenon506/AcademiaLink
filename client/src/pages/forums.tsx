import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useQuery } from "@tanstack/react-query";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Plus, Search, Pin, Lock, Users, Clock } from "lucide-react";
import DiscussionForm from "@/components/forms/discussion-form";

export default function Forums() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCourse, setSelectedCourse] = useState<string>("");
  const [showNewDiscussion, setShowNewDiscussion] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  const { data: courses = [], isLoading: coursesLoading } = useQuery({
    queryKey: ['/api/courses'],
    enabled: !!isAuthenticated,
  });

  const { data: forums = [], isLoading: forumsLoading } = useQuery({
    queryKey: ['/api/forums', selectedCourse],
    enabled: !!isAuthenticated,
  });

  const { data: threads = [], isLoading: threadsLoading } = useQuery({
    queryKey: ['/api/forums/threads', selectedCourse],
    enabled: !!isAuthenticated && !!selectedCourse,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading forums...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const filteredThreads = threads.filter((thread: any) =>
    thread.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    thread.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-semibold text-foreground" data-testid="text-forums-title">Discussion Forums</h1>
                <p className="text-sm text-muted-foreground">Participate in course discussions and ask questions</p>
              </div>
              <Button 
                onClick={() => setShowNewDiscussion(true)}
                className="bg-primary hover:bg-primary/90"
                data-testid="button-new-discussion"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Discussion
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Sidebar - Course Selection */}
              <div className="lg:col-span-1">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Courses</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Button
                      variant={selectedCourse === "" ? "default" : "ghost"}
                      onClick={() => setSelectedCourse("")}
                      className="w-full justify-start"
                      data-testid="button-all-courses"
                    >
                      <MessageSquare className="w-4 h-4 mr-2" />
                      All Forums
                    </Button>
                    
                    {coursesLoading ? (
                      <div className="space-y-2">
                        {[1, 2, 3].map((i) => (
                          <div key={i} className="h-10 bg-muted animate-pulse rounded-md"></div>
                        ))}
                      </div>
                    ) : (
                      courses.map((course: any) => (
                        <Button
                          key={course.id}
                          variant={selectedCourse === course.id ? "default" : "ghost"}
                          onClick={() => setSelectedCourse(course.id)}
                          className="w-full justify-start"
                          data-testid={`button-course-${course.id}`}
                        >
                          <div className="truncate">
                            <div className="font-medium text-sm">{course.code}</div>
                            <div className="text-xs text-muted-foreground truncate">{course.name}</div>
                          </div>
                        </Button>
                      ))
                    )}
                  </CardContent>
                </Card>

                {/* Forum Stats */}
                <Card className="mt-4">
                  <CardHeader>
                    <CardTitle className="text-base">Forum Stats</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Total Forums</span>
                        <span className="font-medium" data-testid="stat-total-forums">{forums.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Active Discussions</span>
                        <span className="font-medium" data-testid="stat-active-discussions">{threads.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Your Posts</span>
                        <span className="font-medium" data-testid="stat-user-posts">-</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Main Content */}
              <div className="lg:col-span-3">
                {/* Search Bar */}
                <div className="relative mb-6">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Search discussions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                    data-testid="input-search-discussions"
                  />
                </div>

                {/* Discussion Threads */}
                <div className="space-y-4">
                  {threadsLoading ? (
                    <div className="space-y-4">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <Card key={i}>
                          <CardContent className="p-4">
                            <div className="space-y-3 animate-pulse">
                              <div className="h-5 bg-muted rounded w-3/4"></div>
                              <div className="h-4 bg-muted rounded w-full"></div>
                              <div className="h-4 bg-muted rounded w-1/2"></div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : filteredThreads.length === 0 ? (
                    <Card>
                      <CardContent className="p-8 text-center">
                        <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-foreground mb-2">No discussions found</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          {searchTerm ? "Try adjusting your search terms" : "Be the first to start a discussion"}
                        </p>
                        <Button onClick={() => setShowNewDiscussion(true)} data-testid="button-start-discussion">
                          Start Discussion
                        </Button>
                      </CardContent>
                    </Card>
                  ) : (
                    filteredThreads.map((thread: any) => (
                      <Card key={thread.id} className="hover:shadow-md transition-shadow cursor-pointer">
                        <CardContent className="p-4" data-testid={`thread-${thread.id}`}>
                          <div className="flex items-start space-x-4">
                            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                              <MessageSquare className="w-6 h-6 text-primary" />
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-2 mb-1">
                                {thread.isPinned && (
                                  <Pin className="w-4 h-4 text-accent" />
                                )}
                                {thread.isLocked && (
                                  <Lock className="w-4 h-4 text-muted-foreground" />
                                )}
                                <h3 className="font-medium text-foreground truncate" data-testid="text-thread-title">
                                  {thread.title}
                                </h3>
                              </div>
                              
                              <p className="text-sm text-muted-foreground mb-3 line-clamp-2" data-testid="text-thread-content">
                                {thread.content}
                              </p>
                              
                              <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                                <div className="flex items-center space-x-1">
                                  <Users className="w-3 h-3" />
                                  <span data-testid="text-thread-author">By {thread.authorId}</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <Clock className="w-3 h-3" />
                                  <span data-testid="text-thread-time">
                                    {new Date(thread.createdAt).toLocaleDateString()}
                                  </span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <MessageSquare className="w-3 h-3" />
                                  <span data-testid="text-thread-replies">0 replies</span>
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex flex-col items-end space-y-1">
                              {thread.isPinned && (
                                <Badge variant="secondary" className="text-xs">
                                  Pinned
                                </Badge>
                              )}
                              {thread.isLocked && (
                                <Badge variant="outline" className="text-xs">
                                  Locked
                                </Badge>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* New Discussion Modal */}
      {showNewDiscussion && (
        <DiscussionForm
          isOpen={showNewDiscussion}
          onClose={() => setShowNewDiscussion(false)}
          courseId={selectedCourse}
          courses={courses}
        />
      )}
    </div>
  );
}
