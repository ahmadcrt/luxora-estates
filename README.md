# Luxora Estates

A luxury real estate website built with plain HTML5, CSS3 and vanilla JavaScript. No build step, no dependencies.

> **All properties, prices, people and contact details are fictional demo content.**

## Features
- Sticky navigation with a mobile menu and smooth anchor scrolling
- Search by keyword, type, location, bedrooms and maximum price, with Buy/Rent modes and sorting
- Interactive property cards, detail modal with photo switcher, and saved favourites (stored in `localStorage`)
- Featured properties, services, about, why-us and lightbox gallery sections
- Contact form with inline validation (name, email, optional phone, message)
- WhatsApp integration: floating button, contact button, and a per-property "Ask on WhatsApp" message
- Responsive layout, keyboard focus styles, and `prefers-reduced-motion` support

## Structure
```
index.html
css/styles.css
js/data.js     demo listings, gallery, WhatsApp number
js/app.js      filtering logic and UI behaviour
tests/filter.test.js
```

## Run locally
Open `index.html` in a browser, or serve the folder: `python3 -m http.server`.

Run the filter tests with `node tests/filter.test.js`.

## Customise
1. Edit `PROPERTIES` and `GALLERY` in `js/data.js`.
2. Set `WHATSAPP_NUMBER` (digits only, with country code).
3. Replace copy and contact details in `index.html`.

Photos load from Unsplash by photo ID. For production, download the images into an `images/` folder and update the `U()` helper in `js/data.js` to point at them. Check each image's licence.

## Deploy to GitHub Pages
1. Push this folder to a GitHub repository.
2. Go to **Settings > Pages**.
3. Under **Build and deployment**, choose **Deploy from a branch**, select `main` and `/ (root)`, then save.
4. Your site appears at `https://<username>.github.io/<repository>/`.

All asset paths are relative, so it works under a repository subpath.

## Contact form
The form validates in the browser only and does not send data. To receive enquiries, connect it to a service such as Formspree or your own backend.
