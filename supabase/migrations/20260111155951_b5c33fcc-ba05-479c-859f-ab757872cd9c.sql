-- Update storage bucket file size limit to 15MB
UPDATE storage.buckets 
SET file_size_limit = 15728640 
WHERE id = 'item-images';