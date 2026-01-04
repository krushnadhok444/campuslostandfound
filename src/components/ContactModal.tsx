import { Item } from '@/types/item';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Mail, MapPin, Clock, Package, Copy, Check } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useState } from 'react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface ContactModalProps {
  item: Item | null;
  onClose: () => void;
}

export function ContactModal({ item, onClose }: ContactModalProps) {
  const [copied, setCopied] = useState(false);

  if (!item) return null;

  const contactInfo = item.contact_info || 'No contact info provided';

  const copyContact = async () => {
    await navigator.clipboard.writeText(contactInfo);
    setCopied(true);
    toast.success('Contact info copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  const statusConfig = {
    lost: {
      label: 'Lost Item',
      className: 'gradient-lost text-lost-foreground',
      personLabel: 'Owner',
    },
    found: {
      label: 'Found Item',
      className: 'gradient-found text-found-foreground',
      personLabel: 'Finder',
    },
    claimed: {
      label: 'Claimed',
      className: 'bg-claimed text-claimed-foreground',
      personLabel: 'Person',
    },
  };

  const status = statusConfig[item.status];

  return (
    <Dialog open={!!item} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <Badge className={cn('font-semibold', status.className)}>
              {status.label}
            </Badge>
            <Badge variant="secondary">{item.category}</Badge>
          </div>
          <DialogTitle className="font-heading text-2xl">{item.title}</DialogTitle>
          <DialogDescription className="flex flex-wrap gap-3 text-sm">
            <span className="flex items-center gap-1">
              <MapPin className="h-4 w-4 text-primary" />
              {item.location}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
            </span>
          </DialogDescription>
        </DialogHeader>

        {/* Image */}
        {item.image_url && (
          <div className="rounded-lg overflow-hidden">
            <img
              src={item.image_url}
              alt={item.title}
              className="w-full h-48 object-cover"
            />
          </div>
        )}

        {/* Description */}
        {item.description && (
          <div className="bg-muted/50 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-foreground mb-1">Description</h4>
            <p className="text-sm text-muted-foreground">{item.description}</p>
          </div>
        )}

        {/* Contact Section */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-foreground">
            Contact the {status.personLabel}
          </h4>
          <div className="flex items-center gap-2">
            <div className="flex-1 flex items-center gap-2 bg-muted rounded-lg px-4 py-3">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium truncate">{contactInfo}</span>
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={copyContact}
              className="shrink-0"
            >
              {copied ? (
                <Check className="h-4 w-4 text-success" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
          <Button
            className="w-full gradient-primary text-primary-foreground hover:opacity-90"
            onClick={() => window.open(`mailto:${contactInfo}?subject=Regarding your ${item.status} item: ${item.title}`)}
          >
            <Mail className="mr-2 h-4 w-4" />
            Send Email
          </Button>
        </div>

        <p className="text-xs text-center text-muted-foreground">
          Please be respectful and provide accurate information when contacting.
        </p>
      </DialogContent>
    </Dialog>
  );
}
