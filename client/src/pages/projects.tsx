import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckSquare, Plus, Calendar, FileText, User, Upload } from "lucide-react";
import AssignmentForm from "@/components/forms/assignment-form";

export default function Projects() {
  const { toast } = useToast();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [showAssignmentForm, setShowAssignmentForm] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

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

  const { data: courses = [] } = useQuery({
    queryKey: ['/api/courses'],
    enabled: !!isAuthenticated,
  });

  const { data: assignments = [], isLoading: assignmentsLoading } = useQuery({
    queryKey: ['/api/assignments'],
    queryFn: async () => {
      const allAssignments = [];
      for (const course of courses) {
        const response = await fetch(`/api/courses/${course.id}/assignments`);
        const courseAssignments = await response.json();
        allAssignments.push(...courseAssignments.map((a: any) => ({ ...a, courseName: course.name, courseCode: course.code })));
      }
      return allAssignments;
    },
    enabled: !!isAuthenticated && courses.length > 0,
  });

  const { data: submissions = [], isLoading: submissionsLoading } = useQuery({
    queryKey: ['/api/submissions'],
    queryFn: async () => {
      const allSubmissions = [];
      for (const assignment of assignments) {
        try {
          if (user?.role === 'student') {
            // Student sees their own submission
            const response = await fetch(`/api/assignments/${assignment.id}/submissions`);
            const assignmentSubmissions = await response.json();
            const userSubmission = assignmentSubmissions.find((s: any) => s.studentId === user.id);
            if (userSubmission) {
              allSubmissions.push({ 
                ...userSubmission, 
                assignmentTitle: assignment.title,
                courseName: assignment.courseName 
              });
            }
          } else if (user?.role === 'faculty') {
            // Faculty sees all submissions for their assignments
            const response = await fetch(`/api/assignments/${assignment.id}/submissions`);
            const assignmentSubmissions = await response.json();
            allSubmissions.push(...assignmentSubmissions.map((s: any) => ({ 
              ...s, 
              assignmentTitle: assignment.title,
              courseName: assignment.courseName 
            })));
          }
        } catch (error) {
          console.error(`Failed to fetch submissions for assignment ${assignment.id}`);
        }
      }
      return allSubmissions;
    },
    enabled: !!isAuthenticated && assignments.length > 0 && !!user,
  });

  const submitAssignmentMutation = useMutation({
    mutationFn: async ({ assignmentId, content, file }: { assignmentId: string, content: string, file?: File }) => {
      const formData = new FormData();
      formData.append('content', content);
      if (file) {
        formData.append('file', file);
      }

      const response = await fetch(`/api/assignments/${assignmentId}/submissions`, {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`${response.status}: ${response.statusText}`);
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Assignment submitted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/submissions'] });
      setSelectedFile(null);
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
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
      toast({
        title: "Error",
        description: "Failed to submit assignment",
        variant: "destructive",
      });
    },
  });

  const handleFileSubmission = (assignmentId: string, content: string) => {
    submitAssignmentMutation.mutate({ assignmentId, content, file: selectedFile || undefined });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'default';
      case 'draft':
        return 'secondary';
      case 'closed':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const getSubmissionStatusColor = (status: string) => {
    switch (status) {
      case 'submitted':
        return 'default';
      case 'pending':
        return 'secondary';
      case 'graded':
        return 'success';
      default:
        return 'secondary';
    }
  };

  const filteredAssignments = assignments.filter((assignment: any) =>
    assignment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    assignment.courseName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading projects...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-semibold text-foreground" data-testid="text-projects-title">Projects & Seminars</h1>
                <p className="text-sm text-muted-foreground">Manage assignments and track submissions</p>
              </div>
              {user?.role === 'faculty' && (
                <Button 
                  onClick={() => setShowAssignmentForm(true)}
                  className="bg-primary hover:bg-primary/90"
                  data-testid="button-new-assignment"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  New Assignment
                </Button>
              )}
            </div>

            <div className="mb-6">
              <Input
                placeholder="Search assignments and projects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-md"
                data-testid="input-search-assignments"
              />
            </div>

            <Tabs defaultValue="assignments" className="space-y-6">
              <TabsList data-testid="tabs-projects">
                <TabsTrigger value="assignments">Assignments</TabsTrigger>
                <TabsTrigger value="submissions">
                  {user?.role === 'faculty' ? 'Student Submissions' : 'My Submissions'}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="assignments" className="space-y-4">
                {assignmentsLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                      <Card key={i} className="animate-pulse">
                        <CardHeader>
                          <div className="space-y-3">
                            <div className="h-5 bg-muted rounded w-3/4"></div>
                            <div className="h-4 bg-muted rounded w-1/2"></div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            <div className="h-4 bg-muted rounded"></div>
                            <div className="h-4 bg-muted rounded w-5/6"></div>
                            <div className="h-8 bg-muted rounded w-1/3"></div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : filteredAssignments.length === 0 ? (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <CheckSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-foreground mb-2">No assignments found</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        {searchTerm ? "Try adjusting your search terms" : "No assignments have been created yet"}
                      </p>
                      {user?.role === 'faculty' && (
                        <Button onClick={() => setShowAssignmentForm(true)} data-testid="button-create-first-assignment">
                          Create Assignment
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredAssignments.map((assignment: any) => (
                      <Card key={assignment.id} className="hover:shadow-md transition-shadow" data-testid={`assignment-${assignment.id}`}>
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <CardTitle className="text-lg" data-testid="text-assignment-title">
                                {assignment.title}
                              </CardTitle>
                              <p className="text-sm text-muted-foreground" data-testid="text-assignment-course">
                                {assignment.courseCode} - {assignment.courseName}
                              </p>
                            </div>
                            <Badge variant={getStatusColor(assignment.status)} data-testid="badge-assignment-status">
                              {assignment.status}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground mb-4 line-clamp-3" data-testid="text-assignment-description">
                            {assignment.description}
                          </p>
                          
                          <div className="space-y-2 text-sm">
                            {assignment.dueDate && (
                              <div className="flex items-center space-x-2 text-muted-foreground">
                                <Calendar className="w-4 h-4" />
                                <span data-testid="text-assignment-due-date">
                                  Due: {new Date(assignment.dueDate).toLocaleDateString()}
                                </span>
                              </div>
                            )}
                            {assignment.maxPoints && (
                              <div className="flex items-center space-x-2 text-muted-foreground">
                                <CheckSquare className="w-4 h-4" />
                                <span data-testid="text-assignment-points">
                                  {assignment.maxPoints} points
                                </span>
                              </div>
                            )}
                          </div>

                          {user?.role === 'student' && (
                            <div className="mt-4 space-y-2">
                              <Input
                                type="file"
                                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                                className="text-sm"
                                data-testid="input-assignment-file"
                              />
                              <Button 
                                size="sm" 
                                className="w-full"
                                onClick={() => handleFileSubmission(assignment.id, `Submission for ${assignment.title}`)}
                                disabled={submitAssignmentMutation.isPending}
                                data-testid="button-submit-assignment"
                              >
                                <Upload className="w-4 h-4 mr-2" />
                                {submitAssignmentMutation.isPending ? "Submitting..." : "Submit"}
                              </Button>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="submissions" className="space-y-4">
                {submissionsLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Card key={i} className="animate-pulse">
                        <CardContent className="p-4">
                          <div className="space-y-3">
                            <div className="h-5 bg-muted rounded w-2/3"></div>
                            <div className="h-4 bg-muted rounded w-1/2"></div>
                            <div className="h-4 bg-muted rounded w-3/4"></div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : submissions.length === 0 ? (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-foreground mb-2">No submissions found</h3>
                      <p className="text-sm text-muted-foreground">
                        {user?.role === 'faculty' ? "No student submissions yet" : "You haven't submitted any assignments yet"}
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {submissions.map((submission: any) => (
                      <Card key={submission.id} data-testid={`submission-${submission.id}`}>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="font-medium text-foreground" data-testid="text-submission-title">
                                {submission.assignmentTitle}
                              </h4>
                              <p className="text-sm text-muted-foreground" data-testid="text-submission-course">
                                {submission.courseName}
                              </p>
                              
                              <div className="flex items-center space-x-4 text-sm text-muted-foreground mt-2">
                                <div className="flex items-center space-x-1">
                                  <User className="w-3 h-3" />
                                  <span data-testid="text-submission-student">
                                    {user?.role === 'faculty' ? 'Student ID: ' + submission.studentId : 'You'}
                                  </span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <Calendar className="w-3 h-3" />
                                  <span data-testid="text-submission-date">
                                    Submitted: {new Date(submission.submittedAt).toLocaleDateString()}
                                  </span>
                                </div>
                              </div>

                              {submission.content && (
                                <p className="text-sm text-foreground mt-2" data-testid="text-submission-content">
                                  {submission.content}
                                </p>
                              )}

                              {submission.feedback && (
                                <div className="mt-3 p-3 bg-secondary/30 rounded-lg">
                                  <p className="text-sm font-medium text-foreground">Feedback:</p>
                                  <p className="text-sm text-foreground mt-1" data-testid="text-submission-feedback">
                                    {submission.feedback}
                                  </p>
                                </div>
                              )}
                            </div>
                            
                            <div className="flex flex-col items-end space-y-2">
                              <Badge variant={getSubmissionStatusColor(submission.status)} data-testid="badge-submission-status">
                                {submission.status}
                              </Badge>
                              {submission.grade && (
                                <Badge variant="outline" data-testid="badge-submission-grade">
                                  {submission.grade} pts
                                </Badge>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>

      {/* Assignment Form Modal */}
      {showAssignmentForm && (
        <AssignmentForm
          isOpen={showAssignmentForm}
          onClose={() => setShowAssignmentForm(false)}
        />
      )}
    </div>
  );
}
