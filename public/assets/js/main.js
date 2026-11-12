function debounceOnWidthChange(e, t) {
  let a,
    n = innerWidth;
  return function (...r) {
    (clearTimeout(a),
      (a = setTimeout(() => {
        const t = innerWidth;
        t !== n && ((n = t), e.apply(this, r));
      }, t)));
  };
}
function initCount(e = document) {
  const t = e.querySelectorAll('[data-count="group"]');
  0 !== t.length &&
    t.forEach((e) => {
      e.querySelectorAll(".w-condition-invisible").forEach((e) => e.remove());
      e.querySelectorAll('[data-count="child"]').forEach((e, t) => {
        e.style.setProperty("--index", t);
      });
    });
}
function initDisposables() {
  if (window.__disposablesInit) return;
  window.__disposablesInit = !0;
  const e = [];
  ((window.addDisposable = (t) => ("function" == typeof t && e.push(t), t)),
    (window.cleanupOnLeave = () => {
      for (let t = 0; t < e.length; t++)
        try {
          e[t]();
        } catch (e) {}
      e.length = 0;
    }));
}
function initObserverHub() {
  function e(e = {}) {
    const t = Array.isArray(e.threshold) ? e.threshold.join(",") : (e.threshold ?? 0),
      a = e.rootMargin ?? "0px 0px 0px 0px";
    return JSON.stringify({ t: t, r: a });
  }
  if (window.__observerHubInit) return;
  window.__observerHubInit = !0;
  const t = new Map();
  ((window.getObserver = (a = {}) => {
    const n = e(a);
    if (t.has(n)) return t.get(n);
    const r = new IntersectionObserver((e) => {
      for (let t = 0; t < e.length; t++) {
        const a = e[t],
          n = a.target.__ioCallbacks;
        if (n) for (let e = 0; e < n.length; e++) n[e](a);
      }
    }, a);
    return (t.set(n, r), r);
  }),
    (window.observeWith = (e, t = {}, a) => {
      if (!e || "function" != typeof a) return () => {};
      const n = window.getObserver(t);
      ((e.__ioCallbacks = e.__ioCallbacks || []), e.__ioCallbacks.push(a), n.observe(e));
      const r = () => {
        e.__ioCallbacks && (e.__ioCallbacks = e.__ioCallbacks.filter((e) => e !== a));
        try {
          n.unobserve(e);
        } catch (e) {}
      };
      return window.addDisposable ? window.addDisposable(r) : r;
    }));
}
function initPageVisibility() {
  if (window.__pageVisibilityInit) return;
  window.__pageVisibilityInit = !0;
  let e = !1;
  document.addEventListener("visibilitychange", () => {
    document.hidden
      ? (window.lenis && !window.lenis.__paused && window.lenis.stop
          ? (window.lenis.stop(), (e = !0))
          : (e = !1),
        gsap.ticker.sleep())
      : requestAnimationFrame(() => {
          (window.lenis && window.lenis.resize && window.lenis.resize(),
            ScrollTrigger.refresh(),
            gsap.ticker.wake(),
            e && window.lenis && !window.lenis.__paused && window.lenis.start && window.lenis.start());
        });
  });
}
function initMobileMenu() {
  if (((menuButton = document.querySelector(".menu-button")), !menuButton)) return;
  const e = document.querySelector(".nav_menu_outer"),
    t = document.querySelector(".menu_bg");
  if (!e) return;
  window.activeTimeouts || (window.activeTimeouts = []);
  let a = !1,
    n = !1;
  const r = () => {
      n ||
        ((a = !0),
        lenis && lenis.stop(),
        menuButton.classList.add("close"),
        document.body.setAttribute("data-nav-status", "open"),
        e.setAttribute("data-state", "open"));
    },
    i = () => {
      if (!a || n) return;
      ((n = !0),
        e.classList.add("is-closing"),
        document.body.setAttribute("data-nav-status", "closed"),
        menuButton.classList.remove("close"),
        lenis && lenis.start());
      const t = setTimeout(() => {
        ((a = !1), (n = !1), e.setAttribute("data-state", "closed"), e.classList.remove("is-closing"));
      }, 450);
      window.activeTimeouts.push(t);
    },
    o = () => {
      (window.activeTimeouts.forEach((e) => clearTimeout(e)),
        (window.activeTimeouts = []),
        (a = !1),
        (n = !1),
        menuButton.classList.remove("close"),
        e.classList.remove("is-closing"),
        e.setAttribute("data-state", "closed"),
        document.body.setAttribute("data-nav-status", "closed"),
        lenis && lenis.start());
    };
  ((window.closeMenu = i),
    (window.forceCloseMenu = o),
    menuButton.addEventListener("click", () => {
      a ? i() : r();
    }),
    t && t.addEventListener("click", i),
    e.addEventListener("click", (e) => {
      e.target.matches("a") && i();
    }));
}
function initModal() {
  window.__osmoModals ||
    ((window.__osmoModals = {
      wraps: new Set(),
      closeAll: function (e = !0) {
        this.wraps.forEach((t) => {
          t._modals && t._modals.closeAll && t._modals.closeAll(e);
        });
      },
      findWrapForModal: function (e) {
        for (const t of this.wraps) if (t.querySelector(`[data-modal-target="${e}"]`)) return t;
        return null;
      },
    }),
    (window.closeAllModals = () => window.__osmoModals.closeAll()),
    document.addEventListener("click", (e) => {
      const t = e.target.closest("[data-modal-trigger]");
      if (!t) return;
      const a = t.getAttribute("data-modal-trigger");
      if (!a || !a.trim()) return;
      const n = window.__osmoModals.findWrapForModal(a);
      n && n._modals && (e.preventDefault(), n._modals.open(a, t));
    }));
  document.querySelectorAll('[data-modal="group"]').forEach((e) => {
    e._modals ||
      (window.__osmoModals.wraps.add(e),
      (e._modals = {
        open: function (t, a) {
          const n = e.querySelector(`[data-modal-target="${t}"]`);
          if (!n) return;
          const r = n.querySelector("[data-modal-scroller]") || n;
          (this.closeAll(!1),
            (n._trigger = a),
            window.lenis && window.lenis.stop(),
            n.setAttribute("data-modal-state", "open"));
          const i = window.Lenis;
          if (i) {
            n._lenis = new i({ wrapper: n, content: r, smoothWheel: !0, lerp: 0.165, wheelMultiplier: 1.25 });
            const e = gsap.ticker.add((e) => {
              n._lenis && n._lenis.raf(1e3 * e);
            });
            ((n._rafId = e),
              ScrollTrigger.scrollerProxy(r, {
                scrollTop(e) {
                  return (
                    arguments.length && n._lenis && n._lenis.scrollTo(e, { immediate: !0 }),
                    n._lenis ? n._lenis.scroll : 0
                  );
                },
                getBoundingClientRect: () => ({
                  top: 0,
                  left: 0,
                  width: window.innerWidth,
                  height: window.innerHeight,
                }),
              }),
              n._lenis.on("scroll", ScrollTrigger.update));
          }
          (this.setupFocusTrap(n), this.setupEscapeKey(t));
          const o = window[`initModal${t.charAt(0).toUpperCase() + t.slice(1)}`];
          "function" == typeof o && o({ wrap: e, modal: n });
        },
        close: (t, a = !0) => {
          const n = e.querySelector(`[data-modal-target="${t}"]`);
          if (!n) return;
          (n.setAttribute("data-modal-state", "closed"),
            n._lenis && (n._lenis.destroy(), (n._lenis = null)),
            n._rafId && (gsap.ticker.remove(n._rafId), (n._rafId = null)),
            window.lenis && window.lenis.start());
          (ScrollTrigger.getAll().forEach((e) => {
            const t = e.vars.scroller;
            t && n.contains(t) && e.kill();
          }),
            n._escapeHandler &&
              (document.removeEventListener("keydown", n._escapeHandler), (n._escapeHandler = null)),
            n._focusTrapHandler &&
              (n.removeEventListener("keydown", n._focusTrapHandler), (n._focusTrapHandler = null)),
            a && n._trigger && (n._trigger.focus(), (n._trigger = null)),
            gsap.delayedCall(0.75, () => {
              n.scrollTop = 0;
              const e = n.querySelector("[data-modal-scroller]");
              e && (e.scrollTop = 0);
            }));
        },
        closeAll: function (t = !0) {
          e.querySelectorAll("[data-modal-target]").forEach((e) => {
            const a = e.getAttribute("data-modal-target");
            "open" === e.getAttribute("data-modal-state") && this.close(a, t);
          });
        },
        setupFocusTrap: (e) => {
          const t = e.querySelectorAll(
            'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
          );
          if (0 === t.length) return;
          const a = t[0],
            n = t[t.length - 1];
          ((e._focusTrapHandler = (e) => {
            "Tab" === e.key &&
              (e.shiftKey
                ? document.activeElement === a && (e.preventDefault(), n.focus())
                : document.activeElement === n && (e.preventDefault(), a.focus()));
          }),
            e.addEventListener("keydown", e._focusTrapHandler),
            requestAnimationFrame(() => {
              a.focus();
            }));
        },
        setupEscapeKey: function (t) {
          const a = e.querySelector(`[data-modal-target="${t}"]`);
          a &&
            ((a._escapeHandler = (e) => {
              "Escape" === e.key && this.close(t);
            }),
            document.addEventListener("keydown", a._escapeHandler));
        },
      }),
      e.addEventListener("click", (t) => {
        const a = t.target.closest('[data-modal="close"]');
        if (!a) return;
        const n = a.closest("[data-modal-target]");
        if (n && e._modals) {
          const a = n.getAttribute("data-modal-target");
          (t.preventDefault(), e._modals.close(a));
        } else !n && e._modals && (t.preventDefault(), e._modals.closeAll());
      }));
  });
}
function initLenis() {
  if (lenis) return;
  const e = window.Lenis;
  ((lenis = new e({ lerp: 0.165, wheelMultiplier: 1.25 })), lenis.on("scroll", ScrollTrigger.update));
  const t = (e) => {
    lenis.raf(1e3 * e);
  };
  ((lenisRafId = gsap.ticker.add(t)), gsap.ticker.lagSmoothing(500, 33), (window.lenis = lenis));
}
function destroyLenis() {
  (null !== lenisRafId && (gsap.ticker.remove(lenisRafId), (lenisRafId = null)),
    lenis && (lenis.destroy(), (lenis = null), (window.lenis = null)));
}
function initLenisCheckScrollUpDown() {
  function e(e) {
    const r = e.targetScroll;
    if (Math.abs(t - r) >= 50) {
      const e = r > t ? "down" : "up";
      (e !== a && (document.body.setAttribute("data-scrolling-direction", e), (a = e)), (t = r));
    }
    const i = r > 50 ? "true" : "false";
    i !== n && (document.body.setAttribute("data-scrolling-started", i), (n = i));
  }
  if (!lenis) return;
  let t = 0,
    a = null,
    n = null;
  lenis.on("scroll", e);
}
function initCurrentYear(e = document) {
  const t = $$("[data-current-year]", e);
  if (0 === t.length) return;
  const a = new Date().getFullYear();
  t.forEach((e) => {
    e.textContent = a;
  });
}
function initSplit(e = document) {
  const t = e.querySelectorAll("[data-split]");
  0 !== t.length &&
    t.forEach((e) => {
      if (e.classList.contains("split-done")) return;
      const t = e.dataset.split,
        a = "false" !== e.dataset.splitMask,
        n = "true" === e.dataset.splitIndex,
        r = { type: t, linesClass: "single-line", wordsClass: "word", charsClass: "char" };
      (a && (r.mask = t),
        (r.onSplit = (a) => {
          if (n) {
            (a[t] || []).forEach((e, t) => {
              e.style.setProperty("--index", t);
            });
          }
          e.hasAttribute("data-reveal") &&
            "scroll" === e.dataset.reveal &&
            gsap.from(a.lines, {
              yPercent: 110,
              duration: durations.l,
              stagger: durations.stagger,
              ease: easings.smooth,
              scrollTrigger: { trigger: e, start: "clamp(top 90%)", once: !0 },
            });
        }));
      const i = SplitText.create(e, r);
      (window.addDisposable(() => {
        i.revert();
      }),
        e.classList.add("split-done"));
    });
}
function initScrambleText(e = document) {
  const t = $$("[data-scramble]", e);
  if (0 === t.length) return;
  const a = "##\xb7$%&/=\u20ac|()@+09*+]}{[".split(""),
    n = a.length,
    r = { stagger: 0.05, fakeDuration: 0.08, fakeOut: 0.16, revealDuration: 0.3 };
  t.forEach((e) => {
    if (e.classList.contains("scramble-done")) return;
    (e.classList.add("scramble-done"), (e.dataset.originalText = e.textContent));
    const t = SplitText.create(e, { type: "chars", charsClass: "char" });
    t.chars.forEach((e) => {
      const t = e.textContent,
        r = a[Math.floor(Math.random() * n)],
        i = a[Math.floor(Math.random() * n)];
      e.innerHTML = `\n        <span class="f" aria-hidden="true">${r}</span>\n        <span class="f" aria-hidden="true">${i}</span>\n        <span class="n">${t}</span>\n      `;
    });
    const i = gsap.timeline({ paused: !0, defaults: { ease: "power4.inOut" } });
    (t.chars.forEach((e, t) => {
      const a = e.querySelectorAll(".f"),
        n = e.querySelector(".n"),
        o = t * r.stagger;
      i.to(a[0], { display: "block", scaleX: 1, opacity: 1, duration: 0 }, o)
        .to(a[0], { display: "none", duration: 0 }, `>+${r.fakeDuration}`)
        .to(a[1], { display: "block", scaleX: 1, opacity: 1, duration: 0 }, ">")
        .to(a[1], { scaleX: 0, opacity: 0, duration: r.fakeOut }, `>+${r.fakeDuration}`)
        .to(a[1], { display: "none", duration: 0 }, ">")
        .to(n, { opacity: 1, duration: r.revealDuration }, ">-0.15");
    }),
      (e._scrambleTl = i));
    const o = e.dataset.scramblePlay;
    ("auto" === o
      ? i.play()
      : "scroll" === o &&
        ScrollTrigger.create({ trigger: e, start: "top 85%", once: !0, onEnter: () => i.play() }),
      window.addDisposable(() => {
        (i.kill(), t.revert(), e.classList.remove("scramble-done"));
      }));
  });
}
function initButtonCharacterStagger(e = document) {
  const t = e.querySelectorAll('[data-stagger-char="true"]');
  if (0 === t.length) return;
  const a = gsap.matchMedia(),
    n = 0.01;
  (a.add(
    breakpoints.isDesktop,
    () => (
      t.forEach((e) => {
        const t = e.querySelector('[data-stagger-char="text"]');
        if (!t || t.classList.contains("chars-stagger-done")) return;
        t.classList.add("chars-stagger-done");
        const a = t.textContent;
        ((t.dataset.originalText = a),
          (t.innerHTML = ""),
          [...a].forEach((e, a) => {
            const r = document.createElement("span");
            ((r.className = "char"),
              (r.textContent = e),
              r.style.setProperty("--char-index", a),
              (r.style.transitionDelay = a * n + "s"),
              " " === e && (r.style.whiteSpace = "pre"),
              t.appendChild(r));
          }));
      }),
      () => {
        t.forEach((e) => {
          const t = e.querySelector('[data-stagger-char="text"]');
          if (!t) return;
          const a = t.dataset.originalText;
          a && ((t.innerHTML = a), t.classList.remove("chars-stagger-done"), delete t.dataset.originalText);
        });
      }
    ),
  ),
    window.addDisposable(() => a.kill()));
}
function initFaq(e = document) {
  const t = e.querySelectorAll('[data-dropdown="item"]');
  0 !== t.length &&
    t.forEach((e) => {
      const a = e.querySelector('[data-dropdown="trigger"]');
      a &&
        a.addEventListener("click", () => {
          const a = "open" === e.getAttribute("data-state");
          (t.forEach((t) => {
            t !== e && t.setAttribute("data-state", "closed");
          }),
            e.setAttribute("data-state", a ? "closed" : "open"),
            setTimeout(() => {
              (lenis && lenis.resize(), ScrollTrigger.refresh());
            }, 1e3 * durations.m));
        });
    });
}
function initFormValidation(e = document) {
  e.querySelectorAll('[data-form="group"]').forEach((e) => {
    function t() {
      return new Date().getTime() - o < 5e3;
    }
    function a() {
      let e = !0,
        t = null;
      return (
        l.forEach((a) => {
          const n = a.querySelector("input, textarea, select"),
            o = a.querySelectorAll('input[type="radio"], input[type="checkbox"]');
          (n || 0 !== o.length) &&
            (n && "radio" !== n.type && "checkbox" !== n.type && (n.__validationStarted = !0),
            o.length > 0 &&
              o.forEach((e) => {
                e.__validationStarted = !0;
              }),
            i(a),
            r(a) || ((e = !1), t || (t = n || o[0])));
        }),
        !e && t && t.focus(),
        e
      );
    }
    function n(e) {
      if (u.has(e)) return u.get(e);
      const t = e.querySelectorAll('input[type="radio"]'),
        a = e.querySelectorAll('input[type="checkbox"]'),
        n = e.querySelector("input, textarea, select"),
        r = "true" === e.getAttribute("data-required");
      let i = 1,
        o = Number.POSITIVE_INFINITY;
      (e.hasAttribute("min") && (i = Number.parseInt(e.getAttribute("min"))),
        e.hasAttribute("max") && (o = Number.parseInt(e.getAttribute("max"))));
      const s = e.querySelector("[min], [max]");
      s &&
        (s.hasAttribute("min") && (i = Number.parseInt(s.getAttribute("min"))),
        s.hasAttribute("max") && (o = Number.parseInt(s.getAttribute("max"))));
      const l = { radioInputs: t, checkboxInputs: a, input: n, isRequired: r, min: i, max: o };
      return (u.set(e, l), l);
    }
    function r(e) {
      const { radioInputs: t, checkboxInputs: a, input: r, isRequired: i, min: o, max: s } = n(e);
      if (t.length > 0) {
        if (!i) return !0;
        return Array.from(t).filter((e) => e.checked).length >= 1;
      }
      if (a.length > 0) {
        if (!i) return !0;
        const e = Array.from(a).filter((e) => e.checked).length;
        return e >= o && e <= s;
      }
      if (!r) return !1;
      const l = r.value.trim();
      return "select" === r.tagName.toLowerCase()
        ? "" !== l && "disabled" !== l && "null" !== l && "false" !== l
        : "email" === r.type
          ? p.test(l)
          : !r.hasAttribute("required") || l.length > 0;
    }
    function i(e) {
      const { radioInputs: t, checkboxInputs: a, input: i } = n(e);
      if (t.length > 0 || a.length > 0) {
        const n = t.length > 0 ? t : a;
        if (r(e))
          n.forEach((e) => {
            (e.classList.add("has-success"), e.classList.remove("has-error"));
          });
        else {
          n.forEach((e) => {
            e.classList.remove("has-success");
          });
          Array.from(n).some((e) => e.__validationStarted)
            ? n.forEach((e) => {
                e.classList.add("has-error");
              })
            : n.forEach((e) => {
                e.classList.remove("has-error");
              });
        }
      } else {
        if (!i) return;
        r(e)
          ? (i.classList.add("has-success"), i.classList.remove("has-error"))
          : (i.classList.remove("has-success"),
            i.__validationStarted ? i.classList.add("has-error") : i.classList.remove("has-error"));
      }
    }
    const o = new Date().getTime(),
      s = e.querySelector("form");
    if (!s) return;
    s.setAttribute("novalidate", "novalidate");
    const l = s.querySelectorAll('[data-form="validate"]'),
      c = s.querySelector('[data-form="submit"]');
    if (!c) return;
    const d = c.querySelector('input[type="submit"]');
    if (!d) return;
    l.forEach((e) => {
      if ("true" === e.getAttribute("data-required")) {
        e.querySelectorAll("input:not([type='radio']):not([type='checkbox']), textarea, select").forEach(
          (e) => {
            e.setAttribute("required", "required");
          },
        );
      }
    });
    const u = new WeakMap(),
      p = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    l.forEach((e) => {
      const t = e.querySelector("select");
      if (t) {
        t.querySelectorAll("option").forEach((e) => {
          ("" !== e.value && "disabled" !== e.value && "null" !== e.value && "false" !== e.value) ||
            e.setAttribute("disabled", "disabled");
        });
      }
    });
    const f = new WeakMap();
    l.forEach((e) => {
      e.querySelectorAll("input, textarea, select").forEach((t) => {
        ((t.__validationStarted = !1), f.set(t, e));
      });
    });
    const g = (e) => {
        const t = e.target,
          a = f.get(t);
        if (!a) return;
        if ("radio" === t.type || "checkbox" === t.type) return;
        const n = t.value.trim();
        (t.__validationStarted ||
          ("email" === t.type
            ? r(a) && (t.__validationStarted = !0)
            : n.length > 0 && (t.__validationStarted = !0)),
          t.__validationStarted && i(a));
      },
      h = (e) => {
        const t = e.target,
          a = f.get(t);
        a &&
          ("radio" === t.type || "checkbox" === t.type
            ? requestAnimationFrame(() => {
                const e = a.querySelectorAll(`input[type="${t.type}"]`),
                  n = Array.from(e).filter((e) => e.checked).length;
                (!t.__validationStarted && n >= 1 && e.forEach((e) => (e.__validationStarted = !0)),
                  t.__validationStarted && i(a));
              })
            : "select" === t.tagName.toLowerCase() && ((t.__validationStarted = !0), i(a)));
      },
      m = (e) => {
        const t = e.target,
          a = f.get(t);
        a && ((t.__validationStarted = !0), i(a));
      },
      w = () => {
        if (a()) {
          if (t()) return void alert("Form submitted too quickly. Please try again.");
          d.click();
        }
      },
      y = (e) => {
        "Enter" === e.key && "TEXTAREA" !== e.target.tagName && (e.preventDefault(), w());
      };
    (s.addEventListener("input", g),
      s.addEventListener("change", h),
      s.addEventListener("focusout", m),
      s.addEventListener("keydown", y),
      c.addEventListener("click", w));
  });
}
function createDashedPillBorder(e, t) {
  const a = 1,
    n = a / 2,
    r = t / 2,
    i =
      `\n    <svg \n      width="${e}" \n      height="${t}" \n      viewBox="0 0 ${e} ${t}"\n      xmlns="http://www.w3.org/2000/svg"\n    >\n      <rect\n        x="${n}"\n        y="${n}"\n        width="${e - a}"\n        height="${t - a}"\n        rx="${r - n}"\n        ry="${r - n}"\n        stroke="rgba(255,255,255,1)" \n        stroke-width="${a}" \n        fill="none" \n        stroke-dasharray="1 3"\n        stroke-linecap="butt"\n      />\n    </svg>\n  `.trim();
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(i)}`;
}
function initButtonBorders(e = document) {
  const t = e.querySelectorAll(".btn_border");
  if (0 === t.length) return;
  const a = gsap.matchMedia();
  (a.add(breakpoints.reduceMotion, () => {
    t.forEach((e) => {
      const t = e.querySelector('[data-btn="border-animate"]');
      t && t.classList.add("is-static");
    });
  }),
    a.add(`not ${breakpoints.reduceMotion}`, () => {
      const e = [];
      (t.forEach((t) => {
        if ("true" === t.dataset.borderInit) return void e.push(null);
        const a = t.getBoundingClientRect();
        e.push({ width: Math.ceil(a.width), height: Math.ceil(a.height) });
      }),
        t.forEach((t, a) => {
          const n = e[a];
          if (!n) return;
          const { width: r, height: i } = n;
          if (0 === r || 0 === i) return;
          const o = 1,
            s = 1,
            l = r - 2 * s,
            c = i - 2 * s,
            d = Math.ceil(i / 2),
            u =
              `\n        <svg width="${r}" height="${i}" viewBox="0 0 ${r} ${i}" xmlns="http://www.w3.org/2000/svg">\n          <rect x="${s}" y="${s}" width="${l}" height="${c}" \n                rx="${d - s}" ry="${d - s}" \n                stroke="rgba(255,255,255,1)" stroke-width="${o}" \n                fill="none" stroke-dasharray="1 3" stroke-linecap="butt"\n                shape-rendering="crispEdges" />\n        </svg>\n      `.trim(),
            p = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(u)}`;
          ((t.style.maskImage = `url("${p}")`),
            (t.style.webkitMaskImage = `url("${p}")`),
            (t.style.maskSize = `${r}px ${i}px`),
            (t.style.webkitMaskSize = `${r}px ${i}px`),
            (t.style.maskRepeat = "no-repeat"),
            (t.style.webkitMaskRepeat = "no-repeat"),
            (t.style.maskPosition = "center"),
            (t.style.webkitMaskPosition = "center"),
            (t.style.imageRendering = "crisp-edges"),
            (t.style.imageRendering = "pixelated"),
            (t.dataset.borderInit = "true"));
          const f = t.querySelector('[data-btn="border-animate"]');
          if (f) {
            const e = 6,
              t = 0.3282275711,
              a = 0.5,
              n = 0.8282275711,
              r = e * t,
              i = e * (a - t),
              o = e * (n - a),
              s = e * (1 - n);
            gsap.set(f, { "--r2": "0deg", "--x": "10%", "--y": "15%" });
            const l = gsap.timeline({ repeat: -1, defaults: { ease: "none" } });
            (l
              .to(f, { "--x": "90%", "--y": "85%", duration: r }, 0)
              .to(f, { "--r2": "180deg", duration: i }, r)
              .to(f, { "--x": "10%", "--y": "15%", duration: o }, i + r)
              .to(f, { "--r2": "360deg", duration: s }, o + i + r),
              window.addDisposable(() => {
                (l.kill(), gsap.set(f, { clearProps: "--r2,--x,--y" }));
              }));
          }
          window.addDisposable(() => {
            ((t.style.maskImage = ""),
              (t.style.webkitMaskImage = ""),
              (t.dataset.borderInit = "false"),
              (t.style.imageRendering = ""));
          });
        }));
    }),
    window.addDisposable(() => a.kill()));
}
function initLogoWall(e = document) {
  const t = e.querySelectorAll("[data-logo-wall-cycle-init]");
  0 !== t.length &&
    t.forEach((e) => {
      const t = 1.5,
        a = 0.9,
        n = "false" !== e.getAttribute("data-logo-wall-shuffle"),
        r = e.querySelector("[data-logo-wall-list]");
      if (!r) return;
      const i = Array.from(r.querySelectorAll("[data-logo-wall-item]")),
        o = i.map((e) => e.querySelector("[data-logo-wall-target]")).filter(Boolean);
      let s = [],
        l = 0,
        c = [],
        d = [],
        u = 0,
        p = null,
        f = null;
      const g = (e) => "none" !== window.getComputedStyle(e).display,
        h = (e) => {
          const t = e.slice();
          for (let e = t.length - 1; e > 0; e--) {
            const a = Math.floor(Math.random() * (e + 1));
            [t[e], t[a]] = [t[a], t[e]];
          }
          return t;
        },
        m = () => {
          let e, a;
          if (
            (p && p.kill(),
            (s = i.filter(g)),
            (l = s.length),
            (d = h(Array.from({ length: l }, (e, t) => t))),
            (u = 0),
            i.forEach((e) => {
              e.querySelectorAll("[data-logo-wall-target]").forEach((e) => e.remove());
            }),
            (c = o.map((e) => e.cloneNode(!0))),
            n)
          ) {
            const t = h(c);
            ((e = t.slice(0, l)), (a = h(t.slice(l))));
          } else ((e = c.slice(0, l)), (a = h(c.slice(l))));
          c = e.concat(a);
          for (let e = 0; e < l; e++) {
            const t = s[e].querySelector("[data-logo-wall-target-parent]") || s[e],
              a = c.shift();
            a && t.appendChild(a);
          }
          c.length > 0 && ((p = gsap.timeline({ repeat: -1, repeatDelay: t })), p.call(w));
        },
        w = () => {
          if (i.filter(g).length !== l) return void m();
          if (!c.length) return;
          const e = d[u % l];
          u++;
          const t = s[e];
          if (!t) return;
          const n = t.querySelector("[data-logo-wall-target-parent]") || t,
            r = n.querySelectorAll("[data-logo-wall-target]");
          if (r.length > 1) {
            for (let e = 0; e < r.length - 1; e++) r[e].remove();
            return;
          }
          const o = n.querySelector("[data-logo-wall-target]"),
            p = c.shift();
          p &&
            (gsap.set(p, { yPercent: 50, autoAlpha: 0 }),
            n.appendChild(p),
            o &&
              gsap.to(o, {
                yPercent: -50,
                autoAlpha: 0,
                duration: a,
                ease: "expo.inOut",
                onComplete: () => {
                  (o.remove(), gsap.set(o, { clearProps: "all" }), c.push(o));
                },
              }),
            gsap.to(p, { yPercent: 0, autoAlpha: 1, duration: a, delay: 0.1, ease: "expo.inOut" }));
        };
      (m(),
        (f = ScrollTrigger.create({
          trigger: e,
          start: "top bottom",
          end: "bottom top",
          onEnter: () => p && p.play(),
          onLeave: () => p && p.pause(),
          onEnterBack: () => p && p.play(),
          onLeaveBack: () => p && p.pause(),
        })),
        window.addDisposable(() => {
          (p && p.kill(), f && f.kill());
        }));
    });
}
function initPortfolioSlider(e = document) {
  const t = e.querySelectorAll('[data-pf="group"]');
  if (0 === t.length) return;
  const a = gsap.matchMedia();
  (t.forEach((e) => {
    const t = e.querySelector('[data-pf="main"]'),
      n = e.querySelector('[data-pf="list"]'),
      r = e.querySelector('[data-swiper="next"]'),
      i = e.querySelector('[data-swiper="prev"]');
    if (!t || !n) return;
    let o = null,
      s = null;
    const l = {
        loop: !1,
        centeredSlides: !0,
        effect: "slide",
        speed: 600,
        slideActiveClass: "active",
        slideNextClass: "next",
        slidePrevClass: "prev",
      },
      c = {
        320: { slidesPerView: 1.05, spaceBetween: 0 },
        480: { slidesPerView: 1.2, spaceBetween: 0 },
        768: { slidesPerView: 1.5, spaceBetween: 0 },
      },
      d = (e) => {
        s && s.slideTo(e, 0);
      },
      u = () => {
        o &&
          o.on("slideChange", () => {
            d(o.activeIndex);
          });
      },
      p = () => {
        (o && o.destroy(!0, !0), s && s.destroy(!0, !0), (o = null), (s = null));
      };
    (a.add(
      "(min-width: 992px)",
      () => (
        (o = new Swiper(t, {
          ...l,
          slidesPerView: "auto",
          spaceBetween: 4,
          direction: "vertical",
          navigation: { nextEl: r, prevEl: i },
        })),
        (s = new Swiper(n, {
          ...l,
          speed: 0,
          allowTouchMove: !1,
          slidesPerView: "auto",
          spaceBetween: 0,
          direction: "vertical",
          watchSlidesProgress: !0,
          cssMode: !1,
          freeMode: !1,
          noSwiping: !0,
          noSwipingClass: "swiper-wrapper",
        })),
        u(),
        () => p()
      ),
    ),
      a.add(
        "(max-width: 991px)",
        () => (
          (o = new Swiper(t, {
            ...l,
            slidesPerView: 1.5,
            spaceBetween: 12,
            direction: "horizontal",
            breakpoints: c,
            navigation: { nextEl: r, prevEl: i },
          })),
          (s = new Swiper(n, {
            ...l,
            speed: 0,
            allowTouchMove: !1,
            slidesPerView: 1,
            spaceBetween: 0,
            direction: "horizontal",
            watchSlidesProgress: !0,
            cssMode: !1,
            noSwiping: !0,
            noSwipingClass: "swiper-wrapper",
          })),
          u(),
          () => p()
        ),
      ));
  }),
    window.addDisposable(() => {
      a.kill();
    }));
}
function initSwiperGeneral(e = document) {
  const t = e.querySelectorAll('[data-swiper="group"]');
  if (0 === t.length) return;
  const a = [];
  (t.forEach((e) => {
    const t = e.querySelector(".swiper-group");
    if (!t || t.swiper) return;
    const n = e.querySelector('[data-swiper="prev"]'),
      r = e.querySelector('[data-swiper="next"]'),
      i = e.querySelector('[data-swiper="pagination"]'),
      o = e.dataset.swiperView;
    let s = 1.5,
      l = 1.15;
    if (o) {
      const e = o.split(",").map((e) => {
        const t = e.trim();
        return "auto" === t ? "auto" : parseFloat(t);
      });
      e.length >= 2 ? ((s = e[0]), (l = e[1])) : 1 === e.length && (s = e[0]);
    }
    const c = e.dataset.swiperSpace;
    let d = 20,
      u = 16;
    if (c) {
      const e = c.split(",").map((e) => parseFloat(e.trim()));
      e.length >= 2 ? ((d = e[0]), (u = e[1])) : 1 === e.length && (d = e[0]);
    }
    const p = "false" !== e.dataset.swiperCenter,
      f = "vertical" === e.dataset.swiperDirection ? "vertical" : "horizontal",
      g = "true" === e.dataset.swiperAutoplay,
      h = "true" === e.dataset.swiperLoop,
      m = e.dataset.swiperInitial;
    let w = p ? 1 : 0;
    if (void 0 !== m) {
      const e = parseInt(m, 10);
      isNaN(e) || (w = e);
    }
    const y = {
      slidesPerView: l,
      spaceBetween: u,
      direction: f,
      loop: h,
      centeredSlides: p,
      initialSlide: w,
      grabCursor: !0,
      speed: 600,
      slideActiveClass: "active",
      slideNextClass: "next",
      slidePrevClass: "prev",
      breakpoints: { 992: { slidesPerView: s, spaceBetween: d } },
    };
    (g && (y.autoplay = { delay: 4e3, disableOnInteraction: !1, pauseOnMouseEnter: !0 }),
      n && r && (y.navigation = { prevEl: n, nextEl: r }),
      i && (y.pagination = { el: i, clickable: !0, type: "bullets" }));
    const b = (e) => {
      requestAnimationFrame(() => {
        const t = e?.slides;
        if (t && t.length) {
          t.forEach((e) => {
            e.classList.remove("next-next", "prev-prev");
          });
          for (let e = 0; e < t.length; e++)
            if (t[e].classList.contains("next") && t[e + 1]) {
              t[e + 1].classList.add("next-next");
              break;
            }
          for (let e = 0; e < t.length; e++)
            if (t[e].classList.contains("prev") && t[e - 1]) {
              t[e - 1].classList.add("prev-prev");
              break;
            }
        }
      });
    };
    y.on = { init: b, slideChange: b };
    const v = new Swiper(t, y);
    a.push(v);
  }),
    window.addDisposable(() => {
      (a.forEach((e) => e.destroy(!0, !0)), (a.length = 0));
    }));
}
function initBunnyPlayer(e = document) {
  function t(e) {
    return (e < 10 ? "0" : "") + e;
  }
  function a(e) {
    if (!isFinite(e) || e < 0) return "00:00";
    var a = Math.floor(e),
      n = Math.floor(a / 3600),
      r = Math.floor((a % 3600) / 60),
      i = a % 60;
    return n > 0 ? n + ":" + t(r) + ":" + t(i) : t(r) + ":" + t(i);
  }
  function n(e) {
    if (!e && 0 !== e) return null;
    if (((e = ("" + e).trim()), /^\d+(\.\d+)?$/.test(e))) return parseFloat(e);
    var t = e.split(":").map(Number);
    return t.some(isNaN)
      ? null
      : 3 === t.length
        ? 3600 * t[0] + 60 * t[1] + t[2]
        : 2 === t.length
          ? 60 * t[0] + t[1]
          : null;
  }
  function r(e, t) {
    e.forEach((e) => (e.textContent = t));
  }
  function i(e) {
    return e && e.length ? e.reduce((e, t) => ((t.width || 0) > (e.width || 0) ? t : e), e[0]) : null;
  }
  function o(e, t) {
    try {
      return new URL(t, e).toString();
    } catch (e) {
      return t;
    }
  }
  const s = e.querySelectorAll("[data-bunny-player-init]");
  s.length &&
    (window.__bunnyPlayers ||
      ((window.__bunnyPlayers = new Map()),
      (window.playPlayerById = function (e, t) {
        const a = window.__bunnyPlayers.get(e);
        if (a) {
          const e = t && void 0 !== t.startAt ? t.startAt : null;
          if (
            ((a.autoCloseOnEnd = !0),
            a._closeTimer && (clearTimeout(a._closeTimer), (a._closeTimer = null)),
            a.isLazy && !a.isAttached() && a.attach(),
            null != e)
          ) {
            let t = a.helpers.parseTime(e);
            if (null != t)
              try {
                (isFinite(a.video.duration) && (t = Math.max(0, Math.min(a.video.duration, t))),
                  (a.video.currentTime = t));
              } catch (e) {}
          }
          (window.lenis && window.lenis.stop(),
            a.player.setAttribute("data-player-open", "true"),
            a.setActivated(!0),
            a.setStatus("loading"),
            a.safePlay(a.video));
        }
      }),
      (window.closePlayerById = function (e) {
        const t = window.__bunnyPlayers.get(e);
        t &&
          ((t.autoCloseOnEnd = !1),
          t._closeTimer && clearTimeout(t._closeTimer),
          t.player.setAttribute("data-player-open", "false"),
          window.lenis && window.lenis.start(),
          (t._closeTimer = setTimeout(function () {
            try {
              t.video.pause();
            } catch (e) {}
            try {
              t.video.currentTime = 0;
            } catch (e) {}
            (t.setActivated(!1), t.setStatus("paused"), (t._closeTimer = null));
          }, 900)));
      })),
    s.forEach(function (e) {
      function t(e, t, a, n) {
        (e.addEventListener(t, a, n), L.push(() => e.removeEventListener(t, a, n)));
      }
      function s(t) {
        e.getAttribute("data-player-status") !== t && e.setAttribute("data-player-status", t);
      }
      function l(t) {
        ((C.muted = !!t), e.setAttribute("data-player-muted", C.muted ? "true" : "false"));
      }
      function c(t) {
        e.setAttribute("data-player-activated", t ? "true" : "false");
      }
      function d(e) {
        var t = e.play();
        t && "function" == typeof t.then && t.catch(function () {});
      }
      function u(e, t, a, n) {
        if ("true" === t && a && n) {
          var r = e.querySelector("[data-player-before]");
          (r && (r.style.paddingTop = (n / a) * 100 + "%"),
            n > a ? e.classList.add("cc-mobile") : e.classList.remove("cc-mobile"));
        }
      }
      function p(e, t, a) {
        if ("true" === t) {
          var n = e.querySelector("[data-player-before]");
          n &&
            ((n.style.paddingTop && "0%" !== n.style.paddingTop) ||
              !a.videoWidth ||
              !a.videoHeight ||
              u(e, t, a.videoWidth, a.videoHeight));
        }
      }
      function f(e, t) {
        return new Promise(function (a) {
          if (t && window.Hls && Hls.isSupported())
            try {
              var n = new Hls(),
                r = { width: 0, height: 0, duration: NaN };
              (n.on(Hls.Events.MANIFEST_PARSED, function (e, t) {
                var a = i((t && t.levels) || n.levels || []);
                a && a.width && a.height && ((r.width = a.width), (r.height = a.height));
              }),
                n.on(Hls.Events.LEVEL_LOADED, function (e, t) {
                  t &&
                    t.details &&
                    isFinite(t.details.totalduration) &&
                    (r.duration = t.details.totalduration);
                }));
              var s = function () {
                try {
                  n.destroy();
                } catch (e) {}
                a(r);
              };
              return (n.on(Hls.Events.ERROR, s), n.on(Hls.Events.LEVEL_LOADED, s), void n.loadSource(e));
            } catch (e) {
              return void a({ width: 0, height: 0, duration: NaN });
            }
          fetch(e, { credentials: "omit", cache: "no-store" })
            .then(function (e) {
              if (!e.ok) throw new Error("master");
              return e.text();
            })
            .then(function (t) {
              for (var n = t.split(/\r?\n/), r = 0, i = 0, s = null, l = null, c = 0; c < n.length; c++) {
                var d = n[c];
                if (0 === d.indexOf("#EXT-X-STREAM-INF:")) l = d;
                else if (l && d && "#" !== d[0]) {
                  s || (s = d.trim());
                  var u = /RESOLUTION=(\d+)x(\d+)/.exec(l);
                  if (u) {
                    var p = parseInt(u[1], 10),
                      f = parseInt(u[2], 10);
                    p > r && ((r = p), (i = f));
                  }
                  l = null;
                }
              }
              if (s) {
                var g = o(e, s);
                return fetch(g, { credentials: "omit", cache: "no-store" })
                  .then((e) => (e.ok ? e.text() : ""))
                  .then((e) => {
                    for (var t, n = 0, o = /#EXTINF:([\d.]+)/g; (t = o.exec(e));) n += parseFloat(t[1]);
                    a({ width: r || 0, height: i || 0, duration: n });
                  });
              }
              a({ width: r || 0, height: i || 0, duration: NaN });
            })
            .catch(function () {
              a({ width: 0, height: 0, duration: NaN });
            });
        });
      }
      function g() {
        f(q, U).then(function (t) {
          (t.width && t.height && u(e, B, t.width, t.height),
            F.length && isFinite(t.duration) && t.duration > 0 && r(F, a(t.duration)),
            h(e, V));
        });
      }
      function h(e, t) {
        t ||
          "true" === e.getAttribute("data-player-activated") ||
          "idle" !== e.getAttribute("data-player-status") ||
          e.setAttribute("data-player-status", "ready");
      }
      function m() {
        if (!Q) {
          if (((Q = !0), e._hls)) {
            try {
              e._hls.destroy();
            } catch (e) {}
            e._hls = null;
          }
          if (X)
            ((C.preload = R || N ? "auto" : C.preload),
              (C.src = q),
              C.addEventListener(
                "loadedmetadata",
                function () {
                  (h(e, V),
                    "true" === B && u(e, B, C.videoWidth, C.videoHeight),
                    F.length && r(F, a(C.duration)));
                },
                { once: !0 },
              ));
          else if (U) {
            var t = new Hls({ maxBufferLength: 10 });
            (t.attachMedia(C),
              t.on(Hls.Events.MEDIA_ATTACHED, function () {
                t.loadSource(q);
              }),
              t.on(Hls.Events.MANIFEST_PARSED, function () {
                if ((h(e, V), "true" === B)) {
                  var a = i(t.levels || []);
                  a && a.width && a.height && u(e, B, a.width, a.height);
                }
              }),
              t.on(Hls.Events.LEVEL_LOADED, function (e, t) {
                t &&
                  t.details &&
                  isFinite(t.details.totalduration) &&
                  F.length &&
                  r(F, a(t.details.totalduration));
              }),
              (e._hls = t));
          } else C.src = q;
        }
      }
      function w() {
        C.paused || C.ended
          ? ((!R && !N) || Q || m(), (V = !0), (j = ""), s("loading"), d(C))
          : ((j = "manual"), C.pause());
      }
      function y() {
        ((C.muted = !C.muted), e.setAttribute("data-player-muted", C.muted ? "true" : "false"));
      }
      function b() {
        !(!document.fullscreenElement && !document.webkitFullscreenElement) || C.webkitDisplayingFullscreen
          ? document.exitFullscreen
            ? document.exitFullscreen()
            : document.webkitExitFullscreen
              ? document.webkitExitFullscreen()
              : C.webkitExitFullscreen && C.webkitExitFullscreen()
          : e.requestFullscreen
            ? e.requestFullscreen()
            : C.requestFullscreen
              ? C.requestFullscreen()
              : C.webkitEnterFullscreen && C.webkitEnterFullscreen();
      }
      function v() {
        if (C.duration) {
          var e = (C.currentTime / C.duration) * 100;
          ($ && ($.style.transform = "translateX(" + (-100 + e) + "%)"), D && (D.style.left = e + "%"));
        }
      }
      function A() {
        (v(), C.paused || C.ended || (K = requestAnimationFrame(A)));
      }
      function S() {
        (F.length && r(F, a(C.duration)), O.length && r(O, a(C.currentTime)));
      }
      function E() {
        if (I && C.duration && C.buffered.length) {
          var e = (C.buffered.end(C.buffered.length - 1) / C.duration) * 100;
          I.style.transform = "translateX(" + (-100 + e) + "%)";
        }
      }
      function x(t) {
        e.getAttribute("data-player-hover") !== t && e.setAttribute("data-player-hover", t);
      }
      function _() {
        (clearTimeout(J),
          (J = setTimeout(function () {
            x("idle");
          }, ue)));
      }
      function T() {
        (x("active"), _());
      }
      function k(t) {
        var a = e.getBoundingClientRect();
        t.clientX >= a.left && t.clientX <= a.right && t.clientY >= a.top && t.clientY <= a.bottom && T();
      }
      const L = [];
      var q = e.getAttribute("data-player-src");
      if (!q) return;
      var C = e.querySelector("video");
      if (!C) return;
      var P = e.getAttribute("data-player-id");
      try {
        C.pause();
      } catch (ge) {}
      try {
        (C.removeAttribute("src"), C.load());
      } catch (he) {}
      e.hasAttribute("data-player-activated") || c(!1);
      var M = e.querySelector("[data-player-timeline]"),
        $ = e.querySelector("[data-player-progress]"),
        I = e.querySelector("[data-player-buffered]"),
        D = e.querySelector("[data-player-timeline-handle]"),
        F = e.querySelectorAll("[data-player-time-duration]"),
        O = e.querySelectorAll("[data-player-time-progress]"),
        B = e.getAttribute("data-player-update-size"),
        H = e.getAttribute("data-player-lazy"),
        R = "true" === H,
        N = "meta" === H,
        W = "true" === e.getAttribute("data-player-autoplay"),
        z = "true" === e.getAttribute("data-player-muted"),
        V = !1,
        j = "";
      (W ? (l(!0), (C.loop = !0)) : l(z),
        C.setAttribute("muted", ""),
        C.setAttribute("playsinline", ""),
        C.setAttribute("webkit-playsinline", ""),
        (C.playsInline = !0),
        void 0 !== C.disableRemotePlayback && (C.disableRemotePlayback = !0),
        W && (C.autoplay = !1));
      var X = !!C.canPlayType("application/vnd.apple.mpegurl"),
        U = !(!window.Hls || !Hls.isSupported() || X);
      if ("true" === B && !N && !R) {
        var Y = C.preload;
        C.preload = "metadata";
        var G = function () {
          (u(e, B, C.videoWidth, C.videoHeight),
            C.removeEventListener("loadedmetadata", G),
            (C.preload = Y || ""));
        };
        (C.addEventListener("loadedmetadata", G, { once: !0 }), (C.src = q));
      }
      var K,
        J,
        Q = !1;
      if (
        (W ? (C.preload = "none") : N ? (g(), (C.preload = "none")) : R ? (C.preload = "none") : m(),
        t(e, "click", function (t) {
          var a = t.target.closest("[data-player-control]");
          if (a && e.contains(a)) {
            var n = a.getAttribute("data-player-control");
            if ("play" === n || "pause" === n || "playpause" === n) w();
            else if ("mute" === n) y();
            else if ("fullscreen" === n) b();
            else if ("reset" === n) {
              (a.classList.add("rotating"),
                setTimeout(() => a.classList.remove("rotating"), 300),
                (!R && !N) || Q || (m(), s("loading")));
              try {
                C.currentTime = 0;
              } catch (e) {}
              (v(), S(), (j = ""), (V = !0), d(C));
            }
          }
        }),
        t(
          e,
          "click",
          (t) => {
            const a = t.target.closest("[data-player-control-set-time]");
            if (!a || !e.contains(a)) return;
            let r = n(a.getAttribute("data-player-control-set-time"));
            if (null !== r) {
              (((R || N) && !Q && V) || Q || m(),
                isFinite(C.duration) && (r = Math.max(0, Math.min(C.duration, r))));
              try {
                C.currentTime = r;
              } catch (e) {}
              C.paused || C.ended || d(C);
            }
          },
          { passive: !0 },
        ),
        t(C, "timeupdate", S),
        t(C, "loadedmetadata", function () {
          (S(), p(e, B, C));
        }),
        t(C, "loadeddata", function () {
          p(e, B, C);
        }),
        t(C, "playing", function () {
          p(e, B, C);
        }),
        t(C, "durationchange", S),
        t(C, "progress", E),
        t(C, "loadedmetadata", E),
        t(C, "durationchange", E),
        t(C, "play", function () {
          (c(!0), cancelAnimationFrame(K), A(), s("playing"));
        }),
        t(C, "playing", function () {
          ((V = !1), s("playing"));
        }),
        t(C, "pause", function () {
          ((V = !1), cancelAnimationFrame(K), v(), s("paused"));
        }),
        t(C, "waiting", function () {
          s("loading");
        }),
        t(C, "canplay", function () {
          h(e, V);
        }),
        t(C, "ended", function () {
          ((V = !1), cancelAnimationFrame(K), v(), s("paused"), c(!1));
          const t = e._playerId || "";
          if (t) {
            const e = window.__bunnyPlayers.get(t);
            e && e.autoCloseOnEnd && window.closePlayerById(t);
          }
        }),
        M)
      ) {
        var Z = !1,
          ee = !1,
          te = 0,
          ae = 0,
          ne = 180,
          re = null;
        function ie(e) {
          re || (re = M.getBoundingClientRect());
          var t = (e - re.left) / re.width;
          return (t < 0 && (t = 0), t > 1 && (t = 1), t);
        }
        function oe(e) {
          if (C.duration) {
            var t = 100 * e;
            ($ && ($.style.transform = "translateX(" + (-100 + t) + "%)"),
              D && (D.style.left = t + "%"),
              O.length && r(O, a(e * C.duration)));
          }
        }
        function se(e) {
          C.duration && (e - ae < ne || ((ae = e), (C.currentTime = te)));
        }
        function le(t) {
          if (C.duration) {
            ((Z = !0),
              (ee = !C.paused && !C.ended) && C.pause(),
              e.setAttribute("data-timeline-drag", "true"),
              (re = M.getBoundingClientRect()));
            var a = ie(t.clientX);
            ((te = a * C.duration),
              oe(a),
              se(performance.now()),
              M.setPointerCapture && M.setPointerCapture(t.pointerId),
              window.addEventListener("pointermove", ce, { passive: !1 }),
              window.addEventListener("pointerup", de, { passive: !0 }),
              t.preventDefault());
          }
        }
        function ce(e) {
          if (Z) {
            var t = ie(e.clientX);
            ((te = t * C.duration), oe(t), se(performance.now()), e.preventDefault());
          }
        }
        function de() {
          Z &&
            ((Z = !1),
            e.setAttribute("data-timeline-drag", "false"),
            (re = null),
            (C.currentTime = te),
            ee ? d(C) : (v(), S()),
            window.removeEventListener("pointermove", ce),
            window.removeEventListener("pointerup", de));
        }
        (t(window, "resize", function () {
          Z || (re = null);
        }),
          t(M, "pointerdown", le, { passive: !1 }),
          D && t(D, "pointerdown", le, { passive: !1 }));
      }
      var ue = 3e3;
      (t(e, "pointerdown", T), t(document, "fullscreenchange", T), t(document, "webkitfullscreenchange", T));
      var pe = !1;
      (t(e, "pointerenter", function () {
        (T(), pe || ((pe = !0), window.addEventListener("pointermove", k, { passive: !0 })));
      }),
        t(e, "pointerleave", function () {
          (x("idle"), clearTimeout(J), pe && ((pe = !1), window.removeEventListener("pointermove", k)));
        }));
      let fe = null;
      (W &&
        window.observeWith &&
        (fe = window.observeWith(e, { threshold: 0.1 }, (e) => {
          if (e.isIntersecting) {
            if (((!R && !N) || Q || m(), "manual" === j)) return;
            C.paused ? ((j = ""), (V = !0), s("loading"), d(C)) : s("playing");
          } else C.paused || C.ended || ((j = "io"), C.pause(), s("paused"));
        })),
        P &&
          ((e._playerId = P),
          window.__bunnyPlayers.set(P, {
            id: P,
            player: e,
            video: C,
            helpers: { parseTime: n },
            setActivated: c,
            setStatus: s,
            safePlay: d,
            attach: m,
            isLazy: R || N,
            isAttached: () => Q,
          })),
        window.addDisposable(() => {
          try {
            C.pause();
          } catch (e) {}
          if ((cancelAnimationFrame(K), clearTimeout(J), e._hls)) {
            try {
              e._hls.destroy();
            } catch (e) {}
            e._hls = null;
          }
          (fe && fe(),
            L.forEach((e) => e()),
            pe && window.removeEventListener("pointermove", k),
            P && window.__bunnyPlayers && window.__bunnyPlayers.delete(P));
        }));
    }),
    window.__bunnyGlobalListeners ||
      ((window.__bunnyGlobalListeners = !0),
      document.addEventListener(
        "click",
        function (e) {
          var t = e.target.closest("[data-player-control-open]");
          t &&
            window.playPlayerById(t.getAttribute("data-player-control-open"), {
              startAt: t.getAttribute("data-player-start"),
            });
          var a = e.target.closest("[data-player-control-close]");
          a && window.closePlayerById(a.getAttribute("data-player-control-close"));
        },
        !0,
      ),
      document.addEventListener("keydown", function (e) {
        if ("Escape" === e.key || "Esc" === e.key) {
          var t = null;
          (window.__bunnyPlayers.forEach((e) => {
            "true" === e.player.getAttribute("data-player-open") && (t = e);
          }),
            t && window.closePlayerById(t.id));
        }
      })));
}
function initProjectDevice(e = document) {
  const t = e.querySelectorAll('[data-project-device="group"]');
  0 !== t.length &&
    t.forEach((e) => {
      function t(e) {
        if (!i || !e) return;
        const t = Flip.getState(i);
        (e.appendChild(i), Flip.from(t, { duration: durations.xs, ease: easings.elastic }));
      }
      function a(e, t) {
        if (s) return;
        s = !0;
        const a = gsap.timeline({
            onComplete: () => {
              s = !1;
            },
          }),
          n = t ? t.querySelectorAll('[data-project-device="item"]') : [],
          i = e.querySelectorAll('[data-project-device="item"]');
        (e.setAttribute("data-tab-status", "active"),
          (e.style.position = "absolute"),
          (e.style.top = "0"),
          (e.style.left = "0"),
          (e.style.width = "100%"));
        const l = e.offsetHeight;
        a.to(o, { height: l, duration: 0.4, ease: "power2.out" }, 0)
          .to(n, { xPercent: -15, autoAlpha: 0, stagger: 0.03, duration: 0.3 }, 0)
          .fromTo(
            i,
            { xPercent: 15, autoAlpha: 0 },
            { xPercent: 0, autoAlpha: 1, stagger: 0.03, duration: 0.4, clearProps: "xPercent" },
            "<+=0.1",
          )
          .add(() => {
            (r.forEach((t) => {
              t !== e && t.setAttribute("data-tab-status", "not-active");
            }),
              (e.style.position = ""),
              (e.style.top = ""),
              (e.style.left = ""),
              (e.style.width = ""));
          })
          .add(() => {
            (gsap.set(o, { clearProps: "height" }),
              window.lenis && window.lenis.resize(),
              ScrollTrigger.refresh());
          });
      }
      e.querySelector('[data-project-device="nav"]');
      const n = e.querySelectorAll('[data-project-device="button"]'),
        r = e.querySelectorAll('[data-project-device="pane"]'),
        i = e.querySelector('[data-project-device="bg"]');
      if (0 === n.length || 0 === r.length) return;
      const o = r[0].parentElement;
      if (!o) return;
      let s = !1,
        l = 0;
      (n.forEach((e, i) => {
        e.addEventListener("click", () => {
          if (s || i === l) return;
          const o = l;
          l = i;
          const c = r[o],
            d = r[l];
          (n.forEach((e, t) => {
            e.setAttribute("data-button-state", t === i ? "active" : "not-active");
          }),
            t(e),
            a(d, c));
        });
      }),
        n.forEach((e, t) => {
          const a = 0 === t;
          (e.setAttribute("data-button-state", a ? "active" : "not-active"), a && i && e.appendChild(i));
        }),
        r.forEach((e, t) => {
          e.setAttribute("data-tab-status", 0 === t ? "active" : "not-active");
        }));
    });
}
function initImageRatio(e = document) {
  function t() {
    (clearTimeout(n),
      (n = setTimeout(() => {
        lenis && lenis.resize();
      }, 100)));
  }
  const a = e.querySelectorAll("[data-image-ratio-init]");
  if (0 === a.length) return;
  let n;
  a.forEach((e) => {
    function a() {
      if (r.naturalWidth && r.naturalHeight) {
        const a = (r.naturalHeight / r.naturalWidth) * 100;
        a !== o &&
          ((o = a),
          (i.style.paddingTop = a + "%"),
          r.naturalHeight > r.naturalWidth ? e.classList.add("cc-mobile") : e.classList.remove("cc-mobile"),
          t());
      }
    }
    const r = e.querySelector("img"),
      i = e.querySelector("[data-image-ratio-before]");
    if (!r || !i) return;
    let o = null;
    if ((a(), r.addEventListener("load", a), r.complete && 0 === r.naturalWidth)) {
      let e = 0;
      const t = setInterval(() => {
        (e++, (r.naturalWidth > 0 || e > 20) && (a(), clearInterval(t)));
      }, 50);
    }
    window.addDisposable(() => {
      (r.removeEventListener("load", a), clearTimeout(n));
    });
  });
}
function initMagneticEffect(e = document) {
  const t = e.querySelectorAll("[data-magnetic-strength]");
  if (0 === t.length) return;
  const a = gsap.matchMedia();
  (a.add(breakpoints.isDesktop, () => {
    const e = (e, t) => {
        e &&
          (gsap.killTweensOf(e),
          (t ? gsap.set : gsap.to)(e, {
            x: "0em",
            y: "0em",
            rotate: "0deg",
            clearProps: "all",
            ...(!t && { ease: "elastic.out(1, 0.3)", duration: 1.6 }),
          }));
      },
      a = (t) => {
        const a = t.currentTarget;
        (e(a, !0), e(a.querySelector("[data-magnetic-inner-target]"), !0));
      },
      n = (e) => {
        const t = e.currentTarget,
          a = t.getBoundingClientRect(),
          n = parseFloat(t.getAttribute("data-magnetic-strength")) || 25,
          r = t.querySelector("[data-magnetic-inner-target]"),
          i = parseFloat(t.getAttribute("data-magnetic-strength-inner")) || n,
          o = ((e.clientX - a.left) / t.offsetWidth - 0.5) * (n / 16),
          s = ((e.clientY - a.top) / t.offsetHeight - 0.5) * (n / 16);
        if (
          (gsap.to(t, { x: o + "em", y: s + "em", rotate: "0.001deg", ease: "power4.out", duration: 1.6 }), r)
        ) {
          const n = ((e.clientX - a.left) / t.offsetWidth - 0.5) * (i / 16),
            o = ((e.clientY - a.top) / t.offsetHeight - 0.5) * (i / 16);
          gsap.to(r, { x: n + "em", y: o + "em", rotate: "0.001deg", ease: "power4.out", duration: 2 });
        }
      },
      r = (e) => {
        const t = e.currentTarget,
          a = t.querySelector("[data-magnetic-inner-target]");
        (gsap.to(t, { x: "0em", y: "0em", ease: "elastic.out(1, 0.3)", duration: 1.6, clearProps: "all" }),
          a &&
            gsap.to(a, { x: "0em", y: "0em", ease: "elastic.out(1, 0.3)", duration: 2, clearProps: "all" }));
      };
    return (
      t.forEach((e) => {
        (e.addEventListener("mouseenter", a),
          e.addEventListener("mousemove", n),
          e.addEventListener("mouseleave", r));
      }),
      () => {
        t.forEach((e) => {
          (e.removeEventListener("mouseenter", a),
            e.removeEventListener("mousemove", n),
            e.removeEventListener("mouseleave", r),
            gsap.set(e, { clearProps: "all" }));
          const t = e.querySelector("[data-magnetic-inner-target]");
          t && gsap.set(t, { clearProps: "all" });
        });
      }
    );
  }),
    window.addDisposable(() => a.kill()));
}
function initProjectInfo(e = document) {
  const t = e.querySelector("[data-project-info='group']");
  if (!t) return;
  const a = t.parentNode,
    n = t.nextSibling,
    r = gsap.matchMedia();
  (r.add(breakpoints.isTablet, () => {
    document.body.appendChild(t);
    const e = t.querySelector("[data-project-info='toggle']"),
      r = document.querySelectorAll("[data-project-info='close']"),
      i = () => {
        (t.setAttribute("data-project-state", "open"), lenis && lenis.stop());
      },
      o = () => {
        (t.setAttribute("data-project-state", "closed"), lenis && lenis.start());
      },
      s = () => {
        "open" === t.getAttribute("data-project-state") ? o() : i();
      };
    return (
      e && e.addEventListener("click", s),
      r.forEach((e) => {
        e.addEventListener("click", o);
      }),
      () => {
        (e && e.removeEventListener("click", s),
          r.forEach((e) => e.removeEventListener("click", o)),
          t.parentNode === document.body && a && a.insertBefore(t, n));
      }
    );
  }),
    window.addDisposable(() => {
      (t.parentNode === document.body && a && a.insertBefore(t, n), r.kill());
    }));
}
function initCycle(e = document) {
  const t = e.querySelectorAll('[data-cycle="group"]');
  0 !== t.length &&
    t.forEach((e) => {
      function t() {
        o &&
          (n = setTimeout(() => {
            if (!o) return;
            const e = a[i],
              n = (i + 1) % a.length,
              s = a[n];
            (e.setAttribute("data-cycle-state", "leaving"),
              s.setAttribute("data-cycle-state", "active"),
              (r = setTimeout(() => {
                o && e.setAttribute("data-cycle-state", "inactive");
              }, 600)),
              (i = n),
              t());
          }, 5e3));
      }
      const a = e.querySelectorAll('[data-cycle="item"]');
      if (0 === a.length) return;
      let n,
        r,
        i = 0,
        o = !0;
      (a.forEach((e, t) => {
        e.setAttribute("data-cycle-state", 0 === t ? "active" : "inactive");
      }),
        t(),
        window.addDisposable(() => {
          ((o = !1), clearTimeout(n), clearTimeout(r));
        }));
    });
}
function initPricingToggle(e = document) {
  const t = $$('[data-offer="card"]', e);
  0 !== t.length &&
    t.forEach((e) => {
      function t(e, t = !1) {
        const a = String(e),
          r = n.length - a.length;
        n.forEach((e, n) => {
          if (n < r) e.setAttribute("data-pricing-status", "inactive");
          else {
            e.setAttribute("data-pricing-status", "active");
            const i = a[n - r],
              o = parseInt(i, 10);
            t
              ? gsap.set(e, { yPercent: -10 * o })
              : gsap.to(e, { yPercent: -10 * o, duration: durations.l, ease: easings.elastic });
          }
        });
      }
      const a = $('[data-offer="toggle"]', e),
        n = $$('[data-pricing="col"]', e),
        r = String(e.dataset.pricingBase || "0"),
        i = String(e.dataset.pricingPlus || "0");
      // ULYCOM : le bouton bascule même sans compteur de prix dans la carte
      if (!a) return;
      const o = () => {
        const e = "active" === a.getAttribute("data-offer-status") ? "inactive" : "active";
        a.setAttribute("data-offer-status", e);
        t("active" === e ? i : r);
      };
      a.addEventListener("click", o);
      (t("active" === (a.getAttribute("data-offer-status") || "inactive") ? i : r, !0),
        window.addDisposable(() => {
          (a.removeEventListener("click", o), gsap.killTweensOf(n));
        }));
    });
}
function initFilter(e = document) {
  const t = $$('[data-filter="group"]', e);
  0 !== t.length &&
    t.forEach((e) => {
      function t(t) {
        const a = r.filter((e) => {
          const a = e.getAttribute("data-filter-category");
          return "All" === t || a === t;
        });
        (a.forEach((e, t) => {
          e.style.setProperty("--index", t);
        }),
          e.style.setProperty("--length", a.length));
      }
      function a(a) {
        o ||
          ((o = !0),
          r.forEach((e) => {
            "active" === e.getAttribute("data-filter-status") &&
              e.setAttribute("data-filter-status", "leaving");
          }),
          (i = setTimeout(() => {
            (r.forEach((e) => {
              const t = e.getAttribute("data-filter-category");
              "All" === a || t === a || e.setAttribute("data-filter-status", "inactive");
            }),
              t(a),
              e.offsetHeight,
              r.forEach((e) => {
                const t = e.getAttribute("data-filter-category");
                ("All" === a || t === a) && e.setAttribute("data-filter-status", "active");
              }),
              (o = !1),
              lenis && lenis.resize(),
              ScrollTrigger.refresh());
          }, 450)));
      }
      const n = $$('[data-filter="button"]', e),
        r = $$('[data-filter="item"]', e);
      if (0 === n.length || 0 === r.length) return;
      let i,
        o = !1;
      const s = (e) => {
          const t = e.target.closest('[data-filter="button"]');
          if (!t || "active" === t.getAttribute("data-filter-status")) return;
          (n.forEach((e) => e.setAttribute("data-filter-status", "inactive")),
            t.setAttribute("data-filter-status", "active"));
          a(t.getAttribute("data-filter-category"));
        },
        l = n.find((e) => "All" === e.getAttribute("data-filter-category")) || n[0];
      (n.forEach((e) => e.setAttribute("data-filter-status", "inactive")),
        l.setAttribute("data-filter-status", "active"),
        r.forEach((e) => e.setAttribute("data-filter-status", "active")),
        t("All"),
        e.addEventListener("click", s),
        window.addDisposable(() => {
          (clearTimeout(i), e.removeEventListener("click", s));
        }));
    });
}
function updateBodyTheme(e) {
  if (!e?.next?.html) return;
  const t = new DOMParser().parseFromString(e.next.html, "text/html").body;
  (document.body.classList.remove("u-mode-invert", "u-mode-base"),
    t.classList.contains("u-mode-invert")
      ? document.body.classList.add("u-mode-invert")
      : t.classList.contains("u-mode-base") && document.body.classList.add("u-mode-base"));
}
function initPreloaderAnimation() {
  const e = $(".preload_wrap");
  if (!e) return null;
  gsap.set(".transition", { autoAlpha: 0 });
  const t = $(".preload_square_wrap", e),
    a = $(".preload_content", e),
    n = $(".mask_logo", e),
    r = $(".preload_logo", e),
    i = $$(".preload_number_col", e),
    o = $$("[data-scramble]", e),
    s = $("[data-preload-move]"),
    l = $(".preload_bg_grid", e),
    c = $(".preload_bg_grey", e),
    d = {
      "is-1": { yPercent: -10, duration: 1, start: 1.5 },
      "is-2": { yPercent: -50, duration: 2, start: 0.5 },
      "is-3": { yPercent: -50, duration: 2.5, start: 0.5 },
    },
    u = "opacity, filter, transform",
    p = document.querySelectorAll('[data-load-heading="children"]'),
    f = document.querySelectorAll('[data-load-heading]:not([data-load-heading="children"])'),
    g = document.querySelectorAll("[data-load-sub]"),
    h = document.querySelectorAll("[data-load-tag]"),
    m = document.querySelectorAll("[data-load-fade]");
  let w = null,
    y = null,
    b = [];
  (p.length &&
    (p.forEach((e) => {
      const t = Array.from(e.children);
      b.push(...t);
    }),
    gsap.set(b, { opacity: 0, filter: "blur(10px)", yPercent: 20, willChange: u })),
    f.length &&
      ((w = new SplitText(f, { type: "lines, words", linesClass: "text-line" })),
      gsap.set(w.words, { opacity: 0, filter: "blur(10px)", yPercent: 20, willChange: u }),
      window.addDisposable(() => {
        w && w.revert();
      })),
    g.length &&
      ((y = new SplitText(g, { type: "lines", linesClass: "text-line" })),
      gsap.set(y.lines, { opacity: 0, filter: "blur(10px)", yPercent: 60, willChange: u }),
      window.addDisposable(() => {
        y && y.revert();
      })),
    h.length && gsap.set(h, { opacity: 0, filter: "blur(10px)", yPercent: 60, willChange: u }),
    gsap.set(e, { display: "flex", autoAlpha: 1 }),
    lenis && lenis.stop(),
    initScrambleText(e));
  const v = gsap.timeline({
    onComplete: () => {
      (e.classList.add("preload-ended"),
        gsap.set(e, { display: "none" }),
        document.body.classList.add("body-ready"));
    },
  });
  (o.length && v.set(o, { autoAlpha: 1 }, 0),
    c && v.fromTo(c, { opacity: 1 }, { opacity: 0, duration: 2, ease: "power3.out" }, 0),
    l &&
      v.fromTo(l, { scale: 1.5, opacity: 0.2 }, { scale: 1, opacity: 0, duration: 3, ease: "expo.out" }, 0),
    t && v.fromTo(t, { scale: 2 }, { scale: 1, duration: 3, ease: "expo.out" }, 0),
    r && v.fromTo(r, { y: "20vw" }, { y: 0, duration: 1, ease: "expo.inOut" }, 0),
    n &&
      v.fromTo(
        n,
        { css: { maskPosition: "500px 0px" } },
        { css: { maskPosition: "1000px 0px" }, duration: 2.5, ease: "expo.inOut" },
        0.5,
      ),
    i.forEach((e) => {
      const t = Object.keys(d).find((t) => e.classList.contains(t));
      if (!t) return;
      const a = d[t];
      v.fromTo(
        e,
        { yPercent: 0 },
        { yPercent: a.yPercent, duration: a.duration, ease: "expo.inOut" },
        a.start,
      );
    }),
    v.call(
      () => {
        o.forEach((e) => {
          e._scrambleTl && e._scrambleTl.play();
        });
      },
      null,
      0.75,
    ),
    v.fromTo(e, { y: 0 }, { y: "-100vh", duration: 2, ease: "expo.inOut" }, 2.5),
    a && v.fromTo(a, { y: 0 }, { y: "75vh", duration: 2, ease: "expo.inOut" }, 2.5),
    s && v.fromTo(s, { y: "33vh" }, { y: 0, duration: 2, ease: "expo.inOut" }, 2.5));
  const A = $(".header");
  A && v.fromTo(A, { y: "-100%" }, { y: 0, duration: 1.5, ease: "expo.out" }, 3.5);
  const S = 3.5,
    E = 3.75,
    x = $$('[data-scramble="after"]');
  (x.length &&
    (x.forEach((e) => {
      e.dataset.scramblePlay = "manual";
    }),
    initScrambleText(document),
    v.call(
      () => {
        x.forEach((e) => {
          e._scrambleTl && e._scrambleTl.play();
        });
      },
      null,
      S,
    )),
    b.length &&
      v.to(
        b,
        {
          opacity: 1,
          filter: "blur(0px)",
          yPercent: 0,
          duration: durations.xl,
          ease: easings.smooth,
          stagger: durations.stagger,
          onComplete: () => {
            gsap.set(b, { willChange: "auto" });
          },
        },
        E,
      ),
    w &&
      v.to(
        w.words,
        {
          opacity: 1,
          filter: "blur(0px)",
          yPercent: 0,
          duration: durations.xl,
          ease: easings.smooth,
          stagger: durations.stagger,
          onComplete: () => {
            gsap.set(w.words, { willChange: "auto" });
          },
        },
        E,
      ));
  const _ = b.length || w ? E + 0.4 : E;
  return (
    y &&
      v.to(
        y.lines,
        {
          opacity: 1,
          filter: "blur(0px)",
          yPercent: 0,
          duration: 1.2,
          ease: "expo.out",
          stagger: 0.05,
          onComplete: () => {
            gsap.set(y.lines, { willChange: "auto" });
          },
        },
        _,
      ),
    h.length &&
      v.to(
        h,
        {
          opacity: 1,
          filter: "blur(0px)",
          yPercent: 0,
          duration: 1.2,
          ease: "expo.out",
          stagger: 0.05,
          onComplete: () => {
            gsap.set(h, { willChange: "auto" });
          },
        },
        _,
      ),
    m.length && v.from(m, { y: "2em", duration: 1.2, ease: "expo.out", stagger: 0.05 }, E),
    v.call(
      () => {
        lenis && lenis.start();
      },
      null,
      E + 0.5,
    ),
    v
  );
}
function runPageOnceAnimation() {
  if (initPreloaderAnimation()) return;
  const e = gsap.timeline();
  (e.call(
    () => {
      lenis && lenis.stop();
    },
    null,
    0,
  ),
    e.set("main", { height: "100vh", overflow: "clip" }),
    e.set(".header", { autoAlpha: 1 }),
    e.from(".header", { yPercent: -125, ease: "expo.out", duration: 1 }, 0.25),
    e.call(
      () => {
        runPageEnterAnimation();
      },
      null,
      0.25,
    ));
}
function runPageLeaveAnimation(e) {
  const t = gsap.timeline({
    onStart: () => {
      window.closeMenu && window.closeMenu();
    },
    onComplete: () => {
      e.remove();
    },
  });
  return (t.to(".transition", { autoAlpha: 1, duration: 0.5, ease: "power1.inOut" }, "<"), t.then());
}
function runPageEnterAnimation(e) {
  e = e || document;
  let t = null,
    a = null;
  const n = e.querySelectorAll('[data-load-heading="children"]'),
    r = e.querySelectorAll('[data-load-heading]:not([data-load-heading="children"])'),
    i = e.querySelectorAll("[data-load-sub]"),
    o = e.querySelectorAll("[data-load-tag]"),
    s = e.querySelectorAll("[data-load-fade]"),
    l = e.querySelectorAll('[data-scramble="after"]'),
    c = "opacity, filter, transform";
  let d = [];
  (n.length &&
    (n.forEach((e) => {
      const t = Array.from(e.children);
      d.push(...t);
    }),
    gsap.set(d, { opacity: 0, filter: "blur(10px)", yPercent: 20, willChange: c })),
    r.length &&
      ((t = new SplitText(r, { type: "lines, words", linesClass: "text-line" })),
      gsap.set(t.words, { opacity: 0, filter: "blur(10px)", yPercent: 20, willChange: c }),
      window.addDisposable(() => {
        t && t.revert();
      })),
    i.length &&
      ((a = new SplitText(i, { type: "lines", linesClass: "text-line" })),
      gsap.set(a.lines, { opacity: 0, filter: "blur(10px)", yPercent: 60, willChange: c }),
      window.addDisposable(() => {
        a && a.revert();
      })),
    o.length && gsap.set(o, { opacity: 0, filter: "blur(10px)", yPercent: 60, willChange: c }),
    l.length &&
      (l.forEach((e) => {
        e.dataset.scramblePlay = "manual";
      }),
      initScrambleText(e)));
  const u = gsap.timeline({
    defaults: { duration: durations.xl, ease: easings.smooth, stagger: durations.stagger },
    onStart: () => {
      (gsap.set("main", { height: "100vh", overflow: "clip" }), lenis && lenis.stop());
    },
  });
  (u.fromTo(
    ".transition",
    { autoAlpha: 1 },
    {
      autoAlpha: 0,
      duration: 0.5,
      ease: "power1.inOut",
      overwrite: !0,
      onStart: () => {
        (gsap.set("main", { clearProps: "all" }),
          lenis && (lenis.resize(), lenis.start()),
          ScrollTrigger.refresh());
      },
    },
    0.3,
  ),
    l.length &&
      u.call(
        () => {
          l.forEach((e) => {
            e._scrambleTl && e._scrambleTl.play();
          });
        },
        null,
        0.4,
      ),
    d.length &&
      u.to(
        d,
        {
          opacity: 1,
          filter: "blur(0px)",
          yPercent: 0,
          delay: 0.1,
          onComplete: () => {
            gsap.set(d, { willChange: "auto" });
          },
        },
        "<",
      ),
    t &&
      u.to(
        t.words,
        {
          opacity: 1,
          filter: "blur(0px)",
          yPercent: 0,
          delay: 0.1,
          onComplete: () => {
            gsap.set(t.words, { willChange: "auto" });
          },
        },
        "<",
      ));
  const p = d.length || t ? "-=0.8" : "<";
  return (
    i.length &&
      u.to(
        a.lines,
        {
          opacity: 1,
          filter: "blur(0px)",
          yPercent: 0,
          onComplete: () => {
            gsap.set(a.lines, { willChange: "auto" });
          },
        },
        p,
      ),
    o.length &&
      u.to(
        o,
        {
          opacity: 1,
          filter: "blur(0px)",
          yPercent: 0,
          onComplete: () => {
            gsap.set(o, { willChange: "auto" });
          },
        },
        p,
      ),
    s.length && u.from(s, { y: "2em" }, "<"),
    u.call(
      () => {
        document.body.classList.add("body-ready");
      },
      null,
      0.5,
    ),
    u.then()
  );
}
function initBarbaNavUpdate(e) {
  if (!e || !e.next || !e.next.container) return;
  const t = e.next.container.querySelectorAll("nav a[href], [data-barba-update]"),
    a = $$("nav a[href], [data-barba-update]");
  if (!a.length || !t.length) return;
  const n = new Map();
  (Array.from(t).forEach((e) => {
    const t = e.getAttribute("href");
    t && n.set(t, e);
  }),
    a.forEach((e) => {
      const t = e.getAttribute("href");
      if (!t) return;
      const a = n.get(t);
      if (a) {
        const t = a.getAttribute("aria-current");
        null !== t ? e.setAttribute("aria-current", t) : e.removeAttribute("aria-current");
        a.classList.contains("w--current") ? e.classList.add("w--current") : e.classList.remove("w--current");
      }
    }));
}
function initDotCanvas() {
  function e() {
    c || ((c = !0), n());
  }
  function t() {
    c && ((c = !1), cancelAnimationFrame(o));
  }
  function a() {
    i.some((e) => e.isVisible) ? e() : t();
  }
  function n() {
    if (!c) return;
    o = requestAnimationFrame(n);
    const e = Date.now();
    i.forEach((t) => {
      const {
        ctx: a,
        canvas: n,
        pixels: r,
        color: i,
        hasAppearAnimation: o,
        hasAppeared: s,
        appearStartTime: l,
        dotSize: c,
      } = t;
      if (!t.isVisible) return;
      a.clearRect(0, 0, n.width, n.height);
      const d = {};
      (r.forEach((t) => {
        ((t.opacity += t.speed * t.direction),
          t.opacity > 1
            ? ((t.opacity = 1), (t.direction = -1))
            : t.opacity < 0 && ((t.opacity = 0), (t.direction = 1)));
        let a = t.opacity;
        if (o && l) {
          const n = e - l,
            r = Math.min((n - t.appearDelay) / 300, 1);
          ((t.appearOpacity = Math.max(0, r)), (a = t.opacity * t.appearOpacity));
        } else o && !s && (a = 0);
        const n = Math.round(100 * a);
        (d[n] || (d[n] = { opacity: a, positions: [] }), d[n].positions.push({ x: t.x, y: t.y }));
      }),
        (a.fillStyle = i),
        Object.values(d).forEach(({ opacity: e, positions: t }) => {
          e <= 0 ||
            ((a.globalAlpha = e),
            t.forEach(({ x: e, y: t }) => {
              a.fillRect(e, t, c, c);
            }));
        }));
    });
  }
  const r = document.querySelectorAll("canvas[data-dot-canvas]");
  if (!r.length) return;
  const i = [];
  let o;
  const s = 1,
    l = 2;
  r.forEach((e) => {
    function t() {
      const t = window.devicePixelRatio || 1,
        a = e.getBoundingClientRect();
      ((e.width = a.width * t),
        (e.height = a.height * t),
        (o.dotSize = Math.max(1, Math.round(s * t))),
        (o.gap = Math.max(1, Math.round(l * t))));
      const n = o.dotSize + o.gap;
      o.pixels = [];
      const r = Math.sqrt(e.width * e.width + e.height * e.height);
      for (let t = 0; t < e.width; t += n)
        for (let a = 0; a < e.height; a += n) {
          const n = e.width - t,
            i = e.height - a,
            s = Math.sqrt(n * n + i * i) / r;
          o.pixels.push({
            x: t,
            y: a,
            opacity: Math.random(),
            speed: 0.02 * Math.random() + 0.005,
            direction: Math.random() < 0.5 ? 1 : -1,
            appearDelay: 1200 * s,
            appearOpacity: 0,
          });
        }
    }
    const a = e.getContext("2d", { alpha: !0 });
    if (!a) return;
    const n = e.dataset.dotColor || "#ffffff",
      r = "true" === e.dataset.appearAnimation,
      o = {
        canvas: e,
        ctx: a,
        color: n,
        hasAppearAnimation: r,
        hasAppeared: !r,
        appearStartTime: null,
        pixels: [],
        isVisible: !1,
        resizeObserver: null,
        dotSize: 0,
        gap: 0,
      };
    ((o.resizeObserver = new ResizeObserver(() => {
      t();
    })),
      o.resizeObserver.observe(e),
      t());
    const c = e.getBoundingClientRect(),
      d = c.top < window.innerHeight && c.bottom > 0;
    ((o.isVisible = d), d && r && ((o.hasAppeared = !0), (o.appearStartTime = Date.now())), i.push(o));
  });
  let c = !1;
  const d = new IntersectionObserver(
      (e) => {
        (e.forEach((e) => {
          const t = i.find((t) => t.canvas === e.target);
          t && (t.isVisible = e.isIntersecting);
        }),
          a());
      },
      { rootMargin: "50px", threshold: 0 },
    ),
    u = new IntersectionObserver(
      (e) => {
        e.forEach((e) => {
          const t = i.find((t) => t.canvas === e.target);
          t &&
            !t.hasAppeared &&
            e.isIntersecting &&
            ((t.hasAppeared = !0), (t.appearStartTime = Date.now()), u.unobserve(e.target));
        });
      },
      { rootMargin: "0px", threshold: 0.1 },
    );
  (i.forEach(({ canvas: e, hasAppearAnimation: t }) => {
    (d.observe(e), t && u.observe(e));
  }),
    a(),
    window.addDisposable(() => {
      (t(), d.disconnect(), u.disconnect(), i.forEach(({ resizeObserver: e }) => e.disconnect()));
    }));
}
function initCleanLink(e = document) {
  const t = $$("[data-clean-link]", e);
  0 !== t.length &&
    t.forEach((e) => {
      const t = e.textContent
        .trim()
        .replace(/^https?:\/\//, "")
        .replace(/^www\./, "")
        .replace(/[?#].*$/, "");
      e.textContent = t;
    });
}
function initCalEmbed(e = document) {
  const t = e.querySelector("#my-cal-inline");
  if (!t) return;
  if (t.querySelector("iframe")) return;
  // ULYCOM : identifiant Cal.com défini dans src/data/site.json (calLink) ; vide = pas de calendrier
  const calLink = (window.SITE && window.SITE.calLink) || "";
  if (!calLink) return;
  const a = "discovery-call";
  (window.Cal ||
    (function (e, t, a) {
      let n = function (e, t) {
          e.q.push(t);
        },
        r = e.document;
      e.Cal = function () {
        let i = e.Cal,
          o = arguments;
        if (
          (i.loaded ||
            ((i.ns = {}),
            (i.q = i.q || []),
            (r.head.appendChild(r.createElement("script")).src = t),
            (i.loaded = !0)),
          o[0] === a)
        ) {
          const e = function () {
              n(e, arguments);
            },
            t = o[1];
          return (
            (e.q = e.q || []),
            void ("string" == typeof t
              ? ((i.ns[t] = i.ns[t] || e), n(i.ns[t], o), n(i, ["initNamespace", t]))
              : n(i, o))
          );
        }
        n(i, o);
      };
    })(window, "https://app.cal.com/embed/embed.js", "init"),
    window.Cal.ns && window.Cal.ns[a] && delete window.Cal.ns[a],
    Cal("init", a, { origin: "https://cal.com" }),
    Cal.ns[a]("inline", {
      elementOrSelector: "#my-cal-inline",
      config: { layout: "month_view", theme: "auto" },
      calLink: calLink,
    }),
    Cal.ns[a]("ui", {
      cssVarsPerTheme: { light: { "cal-brand": "#1f1f1f" }, dark: { "cal-brand": "#ffffff" } },
      hideEventTypeDetails: !1,
      layout: "month_view",
    }),
    window.addDisposable(() => {
      (t && (t.innerHTML = ""), window.Cal && window.Cal.ns && window.Cal.ns[a] && delete window.Cal.ns[a]);
    }));
}
// ---------------------------------------------------------------------------
// ULYCOM : fond animé de la section d'appel à l'action.
// Shader « Wave Gradient » (WebGL2) avec les réglages de la section de référence :
// trois couleurs (bleu clair, bleu, bleu), seed 11, vitesse 1.4, angle 105°.
// ---------------------------------------------------------------------------
const WAVE_GRADIENT = {
  colors: [
    [204 / 255, 230 / 255, 1, 0.9],
    [1 / 255, 113 / 255, 227 / 255, 1],
    [1 / 255, 113 / 255, 227 / 255, 1],
  ],
  seed: 11,
  waveSpeed: 1.4,
  waveFreqX: 0.9,
  waveFreqY: 6,
  waveAngle: 105,
  waveAmplitude: 1.6,
  maskSoftness: 1.4,
  blendAmount: 0.5,
  resolutionScale: 0.5, // le dégradé est flou par nature : demi-résolution, bien plus léger
};
const WAVE_VERTEX = `#version 300 es
precision highp float;
in vec2 a_position;
in vec2 a_texCoord;
out vec2 v_uv;
void main() {
    v_uv = a_texCoord;
    gl_Position = vec4(a_position, 0.0, 1.0);
}`;
const WAVE_FRAGMENT = `#version 300 es
precision highp float;
in vec2 v_uv;
out vec4 fragColor;
uniform float u_time;
uniform vec2 u_resolution;
uniform float u_seed;
uniform float u_waveSpeed;
uniform float u_waveFreqX;
uniform float u_waveFreqY;
uniform float u_waveAngle;
uniform float u_waveAmplitude;
uniform float u_maskSoftness;
uniform float u_blendAmount;
uniform vec4 u_colors[4];
uniform int u_colors_length;

#define S(a,b,t) smoothstep(a,b,t)

mat2 Rot(float a) {
    float s = sin(a), c = cos(a);
    return mat2(c, -s, s, c);
}

vec2 hash(vec2 p) {
    float s = u_seed;
    vec2 k1 = vec2(2127.1 + s * 13.37, 81.17 + s * 7.31);
    vec2 k2 = vec2(1269.5 + s * 11.13, 283.37 + s * 5.79);
    p = vec2(dot(p, k1), dot(p, k2));
    return fract(sin(p) * (43758.5453 + s * 1.618));
}

float noise(in vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    float n = mix(
        mix(dot(-1.0 + 2.0 * hash(i), f),
            dot(-1.0 + 2.0 * hash(i + vec2(1.0, 0.0)), f - vec2(1.0, 0.0)), u.x),
        mix(dot(-1.0 + 2.0 * hash(i + vec2(0.0, 1.0)), f - vec2(0.0, 1.0)),
            dot(-1.0 + 2.0 * hash(i + vec2(1.0, 1.0)), f - vec2(1.0, 1.0)), u.x),
        u.y
    );
    return 0.5 + 0.5 * n;
}

vec3 getColor(int idx) {
    if (u_colors_length < 1) return vec3(0.0);
    int safeIdx = clamp(idx, 0, u_colors_length - 1);
    return u_colors[safeIdx].rgb;
}

float seedF(float base) {
    return base * (1.0 + 0.5 * sin(u_seed * 3.17 + base));
}

vec2 warpUV(vec2 uv) {
    float t = u_time * u_waveSpeed;

    float angleOffset = sin(u_seed * 2.73) * 30.0;
    mat2 dirRot = Rot(radians(u_waveAngle + angleOffset));
    vec2 ruv = dirRot * uv;

    float fxMod = seedF(u_waveFreqX);
    float fyMod = seedF(u_waveFreqY);

    float phaseX = fract(sin(u_seed * 7.19) * 437.58) * 6.2832;
    float phaseY = fract(cos(u_seed * 3.41) * 291.37) * 6.2832;

    float harmonic = sin(u_seed * 1.23) * 0.5;
    float a = fyMod * ruv.y - sin(ruv.x * fxMod + ruv.y - t + phaseX);
    a += harmonic * sin(ruv.x * fxMod * 2.0 + ruv.y * 0.5 + t * 0.7 + phaseY);

    a = smoothstep(
        cos(a) * u_maskSoftness,
        sin(a) * u_maskSoftness + 3.,
        cos(a - fyMod * ruv.y) - sin(a - fxMod * ruv.x)
    );

    a *= u_waveAmplitude;

    uv = cos(a) * uv + sin(a) * vec2(-uv.y, uv.x);
    return uv;
}

void main() {
    vec2 fragCoord = v_uv * u_resolution;
    vec2 uv = fragCoord / u_resolution.xy;
    float ratio = u_resolution.x / u_resolution.y;
    float t = u_time * u_waveSpeed;

    vec2 tuv = uv - 0.5;

    vec2 seedShift = vec2(sin(u_seed * 4.37), cos(u_seed * 5.91)) * 100.0;
    float degree = noise(vec2(t * 0.1, tuv.x * tuv.y) + seedShift);
    tuv.y *= 1.0 / ratio;
    tuv *= Rot(radians((degree - 0.5) * 720.0 + 180.0));
    tuv.y *= ratio;

    vec2 uv2 = (fragCoord * 2.0 - u_resolution.xy) / (u_resolution.x + u_resolution.y) * 2.0;
    float preRotAngle = fract(sin(u_seed * 5.63) * 173.29) * 6.2832;
    uv2 *= Rot(preRotAngle);
    vec2 warped = warpUV(uv2) * 0.5 + 0.5;

    vec2 blendUV = mix(tuv, warped - 0.5, u_blendAmount);

    float layerRot1 = -5.0 + sin(u_seed * 1.83) * 20.0;
    float layerRot2 = 10.0 + cos(u_seed * 2.47) * 20.0;

    vec3 c0 = getColor(0);
    vec3 c1 = getColor(1);
    vec3 c2 = getColor(2);
    vec3 c3 = getColor(3);

    vec3 layer1 = mix(c0, c2, S(-0.3, 0.3, (blendUV * Rot(radians(layerRot1))).x));
    vec3 layer2 = mix(c3, c1, S(-0.3, 0.3, (blendUV * Rot(radians(layerRot2))).x));
    vec3 col = mix(layer1, layer2, S(0.3, -0.3, blendUV.y));

    col = mix(col, col * col + 0.5 * sqrt(col), 0.3);

    fragColor = vec4(col, 1.0);
}`;
function initWaveGradient(scope = document) {
  const canvases = scope.querySelectorAll("canvas[data-wave-gradient]");
  if (0 === canvases.length) return;
  const cfg = WAVE_GRADIENT;
  const reduceMotion = window.matchMedia(breakpoints.reduceMotion).matches;
  canvases.forEach((canvas) => {
    const gl = canvas.getContext("webgl2", { antialias: false, alpha: false, powerPreference: "low-power" });
    if (!gl) return; // le dégradé CSS de .cta_flux reste affiché
    const compile = (type, source) => {
      const shader = gl.createShader(type);
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.warn("[wave-gradient]", gl.getShaderInfoLog(shader));
        return null;
      }
      return shader;
    };
    const vs = compile(gl.VERTEX_SHADER, WAVE_VERTEX);
    const fs = compile(gl.FRAGMENT_SHADER, WAVE_FRAGMENT);
    if (!vs || !fs) return;
    const program = gl.createProgram();
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.warn("[wave-gradient]", gl.getProgramInfoLog(program));
      return;
    }
    gl.useProgram(program);
    const quad = (name, data) => {
      const loc = gl.getAttribLocation(program, name);
      gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);
      gl.enableVertexAttribArray(loc);
      gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    };
    quad("a_position", [-1, -1, 1, -1, -1, 1, 1, 1]);
    quad("a_texCoord", [0, 0, 1, 0, 0, 1, 1, 1]);
    const u = (name) => gl.getUniformLocation(program, name);
    gl.uniform1f(u("u_seed"), cfg.seed);
    gl.uniform1f(u("u_waveSpeed"), cfg.waveSpeed);
    gl.uniform1f(u("u_waveFreqX"), cfg.waveFreqX);
    gl.uniform1f(u("u_waveFreqY"), cfg.waveFreqY);
    gl.uniform1f(u("u_waveAngle"), cfg.waveAngle);
    gl.uniform1f(u("u_waveAmplitude"), cfg.waveAmplitude);
    gl.uniform1f(u("u_maskSoftness"), cfg.maskSoftness);
    gl.uniform1f(u("u_blendAmount"), cfg.blendAmount);
    const colors = new Float32Array(16);
    cfg.colors.forEach((c, i) => colors.set(c, 4 * i));
    gl.uniform4fv(u("u_colors"), colors);
    gl.uniform1i(u("u_colors_length"), cfg.colors.length);
    const uTime = u("u_time"),
      uResolution = u("u_resolution");

    let visible = false,
      rafId = 0,
      elapsed = 0,
      last = 0;
    const resize = () => {
      const scale = Math.min(window.devicePixelRatio || 1, 2) * cfg.resolutionScale;
      const w = Math.max(1, Math.round(canvas.clientWidth * scale)),
        h = Math.max(1, Math.round(canvas.clientHeight * scale));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
      gl.viewport(0, 0, w, h);
      gl.uniform2f(uResolution, w, h);
    };
    const draw = () => {
      gl.uniform1f(uTime, elapsed);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      canvas.dataset.ready = "true";
    };
    const frame = (now) => {
      if (!visible) return;
      elapsed += Math.min((now - last) / 1e3, 0.1);
      last = now;
      draw();
      rafId = requestAnimationFrame(frame);
    };
    const start = () => {
      cancelAnimationFrame(rafId);
      if (reduceMotion) return draw();
      last = performance.now();
      rafId = requestAnimationFrame(frame);
    };
    const ro = new ResizeObserver(() => {
      resize();
      draw();
    });
    ro.observe(canvas);
    resize();
    elapsed = 4; // on démarre dans une phase déjà installée du mouvement
    draw();
    const io = new IntersectionObserver(
      (entries) => {
        visible = entries[0].isIntersecting;
        visible ? start() : cancelAnimationFrame(rafId);
      },
      { rootMargin: "100px" },
    );
    io.observe(canvas);
    window.addDisposable(() => {
      visible = false;
      cancelAnimationFrame(rafId);
      ro.disconnect();
      io.disconnect();
      const lose = gl.getExtension("WEBGL_lose_context");
      lose && lose.loseContext();
    });
  });
}
// ---------------------------------------------------------------------------
// ULYCOM : pied de page révélé au scroll (reprise de good-fella.com).
// Le contenu de la page (z-index 1) glisse vers le haut et découvre le pied de
// page, qui reste immobile dessous : on le décale exactement de la distance qui
// le sépare encore du haut de l'écran. FOOTER_REVEAL.parallax = 1 → immobile ;
// 0.25 → légère remontée, comme sur la référence.
// ---------------------------------------------------------------------------
const FOOTER_REVEAL = { parallax: 1 };
const ASCII_CHARS = "ULYCOMulycom01{}[]<>/\\|=+*#%&$@?!;:,.~^_-()".split("");

/** Champ de densité des deux formes ASCII : deux bras qui se tendent l'un vers l'autre,
 *  clin d'œil à la collaboration (et aux mains en ASCII de la référence). */
function asciiDensity(side, u, v, t) {
  // u : 0 au bord extérieur → 1 au centre de l'écran ; v : 0 en haut → 1 en bas du canvas
  const left = side === "left";
  const tip = left ? 0.8 : 0.78; // le copyright reste lisible entre les deux mains
  if (u > tip) return 0;
  const k = u / tip;
  const sway = Math.sin(t * 0.5 + (left ? 0 : 2.1)) * 0.012 * k; // respiration lente
  const center = (left ? 0.2 + 0.24 * Math.pow(k, 1.25) : 0.3 + 0.14 * Math.pow(k, 1.6)) + sway;
  const forearm = 0.085 * (1 - 0.45 * k);
  const hand = 0.06 * Math.exp(-Math.pow((k - 0.8) / 0.075, 2));
  const finger = k > 0.86 ? -0.045 * ((k - 0.86) / 0.14) : 0;
  const thickness = Math.max(0.018, forearm + hand + finger);
  const d = Math.abs(v - center) / thickness;
  let dens = d < 1 ? 1 - Math.pow(d, 3) : 0;
  // pouce, sous la main
  const thumbC = center + 0.07 + (k - 0.72) * 0.35;
  const thumbT = k > 0.7 && k < 0.86 ? 0.022 : 0;
  if (thumbT) {
    const d2 = Math.abs(v - thumbC) / thumbT;
    if (d2 < 1) dens = Math.max(dens, 1 - d2 * d2);
  }
  // le bras se dissout vers le bord extérieur
  return dens * Math.min(1, 0.35 + k * 1.4);
}

function initFooterReveal(scope = document) {
  const footer = scope.querySelector("[data-footer-reveal]");
  if (!footer) return;
  const prev = footer.previousElementSibling;
  const letters = footer.querySelectorAll("[data-footer-word] span");
  const word = footer.querySelector("[data-footer-word]");

  // 1. Mot géant ajusté à la largeur disponible
  const fitWord = () => {
    if (!word) return;
    word.style.fontSize = "";
    const avail = word.parentElement.clientWidth;
    const natural = word.scrollWidth;
    if (natural > 0) word.style.fontSize = (parseFloat(getComputedStyle(word).fontSize) * avail) / natural + "px";
  };
  fitWord();
  const ro = new ResizeObserver(fitWord);
  ro.observe(footer);
  // Les images chargées en différé changent la hauteur de la page après coup :
  // on recalcule alors les positions, sinon la révélation se décale.
  let lastH = 0,
    refreshTimer = 0;
  const pageRo = new ResizeObserver(() => {
    const h = footer.parentElement.offsetHeight;
    if (Math.abs(h - lastH) < 2) return;
    lastH = h;
    clearTimeout(refreshTimer);
    refreshTimer = setTimeout(() => {
      window.lenis && window.lenis.resize();
      ScrollTrigger.refresh();
    }, 150);
  });
  pageRo.observe(footer.parentElement);
  // Pendant le préchargement, .main-content est décalé de 33vh : les positions
  // mesurées à ce moment sont fausses. On les recalcule une fois la page prête.
  const readyMo = new MutationObserver(() => {
    if (!document.body.classList.contains("body-ready")) return;
    readyMo.disconnect();
    setTimeout(() => ScrollTrigger.refresh(), 50);
  });
  document.body.classList.contains("body-ready")
    ? setTimeout(() => ScrollTrigger.refresh(), 50)
    : readyMo.observe(document.body, { attributes: true, attributeFilter: ["class"] });

  // 2. Révélation : le pied de page reste immobile pendant que la page se lève
  const tl = gsap.timeline({ defaults: { ease: "none" } });
  tl.fromTo(footer, { y: () => -window.innerHeight * FOOTER_REVEAL.parallax }, { y: 0, duration: 1 }, 0);
  if (letters.length)
    tl.fromTo(letters, { yPercent: 100 }, { yPercent: 0, duration: 0.45, stagger: 0.07, ease: "power2.out" }, 0.25);
  const st = ScrollTrigger.create({
    trigger: prev || footer,
    start: prev ? "bottom bottom" : "top bottom",
    end: prev ? "bottom top" : "top top",
    scrub: true,
    animation: tl,
    invalidateOnRefresh: true,
    onUpdate: (self) => document.body.toggleAttribute("data-footer-open", self.progress > 0.9),
  });

  // 3. Bouton « haut de page »
  const topBtn = footer.querySelector("[data-footer-top]");
  const goTop = () => (window.lenis ? window.lenis.scrollTo(0, { duration: 1.6 }) : window.scrollTo({ top: 0, behavior: "smooth" }));
  topBtn && topBtn.addEventListener("click", goTop);

  // 4. Formes en ASCII : caractères qui scintillent, s'illuminent sous le curseur
  const reduceMotion = window.matchMedia(breakpoints.reduceMotion).matches;
  const pointer = { x: -1e4, y: -1e4 };
  const onMove = (e) => {
    pointer.x = e.clientX;
    pointer.y = e.clientY;
  };
  footer.addEventListener("pointermove", onMove);
  footer.addEventListener("pointerleave", () => {
    pointer.x = pointer.y = -1e4;
  });
  const fields = [...footer.querySelectorAll("canvas[data-ascii-hand]")].map((canvas) => {
    const ctx = canvas.getContext("2d");
    const side = canvas.dataset.asciiHand;
    const f = { canvas, ctx, side, cols: 0, rows: 0, cw: 0, ch: 0, seeds: null, dpr: 1 };
    f.resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = canvas.clientWidth,
        h = canvas.clientHeight;
      canvas.width = Math.max(1, Math.round(w * dpr));
      canvas.height = Math.max(1, Math.round(h * dpr));
      f.dpr = dpr;
      f.cw = 7.6;
      f.ch = 12;
      f.cols = Math.ceil(w / f.cw);
      f.rows = Math.ceil(h / f.ch);
      f.seeds = new Float32Array(f.cols * f.rows).map(() => Math.random());
    };
    f.resize();
    return f;
  });
  const drawField = (f, t) => {
    const { ctx, canvas, cols, rows, cw, ch, seeds, side, dpr } = f;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.font = '500 11px Geistmono, ui-monospace, monospace';
    ctx.textBaseline = "top";
    const rect = canvas.getBoundingClientRect();
    const px = pointer.x - rect.left,
      py = pointer.y - rect.top;
    const tick = Math.floor(t * 9);
    for (let r = 0; r < rows; r++) {
      const v = r / rows;
      for (let c = 0; c < cols; c++) {
        const u = side === "left" ? c / cols : 1 - c / cols;
        const dens = asciiDensity(side, u, v, t);
        if (dens <= 0) continue;
        const i = r * cols + c;
        const s = seeds[i];
        if (s > 0.12 + dens * 0.95) continue; // tramage : plein au cœur, clairsemé sur les bords
        const x = c * cw,
          y = r * ch;
        const dx = x - px,
          dy = y - py;
        const near = Math.max(0, 1 - Math.sqrt(dx * dx + dy * dy) / 110);
        const flicker = 0.55 + 0.45 * Math.sin(t * 2.2 + s * 40);
        const alpha = Math.min(1, (0.45 + dens * 0.55) * flicker + near);
        const glyph = ASCII_CHARS[(Math.floor(s * 997) + (s > 0.82 ? tick : 0) + (near > 0.2 ? tick : 0)) % ASCII_CHARS.length];
        ctx.fillStyle = near > 0.15 ? `rgba(255,255,255,${alpha})` : `rgba(214,236,255,${alpha})`;
        ctx.fillText(glyph, x, y);
      }
    }
  };
  let visible = false,
    rafId = 0,
    last = 0,
    time = 0;
  const loop = (now) => {
    if (!visible) return;
    rafId = requestAnimationFrame(loop);
    if (now - last < 1000 / 30) return; // 30 i/s suffisent pour du scintillement
    time += Math.min((now - last) / 1000, 0.1);
    last = now;
    fields.forEach((f) => drawField(f, time));
  };
  const io = new IntersectionObserver((entries) => {
    visible = entries[0].isIntersecting;
    cancelAnimationFrame(rafId);
    if (!visible) return;
    if (reduceMotion) return fields.forEach((f) => drawField(f, 0));
    last = performance.now();
    rafId = requestAnimationFrame(loop);
  });
  io.observe(footer);
  const onResize = () => fields.forEach((f) => f.resize());
  window.addEventListener("resize", onResize);
  (document.fonts ? document.fonts.ready : Promise.resolve()).then(() => {
    fitWord();
    ScrollTrigger.refresh();
  });

  window.addDisposable(() => {
    visible = false;
    cancelAnimationFrame(rafId);
    io.disconnect();
    ro.disconnect();
    pageRo.disconnect();
    readyMo.disconnect();
    clearTimeout(refreshTimer);
    st.kill();
    document.body.removeAttribute("data-footer-open");
    tl.kill();
    gsap.set(footer, { clearProps: "transform" });
    window.removeEventListener("resize", onResize);
    topBtn && topBtn.removeEventListener("click", goTop);
  });
}
function initScriptsBeforeEnter() {
  (initLenis(),
    initLenisCheckScrollUpDown(),
    has("[data-clean-link]") && initCleanLink(),
    has("[data-split]") && initSplit(),
    has("[data-scramble]") && initScrambleText(),
    has('[data-stagger-char="true"]') && initButtonCharacterStagger(),
    has("[data-bunny-player-init]") && initBunnyPlayer(),
    has('[data-project-device="group"]') && initProjectDevice(),
    has('[data-count="group"]') && initCount(),
    has('[data-pf="group"]') && initPortfolioSlider(),
    has('[data-swiper="group"]') && initSwiperGeneral(),
    has("[data-image-ratio-init]") && initImageRatio(),
    has("[data-dot-canvas]") && initDotCanvas(),
    has("[data-wave-gradient]") && initWaveGradient(),
    has("[data-footer-reveal]") && initFooterReveal(),
    has('[data-offer="card"]') && initPricingToggle(),
    has(".btn_border") && initButtonBorders(),
    has("#my-cal-inline") && initCalEmbed(),
    has("[data-booking]") && initBooking(),
    has("[data-live-preview]") && initLivePreview());
}
/* Réservation : calendrier, créneaux, formulaire et confirmation (page /rendez-vous).
   Réglages dans site.json → booking (jours, horaires, pauses, préavis, endpoint).
   Envoi : endpoint (POST JSON, ex. Formspree) ; sinon e-mail pré-rempli ; sinon WhatsApp.
   Les créneaux sont calculés à partir des règles : ils ne lisent pas un agenda réel. */
