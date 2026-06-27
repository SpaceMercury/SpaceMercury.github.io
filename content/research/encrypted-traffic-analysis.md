+++
title = "Encrypted Traffic Analysis at Line Rate"
date = 2025-07-01T00:00:00+02:00
note_type = "Research write-up"
status = "Completed"
tools = ["DPDK", "CUDA", "C++", "Nix"]
summary = "Notes from my high-throughput encrypted traffic classification work with DPDK, CUDA, and reproducible network traffic generation."
+++

At the Cyber Defence Campus, my research focused on Encrypted Traffic Analysis: classifying encrypted network flows without decrypting payloads.

The system combined high-speed packet ingestion, realistic encrypted traffic generation, feature extraction, and GPU-accelerated inference. DPDK handled packet processing close to the NIC, while CUDA and C++ were used for performance-critical classification work.

The research challenge was not only model quality. The pipeline also had to preserve throughput, keep measurements reproducible, and expose telemetry clearly enough to understand behavior under load.

The project write-up is available here: [Fast GPU Traffic Classification](/projects/highspeedclassifier/).
