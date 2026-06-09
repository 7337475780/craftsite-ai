"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export function ScrollAnimationProvider() {
  const [loading, setLoading] = useState(false);
  const pathname = usePathname();

  // Page Transition Progress Bar
  useEffect(() => {
    setLoading(true);
    const timeout = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timeout);
  }, [pathname]);

  // Intersection Observer for scroll animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((el) => {
          if (el.isIntersecting) {
            el.target.classList.add("in-view");
            observer.unobserve(el.target);
          }
        });
      },
      { threshold: 0.12 }
    );

    const elements = document.querySelectorAll("[data-animate]");
    elements.forEach((el) => observer.observe(el));

    return () => {
      elements.forEach((el) => observer.unobserve(el));
    };
  }, [pathname]); // Re-run when pathname changes

  return (
    <>
      {loading && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            height: "3px",
            background: "linear-gradient(90deg, var(--accent), var(--accent-2))",
            zIndex: 9999,
            animation: "progressLoad 0.8s ease-out forwards",
          }}
        />
      )}
      <style>{`
        @keyframes progressLoad {
          0% { width: 0%; opacity: 1; }
          80% { width: 100%; opacity: 1; }
          100% { width: 100%; opacity: 0; }
        }
      `}</style>
    </>
  );
}
