import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Calendar, Upload, MessageSquare, BarChart3 } from "lucide-react";
import { Link } from "wouter";
import AssignmentForm from "@/components/forms/assignment-form";

export default function QuickActions() {
  const [showAssignmentForm, setShowAssignmentForm] = useState(false);

  const actions = [
    {
      title: "Create Assignment",
      icon: Plus,
      color: "primary",
      action: () => setShowAssignmentForm(true),
      testId: "button-create-assignment"
    },
    {
      title: "Schedule Event",
      icon: Calendar,
      color: "secondary",
      href: "/calendar",
      testId: "button-schedule-event"
    },
    {
      title: "Upload Material",
      icon: Upload,
      color: "secondary",
      href: "/documents",
      testId: "button-upload-material"
    },
    {
      title: "Start Discussion",
      icon: MessageSquare,
      color: "secondary",
      href: "/forums",
      testId: "button-start-discussion"
    },
    {
      title: "View Analytics",
      icon: BarChart3,
      color: "secondary",
      href: "/analytics",
      testId: "button-view-analytics"
    }
  ];

  return (
    <>
      <Card data-testid="quick-actions">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {actions.map((action, index) => {
              const ActionButton = (
                <Button
                  key={index}
                  variant={action.color === "primary" ? "default" : "secondary"}
                  className={`w-full justify-start ${
                    action.color === "primary" 
                      ? 'bg-primary/5 hover:bg-primary/10 border border-primary/20 text-primary' 
                      : 'bg-secondary hover:bg-secondary/80'
                  }`}
                  onClick={action.action}
                  data-testid={action.testId}
                >
                  <action.icon className="w-5 h-5 mr-3" />
                  {action.title}
                </Button>
              );

              return action.href ? (
                <Link key={index} href={action.href}>
                  {ActionButton}
                </Link>
              ) : (
                ActionButton
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Assignment Form Modal */}
      {showAssignmentForm && (
        <AssignmentForm
          isOpen={showAssignmentForm}
          onClose={() => setShowAssignmentForm(false)}
        />
      )}
    </>
  );
}
