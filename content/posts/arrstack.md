+++
title = "Arrstack"
date = 2025-04-07T22:53:44+02:00
featured = true
+++

Need a fast and easy way to download Linux ISOs?  
The **arrstack** is a lightweight tool that lets you find, download, and manage Linux distributions in just a few clicks.

No clutter. No hassle. Just ISOs.

Jokes aside the arrstack is a set of aplications that connect together to provide a simple way to download and manage content.


# Quick Setup

Here is my docker compose file to run the stack:

To run just make sure to input your own values in the envs and then run the docker in daemon.

You then have to go through the setup of each application, but it is pretty straightforward. Make an account for each of the applications and then you can start using it.

To connect the applications together like sonarr radarr prowlarr and jellyseer you have to add the api key of each application in the others.

There are plenty of guides on how to do this, so I won't go into detail here.

I will just rapidly go through the applications and what they do.


# Applications

## Sonarr
Sonarr is the application that manages your TV (ISOs). It will download the episodes for you and keep track of what you have watched.

## Radarr
Radarr is the application that manages your longer (movie ISOs). It will download the movies for you and keep track of what you have watched.

## Prowlarr
Prowlarr is the application that manages your indexers. It will search for the content you want and download it for you.

## Jellyfin
Jellyfin is the application that manages your media library. It will organize your content and make it available to you on all your devices.

## Flaresolverr
Flaresolverr is a service that allows you to bypass Cloudflare's anti-bot protection. It is used by some indexers to protect their content.

## Jellyseerr
Jellyseer is an application that connects to radarr and sonarr and allows you to manage and request content from a nice interface. It is used to manage your content and make it available to you on all your devices.

## Heimdall 
Heimdall is a dashboard that allows you to manage your applications and access them from a single place. It is used to manage your content and make it available to you on all your devices.

## Portainer (optional)
Portainer is a web interface for managing your docker containers. It is used to manage your content and make it available to you on all your devices. It's optional but I highly recommend adding it to your stack.



