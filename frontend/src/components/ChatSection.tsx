import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send } from 'lucide-react';
import { useGetMessages, useSendMessage } from '../hooks/useQueries';

export default function ChatSection() {
  const [message, setMessage] = useState('');
  const [senderName, setSenderName] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { data: messages, isLoading } = useGetMessages();
  const sendMessageMutation = useSendMessage();

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load sender name from localStorage
  useEffect(() => {
    const savedName = localStorage.getItem('camperName');
    if (savedName) {
      setSenderName(savedName);
    }
  }, []);

  const handleSendMessage = async () => {
    if (!message.trim() || !senderName.trim()) return;

    try {
      await sendMessageMutation.mutateAsync({
        sender: senderName,
        content: message.trim(),
      });
      setMessage('');
      // Scroll to bottom after sending message
      setTimeout(scrollToBottom, 100);
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTimestamp = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1000000); // Convert nanoseconds to milliseconds
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (!senderName) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-foreground">Chat</h2>
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <p className="text-muted-foreground">
                Please set your name in the Profile section before joining the chat.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Chat</h2>
        <p className="text-muted-foreground">Connect with fellow campers</p>
      </div>

      <Card className="h-[600px] flex flex-col">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Campsite Chat</CardTitle>
        </CardHeader>
        
        {/* Message input moved to top */}
        <div className="px-6 pb-4">
          <div className="flex space-x-2">
            <Input
              placeholder="Type your message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={sendMessageMutation.isPending}
            />
            <Button
              onClick={handleSendMessage}
              disabled={!message.trim() || sendMessageMutation.isPending}
              size="icon"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <CardContent className="flex-1 flex flex-col pt-0">
          <ScrollArea className="flex-1 pr-4">
            <div className="space-y-4 pb-4">
              {isLoading ? (
                <div className="text-center text-muted-foreground">Loading messages...</div>
              ) : messages && messages.length > 0 ? (
                <>
                  {messages.map((msg, index) => (
                    <div key={index} className="flex space-x-3">
                      <Avatar className="w-8 h-8">
                        <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                          {msg.sender.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-sm">{msg.sender}</span>
                          <span className="text-xs text-muted-foreground">
                            {formatTimestamp(msg.timestamp)}
                          </span>
                        </div>
                        <p className="text-sm text-foreground break-words">{msg.content}</p>
                      </div>
                    </div>
                  ))}
                  {/* Invisible element to scroll to */}
                  <div ref={messagesEndRef} />
                </>
              ) : (
                <div className="text-center text-muted-foreground">
                  No messages yet. Start the conversation!
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
