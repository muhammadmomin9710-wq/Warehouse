# Master's Warehouse

Clean, professional website for **Master's Warehouse** — After Effects plugins, color correction packs, and project files.

## Quick start

Open `index.html` in a browser or serve the folder with any static server.

## Replacing the hero video

The hero section currently uses a placeholder. To use your own video:

1. **In `index.html`**, find the hero block and replace the placeholder div with a `<video>` element:

   **Remove this:**
   ```html
   <div class="hero-video-placeholder" id="hero-video-placeholder">
       <span class="placeholder-label">Video will appear here</span>
   </div>
   ```

   **Add this (adjust the `src` path to your video file):**
   ```html
   <video class="hero-video" autoplay muted loop playsinline>
       <source src="assets/hero-video.mp4" type="video/mp4">
   </video>
   ```

2. **Optional:** To darken the video so white text stays readable, in `style.css` you can add a pseudo-element or a thin overlay div and style it, e.g.:
   ```css
   .hero::after {
       content: '';
       position: absolute;
       inset: 0;
       background: rgba(0,0,0,0.4);
       z-index: 1.5;
       pointer-events: none;
   }
   ```
   (Keep `.hero-overlay` at a higher `z-index` so text stays on top.)

No JavaScript changes are required for the video.

## Adding real products

- **Images:** Replace the `src` in each product `<img>` with your product image URL or path.
- **Copy:** Edit the product card `<h3>` and `<p>` for title and description.
- **Cart:** The "Add to Cart" buttons are presentational. Hook them up to your cart/payment system (e.g. Stripe, Gumroad) when ready.

## File structure

- `index.html` — Page structure and content
- `style.css` — Layout, gradient, animations, responsive styles
- `script.js` — Scroll animations, review slider, contact form handler

## Contact details (on site)

- **Email:** muhammadmomin9710@gmail.com  
- **Discord:** mobthemaster_

---

© 2026 Master's Warehouse