function initBooking(scope = document) {
  const root = scope.querySelector("[data-booking]");
  if (!root || root.__bk) return;
  root.__bk = true;
  let cfg = {};
  try {
    cfg = JSON.parse(root.querySelector("[data-bk-config]").textContent);
  } catch (e) {}
  const TZ = "Europe/Paris",
    duration = +cfg.duration || 30,
    step = +cfg.step || 30,
    days = cfg.days || [1, 2, 3, 4, 5],
    maxDays = +cfg.maxDays || 60,
    notice = (+cfg.minNoticeHours || 0) * 36e5;
  const q = (s) => root.querySelector(s),
    qa = (s) => Array.from(root.querySelectorAll(s));
  const els = {
    grid: q("[data-bk-grid]"),
    month: q("[data-bk-month]"),
    prev: q("[data-bk-prev]"),
    next: q("[data-bk-next]"),
    day: q("[data-bk-day]"),
    slots: q("[data-bk-slots]"),
    summary: q("[data-bk-summary]"),
    sumDate: q("[data-bk-summary-date]"),
    sumTime: q("[data-bk-summary-time]"),
    form: q("[data-bk-form]"),
    error: q("[data-bk-error]"),
    submit: q("[data-bk-submit]"),
    submitLabel: q("[data-bk-submit-label]"),
    doneTitle: q("[data-bk-done-title]"),
    doneText: q("[data-bk-done-text]"),
    doneDate: q("[data-bk-done-date]"),
    doneTime: q("[data-bk-done-time]"),
    gcal: q("[data-bk-gcal]"),
    ics: q("[data-bk-ics]"),
  };
  /* --- dates en heure de Paris --- */
  const fmtParts = new Intl.DateTimeFormat("en-GB", {
    timeZone: TZ,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
  const parisParts = (date) => {
    const o = {};
    fmtParts.formatToParts(date).forEach((p) => p.type !== "literal" && (o[p.type] = +p.value));
    return o;
  };
  const parisToDate = (y, m, d, mins) => {
    const want = Date.UTC(y, m - 1, d, 0, mins);
    let t = want;
    for (let i = 0; i < 2; i++) {
      const p = parisParts(new Date(t));
      t -= Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute) - want;
    }
    return new Date(t);
  };
  const toMin = (s) => {
    const [h, m] = String(s).split(":").map(Number);
    return h * 60 + (m || 0);
  };
  const hhmm = (mins) => String(Math.floor(mins / 60)).padStart(2, "0") + ":" + String(mins % 60).padStart(2, "0");
  const keyOf = (y, m, d) => y + "-" + String(m).padStart(2, "0") + "-" + String(d).padStart(2, "0");
  const fromKey = (k) => k.split("-").map(Number);
  const weekday = (y, m, d) => new Date(Date.UTC(y, m - 1, d)).getUTCDay();
  const longDate = (y, m, d) =>
    new Intl.DateTimeFormat("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(
      new Date(Date.UTC(y, m - 1, d)),
    );
  const dayTitle = (y, m, d) =>
    new Intl.DateTimeFormat("fr-FR", { weekday: "long", day: "numeric", month: "long", timeZone: "UTC" }).format(
      new Date(Date.UTC(y, m - 1, d)),
    );
  const monthTitle = (y, m) =>
    new Intl.DateTimeFormat("fr-FR", { month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(Date.UTC(y, m - 1, 1)));
  const now = parisParts(new Date()),
    todayUTC = Date.UTC(now.year, now.month - 1, now.day),
    lastUTC = todayUTC + maxDays * 864e5;
  const breaks = (cfg.breaks || []).map(([a, b]) => [toMin(a), toMin(b)]);
  const slotsFor = (y, m, d) => {
    const t = Date.UTC(y, m - 1, d);
    if (t < todayUTC || t > lastUTC || !days.includes(weekday(y, m, d))) return [];
    const out = [],
      limit = Date.now() + notice;
    for (let s = toMin(cfg.start || "09:00"); s + duration <= toMin(cfg.end || "18:00"); s += step) {
      if (breaks.some(([a, b]) => s < b && s + duration > a)) continue;
      parisToDate(y, m, d, s).getTime() > limit && out.push(s);
    }
    return out;
  };
  /* --- état --- */
  const state = { y: now.year, m: now.month, key: "", time: null, step: "date" };
  for (let i = 0; i <= maxDays; i++) {
    const p = new Date(todayUTC + i * 864e5);
    const y = p.getUTCFullYear(),
      m = p.getUTCMonth() + 1,
      d = p.getUTCDate();
    if (slotsFor(y, m, d).length) {
      state.key = keyOf(y, m, d);
      state.y = y;
      state.m = m;
      break;
    }
  }
  /* --- calendrier --- */
  const renderMonth = (dir) => {
    const { y, m } = state,
      first = weekday(y, m, 1),
      lead = (first + 6) % 7,
      count = new Date(Date.UTC(y, m, 0)).getUTCDate();
    els.month.textContent = monthTitle(y, m);
    els.prev.disabled = Date.UTC(y, m - 1, 1) <= Date.UTC(now.year, now.month - 1, 1);
    els.next.disabled = Date.UTC(y, m, 1) > lastUTC;
    const frag = document.createDocumentFragment();
    let row;
    for (let i = 0; i < 42; i++) {
      if (i % 7 === 0) {
        row = document.createElement("div");
        row.setAttribute("role", "row");
        row.style.display = "contents";
        frag.appendChild(row);
      }
      const d = i - lead + 1,
        b = document.createElement("button");
      b.type = "button";
      b.className = "bk_day";
      b.setAttribute("role", "gridcell");
      if (d < 1 || d > count) {
        b.classList.add("is-outside");
        b.disabled = true;
        b.tabIndex = -1;
        b.setAttribute("aria-hidden", "true");
      } else {
        const k = keyOf(y, m, d),
          ok = slotsFor(y, m, d).length > 0;
        b.textContent = d;
        b.dataset.key = k;
        b.setAttribute("aria-label", longDate(y, m, d) + (ok ? "" : ", indisponible"));
        b.setAttribute("aria-selected", k === state.key ? "true" : "false");
        Date.UTC(y, m - 1, d) === todayUTC && b.classList.add("is-today");
        ok ? b.classList.add("is-available") : (b.disabled = true);
        b.tabIndex = k === state.key ? 0 : -1;
      }
      row.appendChild(b);
    }
    els.grid.replaceChildren(frag);
    if (!els.grid.querySelector('[tabindex="0"]')) {
      const f = els.grid.querySelector(".bk_day:not(:disabled)");
      f && (f.tabIndex = 0);
    }
    els.grid.classList.remove("is-next", "is-prev");
    if (dir) {
      void els.grid.offsetWidth;
      els.grid.classList.add(dir > 0 ? "is-next" : "is-prev");
    }
    // rows sans cellule visible : on les masque (mois sur 5 lignes)
    Array.from(els.grid.children).forEach((r) => {
      r.style.display = Array.from(r.children).every((c) => c.classList.contains("is-outside")) ? "none" : "contents";
    });
  };
  const shiftMonth = (n) => {
    let m = state.m + n,
      y = state.y;
    m < 1 && ((m = 12), y--);
    m > 12 && ((m = 1), y++);
    state.y = y;
    state.m = m;
    renderMonth(n);
  };
  /* --- créneaux --- */
  const renderSlots = () => {
    state.time = null;
    if (!state.key) {
      els.day.textContent = "Aucune date disponible";
      els.slots.innerHTML = '<p class="bk_slots_empty">Aucun créneau ouvert pour le moment. Écrivez-nous et nous trouverons un horaire ensemble.</p>';
      return;
    }
    const [y, m, d] = fromKey(state.key),
      list = slotsFor(y, m, d);
    els.day.textContent = dayTitle(y, m, d);
    const frag = document.createDocumentFragment();
    list.forEach((s, i) => {
      const item = document.createElement("div");
      item.className = "bk_slot_item";
      item.setAttribute("role", "listitem");
      item.style.setProperty("--i", i);
      item.innerHTML =
        '<button type="button" class="bk_slot" aria-pressed="false">' +
        hhmm(s) +
        '</button><button type="button" class="bk_slot_next" tabindex="-1">Continuer</button>';
      item.dataset.time = s;
      frag.appendChild(item);
    });
    els.slots.replaceChildren(frag);
    els.slots.scrollTop = 0;
  };
  const selectSlot = (item) => {
    qa(".bk_slot_item").forEach((it) => {
      const on = it === item;
      it.classList.toggle("is-selected", on);
      it.querySelector(".bk_slot").setAttribute("aria-pressed", on ? "true" : "false");
      it.querySelector(".bk_slot_next").tabIndex = on ? 0 : -1;
    });
    state.time = item ? +item.dataset.time : null;
  };
  const selectDay = (key) => {
    state.key = key;
    qa(".bk_day[data-key]").forEach((b) => {
      const on = b.dataset.key === key;
      b.setAttribute("aria-selected", on ? "true" : "false");
      b.tabIndex = on ? 0 : -1;
    });
    renderSlots();
  };
  /* --- étapes --- */
  const slotText = () => {
    const [y, m, d] = fromKey(state.key);
    return {
      date: longDate(y, m, d),
      time: hhmm(state.time) + " – " + hhmm(state.time + duration) + " · " + (cfg.timezoneLabel || "Heure de Paris"),
    };
  };
  const goStep = (name, focus) => {
    state.step = name;
    root.dataset.step = name;
    qa("[data-bk-panel]").forEach((p) => (p.hidden = p.dataset.bkPanel !== name));
    const picked = name === "form" && state.time !== null;
    els.summary.hidden = !picked;
    if (picked) {
      const t = slotText();
      els.sumDate.textContent = t.date;
      els.sumTime.textContent = t.time;
    }
    if (focus) {
      const target =
        name === "form" ? q("#bk-name") : name === "done" ? els.doneTitle : els.grid.querySelector('[tabindex="0"]');
      target && target.focus({ preventScroll: true });
      const stacked = window.matchMedia("(max-width: 991px)").matches,
        anchor = stacked && name !== "date" ? q('[data-bk-panel="' + name + '"]') : root.querySelector(".bk_card"),
        top = anchor.getBoundingClientRect().top;
      if (top < 0 || top > window.innerHeight * 0.6) {
        window.lenis && window.lenis.scrollTo
          ? window.lenis.scrollTo(anchor, { offset: -90 })
          : window.scrollTo({ top: top + window.scrollY - 90, behavior: "smooth" });
      }
    }
    window.lenis && window.lenis.resize && window.lenis.resize();
    window.ScrollTrigger && ScrollTrigger.refresh();
  };
  /* --- évènements --- */
  els.prev.addEventListener("click", () => shiftMonth(-1));
  els.next.addEventListener("click", () => shiftMonth(1));
  els.grid.addEventListener("click", (e) => {
    const b = e.target.closest(".bk_day[data-key]");
    b && !b.disabled && selectDay(b.dataset.key);
  });
  els.grid.addEventListener("keydown", (e) => {
    const moves = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 };
    const b = e.target.closest(".bk_day[data-key]");
    if (!b) return;
    if (e.key === "Enter" || e.key === " ") return;
    if (!(e.key in moves)) return;
    e.preventDefault();
    const [y, m, d] = fromKey(b.dataset.key);
    let t = Date.UTC(y, m - 1, d);
    for (let i = 0; i < 62; i++) {
      t += moves[e.key] * 864e5;
      if (t < todayUTC || t > lastUTC) return;
      const p = new Date(t),
        ny = p.getUTCFullYear(),
        nm = p.getUTCMonth() + 1,
        nd = p.getUTCDate();
      if (!slotsFor(ny, nm, nd).length) continue;
      if (ny !== state.y || nm !== state.m) {
        const dir = ny * 12 + nm > state.y * 12 + state.m ? 1 : -1;
        state.y = ny;
        state.m = nm;
        renderMonth(dir);
      }
      selectDay(keyOf(ny, nm, nd));
      const nb = els.grid.querySelector('[data-key="' + keyOf(ny, nm, nd) + '"]');
      nb && nb.focus();
      return;
    }
  });
  els.slots.addEventListener("click", (e) => {
    const item = e.target.closest(".bk_slot_item");
    if (!item) return;
    if (e.target.closest(".bk_slot_next")) {
      state.time = +item.dataset.time;
      goStep("form", true);
      return;
    }
    if (item.classList.contains("is-selected") && window.matchMedia("(max-width: 767px)").matches) {
      goStep("form", true);
      return;
    }
    selectSlot(item);
  });
  q("[data-bk-back]").addEventListener("click", () => {
    goStep("date", true);
    const it = els.slots.querySelector('[data-time="' + state.time + '"]');
    it && selectSlot(it);
  });
  q("[data-bk-restart]").addEventListener("click", () => {
    els.form.reset();
    renderSlots();
    goStep("date", true);
  });
  /* --- formulaire --- */
  const setErr = (name, msg) => {
    const input = els.form.elements[name],
      p = q('[data-bk-err="' + name + '"]');
    input && input.setAttribute("aria-invalid", msg ? "true" : "false");
    p && (p.textContent = msg || "");
  };
  ["nom", "email"].forEach((n) => els.form.elements[n].addEventListener("input", () => setErr(n, "")));
  const showError = (msg) => {
    els.error.textContent = msg;
    els.error.hidden = !msg;
  };
  let icsUrl = "";
  window.addDisposable && window.addDisposable(() => icsUrl && URL.revokeObjectURL(icsUrl));
  const icsStamp = (dt) => dt.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const finish = (mode, data) => {
    const [y, m, d] = fromKey(state.key),
      start = parisToDate(y, m, d, state.time),
      end = new Date(start.getTime() + duration * 6e4),
      title = (cfg.title || "Appel découverte") + " — " + (cfg.name || "ULYCOM"),
      details = (cfg.description || "") + (data.message ? "\n\n" + data.message : "");
    const texts = {
      sent: ["C’est noté !", "Votre demande est bien partie. Nous vous confirmons le créneau et le lien de la visio par e-mail."],
      mail: ["Plus qu’une étape", "Votre messagerie s’est ouverte avec la demande pré-remplie : il ne reste qu’à l’envoyer."],
      whatsapp: ["Plus qu’une étape", "WhatsApp s’est ouvert avec votre demande : il ne reste qu’à l’envoyer."],
      preview: ["Aperçu local", "Aucun canal d’envoi n’est configuré (endpoint, e-mail ou WhatsApp dans site.json) : rien n’a été envoyé."],
    };
    els.doneTitle.textContent = texts[mode][0];
    els.doneText.textContent = texts[mode][1];
    const t = slotText();
    els.doneDate.textContent = t.date;
    els.doneTime.textContent = t.time;
    els.gcal.href =
      "https://calendar.google.com/calendar/render?action=TEMPLATE&text=" +
      encodeURIComponent(title) +
      "&dates=" +
      icsStamp(start) +
      "/" +
      icsStamp(end) +
      "&details=" +
      encodeURIComponent(details) +
      "&location=" +
      encodeURIComponent(cfg.location || "");
    const esc = (s) => String(s).replace(/[\\,;]/g, (c) => "\\" + c).replace(/\n/g, "\\n");
    const ics = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//ULYCOM//Reservation//FR",
      "BEGIN:VEVENT",
      "UID:" + icsStamp(start) + "-" + Math.random().toString(36).slice(2) + "@ulycom",
      "DTSTAMP:" + icsStamp(new Date()),
      "DTSTART:" + icsStamp(start),
      "DTEND:" + icsStamp(end),
      "SUMMARY:" + esc(title),
      "DESCRIPTION:" + esc(details),
      "LOCATION:" + esc(cfg.location || ""),
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n");
    icsUrl && URL.revokeObjectURL(icsUrl);
    icsUrl = URL.createObjectURL(new Blob([ics], { type: "text/calendar" }));
    els.ics.href = icsUrl;
    goStep("done", true);
  };
  els.form.addEventListener("submit", async (e) => {
    e.preventDefault();
    showError("");
    const f = els.form.elements,
      data = {
        nom: f.nom.value.trim(),
        email: f.email.value.trim(),
        telephone: f.telephone.value.trim(),
        entreprise: f.entreprise.value.trim(),
        projet: (els.form.querySelector('[name="projet"]:checked') || {}).value || "",
        budget: f.budget.value,
        message: f.message.value.trim(),
      };
    let bad = "";
    setErr("nom", data.nom ? "" : ((bad = bad || "nom"), "Indiquez votre nom."));
    setErr(
      "email",
      /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(data.email) ? "" : ((bad = bad || "email"), "Indiquez un e-mail valide."),
    );
    if (bad) {
      f[bad].focus();
      return;
    }
    if (f.website.value) return; // robot
    const t = slotText(),
      payload = Object.assign({ date: t.date, horaire: t.time, duree: duration + " min" }, data);
    const lines = [
      (cfg.title || "Appel découverte") + " : " + t.date + ", " + t.time,
      "",
      "Nom : " + data.nom,
      "E-mail : " + data.email,
      data.telephone && "Téléphone : " + data.telephone,
      data.entreprise && "Entreprise : " + data.entreprise,
      data.projet && "Projet : " + data.projet,
      data.budget && "Budget : " + data.budget,
      data.message && "\n" + data.message,
    ].filter(Boolean);
    if (cfg.endpoint) {
      els.submit.setAttribute("aria-busy", "true");
      els.submitLabel.textContent = "Envoi…";
      try {
        const r = await fetch(cfg.endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify(payload),
        });
        if (!r.ok) throw new Error(r.status);
        finish("sent", data);
      } catch (err) {
        showError("L’envoi n’a pas abouti. Réessayez dans un instant" + (cfg.email ? " ou écrivez-nous à " + cfg.email : "") + ".");
      } finally {
        els.submit.removeAttribute("aria-busy");
        els.submitLabel.textContent = "Confirmer le rendez-vous";
      }
    } else if (cfg.email) {
      window.location.href =
        "mailto:" +
        cfg.email +
        "?subject=" +
        encodeURIComponent("Rendez-vous : " + t.date + ", " + hhmm(state.time)) +
        "&body=" +
        encodeURIComponent(lines.join("\n"));
      finish("mail", data);
    } else if (cfg.whatsapp) {
      window.open("https://wa.me/" + cfg.whatsapp + "?text=" + encodeURIComponent(lines.join("\n")), "_blank", "noopener");
      finish("whatsapp", data);
    } else if (/^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname)) {
      console.info("[réservation] aucun canal configuré, données :", payload);
      finish("preview", data);
    } else {
      showError("La réservation en ligne n’est pas encore activée. Merci de réessayer plus tard.");
    }
  });
  renderMonth(0);
  renderSlots();
  goStep("date", false);
}
/* Aperçu du site dans la page projet : onglets Desktop / Mobile, iframe mise à l'échelle
   (mode « live ») ou capture complète défilable (mode « shots »). */
