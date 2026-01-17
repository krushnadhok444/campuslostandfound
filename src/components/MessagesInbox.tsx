import { useState } from 'react';
import { useMessageNotifications } from '@/hooks/useMessageNotifications';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ChatModal } from './ChatModal';

export function MessagesInbox() {
  const { unreadCount, conversations, loading } = useMessageNotifications();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [selectedChat, setSelectedChat] = useState<{
    itemId: string;
    itemTitle: string;
    itemOwnerId: string;
  } | null>(null);

  const handleOpenChat = (conv: typeof conversations[0]) => {
    setSelectedChat({
      itemId: conv.itemId,
      itemTitle: conv.itemTitle,
      itemOwnerId: conv.itemOwnerId,
    });
    setSheetOpen(false);
  };

  return (
    <>
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="relative">
            <MessageSquare className="h-5 w-5" />
            {unreadCount > 0 && (
              <Badge
                className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs gradient-primary text-primary-foreground border-0"
              >
                {unreadCount > 9 ? '9+' : unreadCount}
              </Badge>
            )}
          </Button>
        </SheetTrigger>
        <SheetContent className="w-full sm:max-w-md">
          <SheetHeader>
            <SheetTitle className="font-heading flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Messages
              {unreadCount > 0 && (
                <Badge variant="secondary">{unreadCount} unread</Badge>
              )}
            </SheetTitle>
          </SheetHeader>

          <ScrollArea className="h-[calc(100vh-120px)] mt-4">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : conversations.length === 0 ? (
              <div className="text-center py-12">
                <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
                <p className="text-muted-foreground">No messages yet</p>
                <p className="text-sm text-muted-foreground/70 mt-1">
                  Start a conversation by contacting an item owner
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {conversations.map((conv) => (
                  <button
                    key={conv.itemId}
                    onClick={() => handleOpenChat(conv)}
                    className={cn(
                      'w-full text-left p-4 rounded-lg transition-colors hover:bg-muted/80',
                      conv.unreadCount > 0 ? 'bg-primary/5 border border-primary/20' : 'bg-muted/50'
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className={cn(
                          'font-medium truncate',
                          conv.unreadCount > 0 && 'text-primary'
                        )}>
                          {conv.itemTitle}
                        </p>
                        <p className="text-sm text-muted-foreground truncate mt-1">
                          {conv.lastMessage.message}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {format(new Date(conv.lastMessage.created_at), 'MMM d')}
                        </span>
                        {conv.unreadCount > 0 && (
                          <Badge className="gradient-primary text-primary-foreground border-0 text-xs">
                            {conv.unreadCount}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </ScrollArea>
        </SheetContent>
      </Sheet>

      {selectedChat && (
        <ChatModal
          open={!!selectedChat}
          onClose={() => setSelectedChat(null)}
          itemId={selectedChat.itemId}
          itemTitle={selectedChat.itemTitle}
          itemOwnerId={selectedChat.itemOwnerId}
        />
      )}
    </>
  );
}
