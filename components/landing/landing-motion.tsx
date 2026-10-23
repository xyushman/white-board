"use client";

import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";

gsap.registerPlugin(ScrollTrigger);

function reduceMotion() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

export function LandingMotion() {
  useEffect(() => {
    const root = document.querySelector<HTMLElement>(".ev");
    if (!root) return;

    const reduced = reduceMotion();

    if (!reduced) {
      const lenis = new Lenis({
        duration: 0.8,
        smoothWheel: true,
        wheelMultiplier: 0.85,
        lerp: 0.1,
      });
      const raf = (time: number) => lenis.raf(time * 1000);
      lenis.on("scroll", ScrollTrigger.update);
      gsap.ticker.add(raf);
      gsap.ticker.lagSmoothing(0);

      // --- nav menu ---
      const menuBtn = root.querySelector<HTMLButtonElement>(".nav__menu");
      const menu = root.querySelector<HTMLElement>("#menu");
      const menuClose = root.querySelector<HTMLButtonElement>(".menu__close");
      const onOpen = () => {
        if (!menu) return;
        menu.hidden = false;
        menuBtn?.setAttribute("aria-expanded", "true");
        lenis.stop();
        gsap.fromTo(
          menu,
          { clipPath: "inset(0 0 100% 0)" },
          { clipPath: "inset(0 0 0% 0)", duration: 0.6, ease: "power3.inOut" },
        );
        gsap.fromTo(
          menu.querySelectorAll(".m-link-3"),
          { yPercent: 60, opacity: 0 },
          { yPercent: 0, opacity: 1, duration: 0.6, stagger: 0.05, delay: 0.15, ease: "power3.out" },
        );
      };
      const onClose = () => {
        if (!menu) return;
        menuBtn?.setAttribute("aria-expanded", "false");
        gsap.to(menu, {
          clipPath: "inset(0 0 100% 0)",
          duration: 0.45,
          ease: "power3.inOut",
          onComplete: () => {
            if (menu) menu.hidden = true;
            lenis.start();
          },
        });
      };
      menuBtn?.addEventListener("click", onOpen);
      menuClose?.addEventListener("click", onClose);
      menu?.querySelectorAll(".m-link-3").forEach((a) =>
        a.addEventListener("click", onClose),
      );

      // nav hides on scroll down, returns on scroll up
      const nav = root.querySelector<HTMLElement>("#nav");
      let lastY = window.scrollY;
      const onScroll = (e: { scroll: number; direction: number }) => {
        const y = e.scroll;
        if (!nav) return;
        if (y < 120) {
          nav.classList.remove("is-hidden");
        } else if (y > lastY && e.direction > 0) {
          nav.classList.add("is-hidden");
        } else {
          nav.classList.remove("is-hidden");
        }
        lastY = y;
      };
      lenis.on("scroll", onScroll);

      const ctx = gsap.context(() => {
        // opening
        gsap.timeline({ defaults: { ease: "power3.out" } })
          .from(".op-two", { backgroundColor: "#0b0b0b", duration: 1.4 })
          .from(".op-two", { clipPath: "inset(0 0 100% 0)", duration: 1.4 }, 0)
          .from(".op-rule", { scaleY: 0, transformOrigin: "0 50%", duration: 1.2 }, 0.2)
          .from(".op-a .ln__i", { yPercent: 120, duration: 1.2, stagger: 0.1 }, 0.35)
          .from(".op-h1 .ln__i", { yPercent: 120, duration: 1.3, stagger: 0.12 }, 0.4)
          .from(".op-sub .ln__i", { yPercent: 120, duration: 1.2, stagger: 0.08 }, 0.55)
          .from(".op-say .ln__i", { yPercent: 120, duration: 1.2, stagger: 0.09 }, 0.75)
          .from(".op-para", { yPercent: 40, opacity: 0, duration: 1 }, 0.85)
          .from(
            ".op-tile",
            { yPercent: 60, opacity: 0, scale: 0.98, duration: 1.2, stagger: { each: 0.14, from: "random" } },
            0.95,
          )
          .from(".op-level__bubble", { scale: 0, duration: 1, ease: "back.out(2.5)" }, 0.65);

        // tools ledger
        gsap.utils.toArray<HTMLElement>(".sv-row").forEach((row) => {
          gsap.from(row.querySelectorAll("[data-motion='post']"), {
            yPercent: 50,
            opacity: 0,
            duration: 0.7,
            stagger: 0.08,
            scrollTrigger: { trigger: row, start: "top 85%" },
          });
          gsap.from(row.querySelector("[data-motion='rule']"), {
            scaleX: 0,
            transformOrigin: "0 50%",
            duration: 0.9,
            scrollTrigger: { trigger: row, start: "top 88%" },
          });
        });
        gsap.from(".sv-rule", {
          scaleY: 0,
          transformOrigin: "50% 0",
          duration: 1,
          scrollTrigger: { trigger: "#services", start: "top 70%" },
        });
        gsap.from(".sv-h .l-a, .sv-h .l-b, .sv-h .sv-in", {
          yPercent: 100,
          opacity: 0,
          duration: 0.9,
          stagger: 0.1,
          scrollTrigger: { trigger: ".sv-h", start: "top 85%" },
        });

        // workflow ruler — one scrub drives the fill, the marker and the tasks
        const moStage = root.querySelector<HTMLElement>(".mo-scale");
        const moTasks = gsap.utils.toArray<HTMLElement>(".mo-task");
        if (moStage) {
          gsap.to(moStage, {
            "--mo-p": 1,
            ease: "none",
            scrollTrigger: {
              trigger: "#workflow",
              start: "top top",
              end: "bottom bottom",
              scrub: true,
            },
          });
        }
        ScrollTrigger.create({
          trigger: "#workflow",
          start: "top top",
          end: "bottom bottom",
          onUpdate: (self) => {
            const lit = Math.round(self.progress * moTasks.length);
            moTasks.forEach((task, i) => task.classList.toggle("is-on", i < lit));
          },
        });
        moTasks.forEach((task) => {
          gsap.from(task, {
            yPercent: 30,
            opacity: 0,
            duration: 0.8,
            scrollTrigger: { trigger: task, start: "top 88%" },
          });
        });

        // boards sphere
        const cards = gsap.utils.toArray<HTMLElement>(".bs-card");
        gsap.set("#boards", { perspective: 1200 });
        const spin = gsap.timeline({
          scrollTrigger: {
            trigger: "#boards",
            start: "top top",
            end: "bottom bottom",
            scrub: true,
            onUpdate: (self) => {
              const t = self.progress;
              cards.forEach((card) => {
                card.style.opacity = `${0.35 + 0.65 * Math.sin(Math.PI * t)}`;
              });
            },
          },
        });
        spin.fromTo(
          ".bs-globe",
          { rotateY: 0, rotateX: -12 },
          { rotateY: 200, rotateX: 10, ease: "none" },
        );
          gsap.from(".bs-half--a, .bs-half--b", {
            opacity: 0,
            yPercent: 40,
            duration: 1,
            stagger: 0.12,
            scrollTrigger: { trigger: "#boards", start: "top 75%" },
          });

        // pricing rows
        gsap.utils.toArray<HTMLElement>(".pr-plan").forEach((row) => {
          gsap.from(row.querySelectorAll("[data-motion='post']"), {
            yPercent: 50,
            opacity: 0,
            duration: 0.7,
            scrollTrigger: { trigger: row, start: "top 88%" },
          });
          gsap.from(row.querySelector("[data-motion='rule']"), {
            scaleX: 0,
            transformOrigin: "0 50%",
            duration: 0.9,
            scrollTrigger: { trigger: row, start: "top 90%" },
          });
        });
        gsap.from(".pr-h span", {
          yPercent: 100,
          opacity: 0,
          duration: 0.9,
          stagger: 0.1,
          scrollTrigger: { trigger: ".pr-h", start: "top 85%" },
        });

        // switch rings
        gsap.from(".sw-tile", {
          yPercent: 40,
          opacity: 0,
          duration: 0.8,
          stagger: 0.12,
          scrollTrigger: { trigger: "#switch", start: "top 60%" },
        });
        gsap.utils.toArray<HTMLElement>(".sw-ring__arc").forEach((arc) => {
          gsap.fromTo(
            arc,
            { strokeDashoffset: 1 },
            {
              strokeDashoffset: 0,
              ease: "none",
              scrollTrigger: {
                trigger: "#switch",
                start: "top 75%",
                end: "bottom bottom",
                scrub: true,
              },
            },
          );
        });
        ScrollTrigger.create({
          trigger: "#switch",
          start: "top 70%",
          end: "bottom bottom",
          onUpdate: (self) => {
            const lit = Math.round(self.progress * 3);
            root
              .querySelectorAll<HTMLElement>(".sw-tile")
              .forEach((tile, i) => tile.classList.toggle("is-done", i < lit));
          },
        });

        // principle lines
        gsap.utils.toArray<HTMLElement>(".pc-l").forEach((line) => {
          gsap.fromTo(
            line,
            { fontWeight: 400, opacity: 0.35 },
            {
              fontWeight: 500,
              opacity: 1,
              duration: 0.6,
              scrollTrigger: { trigger: line, start: "top 75%" },
            },
          );
        });
        gsap.from(".pc-dot", {
          scale: 0,
          duration: 0.6,
          ease: "back.out(2.4)",
          scrollTrigger: { trigger: ".pc-in", start: "top 70%" },
        });

        // reviews stack
        gsap.utils.toArray<HTMLElement>(".rv-sheet").forEach((sheet) => {
          gsap.fromTo(
            sheet,
            { scale: 1 },
            {
              scale: 0.94,
              yPercent: -6,
              ease: "none",
              scrollTrigger: {
                trigger: sheet,
                start: "top 20%",
                end: "bottom 20%",
                scrub: true,
              },
            },
          );
        });

        // footer wordmark
        gsap.from(".ft-a, .ft-b", {
          yPercent: 100,
          opacity: 0,
          duration: 1,
          stagger: 0.1,
          scrollTrigger: { trigger: "#footer", start: "top 85%" },
        });

        // generic posts
        gsap.utils.toArray<HTMLElement>("[data-motion='post']").forEach((el) => {
          if (el.closest(".sv-row") || el.closest(".pr-plan")) return;
          gsap.from(el, {
            yPercent: 50,
            opacity: 0,
            duration: 0.7,
            scrollTrigger: { trigger: el, start: "top 88%" },
          });
        });
      }, root);

      // refresh after layout settles
      const refresh = () => ScrollTrigger.refresh();
      window.addEventListener("load", refresh);
      const t = window.setTimeout(refresh, 600);

      return () => {
        window.removeEventListener("load", refresh);
        window.clearTimeout(t);
        menuBtn?.removeEventListener("click", onOpen);
        menuClose?.removeEventListener("click", onClose);
        lenis.off("scroll", onScroll);
        gsap.ticker.remove(raf);
        lenis.destroy();
        ctx.revert();
        ScrollTrigger.getAll().forEach((s) => s.kill());
      };
    }

    // reduced-motion: make everything visible, no animation
    gsap.set(root.querySelectorAll(".op-two"), { clipPath: "none" });
  }, []);

  return null;
}
