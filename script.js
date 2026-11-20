/* ============================================================
   خُيُوط — منطق العرض التفاعلي
   ============================================================ */
(function () {
  "use strict";

  const app = document.getElementById("app");
  const stage = document.getElementById("stage");
  const slides = Array.from(document.querySelectorAll(".slide"));
  const progressBar = document.getElementById("progressBar");
  const currentNum = document.getElementById("currentNum");
  const totalNum = document.getElementById("totalNum");
  const prevBtn = document.getElementById("prevBtn");
  const nextBtn = document.getElementById("nextBtn");
  const startBtn = document.getElementById("startBtn");
  const introOverlay = document.getElementById("introOverlay");
  const introStartBtn = document.getElementById("introStartBtn");
  const restartBtn = document.getElementById("restartBtn");
  const fullscreenBtn = document.getElementById("fullscreenBtn");

  const total = slides.length;
  let current = 0;
  let started = false;
  let touchStartX = 0;

  const arabicNumber = (n) => n.toLocaleString("ar-EG");

  /* ---------- تحديث واجهة التنقل ---------- */
  function updateUI() {
    progressBar.style.width = ((current + 1) / total) * 100 + "%";
    currentNum.textContent = arabicNumber(current + 1);
    totalNum.textContent = arabicNumber(total);
    prevBtn.disabled = current === 0;
    nextBtn.disabled = current === total - 1;
    stage.setAttribute("aria-label", "شريحة رقم " + (current + 1) + " من " + total);
  }

  /* ---------- إظهار شريحة ---------- */
  function showSlide(index, replay) {
    if (index < 0 || index >= total) return;

    const target = slides[index];
    const active = slides[current];

    if (replay && active === target) {
      active.classList.remove("is-active");
      void active.offsetWidth; // إعادة ضبط الحركة
      active.classList.add("is-active");
    } else {
      slides.forEach((slide) => slide.classList.remove("is-active"));
      target.classList.add("is-active");
    }

    current = index;
    updateUI();
  }

  function next() { showSlide(current + 1); }
  function prev() { showSlide(current - 1); }

  /* ---------- بدء العرض ---------- */
  function startPresentation() {
    if (started) return;
    started = true;
    introOverlay.classList.add("is-hidden");
    showSlide(0, true);
  }

  /* ---------- الشاشة الكاملة ---------- */
  function syncFullscreenState() {
    const isFull = Boolean(
      document.fullscreenElement || document.webkitFullscreenElement ||
      document.mozFullScreenElement || document.msFullscreenElement
    );
    document.body.classList.toggle("is-fullscreen", isFull);
    fullscreenBtn.setAttribute("aria-pressed", String(isFull));
    fullscreenBtn.setAttribute("aria-label", isFull ? "الخروج من وضع الشاشة الكاملة" : "تفعيل وضع الشاشة الكاملة");
    fullscreenBtn.title = isFull ? "الخروج من ملء الشاشة" : "ملء الشاشة";
  }

  async function toggleFullscreen() {
    try {
      if (!document.fullscreenElement && !document.webkitFullscreenElement) {
        if (app.requestFullscreen) await app.requestFullscreen();
        else if (app.webkitRequestFullscreen) await app.webkitRequestFullscreen();
        else if (app.mozRequestFullScreen) await app.mozRequestFullScreen();
        else if (app.msRequestFullscreen) await app.msRequestFullscreen();
      } else {
        if (document.exitFullscreen) await document.exitFullscreen();
        else if (document.webkitExitFullscreen) await document.webkitExitFullscreen();
        else if (document.mozCancelFullScreen) await document.mozCancelFullScreen();
        else if (document.msExitFullscreen) await document.msExitFullscreen();
      }
    } catch (error) {
      console.warn("تعذّر تفعيل وضع الشاشة الكاملة:", error);
    }
  }

  /* ---------- ربط الأحداث ---------- */
  prevBtn.addEventListener("click", prev);
  nextBtn.addEventListener("click", next);
  startBtn.addEventListener("click", startPresentation);
  introStartBtn.addEventListener("click", startPresentation);
  fullscreenBtn.addEventListener("click", toggleFullscreen);

  restartBtn.addEventListener("click", () => {
    showSlide(0, true);
    stage.scrollTop = 0;
  });

  document.querySelectorAll("[data-goto]").forEach((button) => {
    button.addEventListener("click", () => {
      const index = Number(button.getAttribute("data-goto"));
      showSlide(index);
    });
  });

  document.addEventListener("fullscreenchange", syncFullscreenState);
  document.addEventListener("webkitfullscreenchange", syncFullscreenState);
  document.addEventListener("mozfullscreenchange", syncFullscreenState);
  document.addEventListener("MSFullscreenChange", syncFullscreenState);

  document.addEventListener("keydown", (event) => {
    const key = event.key;

    if (!started) {
      if (key === "Enter" || key === " " || key === "ArrowLeft" || key === "ArrowRight") {
        event.preventDefault();
        startPresentation();
        if (key === "ArrowRight") window.setTimeout(next, 280);
      }
      return;
    }

    switch (key) {
      case "ArrowRight":
      case "PageDown":
        event.preventDefault();
        next();
        break;
      case "ArrowLeft":
      case "PageUp":
        event.preventDefault();
        prev();
        break;
      case " ":
        event.preventDefault();
        next();
        break;
      case "Home":
        event.preventDefault();
        showSlide(0);
        break;
      case "End":
        event.preventDefault();
        showSlide(total - 1);
        break;
      case "f":
      case "F":
        toggleFullscreen();
        break;
      default:
        break;
    }
  });

  /* ---------- السحب على الجوال ---------- */
  stage.addEventListener("touchstart", (event) => {
    touchStartX = event.changedTouches[0].screenX;
  }, { passive: true });

  stage.addEventListener("touchend", (event) => {
    const delta = event.changedTouches[0].screenX - touchStartX;
    if (Math.abs(delta) < 55) return;
    if (delta < 0) next();  // سحب لليسار = التالي
    else prev();            // سحب لليمين = السابق
  }, { passive: true });

  /* ---------- بدء التشغيل ---------- */
  updateUI();
  syncFullscreenState();
})();
