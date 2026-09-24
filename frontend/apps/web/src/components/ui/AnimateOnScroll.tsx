"use client";

import React, { useEffect, useRef, useState } from "react";

interface AnimateOnScrollProps {
  children: React.ReactNode;
  animationClass?: string;
  className?: string;
  threshold?: number;
}

export function AnimateOnScroll({
  children,
  animationClass = "animate-elastic-pop",
  className = "",
  threshold = 0.15,
}: AnimateOnScrollProps) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // Element enters viewport -> animate into view
          setIsVisible(true);
        } else {
          // Element leaves viewport:
          // Only reset if element is BELOW current viewport (user scrolled back up above it)
          if (entry.boundingClientRect.top > 0) {
            setIsVisible(false);
          }
          // If boundingClientRect.top <= 0, user scrolled past it downwards -> keep visible!
        }
      },
      { threshold }
    );

    const currentRef = ref.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [threshold]);

  return (
    <div
      ref={ref}
      className={`${className} ${isVisible ? animationClass : "opacity-0"}`}
    >
      {children}
    </div>
  );
}
