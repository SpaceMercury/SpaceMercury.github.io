+++
title = "QUIC Traffic Notes"
date = 2025-04-10T00:00:00+02:00
note_type = "Protocol note"
status = "Published note"
tools = ["QUIC", "TLS 1.3", "UDP", "Transport protocols"]
summary = "A short protocol note on QUIC, UDP-based reliability, and why modern secure transport changed shape."
+++

QUIC is a useful protocol to study because it compresses several old transport assumptions into one place: encryption, multiplexing, reliability, and connection migration all live above UDP.

That design makes QUIC faster for many user-facing applications, but it also changes what network measurement and traffic analysis can observe. For my own networking research, QUIC is a good example of how protocol design, security, and operational visibility pull against each other.

The original post is available here: [QUIC Traffic, explained](/posts/quic/).
