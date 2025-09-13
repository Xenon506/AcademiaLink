import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

interface DiscussionFormProps {
  isOpen: boolean;
  onClose: () => void;
  courseId?: string;
  courses: any[];
}

export default function DiscussionForm({ isOpen, onClose, courseId, courses }: DiscussionFormProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    courseId: courseId || "",
    isGeneral: !courseId,
    isPinned: false,
  });

  const createForumMutation = useMutation({
    mutationFn: async () => {
      // First create or get the forum
      const forumResponse = await apiRequest("POST", "/api/forums", {
        title: `${formData.courseId ? courses.find(c => c.id === formData.courseId)?.name : 'General'} Discussion`,
        courseId: formData.courseId || null,
        isGeneral: formData.isGeneral,
      });
      const forum = await forumResponse.json();
      return forum;
    },
    onSuccess: async (forum) => {
      // Then create the thread
      try {
        await apiRequest("POST", `/api/forums/${forum.id}/threads`, {
          title: formData.title,
          content: formData.content,
          isPinned: formData.isPinned,
        });
        
        toast({
          title: "Success",
          description: "Discussion thread created successfully",
        });
        
        queryClient.invalidateQueries({ queryKey: ['/api/forums'] });
        queryClient.invalidateQueries({ queryKey: ['/api/activity-logs'] });
        onClose();
        setFormData({
          title: "",
          content: "",
          courseId: courseId || "",
          isGeneral: !courseId,
          isPinned: false,
        });
      } catch (error) {
        throw error;
      }
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
        description: "Failed to create discussion thread",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.content) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }
    createForumMutation.mutate();
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Start New Discussion</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Discussion Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleInputChange("title", e.target.value)}
              placeholder="Enter discussion title"
              required
              data-testid="input-discussion-title"
            />
          </div>

          <div>
            <Label htmlFor="course">Course</Label>
            <Select 
              value={formData.courseId} 
              onValueChange={(value) => {
                handleInputChange("courseId", value);
                handleInputChange("isGeneral", !value);
              }}
            >
              <SelectTrigger data-testid="select-discussion-course">
                <SelectValue placeholder="Select a course (optional for general discussion)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">General Discussion</SelectItem>
                {courses.map((course: any) => (
                  <SelectItem key={course.id} value={course.id}>
                    {course.code} - {course.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="content">Discussion Content *</Label>
            <Textarea
              id="content"
              value={formData.content}
              onChange={(e) => handleInputChange("content", e.target.value)}
              placeholder="Start your discussion here..."
              rows={6}
              required
              data-testid="textarea-discussion-content"
            />
          </div>

          {(user?.role === 'faculty' || user?.role === 'admin') && (
            <div className="flex items-center space-x-2">
              <Switch
                id="isPinned"
                checked={formData.isPinned}
                onCheckedChange={(checked) => handleInputChange("isPinned", checked)}
                data-testid="switch-pin-discussion"
              />
              <Label htmlFor="isPinned">Pin this discussion</Label>
            </div>
          )}

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} data-testid="button-cancel-discussion">
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={createForumMutation.isPending}
              data-testid="button-create-discussion"
            >
              {createForumMutation.isPending ? "Creating..." : "Start Discussion"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
