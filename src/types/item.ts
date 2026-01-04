export type ItemStatus = 'lost' | 'found' | 'claimed';

export interface Item {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  category: string;
  location: string;
  status: ItemStatus;
  image_url: string | null;
  contact_info: string | null;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  user_id: string;
  full_name: string | null;
  avatar_url: string | null;
  email: string | null;
  created_at: string;
}

export const CATEGORIES = [
  'Electronics',
  'Books & Notes',
  'ID Cards',
  'Keys',
  'Bags & Wallets',
  'Clothing',
  'Sports Equipment',
  'Accessories',
  'Other',
] as const;

export const LOCATIONS = [
  'Library',
  'Cafeteria',
  'Gym',
  'Main Building',
  'Science Block',
  'Arts Building',
  'Sports Complex',
  'Parking Lot',
  'Student Center',
  'Hostel',
  'Other',
] as const;
