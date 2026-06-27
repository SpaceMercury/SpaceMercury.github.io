+++
title = "Album Title"
date = 2026-06-27T00:00:00+02:00
draft = true
cover = "/photos/album-title/cover.webp"
location = "City, Country"
season = "Month Year"
summary = "A short one-line mood or subject for this album."

[[images]]
src = "/photos/album-title/01.webp"
alt = "Short factual description of the photo."
caption = "Optional caption."
meta = "Optional camera/lens note."

[[images]]
src = "/photos/album-title/02.webp"
alt = "Short factual description of the photo."
caption = "Optional caption."
meta = "Optional camera/lens note."
+++

Duplicate this file for a real album, rename it to `content/photos/<album-name>.md`, and remove `draft = true`.

Put the exported photos for that album in `static/photos/<album-name>/`. The URL path starts at `/photos/<album-name>/`.
