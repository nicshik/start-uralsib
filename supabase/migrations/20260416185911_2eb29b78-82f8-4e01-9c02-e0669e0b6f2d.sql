drop policy if exists "Public read access for media bucket" on storage.objects;

create policy "Public read access for demo video"
on storage.objects
for select
using (bucket_id = 'media' and name = 'demo.mp4');