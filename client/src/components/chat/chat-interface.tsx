import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useWebSocket } from "@/hooks/useWebSocket";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { User, Send, Circle } from "lucide-react";

interface ChatInterfaceProps {
  courseId?: string;
  receiverId?: string;
  type?: 'direct' | 'course' | 'group';
}

export default function ChatInterface({ courseId, receiverId, type = 'direct' }: ChatInterfaceProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const { isConnected, messages: wsMessages, sendMessage } = useWebSocket();
  const [message, setMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: messages = [], isLoading } = useQuery({
    queryKey: ['/api/messages', courseId, receiverId],
    queryFn: () => {
      const params = new URLSearchParams();
      if (courseId) params.set('courseId', courseId);
      if (receiverId) params.set('receiverId', receiverId);
      return fetch(`/api/messages?${params}`).then(res => res.json());
    },
    enabled: !!user,
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/messages", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/messages'] });
      setMessage("");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    },
  });

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    const messageData = {
      content: message.trim(),
      type,
      receiverId,
      courseId,
      senderId: user?.id,
      messageType: type
    };

    // Send via WebSocket for real-time delivery
    sendMessage({
      type: 'message',
      ...messageData
    });

    // Also send via HTTP API for persistence
    sendMessageMutation.mutate(messageData);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, wsMessages]);

  const formatTime = (date: string) => {
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const allMessages = [...messages, ...wsMessages.filter(msg => msg.type === 'new_message').map(msg => msg.message)];
  const sortedMessages = allMessages.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  return (
    <Card className="h-full flex flex-col" data-testid="chat-interface">
      <CardHeader className="flex-shrink-0">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            {type === 'course' ? (
              <>
                <span>Course Chat</span>
                <Badge variant="secondary">Group</Badge>
              </>
            ) : (
              <>
                <span>Direct Message</span>
                <Badge variant="secondary">Private</Badge>
              </>
            )}
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Circle className={`w-3 h-3 ${isConnected ? 'text-green-500 fill-current' : 'text-gray-400'}`} />
            <span className="text-xs text-muted-foreground">
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0">
        <ScrollArea className="flex-1 p-4">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex space-x-3 animate-pulse">
                  <div className="w-8 h-8 bg-muted rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-muted rounded w-1/4"></div>
                    <div className="h-10 bg-muted rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : sortedMessages.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No messages yet</p>
              <p className="text-sm text-muted-foreground mt-2">Start the conversation!</p>
            </div>
          ) : (
            <div className="space-y-4" data-testid="messages-container">
              {sortedMessages.map((msg: any, index: number) => {
                const isOwn = msg.senderId === user?.id;
                const showAvatar = index === 0 || sortedMessages[index - 1]?.senderId !== msg.senderId;
                
                return (
                  <div 
                    key={msg.id || index}
                    className={`flex space-x-3 ${isOwn ? 'justify-end' : 'justify-start'}`}
                    data-testid={`message-${msg.id || index}`}
                  >
                    {!isOwn && showAvatar && (
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-primary" />
                      </div>
                    )}
                    {!isOwn && !showAvatar && <div className="w-8" />}
                    
                    <div className={`max-w-xs lg:max-w-md ${isOwn ? 'order-1' : ''}`}>
                      {showAvatar && (
                        <p className="text-xs text-muted-foreground mb-1" data-testid="message-sender">
                          {isOwn ? 'You' : (msg.senderName || 'Unknown User')}
                        </p>
                      )}
                      <div 
                        className={`rounded-lg px-3 py-2 ${
                          isOwn 
                            ? 'bg-primary text-primary-foreground' 
                            : 'bg-muted text-foreground'
                        }`}
                      >
                        <p className="text-sm" data-testid="message-content">{msg.content}</p>
                        <p className={`text-xs mt-1 ${isOwn ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                          {formatTime(msg.createdAt)}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
          )}
        </ScrollArea>

        <div className="border-t p-4">
          <form onSubmit={handleSendMessage} className="flex space-x-2">
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-1"
              disabled={sendMessageMutation.isPending || !isConnected}
              data-testid="input-message"
            />
            <Button 
              type="submit" 
              disabled={!message.trim() || sendMessageMutation.isPending || !isConnected}
              data-testid="button-send-message"
            >
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </div>
      </CardContent>
    </Card>
  );
}
