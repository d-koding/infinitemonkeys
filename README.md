# infinitemonkeys.com

Minimal static story app for GitHub Pages.

## Deploy on GitHub Pages

1. Push this repo to GitHub.
2. Open `Settings` -> `Pages`.
3. Under `Build and deployment`, choose `Deploy from a branch`.
4. Select the branch you want to publish from.
5. Select the `/ (root)` folder.
6. Save.

GitHub Pages will serve the site from the root `index.html`.

## Files

- `index.html` is the deployed entry page.
- `styles.css` and `app.js` are used by the deployed page.
- `standalone.html` is the single-file version you can drag into a browser.
- `.nojekyll` disables Jekyll processing so Pages serves the site as plain static files.
