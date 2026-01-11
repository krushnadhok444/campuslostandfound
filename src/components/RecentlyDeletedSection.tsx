import { useState, useEffect } from 'react';
import { Item } from '@/types/item';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Clock, Trash2, Package, RotateCcw, ChevronDown, ChevronUp } from 'lucide-react';
import { formatDistanceToNow, differenceInDays, differenceInHours } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
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

export function RecentlyDeletedSection() {
  const { user } = useAuth();
  const [deletedItems, setDeletedItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (user) {
      fetchDeletedItems();
      
      // Set up realtime subscription
      const channel = supabase
        .channel('deleted-items-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'items',
            filter: `user_id=eq.${user.id}`,
          },
          () => {
            fetchDeletedItems();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    } else {
      setDeletedItems([]);
      setLoading(false);
    }
  }, [user]);

  const fetchDeletedItems = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('items')
        .select('*')
        .eq('user_id', user.id)
        .not('deleted_at', 'is', null)
        .order('deleted_at', { ascending: false });

      if (error) throw error;
      
      setDeletedItems((data as unknown as Item[]) || []);
    } catch (error) {
      console.error('Error fetching deleted items:', error);
    } finally {
      setLoading(false);
    }
  };

  const restoreItem = async (itemId: string) => {
    try {
      const { error } = await supabase
        .from('items')
        .update({ deleted_at: null })
        .eq('id', itemId);

      if (error) throw error;
      toast.success('Item restored successfully');
      fetchDeletedItems();
    } catch (error) {
      console.error('Error restoring item:', error);
      toast.error('Failed to restore item');
    }
  };

  const permanentlyDelete = async (itemId: string) => {
    try {
      const { error } = await supabase
        .from('items')
        .delete()
        .eq('id', itemId);

      if (error) throw error;
      toast.success('Item permanently deleted');
      fetchDeletedItems();
    } catch (error) {
      console.error('Error deleting item:', error);
      toast.error('Failed to delete item');
    }
  };

  const getTimeRemaining = (deletedAt: string) => {
    const deletedDate = new Date(deletedAt);
    const expiryDate = new Date(deletedDate.getTime() + 3 * 24 * 60 * 60 * 1000); // 3 days
    const now = new Date();
    
    const hoursLeft = Math.max(0, Math.floor((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60)));
    const daysLeft = Math.floor(hoursLeft / 24);
    
    if (daysLeft > 0) {
      return `${daysLeft}d ${hoursLeft % 24}h left`;
    }
    return `${hoursLeft}h left`;
  };

  if (!user || loading || deletedItems.length === 0) {
    return null;
  }

  return (
    <section className="py-8 bg-muted/30">
      <div className="container mx-auto px-4">
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center justify-between py-4 text-left"
        >
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-destructive/10 flex items-center justify-center">
              <Trash2 className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <h2 className="font-heading text-xl font-semibold text-foreground">
                Recently Deleted
              </h2>
              <p className="text-sm text-muted-foreground">
                {deletedItems.length} item{deletedItems.length !== 1 ? 's' : ''} • Auto-deleted after 3 days
              </p>
            </div>
          </div>
          {expanded ? (
            <ChevronUp className="h-5 w-5 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-5 w-5 text-muted-foreground" />
          )}
        </button>

        {expanded && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-4">
            {deletedItems.map((item) => (
              <Card key={item.id} className="overflow-hidden border-border/50 opacity-75 hover:opacity-100 transition-opacity">
                {/* Image Section */}
                <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                  {item.image_url ? (
                    <img
                      src={item.image_url}
                      alt={item.title}
                      className="h-full w-full object-cover grayscale"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-muted to-muted/50">
                      <Package className="h-12 w-12 text-muted-foreground/40" />
                    </div>
                  )}
                  
                  {/* Deletion Timer Badge */}
                  <div className="absolute top-3 left-3">
                    <Badge variant="destructive" className="font-semibold px-3 py-1 shadow-lg">
                      <Clock className="h-3 w-3 mr-1" />
                      {getTimeRemaining(item.deleted_at!)}
                    </Badge>
                  </div>
                </div>

                <CardHeader className="p-4 pb-2">
                  <h3 className="font-heading text-lg font-semibold text-foreground line-clamp-1">
                    {item.title}
                  </h3>
                </CardHeader>

                <CardContent className="p-4 pt-0 space-y-3">
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>{item.location}</span>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={() => restoreItem(item.id)}
                      variant="outline"
                      size="sm"
                      className="flex-1"
                    >
                      <RotateCcw className="mr-1 h-4 w-4" />
                      Restore
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="destructive"
                          size="sm"
                          className="flex-1"
                        >
                          <Trash2 className="mr-1 h-4 w-4" />
                          Delete
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Permanently delete this item?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. The item will be permanently removed.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => permanentlyDelete(item.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Delete Permanently
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
