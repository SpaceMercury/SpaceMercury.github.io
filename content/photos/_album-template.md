+++
title = "Album Title"
date = 2026-06-27T00:00:00+02:00
draft = true
cover = "/photos/album-title/cover.webp"
location = "City, Country"
season = "Month Year"
camera = "Fujifilm X-S20"
summary = "A short one-line mood or subject for this album."

[[images]]
src = "/photos/album-title/01.webp"
alt = "Short factual description of the photo."
caption = "Caption goes here."

[[images]]
src = "/photos/album-title/02.webp"
alt = "Short factual description of the photo."
caption = "Caption goes here."
+++

Duplicate this file for a real album, rename it to `content/photos/<album-name>.md`, and remove `draft = true`.

Put exported web assets in `static/photos/<album-name>/`:

- `cover.webp`: cropped album cover, around 900px wide.
- `*.webp`: optimized gallery images, around 2000-2400px on the long edge.

Keep full camera originals outside `static/` and outside git.
