const studioConfig = {
  // Numero ficticio de ejemplo. Reemplazar antes de publicar.
  whatsappNumber: "00000000000",
  whatsappMessage: "Hola, quiero consultar por un tatuaje.",
};

const buildWhatsAppUrl = (message = studioConfig.whatsappMessage) => {
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${studioConfig.whatsappNumber}?text=${encodedMessage}`;
};

const header = document.querySelector(".site-header");
const menuToggle = document.querySelector(".menu-toggle");
const navPanel = document.querySelector(".nav-panel");
const revealItems = document.querySelectorAll(".reveal");
const faqItems = document.querySelectorAll(".faq-item");
const whatsappLinks = document.querySelectorAll("[data-wa-link]");
const sectionLinks = document.querySelectorAll("a[href^='#']");
const galleryItems = document.querySelectorAll("[data-gallery-item]");
const galleryModal = document.querySelector("[data-gallery-modal]");
const galleryModalImage = document.querySelector("[data-gallery-modal-image]");
const galleryModalTitle = document.querySelector("[data-gallery-modal-title]");
const galleryModalMeta = document.querySelector("[data-gallery-modal-meta]");
const galleryCloseTriggers = document.querySelectorAll("[data-gallery-close]");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const desktopViewport = window.matchMedia("(min-width: 861px)");
let lastGalleryTrigger = null;

const setHeaderState = () => {
  if (!header) {
    return;
  }

  header.classList.toggle("is-condensed", window.scrollY > 32);
};

const closeMenu = () => {
  if (!menuToggle || !navPanel) {
    return;
  }

  menuToggle.setAttribute("aria-expanded", "false");
  navPanel.classList.remove("is-open");
};

const setFaqState = (item, open) => {
  const trigger = item.querySelector(".faq-trigger");
  const panel = item.querySelector(".faq-panel");

  if (!trigger) {
    return;
  }

  item.classList.toggle("is-open", open);
  trigger.setAttribute("aria-expanded", String(open));

  if (panel) {
    panel.setAttribute("aria-hidden", String(!open));
  }
};

const getScrollTargetPosition = (target) => {
  const headerHeight = header ? header.getBoundingClientRect().height : 0;
  const offset = headerHeight + 18;
  return target.getBoundingClientRect().top + window.scrollY - offset;
};

const scrollToSection = (target) => {
  window.scrollTo({
    top: getScrollTargetPosition(target),
    behavior: prefersReducedMotion.matches ? "auto" : "smooth",
  });
};

const openGalleryModal = (trigger) => {
  if (
    !galleryModal ||
    !galleryModalImage ||
    !galleryModalTitle ||
    !galleryModalMeta
  ) {
    return;
  }

  lastGalleryTrigger = trigger;
  galleryModalImage.src = trigger.dataset.image || "";
  galleryModalImage.alt = trigger.dataset.alt || "";
  galleryModalTitle.textContent = trigger.dataset.title || "";
  galleryModalMeta.textContent = trigger.dataset.meta || "";
  galleryModal.hidden = false;
  document.body.classList.add("modal-open");

  const closeButton = galleryModal.querySelector(".gallery-modal-close");
  if (closeButton) {
    closeButton.focus();
  }
};

const closeGalleryModal = () => {
  if (!galleryModal || galleryModal.hidden) {
    return;
  }

  galleryModal.hidden = true;
  document.body.classList.remove("modal-open");

  if (lastGalleryTrigger instanceof HTMLElement) {
    lastGalleryTrigger.focus();
  }
};

whatsappLinks.forEach((link) => {
  const customMessage = link.dataset.message || studioConfig.whatsappMessage;
  link.href = buildWhatsAppUrl(customMessage);
  link.target = "_blank";
  link.rel = "noopener noreferrer";
});

setHeaderState();
window.addEventListener("scroll", setHeaderState, { passive: true });

if (menuToggle && navPanel) {
  menuToggle.addEventListener("click", () => {
    const expanded = menuToggle.getAttribute("aria-expanded") === "true";
    menuToggle.setAttribute("aria-expanded", String(!expanded));
    navPanel.classList.toggle("is-open", !expanded);
  });

  navPanel.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", closeMenu);
  });
}

const handleDesktopChange = (event) => {
  if (event.matches) {
    closeMenu();
  }
};

if (desktopViewport.addEventListener) {
  desktopViewport.addEventListener("change", handleDesktopChange);
} else {
  desktopViewport.addListener(handleDesktopChange);
}

sectionLinks.forEach((link) => {
  const targetId = link.getAttribute("href");

  if (!targetId || targetId === "#") {
    return;
  }

  const target = document.querySelector(targetId);

  if (!target) {
    return;
  }

  link.addEventListener("click", (event) => {
    event.preventDefault();
    closeMenu();
    scrollToSection(target);

    if (window.history.pushState) {
      window.history.pushState(null, "", targetId);
    }
  });
});

galleryItems.forEach((item) => {
  item.addEventListener("click", () => {
    openGalleryModal(item);
  });
});

galleryCloseTriggers.forEach((trigger) => {
  trigger.addEventListener("click", closeGalleryModal);
});

document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") {
    return;
  }

  closeMenu();
  closeGalleryModal();
});

if (prefersReducedMotion.matches || !("IntersectionObserver" in window)) {
  revealItems.forEach((item) => item.classList.add("is-visible"));
} else {
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    {
      threshold: 0.18,
      rootMargin: "0px 0px -8% 0px",
    }
  );

  revealItems.forEach((item) => revealObserver.observe(item));
}

faqItems.forEach((item, index) => {
  const trigger = item.querySelector(".faq-trigger");

  if (!trigger) {
    return;
  }

  setFaqState(item, item.classList.contains("is-open") && index === 0);

  trigger.addEventListener("click", () => {
    const willOpen = !item.classList.contains("is-open");

    faqItems.forEach((faqItem) => setFaqState(faqItem, false));
    setFaqState(item, willOpen);
  });
});
