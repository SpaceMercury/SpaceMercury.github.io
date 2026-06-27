(() => {
  "use strict";

  const root = document.querySelector("[data-network-course]");
  if (!root) return;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const svgNS = "http://www.w3.org/2000/svg";
  const colors = {
    data: "#72e3bd",
    loss: "#ff8f82",
    control: "#8aa9ff",
    retry: "#f2cd76",
    streamA: "#72e3bd",
    streamB: "#b79cff"
  };

  const tabButtons = Array.from(root.querySelectorAll("[data-tab]"));
  const tabPanels = Array.from(root.querySelectorAll("[data-panel]"));
  const controllers = { journey: null, protocols: null };

  function activateTab(name, moveFocus = false) {
    tabButtons.forEach((button) => {
      const selected = button.dataset.tab === name;
      button.setAttribute("aria-selected", String(selected));
      button.tabIndex = selected ? 0 : -1;
      if (selected && moveFocus) button.focus();
    });

    tabPanels.forEach((panel) => {
      panel.hidden = panel.dataset.panel !== name;
    });

    if (name !== "journey") controllers.journey?.stop();
    if (name !== "protocols") controllers.protocols?.stop();
  }

  function scrollToCourseTabs() {
    const tabsAnchor = root.querySelector("[data-course-tabs-anchor]");
    if (!tabsAnchor) return;
    window.setTimeout(() => {
      tabsAnchor.scrollIntoView({
        behavior: reduceMotion ? "auto" : "smooth",
        block: "start"
      });
    }, 0);
  }

  tabButtons.forEach((button, index) => {
    button.addEventListener("click", () => activateTab(button.dataset.tab));
    button.addEventListener("keydown", (event) => {
      if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
      event.preventDefault();
      const direction = event.key === "ArrowRight" ? 1 : -1;
      const nextIndex = (index + direction + tabButtons.length) % tabButtons.length;
      activateTab(tabButtons[nextIndex].dataset.tab, true);
    });
  });

  root.querySelectorAll("[data-open-tab]").forEach((button) => {
    button.addEventListener("click", () => {
      activateTab(button.dataset.openTab);
      scrollToCourseTabs();
    });
  });

  function createEngine(lab) {
    const packetLayer = lab.querySelector("[data-packet-layer]");
    const routePath = lab.querySelector("[data-route-path]");
    const stateOutput = lab.querySelector("[data-network-state]");
    const eventLog = lab.querySelector("[data-network-log]");
    const packetFilter = lab.dataset.packetFilter;
    let runId = 0;

    function clearPackets() {
      packetLayer.replaceChildren();
    }

    function begin() {
      runId += 1;
      clearPackets();
      return runId;
    }

    function isActive(token) {
      return token === runId;
    }

    function setState(message) {
      stateOutput.textContent = message;
    }

    function resetLog() {
      eventLog.replaceChildren();
    }

    function logEvent(tag, message, tone = "") {
      const item = document.createElement("li");
      if (tone) item.classList.add(`is-${tone}`);
      const label = document.createElement("span");
      label.textContent = tag;
      item.append(label, document.createTextNode(message));
      eventLog.append(item);
      while (eventLog.children.length > 5) eventLog.firstElementChild.remove();
    }

    function wait(milliseconds, token) {
      const duration = reduceMotion ? Math.min(milliseconds, 80) : milliseconds;
      return new Promise((resolve) => {
        window.setTimeout(() => resolve(isActive(token)), duration);
      });
    }

    function makePacket(label, color) {
      const group = document.createElementNS(svgNS, "g");
      group.classList.add("packet-visual");

      const rect = document.createElementNS(svgNS, "rect");
      rect.setAttribute("x", "-16");
      rect.setAttribute("y", "-11");
      rect.setAttribute("width", "32");
      rect.setAttribute("height", "22");
      rect.setAttribute("rx", "4");
      rect.setAttribute("fill", color);
      if (packetFilter) rect.setAttribute("filter", `url(#${packetFilter})`);

      const text = document.createElementNS(svgNS, "text");
      text.setAttribute("text-anchor", "middle");
      text.setAttribute("y", "3");
      text.textContent = label;

      group.append(rect, text);
      packetLayer.append(group);
      return group;
    }

    function animatePacket({ label = "01", color = colors.data, duration = 1450, reverse = false, drop = false, offset = 0 }, token) {
      return new Promise((resolve) => {
        if (!isActive(token)) return resolve(false);

        const packet = makePacket(label, color);
        const pathLength = routePath.getTotalLength();
        const actualDuration = reduceMotion ? Math.min(duration, 180) : duration;
        const startTime = performance.now();

        function frame(now) {
          if (!isActive(token)) {
            packet.remove();
            resolve(false);
            return;
          }

          const rawProgress = Math.min((now - startTime) / actualDuration, 1);
          const progress = rawProgress < .5
            ? 2 * rawProgress * rawProgress
            : 1 - Math.pow(-2 * rawProgress + 2, 2) / 2;

          let routeProgress = progress;
          let fall = 0;
          let opacity = 1;

          if (drop) {
            const dropPoint = .66;
            if (progress < .72) {
              routeProgress = (progress / .72) * dropPoint;
            } else {
              routeProgress = dropPoint;
              const dropProgress = (progress - .72) / .28;
              fall = dropProgress * 88;
              opacity = 1 - dropProgress;
            }
          }

          if (reverse) routeProgress = 1 - routeProgress;
          const distance = pathLength * routeProgress;
          const point = routePath.getPointAtLength(distance);
          const nearby = routePath.getPointAtLength(Math.min(pathLength, distance + 1));
          const angle = Math.atan2(nearby.y - point.y, nearby.x - point.x);
          const normalX = -Math.sin(angle) * offset;
          const normalY = Math.cos(angle) * offset;

          packet.setAttribute("transform", `translate(${point.x + normalX} ${point.y + normalY + fall})`);
          packet.setAttribute("opacity", String(opacity));

          if (rawProgress < 1) {
            window.requestAnimationFrame(frame);
          } else {
            packet.remove();
            resolve(isActive(token));
          }
        }

        window.requestAnimationFrame(frame);
      });
    }

    function stop(message = "Paused.") {
      runId += 1;
      clearPackets();
      setState(message);
    }

    return { begin, isActive, setState, resetLog, logEvent, wait, animatePacket, stop };
  }

  function createJourneyController() {
    const lab = root.querySelector("[data-journey-lab]");
    if (!lab) return null;

    const engine = createEngine(lab);
    const scenarioTitle = lab.querySelector("[data-scenario-title]");
    const scenarioDescription = lab.querySelector("[data-scenario-description]");
    const scenarioButtons = Array.from(lab.querySelectorAll("[data-scenario]"));
    const replayButton = lab.querySelector("[data-journey-replay]");
    let currentScenario = "basic";

    const copy = {
      basic: ["A packet goes from A to B", "Routers inspect the destination and forward the packet one hop closer."],
      loss: ["A packet disappears", "IP makes a best effort. A full queue, broken link, or corrupted frame can end the trip."]
    };

    async function runBasic(token) {
      engine.setState("A wraps 48 bytes with B's destination address.");
      engine.logEvent("A · send", "203.0.113.42 · 48 bytes", "note");
      if (!await engine.wait(350, token)) return;
      engine.setState("Each router forwards the packet toward the next hop.");
      if (!await engine.animatePacket({ label: "01" }, token)) return;
      engine.setState("B received the packet. One trip took about 42 ms.");
      engine.logEvent("B · recv", "packet 01 · 42 ms", "success");
    }

    async function runLoss(token) {
      engine.setState("A sends normally. The route itself promises no receipt.");
      engine.logEvent("A · send", "packet 01", "note");
      if (!await engine.wait(250, token)) return;
      if (!await engine.animatePacket({ label: "01", color: colors.loss, drop: true, duration: 1700 }, token)) return;
      engine.setState("Packet 01 was dropped. B has no packet to acknowledge.");
      engine.logEvent("drop", "router 02 · packet 01", "loss");
      engine.logEvent("B", "nothing arrived", "loss");
    }

    function selectScenario(name) {
      currentScenario = name;
      const token = engine.begin();
      engine.resetLog();
      scenarioButtons.forEach((button) => {
        const active = button.dataset.scenario === name;
        button.classList.toggle("is-active", active);
        button.setAttribute("aria-pressed", String(active));
      });
      scenarioTitle.textContent = copy[name][0];
      scenarioDescription.textContent = copy[name][1];
      if (name === "basic") runBasic(token);
      if (name === "loss") runLoss(token);
    }

    scenarioButtons.forEach((button) => {
      button.addEventListener("click", () => selectScenario(button.dataset.scenario));
    });
    replayButton.addEventListener("click", () => selectScenario(currentScenario));

    if (!reduceMotion && "IntersectionObserver" in window) {
      const observer = new IntersectionObserver((entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        observer.disconnect();
        window.setTimeout(() => selectScenario("basic"), 450);
      }, { threshold: .38 });
      observer.observe(lab);
    }

    return {
      stop() {
        engine.stop("Paused. Return to Journey and press Replay when you are ready.");
      }
    };
  }

  function createProtocolController() {
    const simulator = root.querySelector("[data-protocol-lab]");
    if (!simulator) return null;

    const lab = simulator.querySelector(".protocol-network-lab");
    const engine = createEngine(lab);
    const pickerButtons = Array.from(simulator.querySelectorAll("[data-protocol]"));
    const kicker = simulator.querySelector("[data-protocol-kicker]");
    const protocolTitle = simulator.querySelector("[data-protocol-title]");
    const protocolCopy = simulator.querySelector("[data-protocol-copy]");
    const traits = simulator.querySelector("[data-protocol-traits]");
    const stepTitle = simulator.querySelector("[data-protocol-step-title]");
    const stepCount = simulator.querySelector("[data-protocol-step-count]");
    const stepDescription = simulator.querySelector("[data-protocol-step-description]");
    const progressLabel = simulator.querySelector("[data-step-progress-label]");
    const progressBar = simulator.querySelector("[data-step-progress]");
    const previousButton = simulator.querySelector("[data-step-prev]");
    const replayButton = simulator.querySelector("[data-step-replay]");
    const nextButton = simulator.querySelector("[data-step-next]");

    const definitions = {
      udp: {
        name: "UDP",
        kicker: "UDP · datagram transport",
        title: "Send it and keep moving.",
        copy: "UDP sends independent messages and leaves recovery policy to the application.",
        traits: ["No handshake", "No retransmission", "Message boundaries"],
        ready: "UDP is ready. Each datagram will be its own small event.",
        steps: [
          {
            label: "Datagram 01 arrives",
            description: "UDP sends the first datagram without establishing a connection.",
            async run(token) {
              engine.setState("A sends datagram 01 immediately.");
              engine.logEvent("A · UDP", "datagram 01", "note");
              if (!await engine.animatePacket({ label: "01", duration: 1200 }, token)) return false;
              engine.setState("B received datagram 01. UDP does not send a transport acknowledgement.");
              engine.logEvent("B · recv", "datagram 01", "success");
              return true;
            }
          },
          {
            label: "Datagram 02 is lost",
            description: "The next datagram is dropped. UDP itself does not notice or retransmit it.",
            async run(token) {
              engine.setState("A sends datagram 02 exactly like the first one.");
              engine.logEvent("A · UDP", "datagram 02", "note");
              if (!await engine.animatePacket({ label: "02", color: colors.loss, drop: true, duration: 1450 }, token)) return false;
              engine.setState("Datagram 02 vanished. UDP schedules no recovery.");
              engine.logEvent("drop", "datagram 02", "loss");
              return true;
            }
          },
          {
            label: "Datagram 03 keeps going",
            description: "A later datagram can still arrive even though number 02 never did.",
            async run(token) {
              engine.setState("UDP does not wait for the missing datagram before sending 03.");
              engine.logEvent("A · UDP", "datagram 03", "note");
              if (!await engine.animatePacket({ label: "03", duration: 1200 }, token)) return false;
              engine.setState("B has 01 and 03. The application decides whether the gap matters.");
              engine.logEvent("B · recv", "datagrams 01, 03", "success");
              engine.logEvent("gap", "datagram 02 missing", "loss");
              return true;
            }
          }
        ]
      },
      tcp: {
        name: "TCP",
        kicker: "TCP · ordered byte stream",
        title: "Deliver every byte, in order.",
        copy: "TCP creates shared connection state, detects gaps, retransmits missing data, and exposes one ordered stream.",
        traits: ["Reliable", "Ordered", "Congestion controlled"],
        ready: "TCP is ready. Start with its three-way handshake.",
        steps: [
          {
            label: "SYN",
            description: "A asks B to begin a TCP connection and proposes initial sequence state.",
            async run(token) {
              engine.setState("A starts the handshake with SYN.");
              engine.logEvent("A → B", "SYN", "note");
              if (!await engine.animatePacket({ label: "SYN", color: colors.control, duration: 900 }, token)) return false;
              engine.setState("B received the connection request.");
              return true;
            }
          },
          {
            label: "SYN + ACK",
            description: "B acknowledges A and sends its own connection parameters back.",
            async run(token) {
              engine.setState("B answers with SYN + ACK.");
              engine.logEvent("B → A", "SYN + ACK", "note");
              if (!await engine.animatePacket({ label: "S+A", color: colors.control, reverse: true, duration: 900 }, token)) return false;
              engine.setState("A received B's acknowledgement and sequence state.");
              return true;
            }
          },
          {
            label: "ACK · connected",
            description: "A acknowledges B. Both endpoints now agree that the connection exists.",
            async run(token) {
              engine.setState("A completes the handshake with ACK.");
              engine.logEvent("A → B", "ACK", "note");
              if (!await engine.animatePacket({ label: "ACK", color: colors.control, duration: 800 }, token)) return false;
              engine.setState("The TCP connection is established.");
              engine.logEvent("TCP", "connection established", "success");
              return true;
            }
          },
          {
            label: "Segment 01 arrives",
            description: "The first piece of application data reaches B in sequence.",
            async run(token) {
              engine.setState("A sends the first data segment.");
              engine.logEvent("A → B", "segment 01", "note");
              if (!await engine.animatePacket({ label: "01", duration: 1000 }, token)) return false;
              engine.setState("B can deliver segment 01 immediately.");
              engine.logEvent("B · recv", "segment 01", "success");
              return true;
            }
          },
          {
            label: "Segment 02 is lost",
            description: "The next segment disappears, creating a hole in TCP's ordered byte stream.",
            async run(token) {
              engine.setState("A sends segment 02, but the network drops it.");
              engine.logEvent("A → B", "segment 02", "note");
              if (!await engine.animatePacket({ label: "02", color: colors.loss, drop: true, duration: 1350 }, token)) return false;
              engine.setState("B is now missing the next expected bytes.");
              engine.logEvent("drop", "segment 02", "loss");
              return true;
            }
          },
          {
            label: "Segment 03 waits",
            description: "Segment 03 arrives, but TCP cannot expose it as the next ordered bytes while 02 is absent.",
            async run(token) {
              engine.setState("A sends segment 03. It can cross the network normally.");
              engine.logEvent("A → B", "segment 03", "note");
              if (!await engine.animatePacket({ label: "03", offset: 10, duration: 1100 }, token)) return false;
              engine.setState("B buffers 03 and continues asking for the missing segment 02.");
              engine.logEvent("B · buffer", "03 · waiting for 02", "loss");
              return true;
            }
          },
          {
            label: "Segment 02 is retransmitted",
            description: "TCP repairs the gap by sending the missing bytes again.",
            async run(token) {
              engine.setState("A retransmits the missing segment 02.");
              engine.logEvent("A → B", "retransmit 02", "note");
              if (!await engine.animatePacket({ label: "02", color: colors.retry, duration: 1050 }, token)) return false;
              engine.setState("B now has a continuous sequence from 01 through 03.");
              engine.logEvent("B · recv", "segment 02 recovered", "success");
              return true;
            }
          },
          {
            label: "ACK · release in order",
            description: "B acknowledges the repaired stream and releases the bytes to the application in order.",
            async run(token) {
              engine.setState("B acknowledges the complete ordered range.");
              engine.logEvent("B → A", "ACK through 03", "note");
              if (!await engine.animatePacket({ label: "ACK", color: colors.control, reverse: true, duration: 850 }, token)) return false;
              engine.setState("The application receives bytes 01 → 03 in order.");
              engine.logEvent("B · deliver", "bytes 01 → 03", "success");
              return true;
            }
          }
        ]
      },
      quic: {
        name: "QUIC",
        kicker: "QUIC · secure multiplexed streams",
        title: "Reliability, with independent lanes.",
        copy: "QUIC builds secure, reliable connections over UDP and lets multiple application streams progress independently.",
        traits: ["TLS integrated", "Multiplexed", "Connection migration"],
        ready: "QUIC is ready. Begin with its encrypted connection setup.",
        steps: [
          {
            label: "Initial + TLS",
            description: "A begins a QUIC connection and carries TLS handshake data in the first exchange.",
            async run(token) {
              engine.setState("A sends a QUIC Initial carrying TLS handshake data.");
              engine.logEvent("A → B", "QUIC Initial + TLS", "note");
              if (!await engine.animatePacket({ label: "INIT", color: colors.control, duration: 950 }, token)) return false;
              engine.setState("B can process connection and security setup together.");
              return true;
            }
          },
          {
            label: "Handshake response",
            description: "B answers with encrypted handshake data and connection parameters.",
            async run(token) {
              engine.setState("B returns the QUIC handshake response.");
              engine.logEvent("B → A", "handshake", "note");
              if (!await engine.animatePacket({ label: "HS", color: colors.control, reverse: true, duration: 850 }, token)) return false;
              engine.setState("The secure QUIC connection is ready for application streams.");
              engine.logEvent("QUIC", "secure connection ready", "success");
              return true;
            }
          },
          {
            label: "Two streams move together",
            description: "Stream A and stream B share the connection while keeping their application data separate.",
            async run(token) {
              engine.setState("A sends data on two independent QUIC streams.");
              engine.logEvent("streams", "A = green · B = violet", "note");
              const results = await Promise.all([
                engine.animatePacket({ label: "A1", color: colors.streamA, offset: -16, duration: 1200 }, token),
                engine.animatePacket({ label: "B1", color: colors.streamB, offset: 16, duration: 1250 }, token)
              ]);
              if (!results.every(Boolean) || !engine.isActive(token)) return false;
              engine.setState("B receives useful data on both streams.");
              engine.logEvent("B · recv", "A1 and B1", "success");
              return true;
            }
          },
          {
            label: "A2 is lost; B2 continues",
            description: "Loss affects stream A, while stream B continues delivering data on the same connection.",
            async run(token) {
              engine.setState("A2 is lost, but B2 does not have to wait behind it.");
              engine.logEvent("streams", "A2 lost · B2 moving", "note");
              const results = await Promise.all([
                engine.animatePacket({ label: "A2", color: colors.loss, offset: -16, drop: true, duration: 1450 }, token),
                (async () => {
                  if (!await engine.wait(180, token)) return false;
                  return engine.animatePacket({ label: "B2", color: colors.streamB, offset: 16, duration: 1250 }, token);
                })()
              ]);
              if (!results.every(Boolean) || !engine.isActive(token)) return false;
              engine.setState("Stream B delivered B2 while stream A still has a gap.");
              engine.logEvent("B · stream B", "B2 delivered", "success");
              engine.logEvent("stream A", "A2 missing", "loss");
              return true;
            }
          },
          {
            label: "Stream B is already usable",
            description: "The application can use stream B's data without waiting for stream A's missing bytes.",
            async run(token) {
              engine.setState("Only stream A is blocked by its own missing data.");
              engine.logEvent("stream B", "B1, B2 delivered", "success");
              engine.logEvent("stream A", "waiting for A2", "loss");
              if (!await engine.wait(320, token)) return false;
              return true;
            }
          },
          {
            label: "A2 is repaired",
            description: "QUIC retransmits the missing stream A data; stream B needed no replay.",
            async run(token) {
              engine.setState("QUIC retransmits A2 for stream A only.");
              engine.logEvent("A → B", "stream A · retry A2", "note");
              if (!await engine.animatePacket({ label: "A2", color: colors.retry, offset: -16, duration: 1050 }, token)) return false;
              engine.setState("Both streams are complete. Stream B never waited for A2.");
              engine.logEvent("B · stream A", "A2 recovered", "success");
              return true;
            }
          }
        ]
      }
    };

    let currentProtocol = "udp";
    let currentStep = -1;
    let running = false;

    function renderTraits(items) {
      traits.replaceChildren(...items.map((item) => {
        const element = document.createElement("span");
        element.textContent = item;
        return element;
      }));
    }

    function updateControls() {
      const steps = definitions[currentProtocol].steps;
      previousButton.disabled = running || currentStep < 0;
      replayButton.disabled = running || currentStep < 0;
      nextButton.disabled = running || currentStep >= steps.length - 1;
      nextButton.innerHTML = currentStep < 0
        ? "Start <span aria-hidden=\"true\">→</span>"
        : "Next step <span aria-hidden=\"true\">→</span>";
    }

    function renderReady() {
      const definition = definitions[currentProtocol];
      currentStep = -1;
      running = false;
      engine.begin();
      engine.resetLog();
      stepTitle.textContent = `${definition.name} · ready`;
      stepCount.textContent = `Step 0 of ${definition.steps.length}`;
      stepDescription.textContent = `Use Next step to begin the ${definition.name} exchange.`;
      progressLabel.textContent = "Choose Start when you are ready";
      progressBar.style.width = "0%";
      engine.setState(definition.ready);
      engine.logEvent("ready", "waiting for step 01");
      updateControls();
    }

    function selectProtocol(name) {
      currentProtocol = name;
      const definition = definitions[name];
      pickerButtons.forEach((button) => {
        const active = button.dataset.protocol === name;
        button.classList.toggle("is-active", active);
        button.setAttribute("aria-pressed", String(active));
      });
      kicker.textContent = definition.kicker;
      protocolTitle.textContent = definition.title;
      protocolCopy.textContent = definition.copy;
      renderTraits(definition.traits);
      renderReady();
    }

    async function runStep(index) {
      const definition = definitions[currentProtocol];
      const step = definition.steps[index];
      currentStep = index;
      running = true;
      const token = engine.begin();
      engine.resetLog();
      stepTitle.textContent = `${definition.name} · ${step.label}`;
      stepCount.textContent = `Step ${index + 1} of ${definition.steps.length}`;
      stepDescription.textContent = step.description;
      progressLabel.textContent = step.label;
      progressBar.style.width = `${((index + 1) / definition.steps.length) * 100}%`;
      updateControls();

      await step.run(token);
      if (!engine.isActive(token)) return;
      running = false;
      updateControls();
    }

    pickerButtons.forEach((button) => {
      button.addEventListener("click", () => selectProtocol(button.dataset.protocol));
    });

    previousButton.addEventListener("click", () => {
      if (running || currentStep < 0) return;
      if (currentStep === 0) {
        renderReady();
      } else {
        runStep(currentStep - 1);
      }
    });

    replayButton.addEventListener("click", () => {
      if (!running && currentStep >= 0) runStep(currentStep);
    });

    nextButton.addEventListener("click", () => {
      const steps = definitions[currentProtocol].steps;
      if (!running && currentStep < steps.length - 1) runStep(currentStep + 1);
    });

    selectProtocol("udp");

    return {
      stop() {
        engine.stop("Paused. Return to Protocols to continue step by step.");
        running = false;
        updateControls();
      }
    };
  }

  controllers.journey = createJourneyController();
  controllers.protocols = createProtocolController();
})();
