+++
title = "Host Network Reliability Testing at Uber"
date = 2026-06-27T00:00:00+02:00
note_type = "Engineering note"
status = "Current work"
tools = ["Go", "Cadence", "Buildkite", "Layer 4 networking"]
summary = "A public-facing summary of the reliability testing infrastructure I am building for host networking systems at Uber."
+++

I am currently working at Uber on the Host Network team, where my focus is reliability infrastructure for host networking systems.

The core project is a distributed end-to-end testing orchestrator built with Go and Cadence. The platform validates Layer 4 network proxies and routing agents through production-style flows, giving the team a repeatable way to catch regressions before they reach production.

The testing suites model real network behavior instead of isolated unit paths. Buildkite integration runs those suites continuously, while the orchestration layer makes longer-running, multi-step validation flows manageable and observable.

One important design goal is onboarding. The platform is built so other engineering teams can bring their own deployment and validation use cases into the same infrastructure instead of maintaining separate testing stacks.
