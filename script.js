const root = document.documentElement;
const storageKey = "dd-reduce-motion";

const setMotionState = (enabled) => {
  if (enabled) {
    root.classList.add("motion-off");
  } else {
    root.classList.remove("motion-off");
  }
};

const storedPreference = localStorage.getItem(storageKey);
if (storedPreference) {
  setMotionState(storedPreference === "true");
} else if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  setMotionState(true);
}

document.querySelectorAll(".motion-toggle").forEach((button) => {
  const isReduced = root.classList.contains("motion-off");
  button.textContent = isReduced ? "Enable Motion" : "Reduce Motion";
  button.addEventListener("click", () => {
    const enabled = !root.classList.contains("motion-off");
    setMotionState(enabled);
    localStorage.setItem(storageKey, String(enabled));
    button.textContent = enabled ? "Enable Motion" : "Reduce Motion";
  });
});

const header = document.querySelector(".site-header");
if (header) {
  const transparencyThreshold = 120;
  const setHeaderState = () => {
    const isScrolled = window.scrollY > transparencyThreshold;
    header.classList.toggle("scrolled", isScrolled);
    if (isScrolled) {
      header.style.backgroundColor = "";
      header.style.backdropFilter = "";
      header.style.borderColor = "";
    } else {
      header.style.backgroundColor = "transparent";
      header.style.backdropFilter = "none";
      header.style.borderColor = "transparent";
    }
  };
  setHeaderState();
  window.addEventListener("scroll", setHeaderState, { passive: true });
}

const scrambleCountdown = document.querySelector("[data-scramble-countdown]");
if (scrambleCountdown) {
  const digits = scrambleCountdown.querySelectorAll("[data-countdown-digit]");
  const randomInt = (max) => Math.floor(Math.random() * max);
  const pad2 = (value) => String(value).padStart(2, "0");
  const generateNextValue = (maxValue, currentValue) => {
    const current = pad2(currentValue);
    for (let i = 0; i < 40; i += 1) {
      const candidate = pad2(randomInt(maxValue));
      if (candidate[0] !== current[0] && candidate[1] !== current[1]) {
        return candidate;
      }
    }
    let fallback = pad2(randomInt(maxValue));
    while (fallback === current) {
      fallback = pad2(randomInt(maxValue));
    }
    return fallback;
  };
  const updateDigit = (digit, index) => {
    let maxValue = 100;
    if (index === 1) {
      maxValue = 24;
    } else if (index === 2 || index === 3) {
      maxValue = 60;
    }
    const chars = digit.querySelectorAll("[data-countdown-char]");
    const currentValue = Array.from(chars)
      .map((char) => char.textContent.trim() || "0")
      .join("");
    const safeNextValue = generateNextValue(maxValue, currentValue);
    chars.forEach((char, charIndex) => {
      const offset = 3 + charIndex * 3;
      char.classList.remove("scramble");
      void char.offsetWidth;
      char.classList.add("scramble");
      if (char._scrambleTimeout) {
        clearTimeout(char._scrambleTimeout);
      }
      char._scrambleTimeout = setTimeout(() => {
        char.textContent = safeNextValue[charIndex] ?? "0";
      }, offset);
    });
  };

  const updateAllDigits = () => {
    digits.forEach((digit, index) => updateDigit(digit, index));
  };

  updateAllDigits();
  const intervalMs = 24;
  setInterval(updateAllDigits, intervalMs);
}

