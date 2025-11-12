+++
title = "Fast GPU Traffic Classification"
date = 2025-07-01T00:00:00+00:00
technologies = ["CUDA", "DPDK", "C++", "Kafka", "Nix", "Grafana"]
status = "Finished"
featured = true
featured_order = 1
+++
A high-throughput encrypted traffic classification system built using CUDA and DPDK, designed to process network flows at over 75 Gbps. Developed for real-time inference and cybersecurity research.

## Overview

This project focuses on classifying encrypted network traffic in real-time using GPU acceleration. It combines **DPDK** for high-speed packet ingestion with a custom **neural network inference engine written in CUDA**. The system targets cybersecurity and traffic engineering applications where line-rate classification is essential.

## Features

- 🚀 **GPU-Accelerated Inference** — Custom neural network in CUDA optimized for speed  
- 🔁 **High-Speed Flow Parsing** — Multi-core DPDK pipeline with lock-free hash tables  
- 📈 **Real-Time Telemetry** — Kafka + Telegraf + InfluxDB + Grafana integration  
- 🔐 **VPN Traffic Generation** — Reproducible WireGuard traces via containerized trafficgen  
- 🔄 **Reproducible Environments** — Nix Flake + Docker Compose setup  

## Architecture

### Core Components

- **DPDK Ingress Pipeline**: Receives packets, extracts 5-tuples, builds flows
- **Flow Ring Buffer**: Batches flows for GPU handoff
- **CUDA Inference Engine**: Classifies flow batches using matrix multiplication
- **Telemetry Pipeline**: Exports telemetry via Kafka → Telegraf → InfluxDB → Grafana
- **Traffic Generator**: WireGuard container with Scapy-based session scripting

### Performance Optimizations

- **RSS Flow Distribution** via NIC hardware hash
- **NUMA-Aware Memory Pools** for isolated thread-local processing
- **Minimal CUDA Overhead** using raw kernels and manual weight loading
- **Flamegraph Profiling** to guide low-level optimizations (`perf` + `FlameGraph`)


