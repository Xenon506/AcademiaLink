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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  MessageCircle, 
  Users, 
  User, 
  Search, 
  Plus,
  Circle,
  Phone,
  Video,
  MoreHorizontal
} from "lucide-react";
import ChatInterface from "@/components/chat/chat-interface";

export default function Chat() {
  const { toast } = useToast();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedConversation, setSelectedConversation] = useState<any>(null);
  const [conversationType, setConversationType] = useState<'direct' | 'course' | 'group'>('direct');

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

  const { data: messages = [] } = useQuery({
    queryKey: ['/api/messages'],
    enabled: !!isAuthenticated,
  });

  // Group messages by conversation
  const conversations = messages.reduce((acc: any[], message: any) => {
    let conversationKey;
    let conversationName;
    let conversationType;
    
    if (message.courseId) {
      conversationKey = `course_${message.courseId}`;
      const course = courses.find((c: any) => c.id === message.courseId);
      conversationName = course ? `${course.code} - ${course.name}` : 'Course Chat';
      conversationType = 'course';
    } else {
      // Direct message
      const otherUserId = message.senderId === user?.id ? message.receiverId : message.senderId;
      conversationKey = `direct_${otherUserId}`;
      conversationName = message.senderId === user?.id ? 'Unknown User' : message.senderName || 'Unknown User';
      conversationType = 'direct';
    }

    let conversation = acc.find(c => c.key === conversationKey);
    if (!conversation) {
      conversation = {
        key: conversationKey,
        name: conversationName,
        type: conversationType,
        courseId: message.courseId,
        receiverId: conversationType === 'direct' ? (message.senderId === user?.id ? message.receiverId : message.senderId) : null,
        messages: [],
        lastMessage: null,
        unreadCount: 0
      };
      acc.push(conversation);
    }

    conversation.messages.push(message);
    if (!conversation.lastMessage || new Date(message.createdAt) > new Date(conversation.lastMessage.createdAt)) {
      conversation.lastMessage = message;
    }
    
    if (!message.isRead && message.receiverId === user?.id) {
      conversation.unreadCount++;
    }

    return acc;
  }, []);

  // Sort conversations by last message time
  conversations.sort((a, b) => {
    if (!a.lastMessage) return 1;
    if (!b.lastMessage) return -1;
    return new Date(b.lastMessage.createdAt).getTime() - new Date(a.lastMessage.createdAt).getTime();
  });

  const directConversations = conversations.filter(c => c.type === 'direct');
  const courseConversations = conversations.filter(c => c.type === 'course');

  const filteredConversations = (type: string) => {
    const convs = type === 'direct' ? directConversations : courseConversations;
    return convs.filter(conv =>
      conv.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const formatTime = (date: string) => {
    const messageDate = new Date(date);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - messageDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) {
      return messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInDays === 1) {
      return 'Yesterday';
    } else if (diffInDays < 7) {
      return messageDate.toLocaleDateString([], { weekday: 'short' });
    } else {
      return messageDate.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading chat...</p>
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
        
        <main className="flex-1 overflow-hidden">
          <div className="h-full flex">
            {/* Chat Sidebar */}
            <div className="w-80 border-r border-border flex flex-col bg-card">
              <div className="p-4 border-b border-border">
                <div className="flex items-center justify-between mb-4">
                  <h1 className="text-xl font-semibold text-foreground" data-testid="text-chat-title">
                    Messages
                  </h1>
                  <Button size="sm" variant="outline" data-testid="button-new-chat">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Search conversations..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                    data-testid="input-search-conversations"
                  />
                </div>
              </div>

              <Tabs defaultValue="direct" className="flex-1 flex flex-col">
                <div className="px-4 pt-4">
                  <TabsList className="grid w-full grid-cols-2" data-testid="tabs-chat-type">
                    <TabsTrigger value="direct">Direct</TabsTrigger>
                    <TabsTrigger value="course">Courses</TabsTrigger>
                  </TabsList>
                </div>

                <TabsContent value="direct" className="flex-1 overflow-hidden mt-4">
                  <div className="h-full overflow-y-auto">
                    {filteredConversations('direct').length === 0 ? (
                      <div className="p-4 text-center">
                        <MessageCircle className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">
                          {searchTerm ? "No conversations found" : "No direct messages yet"}
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-1 px-2">
                        {filteredConversations('direct').map((conversation) => (
                          <div
                            key={conversation.key}
                            className={`p-3 rounded-lg cursor-pointer transition-colors ${
                              selectedConversation?.key === conversation.key
                                ? 'bg-primary/10 border-primary/20'
                                : 'hover:bg-secondary/50'
                            }`}
                            onClick={() => {
                              setSelectedConversation(conversation);
                              setConversationType('direct');
                            }}
                            data-testid={`conversation-${conversation.key}`}
                          >
                            <div className="flex items-start space-x-3">
                              <div className="relative">
                                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                                  <User className="w-5 h-5 text-primary" />
                                </div>
                                <Circle className="absolute -bottom-1 -right-1 w-3 h-3 text-green-500 fill-current" />
                              </div>
                              
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                  <h4 className="font-medium text-foreground truncate" data-testid="text-conversation-name">
                                    {conversation.name}
                                  </h4>
                                  {conversation.lastMessage && (
                                    <span className="text-xs text-muted-foreground" data-testid="text-conversation-time">
                                      {formatTime(conversation.lastMessage.createdAt)}
                                    </span>
                                  )}
                                </div>
                                
                                <div className="flex items-center justify-between">
                                  <p className="text-sm text-muted-foreground truncate" data-testid="text-conversation-preview">
                                    {conversation.lastMessage?.content || "No messages yet"}
                                  </p>
                                  {conversation.unreadCount > 0 && (
                                    <Badge variant="destructive" className="text-xs h-5 px-2">
                                      {conversation.unreadCount}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="course" className="flex-1 overflow-hidden mt-4">
                  <div className="h-full overflow-y-auto">
                    {/* Show available courses for chat */}
                    <div className="space-y-1 px-2">
                      {courses.map((course: any) => {
                        const courseConv = courseConversations.find(c => c.courseId === course.id);
                        
                        return (
                          <div
                            key={`course_${course.id}`}
                            className={`p-3 rounded-lg cursor-pointer transition-colors ${
                              selectedConversation?.courseId === course.id
                                ? 'bg-primary/10 border-primary/20'
                                : 'hover:bg-secondary/50'
                            }`}
                            onClick={() => {
                              setSelectedConversation({
                                key: `course_${course.id}`,
                                name: `${course.code} - ${course.name}`,
                                type: 'course',
                                courseId: course.id,
                                receiverId: null,
                                ...courseConv
                              });
                              setConversationType('course');
                            }}
                            data-testid={`course-chat-${course.id}`}
                          >
                            <div className="flex items-start space-x-3">
                              <div className="w-10 h-10 bg-chart-2/10 rounded-full flex items-center justify-center">
                                <Users className="w-5 h-5 text-chart-2" />
                              </div>
                              
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                  <h4 className="font-medium text-foreground truncate" data-testid="text-course-name">
                                    {course.code}
                                  </h4>
                                  {courseConv?.lastMessage && (
                                    <span className="text-xs text-muted-foreground">
                                      {formatTime(courseConv.lastMessage.createdAt)}
                                    </span>
                                  )}
                                </div>
                                
                                <div className="flex items-center justify-between">
                                  <p className="text-sm text-muted-foreground truncate">
                                    {courseConv?.lastMessage?.content || course.name}
                                  </p>
                                  {courseConv?.unreadCount > 0 && (
                                    <Badge variant="destructive" className="text-xs h-5 px-2">
                                      {courseConv.unreadCount}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col">
              {selectedConversation ? (
                <>
                  {/* Chat Header */}
                  <div className="p-4 border-b border-border bg-card">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                          {conversationType === 'course' ? (
                            <Users className="w-5 h-5 text-primary" />
                          ) : (
                            <User className="w-5 h-5 text-primary" />
                          )}
                        </div>
                        <div>
                          <h2 className="font-semibold text-foreground" data-testid="text-chat-header-name">
                            {selectedConversation.name}
                          </h2>
                          <p className="text-xs text-muted-foreground">
                            {conversationType === 'course' ? 'Course Discussion' : 'Direct Message'}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {conversationType === 'direct' && (
                          <>
                            <Button variant="ghost" size="sm" data-testid="button-voice-call">
                              <Phone className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm" data-testid="button-video-call">
                              <Video className="w-4 h-4" />
                            </Button>
                          </>
                        )}
                        <Button variant="ghost" size="sm" data-testid="button-chat-options">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Chat Interface */}
                  <div className="flex-1">
                    <ChatInterface
                      courseId={conversationType === 'course' ? selectedConversation.courseId : undefined}
                      receiverId={conversationType === 'direct' ? selectedConversation.receiverId : undefined}
                      type={conversationType}
                    />
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center bg-muted/20">
                  <div className="text-center">
                    <MessageCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-foreground mb-2">
                      Select a conversation
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Choose a conversation from the sidebar to start messaging
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
