# PlayRWDZ lokale Kopie

Lokale Seite starten:

```bash
npm start
```

Dann öffnen:

```text
http://localhost:5173
```

Die Seite ist aus der gelieferten PlayRWDZ-URL gespiegelt. Fonts und Logo liegen lokal. Der Roblox-Nutzername-Lookup läuft über den lokalen Server und nutzt die ursprüngliche Lookup-API; wenn diese nicht erreichbar ist, läuft der Flow mit einem lokalen Fallback-Profil weiter.

Das ursprüngliche externe Tracking-Script wurde durch `local-tracking.js` ersetzt. Es speichert Events nur lokal in `window.__localTrackingEvents` und `localStorage`, statt Traffic an den externen Tracking-Endpunkt zu senden.