function initLivePreview(scope = document) {
  scope.querySelectorAll("[data-live-preview]").forEach((root) => {
    if (root.__lp) return;
    root.__lp = true;
    const tabs = Array.from(root.querySelectorAll("[data-lp-tab]")),
      panes = Array.from(root.querySelectorAll("[data-lp-pane]")),
      bg = root.querySelector(".lp_tabs_bg");
    const placeBg = () => {
      const t = tabs.find((b) => b.getAttribute("aria-selected") === "true");
      if (!t || !bg) return;
      root.style.setProperty("--lp-tab-w", t.offsetWidth + "px");
      root.style.setProperty("--lp-tab-x", t.offsetLeft - tabs[0].offsetLeft + "px");
    };
    // iframe rendue à sa largeur réelle puis réduite pour tenir dans le cadre
    const fit = (frame) => {
      const ifr = frame.querySelector("iframe");
      if (!ifr) return;
      const base = +frame.dataset.lpFrame || 1440,
        w = frame.clientWidth,
        h = frame.clientHeight,
        k = w / base;
      ifr.style.width = base + "px";
      ifr.style.height = Math.ceil(h / k) + "px";
      ifr.style.transform = "scale(" + k + ")";
    };
    const load = (pane) => {
      pane.querySelectorAll("[data-lp-frame]").forEach((frame) => {
        fit(frame);
        const ifr = frame.querySelector("iframe");
        if (ifr && !ifr.src) {
          ifr.addEventListener("load", () => frame.classList.add("is-loaded"), { once: true });
          ifr.src = ifr.dataset.src;
        }
      });
    };
    // mode « video » : seule la vidéo de l'onglet affiché joue, et seulement quand l'aperçu est à l'écran
    const syncVideos = () => {
      panes.forEach((p) =>
        p.querySelectorAll("video").forEach((v) => {
          if (!p.hidden && visible) {
            if (!v.src && v.dataset.src) v.src = v.dataset.src;
            const r = v.play();
            r && r.catch && r.catch(() => {});
          } else if (v.src) v.pause();
        }),
      );
    };
    const show = (device) => {
      root.dataset.device = device;
      tabs.forEach((b) => b.setAttribute("aria-selected", b.dataset.lpTab === device ? "true" : "false"));
      panes.forEach((p) => (p.hidden = p.dataset.lpPane !== device));
      placeBg();
      const pane = panes.find((p) => p.dataset.lpPane === device);
      pane && visible && load(pane);
      syncVideos();
    };
    tabs.forEach((b) => b.addEventListener("click", () => show(b.dataset.lpTab)));
    root.addEventListener("keydown", (e) => {
      if (!e.target.closest("[data-lp-tab]") || (e.key !== "ArrowLeft" && e.key !== "ArrowRight")) return;
      const i = tabs.indexOf(e.target.closest("[data-lp-tab]")),
        n = tabs[(i + (e.key === "ArrowRight" ? 1 : tabs.length - 1)) % tabs.length];
      n.focus();
      show(n.dataset.lpTab);
    });
    // le premier défilement masque l'indication
    const touched = () => root.classList.add("is-touched");
    root.querySelectorAll(".lp_scroll").forEach((s) => s.addEventListener("scroll", touched, { once: true, passive: true }));
    root.querySelectorAll("[data-lp-frame]").forEach((f) => f.addEventListener("pointerdown", touched, { once: true }));
    // ne charger le vrai site qu'une fois l'aperçu à l'écran
    let visible = false;
    const io = new IntersectionObserver(
      (entries) => {
        visible = entries.some((e) => e.isIntersecting);
        if (visible) show(root.dataset.device);
        else syncVideos();
      },
      { rootMargin: "120px" },
    );
    io.observe(root);
    const ro = new ResizeObserver(() => {
      root.querySelectorAll("[data-lp-frame]").forEach(fit);
      placeBg();
    });
    ro.observe(root);
    window.addDisposable &&
      window.addDisposable(() => {
        io.disconnect();
        ro.disconnect();
      });
    // onglet de départ : celui du projet (mobile pour les applications), mobile sur téléphone
    show(window.matchMedia("(max-width: 767px)").matches ? "mobile" : root.dataset.default || "desktop");
  });
}
function initScriptsAfterEnter() {
  (has('[data-dropdown="item"]') && initFaq(),
    has("[data-current-year]") && initCurrentYear(),
    has('[data-modal="group"]') && initModal(),
    has('[data-form="group"]') && initFormValidation(),
    has("[data-logo-wall-cycle-init]") && initLogoWall(),
    has("[data-project-info='group']") && initProjectInfo(),
    has("[data-magnetic-strength]") && initMagneticEffect(),
    has('[data-cycle="group"]') && initCycle(),
    has('[data-filter="group"]') && initFilter(),
    lenis && lenis.resize(),
    ScrollTrigger.refresh());
}
/* Header « île » : encoche de Mac sur desktop, Dynamic Island sur mobile.
   collapseOnScroll : l'encoche se replie quand on descend dans la page (desktop avec souris) ;
   scrollThreshold : distance de scroll (px) avant le repli ; leaveDelay : délai (ms) avant de se replier quand la souris sort. */
