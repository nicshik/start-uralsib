DROP POLICY IF EXISTS "Public read access for demo video" ON storage.objects;

CREATE POLICY "Public read access for demo media"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'media'
  AND name IN ('demo.mp4', 'demo-poster.jpg')
);