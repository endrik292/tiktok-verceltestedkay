# PlayRWDZ Local Clone

Start the local site with:

```bash
npm start
```

Then open:

```text
http://localhost:5173
```

The page is mirrored from the supplied PlayRWDZ URL. Fonts and the logo are stored locally. The Roblox username lookup goes through the local server and proxies the original lookup API; if that upstream API is unavailable, the page still continues with a local fallback profile.

The original external tracking script has been replaced by `local-tracking.js`, which records local-only events in `window.__localTrackingEvents` and `localStorage` instead of sending traffic to the external tracking endpoint.
