-- Add deleted_at column for soft delete
ALTER TABLE public.items ADD COLUMN deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- Create index for efficient querying of deleted items
CREATE INDEX idx_items_deleted_at ON public.items(deleted_at) WHERE deleted_at IS NOT NULL;

-- Update RLS policy to allow users to see their own deleted items
DROP POLICY IF EXISTS "Anyone can view items" ON public.items;

CREATE POLICY "Anyone can view active items" 
ON public.items 
FOR SELECT 
USING (deleted_at IS NULL);

CREATE POLICY "Users can view their own deleted items" 
ON public.items 
FOR SELECT 
USING (auth.uid() = user_id AND deleted_at IS NOT NULL);

-- Function to auto-delete items older than 3 days
CREATE OR REPLACE FUNCTION public.cleanup_deleted_items()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.items 
  WHERE deleted_at IS NOT NULL 
  AND deleted_at < NOW() - INTERVAL '3 days';
END;
$$;