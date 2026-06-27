(() => {
  "use strict";

  const root = document.querySelector("[data-git-course]");
  if (!root) return;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const tabButtons = Array.from(root.querySelectorAll("[data-tab]"));
  const tabPanels = Array.from(root.querySelectorAll("[data-panel]"));

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
  }

  function scrollToTabs() {
    const tabs = root.querySelector(".course-tabs-wrap");
    if (!tabs) return;
    const top = tabs.getBoundingClientRect().top + window.scrollY - 12;
    window.scrollTo({ top: Math.max(0, top), behavior: reduceMotion ? "auto" : "smooth" });
  }

  tabButtons.forEach((button, index) => {
    button.addEventListener("click", () => activateTab(button.dataset.tab));
    button.addEventListener("keydown", (event) => {
      if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
      event.preventDefault();
      const direction = event.key === "ArrowRight" ? 1 : -1;
      const next = (index + direction + tabButtons.length) % tabButtons.length;
      activateTab(tabButtons[next].dataset.tab, true);
    });
  });

  root.querySelectorAll("[data-open-tab]").forEach((button) => {
    button.addEventListener("click", () => {
      activateTab(button.dataset.openTab);
      window.requestAnimationFrame(scrollToTabs);
    });
  });

  function createLocalLab() {
    const lab = root.querySelector("[data-local-lab]");
    if (!lab) return;

    const buttons = Array.from(lab.querySelectorAll("[data-local-action]"));
    const worktreeFile = lab.querySelector("[data-worktree-file]");
    const worktreeState = lab.querySelector("[data-worktree-state]");
    const worktreeBadge = lab.querySelector("[data-worktree-badge]");
    const stagedFile = lab.querySelector("[data-staged-file]");
    const stageEmpty = lab.querySelector("[data-stage-empty]");
    const commitB = lab.querySelector("[data-local-commit-b]");
    const link = lab.querySelector("[data-local-link]");
    const commitALabel = lab.querySelector("[data-commit-a-label]");
    const progress = lab.querySelector("[data-local-progress]");
    const command = lab.querySelector("[data-local-command]");
    const message = lab.querySelector("[data-local-message]");
    let state = 0;

    const states = [
      { progress: "Clean repository", command: "$ git status", message: "Nothing to commit. Your working tree matches commit A." },
      { progress: "Modified · not staged", command: "$ git diff", message: "app.js differs from commit A, but the next snapshot is still empty." },
      { progress: "Change staged", command: "$ git add app.js", message: "The updated app.js is now part of the proposed next snapshot." },
      { progress: "Commit B created", command: "$ git commit -m \"Update button label\"", message: "Git stored a new snapshot B, linked it to parent A, and moved main forward." }
    ];

    function render() {
      const current = states[state];
      progress.textContent = current.progress;
      command.textContent = current.command;
      message.textContent = current.message;

      worktreeFile.classList.toggle("is-modified", state === 1 || state === 2);
      worktreeState.textContent = state === 0 ? "matches commit A" : state === 3 ? "matches commit B" : "button label updated";
      worktreeBadge.textContent = state === 0 || state === 3 ? "clean" : "modified";
      stagedFile.hidden = state !== 2;
      stageEmpty.hidden = state === 2;
      stageEmpty.textContent = state === 3 ? "Snapshot recorded; the stage is clear." : "Nothing selected yet.";
      commitB.hidden = state !== 3;
      link.hidden = state !== 3;
      commitALabel.textContent = state === 3 ? "parent of B" : "main · HEAD";

      buttons.forEach((button) => {
        const action = button.dataset.localAction;
        if (action === "edit") button.disabled = state !== 0;
        if (action === "stage") button.disabled = state !== 1;
        if (action === "commit") button.disabled = state !== 2;
        button.classList.toggle("is-complete", (action === "edit" && state > 0) || (action === "stage" && state > 1) || (action === "commit" && state > 2));
      });
    }

    buttons.forEach((button) => {
      button.addEventListener("click", () => {
        const action = button.dataset.localAction;
        if (action === "reset") state = 0;
        if (action === "edit" && state === 0) state = 1;
        if (action === "stage" && state === 1) state = 2;
        if (action === "commit" && state === 2) state = 3;
        render();
      });
    });

    render();
  }

  function createAnatomyController() {
    const card = root.querySelector("[data-anatomy-card]");
    if (!card) return;

    const copy = card.querySelector("[data-anatomy-copy]");
    const controls = Array.from(root.querySelectorAll("[data-graph-focus]"));
    const descriptions = {
      commit: "<strong>Commit C</strong> stores a project snapshot, metadata, and the identity of parent B.",
      branch: "<strong>main</strong> is a movable name. A new commit on main makes this label advance.",
      head: "<strong>HEAD</strong> says what is checked out. Here it refers to main, which refers to commit C."
    };

    controls.forEach((button) => {
      button.addEventListener("click", () => {
        const focus = button.dataset.graphFocus;
        card.dataset.focus = focus;
        copy.innerHTML = descriptions[focus];
        controls.forEach((candidate) => {
          const active = candidate === button;
          candidate.classList.toggle("is-active", active);
          candidate.setAttribute("aria-pressed", String(active));
        });
      });
    });
  }

  function createBranchLab() {
    const lab = root.querySelector("[data-branch-lab]");
    if (!lab) return;

    const title = lab.querySelector("[data-branch-title]");
    const count = lab.querySelector("[data-branch-count]");
    const description = lab.querySelector("[data-branch-description]");
    const progress = lab.querySelector("[data-branch-progress]");
    const progressBar = lab.querySelector("[data-branch-progress-bar]");
    const command = lab.querySelector("[data-branch-command]");
    const message = lab.querySelector("[data-branch-message]");
    const previous = lab.querySelector("[data-branch-prev]");
    const next = lab.querySelector("[data-branch-next]");
    const elements = {};
    lab.querySelectorAll("[data-branch-element]").forEach((element) => { elements[element.dataset.branchElement] = element; });
    const mainAtB = lab.querySelector("[data-branch-main-b]");
    const headAtB = lab.querySelector("[data-branch-head-main]");
    let step = 0;

    const steps = [
      { title: "Start on main", description: "Two commits exist. main and HEAD both point to B.", progress: "main points to B", command: "$ git log --oneline --graph", message: "Nothing has diverged yet: A ← B, with main checked out.", next: "Next: create branch" },
      { title: "Create feature at B", description: "A new label appears at the current commit. No files or commits are copied.", progress: "feature and main point to B", command: "$ git switch -c feature", message: "HEAD now follows feature. Both branch names still identify the same snapshot B.", next: "Next: commit on feature" },
      { title: "Commit F1 on feature", description: "The new commit points to B. Only the checked-out feature label advances.", progress: "feature points to F1", command: "$ git commit -am \"Add search\"", message: "The feature branch has grown one commit beyond B; main has not moved.", next: "Next: switch to main" },
      { title: "Switch back to main", description: "HEAD follows main again, and the working tree is restored to snapshot B.", progress: "HEAD follows main at B", command: "$ git switch main", message: "F1 still exists on feature. Switching changed your position, not the history.", next: "Next: commit on main" },
      { title: "Commit C on main", description: "main advances independently. The shared ancestor B now has two different descendants.", progress: "the history has diverged", command: "$ git commit -am \"Update navigation\"", message: "This fork is the ordinary shape that merge or rebase will later integrate.", next: "Complete" }
    ];

    function show(name, visible) { if (elements[name]) elements[name].toggleAttribute("hidden", !visible); }

    function render() {
      const current = steps[step];
      title.textContent = current.title;
      count.textContent = `Step ${step} of ${steps.length - 1}`;
      description.textContent = current.description;
      progress.textContent = current.progress;
      progressBar.style.width = `${(step / (steps.length - 1)) * 100}%`;
      command.textContent = current.command;
      message.textContent = current.message;
      previous.disabled = step === 0;
      next.disabled = step === steps.length - 1;
      next.innerHTML = `${current.next}${step < steps.length - 1 ? ' <span aria-hidden="true">→</span>' : ''}`;

      const hasFeature = step >= 1;
      const featureCommitted = step >= 2;
      const mainCommitted = step >= 4;
      show("feature-label-b", hasFeature && !featureCommitted);
      show("feature-edge", featureCommitted);
      show("feature-node", featureCommitted);
      show("feature-label-f", featureCommitted);
      show("main-edge", mainCommitted);
      show("main-node", mainCommitted);
      show("main-label", mainCommitted);
      show("head-feature", step === 2);
      show("head-main-c", step === 4);
      mainAtB.toggleAttribute("hidden", mainCommitted);
      headAtB.toggleAttribute("hidden", step === 2 || step === 4);
    }

    previous.addEventListener("click", () => { if (step > 0) { step -= 1; render(); } });
    next.addEventListener("click", () => { if (step < steps.length - 1) { step += 1; render(); } });
    render();
  }

  function createIntegrateLab() {
    const lab = root.querySelector("[data-integrate-lab]");
    if (!lab) return;

    const buttons = Array.from(lab.querySelectorAll("[data-integrate-mode]"));
    const stage = lab.querySelector("[data-integrate-stage]");
    const operation = lab.querySelector("[data-operation-command]");
    const kicker = lab.querySelector("[data-integrate-kicker]");
    const title = lab.querySelector("[data-integrate-title]");
    const copy = lab.querySelector("[data-integrate-copy]");
    const traits = lab.querySelector("[data-integrate-traits]");
    const change = lab.querySelector("[data-integrate-change]");
    const story = lab.querySelector("[data-integrate-story]");
    const when = lab.querySelector("[data-integrate-when]");

    const modes = {
      merge: {
        operation: "git merge feature", kicker: "MERGE · preserve the fork", title: "Create a commit with two parents.",
        copy: "The existing commits keep their identities. A new merge commit records that main and feature were joined here.",
        traits: ["Original commits stay", "Topology stays visible", "New merge commit"],
        change: "A merge commit is added.", story: "“These two lines met here.”", when: "The branch is shared or its shape matters."
      },
      rebase: {
        operation: "git rebase main", kicker: "REBASE · replay the feature", title: "Copy commits onto a new parent.",
        copy: "Git creates D′ and E′ after C. They contain the feature changes, but they are new commits with new identities and parents.",
        traits: ["Commits are replaced", "Linear result", "No merge commit"],
        change: "D and E become new D′ and E′.", story: "“The feature began after C.”", when: "The commits are private and a linear story helps."
      }
    };

    function render(mode) {
      const definition = modes[mode];
      stage.dataset.mode = mode;
      operation.textContent = definition.operation;
      kicker.textContent = definition.kicker;
      title.textContent = definition.title;
      copy.textContent = definition.copy;
      traits.replaceChildren(...definition.traits.map((trait) => {
        const span = document.createElement("span"); span.textContent = trait; return span;
      }));
      change.textContent = definition.change;
      story.textContent = definition.story;
      when.textContent = definition.when;
      buttons.forEach((button) => {
        const active = button.dataset.integrateMode === mode;
        button.classList.toggle("is-active", active);
        button.setAttribute("aria-pressed", String(active));
      });
    }

    buttons.forEach((button) => button.addEventListener("click", () => render(button.dataset.integrateMode)));
    render("merge");
  }

  function createConflictLab() {
    const lab = root.querySelector("[data-conflict-lab]");
    if (!lab) return;

    const file = lab.querySelector(".git-conflict-file");
    const fileLabel = lab.querySelector("[data-conflict-file-label]");
    const state = lab.querySelector("[data-conflict-state]");
    const preview = lab.querySelector("[data-conflict-preview]");
    const command = lab.querySelector("[data-conflict-command]");
    const message = lab.querySelector("[data-conflict-message]");
    const choices = Array.from(lab.querySelectorAll("[data-conflict-choice]"));
    const reset = lab.querySelector("[data-conflict-reset]");
    const values = { main: "Explore", feature: "Discover", combine: "Explore & Discover" };

    function resetConflict() {
      file.classList.remove("is-resolved");
      fileLabel.textContent = "nav.js · conflict";
      state.textContent = "needs a human decision";
      preview.innerHTML = '<span>&lt;&lt;&lt;&lt;&lt;&lt;&lt; main</span>\nconst label = "Explore";\n<span>=======</span>\nconst label = "Discover";\n<span>&gt;&gt;&gt;&gt;&gt;&gt;&gt; feature</span>';
      command.textContent = "$ git status";
      message.textContent = "Both branches changed line 12. Git has preserved both versions for you to resolve.";
      choices.forEach((button) => { button.disabled = false; });
      reset.disabled = true;
    }

    choices.forEach((button) => {
      button.addEventListener("click", () => {
        const value = values[button.dataset.conflictChoice];
        file.classList.add("is-resolved");
        fileLabel.textContent = "nav.js · resolved";
        state.textContent = "resolved and staged";
        preview.innerHTML = `<span>// conflict markers removed</span>\nconst label = "${value}";`;
        command.textContent = "$ git add nav.js && git commit";
        message.textContent = `You chose the project meaning: “${value}”. Git can now record the resolution.`;
        choices.forEach((candidate) => { candidate.disabled = true; });
        reset.disabled = false;
      });
    });

    reset.addEventListener("click", resetConflict);
    resetConflict();
  }

  function createRemoteLab() {
    const lab = root.querySelector("[data-remote-lab]");
    if (!lab) return;

    const title = lab.querySelector("[data-remote-title]");
    const count = lab.querySelector("[data-remote-count]");
    const progress = lab.querySelector("[data-remote-progress]");
    const progressBar = lab.querySelector("[data-remote-progress-bar]");
    const command = lab.querySelector("[data-remote-command]");
    const message = lab.querySelector("[data-remote-message]");
    const localMain = lab.querySelector("[data-local-main]");
    const originMain = lab.querySelector("[data-origin-main]");
    const remoteMain = lab.querySelector("[data-remote-main]");
    const localCopy = lab.querySelector("[data-local-repo-copy]");
    const remoteCopy = lab.querySelector("[data-remote-repo-copy]");
    const localC = lab.querySelector("[data-local-c]");
    const localEdgeC = lab.querySelector("[data-local-edge-c]");
    const localD = lab.querySelector("[data-local-d]");
    const localEdgeD = lab.querySelector("[data-local-edge-d]");
    const remoteD = lab.querySelector("[data-remote-d]");
    const remoteEdgeD = lab.querySelector("[data-remote-edge-d]");
    const previous = lab.querySelector("[data-remote-prev]");
    const next = lab.querySelector("[data-remote-next]");
    const channel = lab.querySelector(".git-remote-channel");
    const channelLabel = lab.querySelector("[data-channel-label]");
    let step = 0;

    const steps = [
      { title: "The remote is one commit ahead", progress: "Local knowledge is stale", command: "$ git status", message: "Your repository cannot know C exists until it talks to origin.", next: "Next: fetch", localMain: "main → B", origin: "origin/main → B", remote: "main → C", localCopy: "You have A and B. origin/main still reflects the last fetched state.", remoteCopy: "Someone else pushed C. Nothing on your computer changes automatically." },
      { title: "Fetch updates knowledge, not your files", progress: "C downloaded · main unchanged", command: "$ git fetch origin", message: "C is now in your local object database and origin/main moved to it. Your main branch still points to B.", next: "Next: integrate", localMain: "main → B", origin: "origin/main → C", remote: "main → C", localCopy: "C now exists locally. The dashed origin/main label moved, but your branch and files did not.", remoteCopy: "origin has not changed; fetch only copied its history toward you." },
      { title: "Integrate C into local main", progress: "main caught up to origin/main", command: "$ git merge --ff-only origin/main", message: "Because main had no unique commits, it can fast-forward directly from B to C.", next: "Next: commit locally", localMain: "main → C", origin: "origin/main → C", remote: "main → C", localCopy: "main and origin/main now agree at C. Your working tree reflects snapshot C.", remoteCopy: "The remote still points to the same C." },
      { title: "Create local commit D", progress: "Local main is one ahead", command: "$ git commit -am \"Add keyboard shortcut\"", message: "D exists only in your local repository. origin/main remains your last observed remote state at C.", next: "Next: push", localMain: "main → D", origin: "origin/main → C", remote: "main → C", localCopy: "Your main branch points to new commit D. Nothing has been uploaded yet.", remoteCopy: "origin still ends at C and cannot see D." },
      { title: "Push D to origin", progress: "Local and remote agree", command: "$ git push origin main", message: "D was uploaded, origin's main advanced, and your origin/main label updated to the accepted state.", next: "Complete", localMain: "main → D", origin: "origin/main → D", remote: "main → D", localCopy: "main and origin/main agree at D.", remoteCopy: "origin now stores D, ready for another repository to fetch." }
    ];

    function animateTransfer(direction) {
      channel.classList.remove("is-transferring", "is-pushing");
      void channel.offsetWidth;
      channel.classList.add("is-transferring");
      if (direction === "push") channel.classList.add("is-pushing");
      window.setTimeout(() => channel.classList.remove("is-transferring", "is-pushing"), reduceMotion ? 30 : 700);
    }

    function render(animate = false) {
      const current = steps[step];
      title.textContent = current.title;
      count.textContent = `Step ${step} of ${steps.length - 1}`;
      progress.textContent = current.progress;
      progressBar.style.width = `${(step / (steps.length - 1)) * 100}%`;
      command.textContent = current.command;
      message.textContent = current.message;
      localMain.textContent = current.localMain;
      originMain.textContent = current.origin;
      remoteMain.textContent = current.remote;
      localCopy.textContent = current.localCopy;
      remoteCopy.textContent = current.remoteCopy;
      localC.hidden = step < 1;
      localEdgeC.hidden = step < 1;
      localD.hidden = step < 3;
      localEdgeD.hidden = step < 3;
      remoteD.hidden = step < 4;
      remoteEdgeD.hidden = step < 4;
      previous.disabled = step === 0;
      next.disabled = step === steps.length - 1;
      next.innerHTML = `${current.next}${step < steps.length - 1 ? ' <span aria-hidden="true">→</span>' : ''}`;
      channelLabel.textContent = step === 1 ? "fetch ↓" : step === 4 ? "push ↑" : "network";
      if (animate && step === 1) animateTransfer("fetch");
      if (animate && step === 4) animateTransfer("push");
    }

    previous.addEventListener("click", () => { if (step > 0) { step -= 1; render(false); } });
    next.addEventListener("click", () => { if (step < steps.length - 1) { step += 1; render(true); } });
    render();
  }

  createLocalLab();
  createAnatomyController();
  createBranchLab();
  createIntegrateLab();
  createConflictLab();
  createRemoteLab();
})();
