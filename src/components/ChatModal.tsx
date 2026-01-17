import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface ChatMessage {
  id: string;
  item_id: string;
  sender_id: string;
  receiver_id: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

interface ChatModalProps {
  open: boolean;
  onClose: () => void;
  itemId: string;
  itemTitle: string;
  itemOwnerId: string;
}

export function ChatModal({ open, onClose, itemId, itemTitle, itemOwnerId }: ChatModalProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const isOwner = user?.id === itemOwnerId;
  const otherUserId = isOwner ? null : itemOwnerId;

  // Fetch existing messages
  useEffect(() => {
    if (!open || !user || !itemId) return;

    const fetchMessages = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('item_id', itemId)
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching messages:', error);
        toast.error('Failed to load messages');
      } else {
        setMessages(data || []);
      }
      setLoading(false);
    };

    fetchMessages();

    // Mark unread messages as read
    supabase
      .from('chat_messages')
      .update({ is_read: true })
      .eq('item_id', itemId)
      .eq('receiver_id', user.id)
      .eq('is_read', false)
      .then();

  }, [open, user, itemId]);

  // Subscribe to new messages
  useEffect(() => {
    if (!open || !user || !itemId) return;

    const channel = supabase
      .channel(`chat-${itemId}-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `item_id=eq.${itemId}`,
        },
        (payload) => {
          const newMsg = payload.new as ChatMessage;
          // Only add if user is participant
          if (newMsg.sender_id === user.id || newMsg.receiver_id === user.id) {
            setMessages((prev) => {
              // Avoid duplicates
              if (prev.find(m => m.id === newMsg.id)) return prev;
              return [...prev, newMsg];
            });
            
            // Mark as read if we're the receiver
            if (newMsg.receiver_id === user.id) {
              supabase
                .from('chat_messages')
                .update({ is_read: true })
                .eq('id', newMsg.id)
                .then();
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [open, user, itemId]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSend = async () => {
    if (!newMessage.trim() || !user || sending) return;

    // Determine the receiver
    let receiverId = otherUserId;
    
    // If user is owner, find the other participant from messages
    if (isOwner && messages.length > 0) {
      const otherParticipant = messages.find(m => m.sender_id !== user.id);
      receiverId = otherParticipant?.sender_id || null;
    }

    if (!receiverId) {
      toast.error('Cannot send message - no recipient found');
      return;
    }

    setSending(true);
    const { error } = await supabase.from('chat_messages').insert({
      item_id: itemId,
      sender_id: user.id,
      receiver_id: receiverId,
      message: newMessage.trim(),
    });

    if (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    } else {
      setNewMessage('');
    }
    setSending(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md h-[500px] flex flex-col">
        <DialogHeader>
          <DialogTitle className="font-heading text-lg truncate">
            Chat about: {itemTitle}
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-3">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : messages.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No messages yet. Start the conversation!
              </p>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={cn(
                    'flex flex-col max-w-[80%] rounded-lg p-3',
                    msg.sender_id === user?.id
                      ? 'ml-auto bg-primary text-primary-foreground'
                      : 'bg-muted'
                  )}
                >
                  <p className="text-sm break-words">{msg.message}</p>
                  <span
                    className={cn(
                      'text-xs mt-1',
                      msg.sender_id === user?.id
                        ? 'text-primary-foreground/70'
                        : 'text-muted-foreground'
                    )}
                  >
                    {format(new Date(msg.created_at), 'MMM d, h:mm a')}
                  </span>
                </div>
              ))
            )}
            <div ref={scrollRef} />
          </div>
        </ScrollArea>

        <div className="flex gap-2 pt-2 border-t">
          <Input
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={sending}
          />
          <Button onClick={handleSend} disabled={sending || !newMessage.trim()}>
            {sending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
