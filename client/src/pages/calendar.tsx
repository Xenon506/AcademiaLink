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
import { Label } from "@/components/ui/label";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Calendar as CalendarIcon, Plus, Clock, MapPin, AlertTriangle } from "lucide-react";
import { format, startOfMonth, endOfMonth, addMonths, subMonths } from "date-fns";

export default function Calendar() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewDate, setViewDate] = useState(new Date());
  const [showEventForm, setShowEventForm] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    startDate: new Date(),
    endDate: new Date(),
    location: "",
    courseId: ""
  });

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

  const { data: events = [], isLoading: eventsLoading } = useQuery({
    queryKey: ['/api/events', format(startOfMonth(viewDate), 'yyyy-MM-dd'), format(endOfMonth(viewDate), 'yyyy-MM-dd')],
    queryFn: () => {
      const start = startOfMonth(viewDate);
      const end = endOfMonth(viewDate);
      return fetch(`/api/events?startDate=${start.toISOString()}&endDate=${end.toISOString()}`)
        .then(res => res.json());
    },
    enabled: !!isAuthenticated,
  });

  const createEventMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/events", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Event created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/events'] });
      setShowEventForm(false);
      setFormData({
        title: "",
        description: "",
        startDate: new Date(),
        endDate: new Date(),
        location: "",
        courseId: ""
      });
    },
    onError: (error: any) => {
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
      
      if (error.message.includes('409')) {
        toast({
          title: "Schedule Conflict",
          description: "This event conflicts with existing events",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to create event",
          variant: "destructive",
        });
      }
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createEventMutation.mutate(formData);
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const getEventsForDate = (date: Date) => {
    return events.filter((event: any) => {
      const eventStart = new Date(event.startDate);
      const eventEnd = new Date(event.endDate);
      return date >= eventStart && date <= eventEnd;
    });
  };

  const dayEvents = selectedDate ? getEventsForDate(selectedDate) : [];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading calendar...</p>
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
                <h1 className="text-2xl font-semibold text-foreground" data-testid="text-calendar-title">Calendar & Timeline</h1>
                <p className="text-sm text-muted-foreground">Manage your schedule and events</p>
              </div>
              <Button 
                onClick={() => setShowEventForm(true)}
                className="bg-primary hover:bg-primary/90"
                data-testid="button-new-event"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Event
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Calendar */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>{format(viewDate, 'MMMM yyyy')}</CardTitle>
                      <div className="flex space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setViewDate(subMonths(viewDate, 1))}
                          data-testid="button-prev-month"
                        >
                          ←
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setViewDate(new Date())}
                          data-testid="button-today"
                        >
                          Today
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setViewDate(addMonths(viewDate, 1))}
                          data-testid="button-next-month"
                        >
                          →
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CalendarComponent
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      month={viewDate}
                      onMonthChange={setViewDate}
                      components={{
                        Day: ({ date, ...props }) => {
                          const dayEvents = getEventsForDate(date);
                          return (
                            <div className="relative">
                              <button {...props} />
                              {dayEvents.length > 0 && (
                                <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2">
                                  <div className="w-1 h-1 bg-primary rounded-full"></div>
                                </div>
                              )}
                            </div>
                          );
                        }
                      }}
                      data-testid="calendar-component"
                    />
                  </CardContent>
                </Card>
              </div>

              {/* Events for Selected Date */}
              <div>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <CalendarIcon className="w-5 h-5" />
                      <span>
                        {selectedDate ? format(selectedDate, 'MMM d, yyyy') : 'Select a date'}
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {eventsLoading ? (
                      <div className="space-y-3">
                        {[1, 2, 3].map((i) => (
                          <div key={i} className="animate-pulse">
                            <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                            <div className="h-3 bg-muted rounded w-1/2"></div>
                          </div>
                        ))}
                      </div>
                    ) : dayEvents.length === 0 ? (
                      <div className="text-center py-8">
                        <CalendarIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground mb-4">No events scheduled</p>
                        <Button variant="outline" size="sm" onClick={() => setShowEventForm(true)}>
                          Add Event
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {dayEvents.map((event: any) => (
                          <div key={event.id} className="p-3 bg-secondary/30 rounded-lg" data-testid={`event-${event.id}`}>
                            <h4 className="font-medium text-foreground" data-testid="text-event-title">
                              {event.title}
                            </h4>
                            <div className="flex items-center space-x-2 text-xs text-muted-foreground mt-1">
                              <Clock className="w-3 h-3" />
                              <span data-testid="text-event-time">
                                {format(new Date(event.startDate), 'HH:mm')} - {format(new Date(event.endDate), 'HH:mm')}
                              </span>
                            </div>
                            {event.location && (
                              <div className="flex items-center space-x-2 text-xs text-muted-foreground mt-1">
                                <MapPin className="w-3 h-3" />
                                <span data-testid="text-event-location">{event.location}</span>
                              </div>
                            )}
                            {event.courseId && (
                              <Badge variant="secondary" className="mt-2 text-xs">
                                Course Event
                              </Badge>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Conflict Alerts */}
                <Card className="mt-4">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2 text-destructive">
                      <AlertTriangle className="w-5 h-5" />
                      <span>Conflict Alerts</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">No scheduling conflicts detected</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Event Creation Modal */}
      {showEventForm && (
        <Dialog open={showEventForm} onOpenChange={setShowEventForm}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Event</DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="title">Event Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  placeholder="Enter event title"
                  required
                  data-testid="input-event-title"
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  placeholder="Event description"
                  rows={3}
                  data-testid="textarea-event-description"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startDate">Start Date & Time *</Label>
                  <Input
                    id="startDate"
                    type="datetime-local"
                    value={format(formData.startDate, "yyyy-MM-dd'T'HH:mm")}
                    onChange={(e) => handleInputChange("startDate", new Date(e.target.value))}
                    required
                    data-testid="input-event-start-date"
                  />
                </div>

                <div>
                  <Label htmlFor="endDate">End Date & Time *</Label>
                  <Input
                    id="endDate"
                    type="datetime-local"
                    value={format(formData.endDate, "yyyy-MM-dd'T'HH:mm")}
                    onChange={(e) => handleInputChange("endDate", new Date(e.target.value))}
                    required
                    data-testid="input-event-end-date"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => handleInputChange("location", e.target.value)}
                    placeholder="Event location"
                    data-testid="input-event-location"
                  />
                </div>

                <div>
                  <Label htmlFor="course">Course (Optional)</Label>
                  <Select 
                    value={formData.courseId} 
                    onValueChange={(value) => handleInputChange("courseId", value)}
                  >
                    <SelectTrigger data-testid="select-event-course">
                      <SelectValue placeholder="Select a course" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">No course</SelectItem>
                      {courses.map((course: any) => (
                        <SelectItem key={course.id} value={course.id}>
                          {course.code} - {course.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setShowEventForm(false)} data-testid="button-cancel-event">
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={createEventMutation.isPending}
                  data-testid="button-create-event"
                >
                  {createEventMutation.isPending ? "Creating..." : "Create Event"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
