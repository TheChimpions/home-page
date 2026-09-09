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

  /* ----------------------------------------------------- hero typewriter */
  function initTypewriter() {
    var lines = document.querySelectorAll("[data-typewriter]");
    if (!lines.length) return;

    lines.forEach(function (line) {
      var target = line.querySelector("[data-typewriter-output]");
      var text = line.dataset.typewriter || "";
      if (!target) return;

      if (reduceMotion) {
        target.textContent = text;
        return;
      }

      var speed = parseInt(line.dataset.speed || "38", 10);
      var delay = parseInt(line.dataset.delay || "0", 10);
      var index = 0;
      var cursor = document.createElement("span");
      cursor.className = "typewriter__cursor";
      cursor.textContent = "_";

      setTimeout(function () {
        target.appendChild(cursor);
        var timer = setInterval(function () {
          index += 1;
          cursor.remove();
          target.textContent = text.slice(0, index);
          target.appendChild(cursor);
          if (index >= text.length) {
            clearInterval(timer);
            setTimeout(function () {
              cursor.remove();
            }, 1200);
          }
        }, speed);
      }, delay);
    });
  }

  /* --------------------------------------------------------- count-up stats */
  function initCountUp() {
    var stats = document.querySelectorAll("[data-countup]");
    if (!stats.length) return;

    function run(el) {
      var end = parseFloat(el.dataset.countup);
      if (isNaN(end)) return;
      var decimals = parseInt(el.dataset.decimals || "0", 10);
      var prefix = el.dataset.prefix || "";
      var suffix = el.dataset.suffix || "";
      var duration = 1400;
      var start = null;

      if (reduceMotion) {
        el.textContent = prefix + end.toFixed(decimals) + suffix;
        return;
      }

      function frame(timestamp) {
        if (start === null) start = timestamp;
        var progress = Math.min((timestamp - start) / duration, 1);
        var eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = prefix + (end * eased).toFixed(decimals) + suffix;
        if (progress < 1) requestAnimationFrame(frame);
      }
      requestAnimationFrame(frame);
    }

    if (!("IntersectionObserver" in window)) {
      stats.forEach(run);
      return;
    }

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          run(entry.target);
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.4 }
    );
    stats.forEach(function (el) {
      observer.observe(el);
    });
  }

  /* ---------------------------------------------------------- FAQ accordion */
  function initFaq() {
    document.querySelectorAll("[data-faq]").forEach(function (faq) {
      var items = faq.querySelectorAll("[data-faq-item]");
      items.forEach(function (item) {
        var button = item.querySelector("[data-faq-question]");
        if (!button) return;
        button.addEventListener("click", function () {
          var isOpen = item.classList.contains("is-open");
          items.forEach(function (other) {
            other.classList.remove("is-open");
            var otherButton = other.querySelector("[data-faq-question]");
            if (otherButton) otherButton.setAttribute("aria-expanded", "false");
          });
          if (!isOpen) {
            item.classList.add("is-open");
            button.setAttribute("aria-expanded", "true");
          }
        });
      });
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
    initTypewriter();
    initCountUp();
    initFaq();
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
