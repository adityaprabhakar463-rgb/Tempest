# Tempest

A sleek, real-time weather app with dynamic themes and live particle effects.

## Features

- Real-time weather for any city worldwide
- Dynamic background themes — clear, cloudy, rainy, snowy, stormy
- Live weather effects — rain and snow particle animations
- 3-day forecast
- °C / °F toggle
- Save favourite cities with a persistent dropdown
- Last searched city loads automatically on revisit
- Glassmorphism UI with animated mesh background
- Click any detail chip to copy the value to clipboard

## Tech stack

- HTML5, CSS3, Vanilla JavaScript
- [wttr.in](https://wttr.in) — free weather API, no key required

## How it works

Weather data is fetched from wttr.in's JSON API:
```
https://wttr.in/{city}?format=j1
```

City names are encoded with `encodeURIComponent` to handle special
characters. Icon URLs are normalised from `http://` to `https://` to
satisfy modern browser security policies. The API returns a
`nearest_area` field with the resolved city name — so searching "lon"
correctly displays "London, United Kingdom".

Dynamic weather themes are applied by mapping the weather description
to a CSS class on `<body>`, which shifts the mesh background gradient
and header colour. Rain and snow conditions spawn particle elements
via JavaScript for an immersive effect.

## Running locally

No build step, no dependencies. Just open `weather.html` in your
browser or use VS Code Live Server.

## Note

Built with AI assistance for UI polish and weather effects.
Core fetch logic, API data extraction, and localStorage
implementation written independently.
