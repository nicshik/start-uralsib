insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do nothing;

create policy "Public read access for media bucket"
on storage.objects
for select
using (bucket_id = 'media');