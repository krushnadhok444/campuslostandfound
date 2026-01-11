import { Item } from '@/types/item';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Clock, MessageCircle, Package, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface ItemCardProps {
  item: Item;
  onContact: (item: Item) => void;
}

export function ItemCard({ item, onContact }: ItemCardProps) {
  const { user } = useAuth();
  
  const statusConfig = {
    lost: {
      label: 'Lost',
      className: 'gradient-lost text-lost-foreground',
      dotClass: 'bg-lost',
    },
    found: {
      label: 'Found',
      className: 'gradient-found text-found-foreground',
      dotClass: 'bg-found',
    },
    claimed: {
      label: 'Claimed',
      className: 'bg-claimed text-claimed-foreground',
      dotClass: 'bg-claimed',
    },
  };

  const status = statusConfig[item.status];

  const handleDelete = async () => {
    try {
      const { error } = await supabase
        .from('items')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', item.id);

      if (error) throw error;
      toast.success('Item moved to Recently Deleted');
    } catch (error) {
      console.error('Error deleting item:', error);
      toast.error('Failed to delete item');
    }
  };

  const isOwner = user?.id === item.user_id;

  return (
    <Card className="group overflow-hidden border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
      {/* Image Section */}
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        {item.image_url ? (
          <img
            src={item.image_url}
            alt={item.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-muted to-muted/50">
            <Package className="h-12 w-12 text-muted-foreground/40" />
          </div>
        )}
        
        {/* Status Badge */}
        <div className="absolute top-3 left-3">
          <Badge className={cn('font-semibold px-3 py-1 shadow-lg', status.className)}>
            <span className={cn('h-2 w-2 rounded-full mr-2', status.dotClass)} />
            {status.label}
          </Badge>
        </div>

        {/* Category Badge */}
        <div className="absolute top-3 right-3">
          <Badge variant="secondary" className="bg-background/80 backdrop-blur-sm">
            {item.category}
          </Badge>
        </div>
      </div>

      <CardHeader className="p-4 pb-2">
        <h3 className="font-heading text-lg font-semibold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
          {item.title}
        </h3>
      </CardHeader>

      <CardContent className="p-4 pt-0 space-y-3">
        {item.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {item.description}
          </p>
        )}

        <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <MapPin className="h-4 w-4 text-primary" />
            <span>{item.location}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>{formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}</span>
          </div>
        </div>

        <div className="flex gap-2 mt-2">
          {item.status !== 'claimed' && (
            <Button
              onClick={() => onContact(item)}
              className="flex-1 gradient-primary text-primary-foreground hover:opacity-90 transition-opacity"
            >
              <MessageCircle className="mr-2 h-4 w-4" />
              Contact {item.status === 'lost' ? 'Owner' : 'Finder'}
            </Button>
          )}
          
          {isOwner && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="shrink-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete this item?</AlertDialogTitle>
                  <AlertDialogDescription>
                    The item will be moved to Recently Deleted and automatically removed after 3 days.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDelete}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
