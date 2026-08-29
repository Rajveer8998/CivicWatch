-- Run this once in Supabase: SQL Editor -> New query -> Run.
-- Public lets every visitor view reported-issue photos; uploads stay limited
-- to each signed-in user's own folder.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('issue-images', 'issue-images', true, 5242880, array['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
on conflict (id) do update set public = true, file_size_limit = 5242880,
  allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

drop policy if exists "Users upload issue images to their folder" on storage.objects;
drop policy if exists "Users can read their uploaded issue images" on storage.objects;

create policy "Users upload issue images to their folder"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'issue-images'
  and (storage.foldername(name))[1] = (select auth.uid()::text)
  and lower(storage.extension(name)) in ('jpg', 'jpeg', 'png', 'webp', 'gif')
);

create policy "Users can read their uploaded issue images"
on storage.objects for select to authenticated
using (
  bucket_id = 'issue-images'
  and owner_id = (select auth.uid()::text)
);
