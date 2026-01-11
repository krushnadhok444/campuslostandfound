import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { Hero } from '@/components/Hero';
import { ItemGrid } from '@/components/ItemGrid';
import { HowItWorks } from '@/components/HowItWorks';
import { Footer } from '@/components/Footer';
import { ReportItemModal } from '@/components/ReportItemModal';
import { ContactModal } from '@/components/ContactModal';
import { RecentlyDeletedSection } from '@/components/RecentlyDeletedSection';
import { Item } from '@/types/item';
import { supabase } from '@/integrations/supabase/client';

const Index = () => {
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [contactItem, setContactItem] = useState<Item | null>(null);
  const [itemCount, setItemCount] = useState(0);

  useEffect(() => {
    fetchItemCount();
  }, []);

  const fetchItemCount = async () => {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const { count } = await supabase
      .from('items')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', startOfMonth.toISOString());

    setItemCount(count || 0);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header onOpenReportModal={() => setReportModalOpen(true)} />
      <Hero onOpenReportModal={() => setReportModalOpen(true)} itemCount={itemCount} />
      <ItemGrid onContact={setContactItem} />
      <RecentlyDeletedSection />
      <HowItWorks />
      <Footer />

      <ReportItemModal
        open={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
      />
      <ContactModal
        item={contactItem}
        onClose={() => setContactItem(null)}
      />
    </div>
  );
};

export default Index;
