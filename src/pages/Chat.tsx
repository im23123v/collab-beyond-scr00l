import { useState, useRef, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useMessages } from '@/hooks/useMessages';
import { useProfiles } from '@/hooks/useProfiles';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Send, MessageCircle } from 'lucide-react';
import { format } from 'date-fns';

export default function Chat() {
  const { user, isAdmin } = useAuth();
  const { profiles, adminProfile } = useProfiles();
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // For non-admins, auto-select admin (vishwa)
  useEffect(() => {
    if (!isAdmin && adminProfile && !selectedUserId) {
      setSelectedUserId(adminProfile.user_id);
    }
  }, [isAdmin, adminProfile, selectedUserId]);

  const { messages, sendMessage } = useMessages(selectedUserId || undefined);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!message.trim() || !selectedUserId) return;
    sendMessage.mutate({ content: message, receiverId: selectedUserId });
    setMessage('');
  };

  // Admin sees all other users, non-admins only see vishwa (admin)
  const chatPartners = isAdmin 
    ? profiles.filter(p => p.user_id !== user?.id)
    : adminProfile ? [adminProfile] : [];

  const selectedProfile = profiles.find(p => p.user_id === selectedUserId);

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in h-[calc(100vh-12rem)]">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Chat</h1>
          <p className="text-muted-foreground">
            {isAdmin ? 'Message your team members' : 'Chat with Vishwa'}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-4 h-[calc(100%-5rem)]">
          {/* Contacts */}
          <Card className="glass md:col-span-1">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Contacts</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {chatPartners.map(profile => (
                <button
                  key={profile.id}
                  onClick={() => setSelectedUserId(profile.user_id)}
                  className={`w-full p-3 rounded-lg text-left transition-colors ${
                    selectedUserId === profile.user_id 
                      ? 'bg-primary/10 text-primary' 
                      : 'hover:bg-muted'
                  }`}
                >
                  <p className="font-medium">{profile.display_name}</p>
                  <p className="text-xs text-muted-foreground">@{profile.username}</p>
                </button>
              ))}
              {chatPartners.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No contacts available
                </p>
              )}
            </CardContent>
          </Card>

          {/* Messages */}
          <Card className="glass md:col-span-2 flex flex-col">
            <CardHeader className="pb-2 border-b">
              <CardTitle className="text-sm flex items-center gap-2">
                <MessageCircle className="h-4 w-4" />
                {selectedProfile ? selectedProfile.display_name : 'Select a contact'}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin">
              {messages.map(msg => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-2xl ${
                      msg.sender_id === user?.id
                        ? 'gradient-primary text-primary-foreground rounded-br-sm'
                        : 'bg-muted rounded-bl-sm'
                    }`}
                  >
                    <p className="text-sm">{msg.content}</p>
                    <p className="text-xs opacity-70 mt-1">
                      {format(new Date(msg.created_at), 'HH:mm')}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </CardContent>
            <div className="p-4 border-t">
              <div className="flex gap-2">
                <Input
                  placeholder="Type a message..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  disabled={!selectedUserId}
                />
                <Button onClick={handleSend} className="gradient-primary" disabled={!selectedUserId || !message.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
