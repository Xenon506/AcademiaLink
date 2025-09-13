import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";

interface AssignmentFormProps {
  isOpen: boolean;
  onClose: () => void;
  courseId?: string;
}

export default function AssignmentForm({ isOpen, onClose, courseId }: AssignmentFormProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    instructions: "",
    courseId: courseId || "",
    dueDate: undefined as Date | undefined,
    maxPoints: 100,
  });

  const { data: courses = [] } = useQuery({
    queryKey: ['/api/courses'],
    enabled: !!user && user.role === 'faculty',
  });

  const createAssignmentMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", `/api/courses/${data.courseId}/assignments`, {
        title: data.title,
        description: data.description,
        instructions: data.instructions,
        dueDate: data.dueDate?.toISOString(),
        maxPoints: data.maxPoints,
        status: 'published'
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Assignment created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/courses'] });
      queryClient.invalidateQueries({ queryKey: ['/api/activity-logs'] });
      onClose();
      setFormData({
        title: "",
        description: "",
        instructions: "",
        courseId: courseId || "",
        dueDate: undefined,
        maxPoints: 100,
      });
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
        description: "Failed to create assignment",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.courseId) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }
    createAssignmentMutation.mutate(formData);
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create New Assignment</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title">Assignment Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                placeholder="Enter assignment title"
                required
                data-testid="input-assignment-title"
              />
            </div>
            
            <div>
              <Label htmlFor="course">Course *</Label>
              <Select 
                value={formData.courseId} 
                onValueChange={(value) => handleInputChange("courseId", value)}
              >
                <SelectTrigger data-testid="select-assignment-course">
                  <SelectValue placeholder="Select a course" />
                </SelectTrigger>
                <SelectContent>
                  {courses.map((course: any) => (
                    <SelectItem key={course.id} value={course.id}>
                      {course.code} - {course.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Brief description of the assignment"
              rows={3}
              data-testid="textarea-assignment-description"
            />
          </div>

          <div>
            <Label htmlFor="instructions">Instructions</Label>
            <Textarea
              id="instructions"
              value={formData.instructions}
              onChange={(e) => handleInputChange("instructions", e.target.value)}
              placeholder="Detailed instructions for students"
              rows={4}
              data-testid="textarea-assignment-instructions"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Due Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                    data-testid="button-assignment-due-date"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.dueDate ? format(formData.dueDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.dueDate}
                    onSelect={(date) => handleInputChange("dueDate", date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <Label htmlFor="maxPoints">Maximum Points</Label>
              <Input
                id="maxPoints"
                type="number"
                value={formData.maxPoints}
                onChange={(e) => handleInputChange("maxPoints", parseInt(e.target.value))}
                min="1"
                max="1000"
                data-testid="input-assignment-max-points"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} data-testid="button-cancel-assignment">
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={createAssignmentMutation.isPending}
              data-testid="button-create-assignment"
            >
              {createAssignmentMutation.isPending ? "Creating..." : "Create Assignment"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