const SP_ISLAND = { collapseOnScroll: true, scrollThreshold: 80, leaveDelay: 380 };
function initSpHeader() {
  const nav = document.querySelector(".sp_nav");
  if (!nav) return;
  const burger = nav.querySelector(".sp_burger"),
    logo = nav.querySelector(".sp_logo"),
    content = nav.querySelector(".sp_content"),
    panel = nav.querySelector(".sp_panel"),
    mobile = window.matchMedia("(max-width: 809px)"),
    canHover = window.matchMedia("(hover: hover) and (pointer: fine)");
  let open = false,
    hovered = false,
    focused = false,
    forcedReady = false,
    leaveTimer = 0,
    last = "";
  const ready = () => forcedReady || document.body.classList.contains("body-ready");
  const scrolled = () => window.scrollY > SP_ISLAND.scrollThreshold;
  const pickIsland = () => {
    if (mobile.matches) return open ? "open" : !ready() || scrolled() ? "mini" : "pill";
    if (hovered || focused) return "full";
    if (!ready()) return "compact";
    return SP_ISLAND.collapseOnScroll && canHover.matches && scrolled() ? "compact" : "full";
  };
  const openWidth = () => Math.min(document.documentElement.clientWidth - 20, 420);
  const sizeOf = (island) => {
    const lw = logo.offsetWidth;
    if (island === "full") return [content.offsetWidth + 1, 53];
    if (island === "compact") return [lw + 50, 38];
    if (island === "pill") return [lw + 62, 44];
    if (island === "mini") return [86, 44];
    return [openWidth(), 44 + panel.offsetHeight];
  };
  const update = () => {
    mobile.matches && nav.style.setProperty("--sp-open-w", openWidth() + "px");
    const island = pickIsland(),
      [w, h] = sizeOf(island),
      key = island + ":" + w + "x" + h;
    if (key === last) return;
    last = key;
    nav.setAttribute("data-island", island);
    nav.style.setProperty("--sp-w", w + "px");
    nav.style.setProperty("--sp-h", h + "px");
  };
  const setOpen = (value) => {
    if (open === value) return;
    open = value;
    nav.setAttribute("data-state", open ? "open" : "closed");
    burger.setAttribute("aria-expanded", open ? "true" : "false");
    burger.setAttribute("aria-label", open ? "Fermer le menu" : "Ouvrir le menu");
    document.body.setAttribute("data-nav-status", open ? "open" : "closed");
    window.lenis && (open ? window.lenis.stop() : window.lenis.start());
    update();
  };
  window.closeMenu = () => setOpen(false);
  window.forceCloseMenu = () => setOpen(false);
  burger.addEventListener("click", () => setOpen(!open));
  nav.addEventListener("click", (e) => {
    e.target.closest("a") && setOpen(false);
  });
  document.addEventListener("click", (e) => {
    open && !nav.contains(e.target) && setOpen(false);
  });
  document.addEventListener("keydown", (e) => {
    e.key === "Escape" && setOpen(false);
  });
  nav.addEventListener("pointerenter", (e) => {
    if (e.pointerType !== "mouse") return;
    clearTimeout(leaveTimer);
    hovered = true;
    update();
  });
  nav.addEventListener("pointerleave", (e) => {
    if (e.pointerType !== "mouse") return;
    clearTimeout(leaveTimer);
    leaveTimer = setTimeout(() => {
      hovered = false;
      update();
    }, SP_ISLAND.leaveDelay);
  });
  nav.addEventListener("focusin", () => {
    focused = nav.matches(":focus-within") && !!nav.querySelector(":focus-visible");
    update();
  });
  nav.addEventListener("focusout", () => {
    focused = false;
    update();
  });
  window.addEventListener("scroll", update, { passive: true });
  window.addEventListener("resize", update);
  const onMedia = () => {
    mobile.matches || setOpen(false);
    update();
  };
  mobile.addEventListener("change", onMedia);
  canHover.addEventListener("change", onMedia);
  new MutationObserver(update).observe(document.body, { attributes: true, attributeFilter: ["class"] });
  if (window.ResizeObserver) {
    const ro = new ResizeObserver(update);
    [logo, content, panel].forEach((el) => ro.observe(el));
  }
  document.fonts && document.fonts.ready && document.fonts.ready.then(update);
  setTimeout(() => {
    forcedReady = true;
    update();
  }, 9000);
  update();
}
function initScriptsOnce() {
  (initPageVisibility(), initDisposables(), initObserverHub(), has(".menu-button") && initMobileMenu(), has(".sp_nav") && initSpHeader());
}
const gsap = window.gsap,
  ScrollTrigger = window.ScrollTrigger,
  SplitText = window.SplitText,
  CustomEase = window.CustomEase,
  Flip = window.Flip;
