-- Storage bucket for vehicle photos uploaded by management
INSERT INTO storage.buckets (id, name, public)
VALUES ('vehicle_photos', 'vehicle_photos', true)
ON CONFLICT (id) DO NOTHING;

-- Allow management/admin to upload
CREATE POLICY "management_upload_vehicle_photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'vehicle_photos'
  AND EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role IN ('management', 'admin')
  )
);

-- Allow management/admin to delete
CREATE POLICY "management_delete_vehicle_photos"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'vehicle_photos'
  AND EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role IN ('management', 'admin')
  )
);

-- Public read (bucket is public, this is for RLS on objects table)
CREATE POLICY "public_read_vehicle_photos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'vehicle_photos');
