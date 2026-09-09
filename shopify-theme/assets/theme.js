/* The Chimpions — theme behaviour.
   Ports the interactive bits of the marketing site (hide-on-scroll header,
   typewriter hero, fade-up reveals, count-up stats, FAQ accordion) plus the
   storefront essentials (variant picker, quantity steppers, cart updates). */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  /* ------------------------------------------------ hide-on-scroll header */
  function initHeader() {
    var header = document.querySelector("[data-header]");
    if (!header) return;
    var last = window.scrollY;

    window.addEventListener(
      "scroll",
      function () {
        var current = window.scrollY;
        if (current < 10 || current < last - 5) {
          header.classList.remove("is-hidden");
        } else if (current > last + 5) {
          header.classList.add("is-hidden");
        }
        last = current;
      },
      { passive: true }
    );
  }

  /* ---------------------------------------------------- mobile nav drawer */
  function initDrawer() {
    var drawer = document.querySelector("[data-drawer]");
    if (!drawer) return;

    function open() {
      drawer.classList.add("is-open");
      drawer.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
    }
    function close() {
      drawer.classList.remove("is-open");
      drawer.setAttribute("aria-hidden", "true");
      document.body.style.overflow = "";
    }

    document.querySelectorAll("[data-drawer-open]").forEach(function (el) {
      el.addEventListener("click", open);
    });
    drawer.querySelectorAll("[data-drawer-close]").forEach(function (el) {
      el.addEventListener("click", close);
    });
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") close();
    });
  }

  /* -------------------------------------------------- desktop nav dropdown */
  function initDropdowns() {
    document.querySelectorAll("[data-dropdown]").forEach(function (dropdown) {
      var toggle = dropdown.querySelector("[data-dropdown-toggle]");
      if (!toggle) return;

      function setOpen(isOpen) {
        dropdown.classList.toggle("is-open", isOpen);
        toggle.setAttribute("aria-expanded", String(isOpen));
      }

      toggle.addEventListener("click", function (event) {
        event.preventDefault();
        setOpen(!dropdown.classList.contains("is-open"));
      });

      document.addEventListener("click", function (event) {
        if (!dropdown.contains(event.target)) setOpen(false);
      });

      document.addEventListener("keydown", function (event) {
        if (event.key === "Escape") setOpen(false);
      });
    });
  }

  /* ------------------------------------------------------ fade-up reveals */
  function initFadeUp() {
    var items = document.querySelectorAll(".fade-up");
    if (!items.length) return;

    if (reduceMotion || !("IntersectionObserver" in window)) {
      items.forEach(function (el) {
        el.classList.add("is-visible");
      });
      return;
    }

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var delay = parseInt(entry.target.dataset.delay || "0", 10);
          setTimeout(function () {
            entry.target.classList.add("is-visible");
          }, delay);
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
    );

    items.forEach(function (el) {
      observer.observe(el);
    });
  }

  /* ------------------------------------------------------ quantity steppers */
  function initQuantity() {
    document.querySelectorAll("[data-quantity]").forEach(function (wrapper) {
      var input = wrapper.querySelector("input");
      if (!input) return;
      wrapper.querySelectorAll("[data-quantity-change]").forEach(function (button) {
        button.addEventListener("click", function () {
          var step = parseInt(button.dataset.quantityChange, 10);
          var min = parseInt(input.min || "1", 10);
          var next = (parseInt(input.value, 10) || min) + step;
          input.value = Math.max(min, next);
          input.dispatchEvent(new Event("change", { bubbles: true }));
        });
      });
    });
  }

  /* --------------------------------------------------------- variant picker */
  function initVariantPickers() {
    document.querySelectorAll("[data-variant-picker]").forEach(function (picker) {
      var dataEl = picker.querySelector("[data-variant-json]");
      if (!dataEl) return;

      var variants;
      try {
        variants = JSON.parse(dataEl.textContent);
      } catch (error) {
        return;
      }

      var form = picker.closest("form") || document.querySelector(
        'form[data-product-form="' + picker.dataset.variantPicker + '"]'
      );
      var idInput = picker.querySelector("[data-variant-id]");
      var priceEl = document.querySelector(
        '[data-product-price="' + picker.dataset.variantPicker + '"]'
      );
      var submit = form ? form.querySelector("[data-add-to-cart]") : null;

      function currentOptions() {
        return Array.prototype.map.call(
          picker.querySelectorAll("[data-option-index]"),
          function (group) {
            var checked = group.querySelector("input:checked");
            var select = group.querySelector("select");
            return checked ? checked.value : select ? select.value : null;
          }
        );
      }

      function findVariant(options) {
        return variants.filter(function (variant) {
          return options.every(function (value, index) {
            return variant.options[index] === value;
          });
        })[0];
      }

      function update() {
        var variant = findVariant(currentOptions());

        picker.querySelectorAll(".product__swatch").forEach(function (swatch) {
          var input = swatch.querySelector("input");
          if (input) swatch.classList.toggle("is-selected", input.checked);
        });

        if (!variant) {
          if (submit) {
            submit.disabled = true;
            submit.textContent = submit.dataset.unavailableText || "Unavailable";
          }
          return;
        }

        if (idInput) idInput.value = variant.id;

        if (priceEl && variant.price_html) priceEl.innerHTML = variant.price_html;

        if (submit) {
          submit.disabled = !variant.available;
          submit.textContent = variant.available
            ? submit.dataset.addText || "Add to cart"
            : submit.dataset.soldOutText || "Sold out";
        }

        if (window.history.replaceState) {
          var url = new URL(window.location.href);
          url.searchParams.set("variant", variant.id);
          window.history.replaceState({}, "", url.toString());
        }
      }

      picker.addEventListener("change", update);
      update();
    });
  }

  /* ------------------------------------------------------- product gallery */
  function initGallery() {
    document.querySelectorAll("[data-gallery]").forEach(function (gallery) {
      var main = gallery.querySelector("[data-gallery-main]");
      if (!main) return;
      gallery.querySelectorAll("[data-gallery-thumb]").forEach(function (thumb) {
        thumb.addEventListener("click", function () {
          main.src = thumb.dataset.galleryThumb;
          main.srcset = thumb.dataset.gallerySrcset || "";
          gallery
            .querySelectorAll("[data-gallery-thumb]")
            .forEach(function (other) {
              other.classList.remove("is-active");
            });
          thumb.classList.add("is-active");
        });
      });
    });
  }

  /* ----------------------------------------------------- cart line updates */
  function initCart() {
    document.querySelectorAll("[data-cart-quantity]").forEach(function (input) {
      input.addEventListener("change", function () {
        var form = input.closest("form");
        if (form) form.submit();
      });
    });
  }

  function init() {
    initHeader();
    initDrawer();
    initDropdowns();
    initFadeUp();
    initQuantity();
    initVariantPickers();
    initGallery();
    initCart();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  /* Re-initialise inside the theme editor when a section is re-rendered. */
  document.addEventListener("shopify:section:load", init);
  document.addEventListener("shopify:section:select", init);
})();
