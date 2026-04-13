# infinitemonkeys.com

Minimal static story app for GitHub Pages with shared persistence via Supabase.

## Deploy on GitHub Pages

1. Push this repo to GitHub.
2. Open `Settings` -> `Pages`.
3. Under `Build and deployment`, choose `Deploy from a branch`.
4. Select the branch you want to publish from.
5. Select the `/ (root)` folder.
6. Save.

GitHub Pages will serve the site from the root `index.html`.

## Turn On Shared Persistence

This app now expects a Supabase project for the live shared story.

### 1. Create a Supabase project

Create a new project at [supabase.com](https://supabase.com), then open the SQL editor and run:

```sql
create table if not exists public.story_lines (
  id bigint generated always as identity primary key,
  text text not null check (char_length(trim(text)) > 0),
  created_at timestamptz not null default now()
);

alter table public.story_lines enable row level security;

create policy "story is readable by anyone"
on public.story_lines
for select
to anon
using (true);

create policy "story accepts inserts from anyone"
on public.story_lines
for insert
to anon
with check (char_length(trim(text)) > 0);
```

### 2. Add your public project settings

Open `Project Settings` -> `API` in Supabase and copy:

- Project URL
- Project API key labeled `anon public`

Paste them into [config.js](/Users/dylanoconnor/develop/infinitemonkeys/config.js):

```js
window.APP_CONFIG = {
  supabaseUrl: "https://YOUR-PROJECT.supabase.co",
  supabaseAnonKey: "YOUR_SUPABASE_ANON_KEY",
};
```

Then commit and push `config.js` along with the rest of the site.

### 3. Redeploy

After GitHub Pages republishes, the story will load from Supabase and new lines will persist for every visitor.

## Notes

- The one-line lock is still per browser/device because there is no user authentication.
- `standalone.html` remains a drag-and-drop local file version.

## Files

- `index.html` is the deployed entry page.
- `styles.css` and `app.js` are used by the deployed page.
- `config.js` holds the public Supabase settings for the live site.
- `standalone.html` is the single-file version you can drag into a browser.
- `.nojekyll` disables Jekyll processing so Pages serves the site as plain static files.
