import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface ChatMessage {
  id: string;
  item_id: string;
  sender_id: string;
  receiver_id: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

interface ConversationPreview {
  itemId: string;
  itemTitle: string;
  itemOwnerId: string;
  lastMessage: ChatMessage;
  unreadCount: number;
  otherUserId: string;
}

export function useMessageNotifications() {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [conversations, setConversations] = useState<ConversationPreview[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchConversations = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Fetch all messages for the user
      const { data: messages, error: msgError } = await supabase
        .from('chat_messages')
        .select('*')
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (msgError) throw msgError;

      // Get unique item IDs
      const itemIds = [...new Set(messages?.map(m => m.item_id) || [])];

      if (itemIds.length === 0) {
        setConversations([]);
        setUnreadCount(0);
        setLoading(false);
        return;
      }

      // Fetch item details
      const { data: items, error: itemsError } = await supabase
        .from('items')
        .select('id, title, user_id')
        .in('id', itemIds);

      if (itemsError) throw itemsError;

      // Group messages by item and build conversation previews
      const convMap = new Map<string, ConversationPreview>();

      for (const msg of messages || []) {
        const item = items?.find(i => i.id === msg.item_id);
        if (!item) continue;

        const otherUserId = msg.sender_id === user.id ? msg.receiver_id : msg.sender_id;

        if (!convMap.has(msg.item_id)) {
          convMap.set(msg.item_id, {
            itemId: msg.item_id,
            itemTitle: item.title,
            itemOwnerId: item.user_id,
            lastMessage: msg,
            unreadCount: 0,
            otherUserId,
          });
        }

        // Count unread messages
        if (msg.receiver_id === user.id && !msg.is_read) {
          const conv = convMap.get(msg.item_id)!;
          conv.unreadCount++;
        }
      }

      const convList = Array.from(convMap.values());
      setConversations(convList);
      setUnreadCount(convList.reduce((acc, c) => acc + c.unreadCount, 0));
    } catch (error) {
      console.error('Error fetching conversations:', error);
    }
    setLoading(false);
  };

  // Initial fetch
  useEffect(() => {
    fetchConversations();
  }, [user]);

  // Subscribe to new messages
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel(`notifications-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'chat_messages',
        },
        (payload) => {
          const msg = payload.new as ChatMessage;
          // Refresh if user is involved
          if (msg.sender_id === user.id || msg.receiver_id === user.id) {
            fetchConversations();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return {
    unreadCount,
    conversations,
    loading,
    refetch: fetchConversations,
  };
}
