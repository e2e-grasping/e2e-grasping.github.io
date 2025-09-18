# e2e-grasping.github.io

A minimal academic website template for the paper "Scaling End-to-End Grasping with Disaggregated Simulation".

## Structure
- `index.html` – homepage with abstract, video gallery, citation
- `assets/css/style.css` – styles
- `assets/js/main.js` – lightbox for videos (YouTube or MP4)
- `assets/img/` – thumbnails and favicon

## Update content
- Title, authors, and affiliations: edit the header in `index.html`
- Abstract: update the text in the `#abstract` section
- Videos: replace the 3 anchors inside `#videos .gallery`
  - For YouTube, set `href` to the watch URL and keep `data-video-type="youtube"`
  - For local MP4, set `href` to the file path and `data-video-type="video"`
  - Replace SVG thumbs with your own images in `assets/img/`
- Citation: edit the BibTeX in the `#citation` section

## Local preview
Open `index.html` directly, or serve locally:

```bash
cd /path/to/e2e-grasping.github.io
python3 -m http.server 4000
```

Then open `http://localhost:4000`.

## Deploy
If this repository is connected to GitHub Pages:
- Push changes to `main` and ensure Pages is configured to serve from the root
- Your site will be available at the repository Pages URL 