gsap.registerPlugin(ScrollTrigger, SplitText, CustomEase, Flip);
const barba = window.barba,
  barbaPrefetch = window.barbaPrefetch;
(barba.use(barbaPrefetch),
  barbaPrefetch.init(),
  CustomEase.create("smooth-ease", "0.66, 0.01, 0.17, 0.97"),
  CustomEase.create("elastic-ease", "0.34, 1.35, 0.64, 1"));
const easings = { smooth: "smooth-ease", elastic: "elastic-ease" },
  durations = { xs: 0.3, s: 0.45, m: 0.6, l: 0.8, xl: 1, xxl: 1.2, stagger: 0.075 };
gsap.defaults({ ease: easings.smooth, duration: durations.m });
const breakpoints = {
  isDesktop: "(min-width: 992px)",
  isTablet: "(max-width: 991px)",
  isMobile: "(max-width: 767px)",
  reduceMotion: "(prefers-reduced-motion: reduce)",
};
let lenis, menuButton;
const prevWidth = window.innerWidth;
history.scrollRestoration = "manual";
const $ = (e, t = document) => t.querySelector(e),
  $$ = (e, t = document) => Array.from(t.querySelectorAll(e)),
  has = (e, t = document) => !!$(e, t);
let lenisRafId = null;
(barba.hooks.beforeLeave(() => {
  document.body.classList.add("is-leaving");
}),
  barba.hooks.leave(() => {
    (window.closeMenu && window.closeMenu(), lenis && lenis.stop());
  }),
  barba.hooks.afterLeave(() => {
    (document.body.classList.remove("body-ready"), destroyLenis());
    try {
      ScrollTrigger.getAll().forEach((e) => e.kill());
    } catch (e) {}
    (window.__osmoModals &&
      window.__osmoModals.wraps &&
      (window.__osmoModals.wraps.forEach((e) => {
        (e._modals && e._modals.closeAll && e._modals.closeAll(!1), delete e._modals);
      }),
      window.__osmoModals.wraps.clear()),
      window.cleanupOnLeave && window.cleanupOnLeave());
  }),
  barba.hooks.beforeEnter((e) => {
    (window.scrollTo(0, 0), updateBodyTheme(e), initScriptsBeforeEnter());
  }),
  barba.hooks.enter((e) => {
    initBarbaNavUpdate(e);
  }),
  barba.hooks.afterEnter((e) => {
    (initScriptsAfterEnter(),
      "form" === e.next.namespace &&
        window.Webflow &&
        (window.Webflow.destroy(), window.Webflow.ready(), window.Webflow.require("ix2").init()),
      e.next.container.querySelector('[data-form="group"]') &&
        window.Webflow &&
        (window.Webflow.destroy(), window.Webflow.ready(), window.Webflow.require("ix2").init()));
  }),
  barba.hooks.after(() => {
    document.body.classList.remove("is-leaving");
  }),
  barba.init({
    sync: !0,
    debug: !1,
    timeout: 7e3,
    preventRunning: !0,
    prevent: ({ el: e, href: t }) => {
      if ("true" === e.getAttribute("data-barba-prevent")) return !0;
      if (t && t.includes("#")) {
        if (new URL(t, window.location.origin).pathname === window.location.pathname) return !0;
      }
      return !1;
    },
    transitions: [
      {
        name: "self",
        from: { custom: ({ current: e, next: t }) => e.url.path === t.url.path },
        async leave(e) {
          await runPageLeaveAnimation(e.current.container, e.next.container);
        },
        async enter(e) {
          await runPageEnterAnimation(e.next.container);
        },
      },
      {
        name: "default",
        once(e) {
          (initScriptsOnce(), runPageOnceAnimation(), initScriptsBeforeEnter());
        },
        async leave(e) {
          await runPageLeaveAnimation(e.current.container, e.next.container);
        },
        async enter(e) {
          await runPageEnterAnimation(e.next.container);
        },
      },
    ],
  }),
  document.fonts?.ready
    ? document.fonts.ready.then(() => {
        window.addEventListener(
          "resize",
          debounceOnWidthChange(() => {
            (lenis && lenis.resize(), ScrollTrigger.refresh());
          }, 350),
        );
      })
    : setTimeout(() => {
        window.addEventListener(
          "resize",
          debounceOnWidthChange(() => {
            (lenis && lenis.resize(), ScrollTrigger.refresh());
          }, 350),
        );
      }, 100));
