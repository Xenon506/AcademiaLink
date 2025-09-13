import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GraduationCap, Users, MessageSquare, Calendar, FileText, BarChart3 } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">Student Interaction Portal</h1>
                <p className="text-sm text-muted-foreground">Academic Management System</p>
              </div>
            </div>
            <Button 
              onClick={() => window.location.href = '/api/login'}
              className="bg-primary hover:bg-primary/90"
              data-testid="button-login"
            >
              Sign In
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
            Streamline Your
            <span className="text-primary"> Academic Experience</span>
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            A comprehensive academic management system designed to enhance communication 
            and coordination between students, faculty, and administrators.
          </p>
          <Button 
            size="lg" 
            onClick={() => window.location.href = '/api/login'}
            className="bg-primary hover:bg-primary/90 text-lg px-8 py-4"
            data-testid="button-get-started"
          >
            Get Started Today
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white/50 dark:bg-gray-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-3xl font-bold text-center text-foreground mb-12">
            Everything You Need for Academic Success
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <Users className="w-12 h-12 text-primary mb-4" />
                <h4 className="text-xl font-semibold text-foreground mb-2">Profile Management</h4>
                <p className="text-muted-foreground">
                  Role-based dashboards for Students, Faculty, Admins, and TAs with permission control.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <MessageSquare className="w-12 h-12 text-primary mb-4" />
                <h4 className="text-xl font-semibold text-foreground mb-2">Discussion Forums</h4>
                <p className="text-muted-foreground">
                  Course-wise threads with moderation tools and content search functionality.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <Calendar className="w-12 h-12 text-primary mb-4" />
                <h4 className="text-xl font-semibold text-foreground mb-2">Smart Calendar</h4>
                <p className="text-muted-foreground">
                  Visual timeline with intelligent conflict detection and notifications.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <FileText className="w-12 h-12 text-primary mb-4" />
                <h4 className="text-xl font-semibold text-foreground mb-2">Document Repository</h4>
                <p className="text-muted-foreground">
                  Course-wise upload system with version control and restricted access.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <MessageSquare className="w-12 h-12 text-primary mb-4" />
                <h4 className="text-xl font-semibold text-foreground mb-2">Real-Time Chat</h4>
                <p className="text-muted-foreground">
                  One-on-one and course-wide messaging with moderation features.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <BarChart3 className="w-12 h-12 text-primary mb-4" />
                <h4 className="text-xl font-semibold text-foreground mb-2">Analytics Dashboard</h4>
                <p className="text-muted-foreground">
                  Interactive charts showing engagement stats and participation metrics.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-3xl font-bold text-center text-foreground mb-12">
            Frequently Asked Questions
          </h3>
          <div className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <h4 className="text-lg font-semibold text-foreground mb-2">
                  How do I get access to the portal?
                </h4>
                <p className="text-muted-foreground">
                  Access is provided through your institutional email. Contact your academic administrator 
                  to set up your account with the appropriate role (Student, Faculty, Admin, or TA).
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h4 className="text-lg font-semibold text-foreground mb-2">
                  What features are available for students?
                </h4>
                <p className="text-muted-foreground">
                  Students can access course materials, participate in discussions, submit assignments, 
                  chat with peers and instructors, view their calendar, and track their progress.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h4 className="text-lg font-semibold text-foreground mb-2">
                  How does the conflict detection work?
                </h4>
                <p className="text-muted-foreground">
                  The system automatically checks for scheduling conflicts when creating new events or 
                  assignments, helping prevent overlapping deadlines and ensuring better time management.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h4 className="text-lg font-semibold text-foreground mb-2">
                  Is my data secure?
                </h4>
                <p className="text-muted-foreground">
                  Yes, we use JWT-based authentication, role-based access control, and secure data 
                  transmission to ensure your academic information remains protected.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-xl font-bold">Student Interaction Portal</h3>
          </div>
          <p className="text-gray-400 mb-4">
            Empowering academic institutions with modern communication and management tools.
          </p>
          <p className="text-sm text-gray-500">
            © 2025 Student Interaction Portal. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
