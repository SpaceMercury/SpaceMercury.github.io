+++
title = "Album Title"
date = 2026-06-27T00:00:00+02:00
draft = true
cover = "/photos/album-title/cover.webp"
location = "City, Country"
season = "Month Year"
summary = "A short one-line mood or subject for this album."

[[images]]
src = "/photos/album-title/thumbs/01.webp"
full = "/photos/album-title/display/01.webp"
alt = "Short factual description of the photo."
caption = "Optional caption."
meta = "Optional camera/lens note."

[[images]]
src = "/photos/album-title/thumbs/02.webp"
full = "/photos/album-title/display/02.webp"
alt = "Short factual description of the photo."
caption = "Optional caption."
meta = "Optional camera/lens note."
+++

Duplicate this file for a real album, rename it to `content/photos/<album-name>.md`, and remove `draft = true`.

Put exported web assets in `static/photos/<album-name>/`:

- `cover.webp`: cropped album cover, around 900px wide.
- `thumbs/*.webp`: grid thumbnails, around 600-900px on the long edge.
- `display/*.webp`: click-to-open images, around 2000-2400px on the long edge.

Keep full camera originals outside `static/` and outside git.
