# infinitemonkeys.com

Minimal static story app for GitHub Pages with shared persistence via Supabase.

## Deploy on GitHub Pages

1. Push this repo to GitHub.
2. Open `Settings` -> `Pages`.
3. Under `Build and deployment`, choose `GitHub Actions`.
4. Push to `main` or run the workflow manually from the `Actions` tab.

GitHub Pages will deploy the root site using `.github/workflows/static.yml`.

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

For local use, create your own untracked [config.js](/Users/dylanoconnor/develop/infinitemonkeys/config.js) from [config.example.js](/Users/dylanoconnor/develop/infinitemonkeys/config.example.js):

```js
window.APP_CONFIG = {
  supabaseUrl: "https://YOUR-PROJECT.supabase.co",
  supabaseAnonKey: "YOUR_SUPABASE_ANON_KEY",
};
```

`config.js` is ignored by git, so your local copy will not be committed.

For GitHub Pages deployment, add these repository secrets in GitHub:

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`

The GitHub Pages workflow generates `config.js` during deploy from those secrets.

### 3. Redeploy

After GitHub Pages republishes, the story will load from Supabase and new lines will persist for every visitor.

## Notes

- The Supabase `anon` key is not a true secret in a browser app. It is safe to expose to clients, but you should never use your `service_role` key here.
- The one-line lock is still per browser/device because there is no user authentication.
- `standalone.html` remains a drag-and-drop local file version.

## Files

- `index.html` is the deployed entry page.
- `styles.css` and `app.js` are used by the deployed page.
- `config.example.js` is the template for local config.
- `config.js` is generated locally or in GitHub Actions and is not committed.
- `standalone.html` is the single-file version you can drag into a browser.
- `.nojekyll` disables Jekyll processing so Pages serves the site as plain static files.
