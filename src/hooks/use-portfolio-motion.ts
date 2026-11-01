import { useEffect, useRef } from "react";

/** Progressive enhancement: content remains visible without JS or an observer. */
export function usePortfolioMotion() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root || !window.IntersectionObserver) return;
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const targets = [...root.querySelectorAll<HTMLElement>(
      "[data-reveal], main .surface, .support-band > div, footer > div",
    )];
    let observer: IntersectionObserver | undefined;

    function reset() {
      observer?.disconnect();
      targets.forEach((target) => target.removeAttribute("data-motion"));
    }

    function start() {
      reset();
      if (preference.matches) return;
      observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          (entry.target as HTMLElement).dataset["motion"] = "revealed";
          observer?.unobserve(entry.target);
        });
      }, { threshold: 0, rootMargin: "0px 0px -24px 0px" });

      targets.forEach((target) => {
        const rect = target.getBoundingClientRect();
        // Never conceal a section reached directly through an anchor.
        target.dataset["motion"] = rect.top < window.innerHeight && rect.bottom > 0
          ? "revealed"
          : "pending";
        if (target.dataset["motion"] === "pending") observer?.observe(target);
      });
    }

    function revealFocused(event: FocusEvent) {
      if (!(event.target instanceof HTMLElement)) return;
      let target: HTMLElement | null = event.target;
      while (target && root?.contains(target)) {
        if (target.dataset["motion"] === "pending") {
          target.dataset["motion"] = "revealed";
          observer?.unobserve(target);
        }
        target = target.parentElement;
      }
    }

    start();
    preference.addEventListener("change", start);
    root.addEventListener("focusin", revealFocused);
    return () => {
      reset();
      preference.removeEventListener("change", start);
      root.removeEventListener("focusin", revealFocused);
    };
  }, []);

  return ref;
}