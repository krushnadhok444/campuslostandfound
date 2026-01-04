import { useState, useEffect } from 'react';
import { Item, ItemStatus, CATEGORIES, LOCATIONS } from '@/types/item';
import { ItemCard } from './ItemCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Filter, Package } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ItemGridProps {
  onContact: (item: Item) => void;
}

export function ItemGrid({ onContact }: ItemGridProps) {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<ItemStatus | 'all'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [locationFilter, setLocationFilter] = useState<string>('all');

  useEffect(() => {
    fetchItems();

    // Set up realtime subscription
    const channel = supabase
      .channel('items-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'items',
        },
        () => {
          fetchItems();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchItems = async () => {
    try {
      const { data, error } = await supabase
        .from('items')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setItems((data as unknown as Item[]) || []);
    } catch (error) {
      console.error('Error fetching items:', error);
      toast.error('Failed to load items');
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
    const matchesLocation = locationFilter === 'all' || item.location === locationFilter;

    return matchesSearch && matchesStatus && matchesCategory && matchesLocation;
  });

  const lostCount = items.filter((i) => i.status === 'lost').length;
  const foundCount = items.filter((i) => i.status === 'found').length;

  return (
    <section id="items" className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-4">
            Recent Reports
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Browse through lost and found items reported by students across campus. 
            Find what you're looking for or help someone find their belongings.
          </p>
        </div>

        {/* Stats */}
        <div className="flex justify-center gap-8 mb-8">
          <div className="text-center">
            <div className="text-3xl font-heading font-bold text-lost">{lostCount}</div>
            <div className="text-sm text-muted-foreground">Lost Items</div>
          </div>
          <div className="h-12 w-px bg-border" />
          <div className="text-center">
            <div className="text-3xl font-heading font-bold text-found">{foundCount}</div>
            <div className="text-sm text-muted-foreground">Found Items</div>
          </div>
        </div>

        {/* Filters */}
        <div className="space-y-4 mb-8">
          {/* Status Tabs */}
          <div className="flex justify-center">
            <Tabs value={statusFilter} onValueChange={(v) => setStatusFilter(v as ItemStatus | 'all')}>
              <TabsList className="grid grid-cols-3 w-full max-w-md">
                <TabsTrigger value="all">All Items</TabsTrigger>
                <TabsTrigger value="lost" className="data-[state=active]:bg-lost data-[state=active]:text-lost-foreground">
                  Lost
                </TabsTrigger>
                <TabsTrigger value="found" className="data-[state=active]:bg-found data-[state=active]:text-found-foreground">
                  Found
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4 max-w-4xl mx-auto">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={locationFilter} onValueChange={setLocationFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Locations</SelectItem>
                {LOCATIONS.map((loc) => (
                  <SelectItem key={loc} value={loc}>
                    {loc}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Items Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="rounded-xl bg-muted animate-pulse aspect-[3/4]" />
            ))}
          </div>
        ) : filteredItems.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredItems.map((item) => (
              <ItemCard key={item.id} item={item} onContact={onContact} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
              <Package className="h-10 w-10 text-muted-foreground" />
            </div>
            <h3 className="font-heading text-xl font-semibold text-foreground mb-2">
              No items found
            </h3>
            <p className="text-muted-foreground">
              {searchQuery || categoryFilter !== 'all' || locationFilter !== 'all'
                ? 'Try adjusting your search or filters'
                : 'Be the first to report an item!'}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
