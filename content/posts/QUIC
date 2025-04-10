+++
title = "QUIC Traffic, explained"
date = 2025-04-10T15:53:44+02:00
+++


In the constant race to speed up the web, Google quietly rolled out a new transport protocol in 2012—QUIC (Quick UDP Internet Connections). Over the years, it has evolved from an experimental feature to a backbone technology used by services like Chrome, YouTube, and Google Search.


QUIC replaces the traditional TCP + TLS stack with a single protocol built directly on top of UDP. This shift gives QUIC a major performance edge.
Traditionally, when you load a website over HTTPS, your browser and the server have to go through:

    A TCP handshake (1 RTT).

    A TLS handshake (1–2 RTTs).

Only then can any real data start flowing.

QUIC collapses this into just the TLS handshake—and even skips that if it’s recently connected.
0-RTT: Faster Than Fast

Thanks to its clever design, QUIC can send data in the very first packet. If the client has connected to the server before and remembers certain credentials, it can initiate a 0-RTT handshake—meaning the request begins immediately without waiting for any server response.

This makes QUIC a game-changer for mobile networks and latency-sensitive apps, where every millisecond matters.
How It Works

QUIC’s core idea is to combine encryption, multiplexing, and transport reliability into one unified protocol:

    Built on UDP, so it avoids middlebox interference and kernel delays.

    Uses TLS 1.3 directly inside the transport layer.

    Provides multiple streams per connection, avoiding head-of-line blocking.

    Supports connection migration, keeping connections alive even when the IP address changes (e.g., switching from Wi-Fi to mobile data).

### Choice of UDP?

Something that can seem weird at first with QUIC is that if it uses UDP, hwo can it ensure that the packets are transmitted directly? I mean the whole point of TCP is that packets that were dropped or lost will be sent again at some point.
The way this is solved is essentially that it is up to QUIC to handle the loss. Basically QUIC uses acknowledgements and has a time out to ensure that the correct packets are received. The idea is that since UDP is technically not reliable, QUIC builds it's own reliability layer in a way.

#### You can find the full article here: 👉 [ietf docs](https://datatracker.ietf.org/doc/html/draft-ietf-quic-recovery-32#name-loss-detection).

### Final thoughts:

QUIC is open source, baked into the Chromium project, and used by default in Chrome and Android apps. As of the SIGCOMM 2017 paper, QUIC already carried over 7% of global internet traffic, and that number has grown since. As of June 2023, an estimated 40% of Chrome's browser traffic was using QUIC.
The official paper dives deeper into the protocol’s evolution and performance: 👉 [Read the paper](https://dl.acm.org/doi/pdf/10.1145/3098822.3098842)
QUIC is not just faster—it’s a complete rethink of how secure transport should work on the modern Internet. With support from Google and now IETF standardization, it’s likely to be the default for many services in the future.
