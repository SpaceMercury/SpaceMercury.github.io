+++
title = "DynamoDB in Go"
date = 2025-07-18T00:00:00+00:00
technologies = ["Go", ]
status = "Finished"
github = "https://github.com/spacemercury/"
+++


# Implementation of DynamoDB in Golang

### DynamoDB in Go

As part of a distributed systems course at EPFL, me and my group built Dynaster, a Dynamo-inspired key-value store written in Go. The idea was to recreate some of the concepts behind Amazon’s Dynamo — high availability, replication, and fault tolerance — but in a simplified, educational setting.

The project runs on top of Peerster, a decentralized messaging and storage system we had been developing throughout the semester. Dynaster adds a new layer on top of it to manage how data gets distributed, stored, and recovered when things go wrong.

At the heart of the system is consistent hashing, which organizes data on a virtual ring. This way, keys are spread evenly across the network, and when a new node joins, it simply “steals” a fair share of tokens from other nodes. Every node can handle get and put requests, and data is always replicated so that failures don’t mean data loss.

To make sure everything actually worked, we set up unit, integration, and performance tests, automated through GitHub Actions. The system reached around 86% test coverage, and the performance tests showed the expected behavior: local operations are faster, remote operations a bit slower, but everything stays stable under load.

Building Dynaster was a great way to understand how large-scale distributed systems like Dynamo or Cassandra actually work under the hood — and how much complexity is hidden behind the simple idea of “just storing key-value pairs.”

