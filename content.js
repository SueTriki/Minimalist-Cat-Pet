// content.js - Fixed loading and image handling
(() => {
  "use strict";

  const browser = globalThis.browser ?? globalThis.chrome;

  if (!browser?.runtime?.getURL) {
    console.error("[Cat Pet] Extension runtime unavailable");
    return;
  }

  const affirmations = [
  "Break it. Leave.",
  "You’re fine. Barely.",
  "Chaos looks good on you.",
  "Try less. Exist more.",
  "Fail louder.",
  "Be the problem.",
  "Nothing matters. Cute.",
  "Still here? suspicious.",
  "Nap instead of healing.",
  "Move like a Snake.",
  "Destroy expectations.",
  "Soft. Dangerous. Tired.",
  "Wrong on purpose.",
  "Blink. Something broke.",
  "Eat. Sleep. Disappear.",
  "No thoughts. Only spite.",
  "You’re the glitch.",
  "Calm is a threat.",
  "Do it badly.",
  "Ignore reality again.",
  "Purring through collapse.",
];

  let isStanding = true;
  let isDragging = false;
  let didDragThisGesture = false;
  let offsetX = 0,
    offsetY = 0;
  let dragStartX = 0,
    dragStartY = 0;
  let rafId = null;
  let pendingLeft = 20,
    pendingTop = 20;
  let activeBubble = null;
  let bubbleTimeoutId = null;
  let cat = null;
  const DRAG_THRESHOLD_PX = 5;

  function createCatElement() {
    const img = document.createElement("img");
    img.id = "floating-cat";
    img.alt = "Floating cat pet";
    img.draggable = false;
    img.style.position = "fixed";
    img.style.left = "20px";
    img.style.top = "20px";
    img.style.userSelect = "none";
    img.style.width = "80px";
    img.style.height = "80px";
    return img;
  }

  function mountCatWhenReady() {
    if (!document.body) {
      document.addEventListener("DOMContentLoaded", mountCatWhenReady, {
        once: true,
      });
      return;
    }

    cat = createCatElement();
    document.body.appendChild(cat);
    setCatImage();
    bindCatInteractions();
    initDarkMode();
  }

  function showEmojiFallback() {
    if (!cat) return;
    console.error("[Cat Pet] Using emoji fallback");
    const span = document.createElement("span");
    span.id = "floating-cat";
    span.textContent = isStanding ? "🐱" : "🐈";
    span.style.cssText = cat.style.cssText;
    span.style.fontSize = "64px";
    span.style.display = "flex";
    span.style.alignItems = "center";
    span.style.justifyContent = "center";
    cat.replaceWith(span);
    cat = span;
  }

  async function setCatImage() {
    if (!cat || cat.tagName !== "IMG") return;

    const standingUrl = browser.runtime.getURL("images/standingcat.png");
    const sittingUrl = browser.runtime.getURL("images/sittingcat.png");
    const targetUrl = isStanding ? standingUrl : sittingUrl;

    // Add cache-busting to avoid stale images
    const urlWithCache = `${targetUrl}?t=${Date.now()}`;

    try {
      await new Promise((resolve, reject) => {
        const probe = new Image();
        probe.onload = () => resolve();
        probe.onerror = () => reject();
        probe.src = urlWithCache;
      });
      cat.src = urlWithCache;
      cat.style.display = "block";
    } catch (err) {
      showEmojiFallback();
    }
  }

  // ✅ FIXED: This is the COMPLETE scheduleCatPosition function (not broken)
  function scheduleCatPosition(left, top) {
    // Bounds checking - prevents cat from going off-screen
    pendingLeft = Math.max(0, Math.min(left, window.innerWidth - 80));
    pendingTop = Math.max(0, Math.min(top, window.innerHeight - 80));

    if (rafId !== null) return;
    rafId = requestAnimationFrame(() => {
      rafId = null;
      if (!cat) return;
      cat.style.left = `${pendingLeft}px`;
      cat.style.top = `${pendingTop}px`;
    });
  }

  function onPointerMove(clientX, clientY) {
    if (!isDragging || !cat) return;
    const movedX = Math.abs(clientX - dragStartX);
    const movedY = Math.abs(clientY - dragStartY);
    if (movedX > DRAG_THRESHOLD_PX || movedY > DRAG_THRESHOLD_PX) {
      didDragThisGesture = true;
    }
    scheduleCatPosition(clientX - offsetX, clientY - offsetY);
  }

  function endDrag() {
    if (!isDragging) return;
    isDragging = false;
    if (cat) cat.style.cursor = "grab";
  }

  function bindCatInteractions() {
    if (!cat) return;

    cat.addEventListener("mousedown", (event) => {
      if (event.button !== 0 || !cat) return;
      isDragging = true;
      didDragThisGesture = false;
      dragStartX = event.clientX;
      dragStartY = event.clientY;
      const rect = cat.getBoundingClientRect();
      offsetX = event.clientX - rect.left;
      offsetY = event.clientY - rect.top;
      cat.style.cursor = "grabbing";
      event.preventDefault();
    });

    document.addEventListener("mousemove", (event) => {
      onPointerMove(event.clientX, event.clientY);
    });

    document.addEventListener("mouseup", endDrag);
    window.addEventListener("blur", endDrag);

    cat.addEventListener("click", (event) => {
      if (event.button !== 0 || !cat) return;
      if (didDragThisGesture) return;
      isStanding = !isStanding;
      setCatImage();
      showAffirmationBubble();
    });
  }

  function showAffirmationBubble() {
    if (!cat) return;
    if (activeBubble) {
      activeBubble.remove();
      activeBubble = null;
    }
    if (bubbleTimeoutId !== null) {
      clearTimeout(bubbleTimeoutId);
      bubbleTimeoutId = null;
    }

    const message = affirmations[Math.floor(Math.random() * affirmations.length)];
    const bubble = document.createElement("div");
    bubble.className = "affirmation-bubble";
    bubble.textContent = message;

    const catRect = cat.getBoundingClientRect();
    bubble.style.left = `${catRect.left + catRect.width / 2 - 40}px`;
    bubble.style.top = `${catRect.top - 40}px`;
    document.body.appendChild(bubble);
    activeBubble = bubble;

    bubbleTimeoutId = setTimeout(() => {
      bubble.remove();
      if (activeBubble === bubble) activeBubble = null;
      bubbleTimeoutId = null;
    }, 5000);
  }

  function checkDarkMode() {
    const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const pageDark =
      document.documentElement.classList.contains("dark") ||
      document.body?.classList.contains("dark-mode") ||
      /dark/i.test(document.documentElement.getAttribute("data-theme") || "") ||
      /dark/i.test(document.body?.getAttribute("data-theme") || "") ||
      document.documentElement.style.colorScheme === "dark";
    const isDark = systemDark || pageDark;
    document.documentElement.classList.toggle("cat-dark-mode", isDark);
  }

  function initDarkMode() {
    const darkQuery = window.matchMedia("(prefers-color-scheme: dark)");
    darkQuery.addEventListener("change", checkDarkMode);
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "data-theme", "style"],
    });
    const observeBody = () => {
      if (!document.body) return;
      observer.observe(document.body, {
        attributes: true,
        attributeFilter: ["class", "data-theme"],
      });
    };
    if (document.body) {
      observeBody();
    } else {
      document.addEventListener("DOMContentLoaded", observeBody, { once: true });
    }
    checkDarkMode();
  }

  mountCatWhenReady();
})();