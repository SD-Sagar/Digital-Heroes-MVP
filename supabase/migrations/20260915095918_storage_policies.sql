/*
# Storage Policies for Winner Proof Uploads

1. Storage bucket "winner-proof" is public (readable by anyone)
2. Authenticated users can upload files to their own folder (user_id/winner_id.ext)
3. Only the owner can update/delete their own files
*/

-- Allow authenticated users to upload to their own folder
DROP POLICY IF EXISTS "upload_own_proof" ON storage.objects;
CREATE POLICY "upload_own_proof" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'winner-proof'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Allow users to update their own files
DROP POLICY IF EXISTS "update_own_proof" ON storage.objects;
CREATE POLICY "update_own_proof" ON storage.objects
  FOR UPDATE TO authenticated
  USING (
    bucket_id = 'winner-proof'
    AND (storage.foldername(name))[1] = auth.uid()::text
  )
  WITH CHECK (
    bucket_id = 'winner-proof'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Public read for proof images (so admin can view them)
DROP POLICY IF EXISTS "read_proof" ON storage.objects;
CREATE POLICY "read_proof" ON storage.objects
  FOR SELECT TO anon, authenticated
  USING (bucket_id = 'winner-proof');