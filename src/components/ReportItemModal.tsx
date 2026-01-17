import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { CATEGORIES, LOCATIONS, ItemStatus } from '@/types/item';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, X, Loader2, Search, Package } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface ReportItemModalProps {
  open: boolean;
  onClose: () => void;
}

export function ReportItemModal({ open, onClose }: ReportItemModalProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    status: 'lost' as ItemStatus,
    title: '',
    description: '',
    category: '',
    location: '',
    contact_info: '',
    phone_number: '',
    alternate_phone: '',
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 15 * 1024 * 1024) {
        toast.error('Image must be less than 15MB');
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!formData.title || !formData.category || !formData.location || !formData.phone_number) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);

    try {
      let imageUrl = null;

      // Upload image if provided
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('item-images')
          .upload(fileName, imageFile);

        if (uploadError) throw uploadError;

        const { data: publicUrl } = supabase.storage
          .from('item-images')
          .getPublicUrl(fileName);

        imageUrl = publicUrl.publicUrl;
      }

      // Build contact info with phone numbers
      const contactParts = [];
      contactParts.push(`Phone: ${formData.phone_number.trim()}`);
      if (formData.alternate_phone.trim()) {
        contactParts.push(`Alt: ${formData.alternate_phone.trim()}`);
      }
      if (formData.contact_info.trim()) {
        contactParts.push(`Email: ${formData.contact_info.trim()}`);
      } else if (user.email) {
        contactParts.push(`Email: ${user.email}`);
      }
      const fullContactInfo = contactParts.join(' | ');

      // Insert item
      const { error: insertError } = await supabase.from('items').insert({
        user_id: user.id,
        title: formData.title.trim(),
        description: formData.description.trim() || null,
        category: formData.category,
        location: formData.location,
        status: formData.status,
        image_url: imageUrl,
        contact_info: fullContactInfo,
      });

      if (insertError) throw insertError;

      toast.success(`${formData.status === 'lost' ? 'Lost' : 'Found'} item reported successfully!`);
      
      // Reset form
      setFormData({
        status: 'lost',
        title: '',
        description: '',
        category: '',
        location: '',
        contact_info: '',
        phone_number: '',
        alternate_phone: '',
      });
      setImageFile(null);
      setImagePreview(null);
      onClose();
    } catch (error) {
      console.error('Error reporting item:', error);
      toast.error('Failed to report item. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-heading text-2xl">Report an Item</DialogTitle>
          <DialogDescription>
            Help the campus community by reporting lost or found items.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Status Toggle */}
          <div className="space-y-2">
            <Label>What are you reporting?</Label>
            <Tabs
              value={formData.status}
              onValueChange={(v) => setFormData({ ...formData, status: v as ItemStatus })}
              className="w-full"
            >
              <TabsList className="grid grid-cols-2 w-full">
                <TabsTrigger
                  value="lost"
                  className="data-[state=active]:gradient-lost data-[state=active]:text-lost-foreground"
                >
                  <Search className="mr-2 h-4 w-4" />
                  I Lost Something
                </TabsTrigger>
                <TabsTrigger
                  value="found"
                  className="data-[state=active]:gradient-found data-[state=active]:text-found-foreground"
                >
                  <Package className="mr-2 h-4 w-4" />
                  I Found Something
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Item Name *</Label>
            <Input
              id="title"
              placeholder="e.g., Blue Backpack, iPhone 15, Student ID Card"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>

          {/* Category & Location */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Category *</Label>
              <Select
                value={formData.category}
                onValueChange={(v) => setFormData({ ...formData, category: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Location *</Label>
              <Input
                id="location"
                placeholder="e.g., Library, Cafeteria"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                required
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Provide additional details to help identify the item..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>

          {/* Image Upload */}
          <div className="space-y-2">
            <Label>Image (optional)</Label>
            {imagePreview ? (
              <div className="relative rounded-lg overflow-hidden">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-48 object-cover"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2"
                  onClick={removeImage}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary/50 transition-colors">
                <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                <span className="text-sm text-muted-foreground">Click to upload image</span>
                <span className="text-xs text-muted-foreground mt-1">Max 15MB</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                />
              </label>
            )}
          </div>

          {/* Phone Numbers */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number *</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="e.g., 9876543210"
                value={formData.phone_number}
                onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="alt-phone">Alternate Phone (optional)</Label>
              <Input
                id="alt-phone"
                type="tel"
                placeholder="e.g., 9123456789"
                value={formData.alternate_phone}
                onChange={(e) => setFormData({ ...formData, alternate_phone: e.target.value })}
              />
            </div>
          </div>

          {/* Contact Info */}
          <div className="space-y-2">
            <Label htmlFor="contact">Email</Label>
            <Input
              id="contact"
              type="email"
              placeholder={user?.email || 'Your email address'}
              value={formData.contact_info}
              onChange={(e) => setFormData({ ...formData, contact_info: e.target.value })}
            />
            <p className="text-xs text-muted-foreground">
              Leave blank to use your account email
            </p>
          </div>

          {/* Submit */}
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              className={cn(
                'flex-1 text-white',
                formData.status === 'lost' ? 'gradient-lost' : 'gradient-found'
              )}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                `Report ${formData.status === 'lost' ? 'Lost' : 'Found'} Item`
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
