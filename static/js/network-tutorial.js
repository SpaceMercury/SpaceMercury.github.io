(() => {
  "use strict";

  const root = document.querySelector("[data-network-course]");
  if (!root) return;

  const tabButtons = Array.from(root.querySelectorAll("[data-tab]"));
  const tabPanels = Array.from(root.querySelectorAll("[data-panel]"));
  let stopLab = () => {};

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

    if (name !== "journey") stopLab();
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
      root.querySelector(".course-tabs-wrap").scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });

  const lab = root.querySelector("[data-network-lab]");
  if (!lab) return;

  const packetLayer = lab.querySelector("[data-packet-layer]");
  const routePath = lab.querySelector("[data-route-path]");
  const stateOutput = lab.querySelector("[data-network-state]");
  const eventLog = lab.querySelector("[data-network-log]");
  const scenarioTitle = lab.querySelector("[data-scenario-title]");
  const scenarioDescription = lab.querySelector("[data-scenario-description]");
  const scenarioButtons = Array.from(lab.querySelectorAll("[data-scenario]"));
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const svgNS = "http://www.w3.org/2000/svg";
  let runId = 0;

  const copy = {
    basic: ["A packet goes from A to B", "Routers inspect the destination and forward the packet one hop closer."],
    loss: ["A packet disappears", "IP makes a best effort. A full queue, broken link, or corrupted frame can end the trip."],
    udp: ["UDP keeps sending", "Each datagram is independent. If number 02 disappears, UDP does not repair the gap."],
    tcp: ["TCP notices and repairs", "Acknowledgements and sequence numbers let TCP detect missing data and retransmit it."],
    quic: ["QUIC uses independent streams", "One stream can repair loss while useful data on another stream continues forward."]
  };

  const colors = {
    data: "#72e3bd",
    loss: "#ff8f82",
    control: "#8aa9ff",
    retry: "#f2cd76",
    streamA: "#72e3bd",
    streamB: "#b79cff"
  };

  function clearPackets() {
    packetLayer.replaceChildren();
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
      window.setTimeout(() => resolve(token === runId), duration);
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
      if (token !== runId) return resolve(false);

      const packet = makePacket(label, color);
      const pathLength = routePath.getTotalLength();
      const actualDuration = reduceMotion ? Math.min(duration, 180) : duration;
      const startTime = performance.now();

      function frame(now) {
        if (token !== runId) {
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
          requestAnimationFrame(frame);
        } else {
          packet.remove();
          resolve(token === runId);
        }
      }

      requestAnimationFrame(frame);
    });
  }

  async function runBasic(token) {
    setState("A wraps 48 bytes with B's destination address.");
    logEvent("A · send", "203.0.113.42 · 48 bytes", "note");
    if (!await wait(350, token)) return;
    setState("Each router forwards the packet toward the next hop.");
    if (!await animatePacket({ label: "01" }, token)) return;
    setState("B received the packet. One trip took about 42 ms.");
    logEvent("B · recv", "packet 01 · 42 ms", "success");
  }

  async function runLoss(token) {
    setState("A sends normally. The route itself promises no receipt.");
    logEvent("A · send", "packet 01", "note");
    if (!await wait(250, token)) return;
    if (!await animatePacket({ label: "01", color: colors.loss, drop: true, duration: 1700 }, token)) return;
    setState("Packet 01 was dropped. B has no packet to acknowledge.");
    logEvent("drop", "router 02 · packet 01", "loss");
    logEvent("B", "nothing arrived", "loss");
  }

  async function runUdp(token) {
    setState("UDP sends three separate datagrams without waiting.");
    logEvent("A · UDP", "datagrams 01, 02, 03", "note");

    const jobs = [
      animatePacket({ label: "01", duration: 1450, offset: -11 }, token),
      (async () => { if (!await wait(140, token)) return false; return animatePacket({ label: "02", color: colors.loss, duration: 1500, drop: true }, token); })(),
      (async () => { if (!await wait(280, token)) return false; return animatePacket({ label: "03", duration: 1450, offset: 11 }, token); })()
    ];
    await Promise.all(jobs);
    if (token !== runId) return;

    setState("B received 01 and 03. UDP leaves the missing 02 to the application.");
    logEvent("B · recv", "datagrams 01, 03", "success");
    logEvent("gap", "datagram 02 missing", "loss");
  }

  async function runTcp(token) {
    setState("First, TCP establishes shared connection state.");
    logEvent("A → B", "SYN", "note");
    if (!await animatePacket({ label: "SYN", color: colors.control, duration: 900 }, token)) return;
    logEvent("B → A", "SYN + ACK", "note");
    if (!await animatePacket({ label: "S+A", color: colors.control, reverse: true, duration: 900 }, token)) return;
    logEvent("A → B", "ACK · connected", "success");
    if (!await animatePacket({ label: "ACK", color: colors.control, duration: 800 }, token)) return;

    setState("Segment 02 is lost. Segment 03 arrives, but the ordered stream has a gap.");
    if (!await animatePacket({ label: "01", offset: -10, duration: 900 }, token)) return;
    logEvent("B · recv", "segment 01", "success");
    const lost = animatePacket({ label: "02", color: colors.loss, drop: true, duration: 1300 }, token);
    const later = (async () => { if (!await wait(170, token)) return false; return animatePacket({ label: "03", offset: 10, duration: 1200 }, token); })();
    await Promise.all([lost, later]);
    if (token !== runId) return;
    logEvent("B · buffer", "segment 03 · waiting for 02", "loss");
    setState("TCP retransmits 02, then releases the complete byte stream in order.");
    if (!await animatePacket({ label: "02", color: colors.retry, duration: 1050 }, token)) return;
    if (!await animatePacket({ label: "ACK", color: colors.control, reverse: true, duration: 800 }, token)) return;
    logEvent("B · deliver", "bytes 01 → 03 in order", "success");
  }

  async function runQuic(token) {
    setState("QUIC creates a secure connection, then carries independent streams.");
    logEvent("A → B", "QUIC Initial + TLS", "note");
    if (!await animatePacket({ label: "INIT", color: colors.control, duration: 950 }, token)) return;
    if (!await animatePacket({ label: "HS", color: colors.control, reverse: true, duration: 850 }, token)) return;

    setState("Stream A loses data. Stream B keeps moving on the same connection.");
    logEvent("streams", "A = green · B = violet", "note");
    const streamJobs = [
      animatePacket({ label: "A1", color: colors.streamA, offset: -16, duration: 1200 }, token),
      animatePacket({ label: "B1", color: colors.streamB, offset: 16, duration: 1250 }, token),
      (async () => { if (!await wait(190, token)) return false; return animatePacket({ label: "A2", color: colors.loss, offset: -16, drop: true, duration: 1450 }, token); })(),
      (async () => { if (!await wait(360, token)) return false; return animatePacket({ label: "B2", color: colors.streamB, offset: 16, duration: 1250 }, token); })()
    ];
    await Promise.all(streamJobs);
    if (token !== runId) return;

    logEvent("B · stream B", "B1, B2 delivered", "success");
    logEvent("stream A", "A2 missing · repairing", "loss");
    setState("Only stream A waits for A2. Stream B has already delivered useful data.");
    if (!await animatePacket({ label: "A2", color: colors.retry, offset: -16, duration: 1050 }, token)) return;
    logEvent("B · stream A", "A2 recovered", "success");
    setState("A2 recovered. Both streams are complete, and stream B never had to wait.");
  }

  const scenarios = { basic: runBasic, loss: runLoss, udp: runUdp, tcp: runTcp, quic: runQuic };

  function selectScenario(name) {
    const token = ++runId;
    clearPackets();
    resetLog();
    scenarioButtons.forEach((button) => {
      const active = button.dataset.scenario === name;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", String(active));
    });
    scenarioTitle.textContent = copy[name][0];
    scenarioDescription.textContent = copy[name][1];
    scenarios[name](token);
  }

  stopLab = () => {
    runId += 1;
    clearPackets();
    setState("Paused. Return to Journey to run another experiment.");
  };

  scenarioButtons.forEach((button) => {
    button.addEventListener("click", () => selectScenario(button.dataset.scenario));
  });

  if (!reduceMotion && "IntersectionObserver" in window) {
    const observer = new IntersectionObserver((entries) => {
      if (!entries.some((entry) => entry.isIntersecting) || runId !== 0) return;
      observer.disconnect();
      window.setTimeout(() => {
        if (runId === 0) selectScenario("basic");
      }, 450);
    }, { threshold: .38 });
    observer.observe(lab);
  }
})();
