"use client";

import { useEffect, useRef, useState } from "react";
import Image from "@/components/Ui/Image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function AnimatedImage({
  image,
  alt = "",
  height,
  width,
  priority = false,
  className = "",
  aspectRatio = "aspect-square",
  ...props
}) {
  const [hydrated, setHydrated] = useState(false);
  const imageRef = useRef(null);

  useEffect(() => setHydrated(true), []);

  useEffect(() => {
    if (!hydrated) return;
    if (!imageRef.current) return;

    const wrapper = imageRef.current.querySelector(".animated-img-inner");
    if (!wrapper) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        wrapper,
        { scale: 1.2 },
        {
          scale: 1,
          ease: "none",
          scrollTrigger: {
            trigger: imageRef.current,
            start: "top 80%",
            end: "bottom top",
            scrub: true,
          },
        }
      );
    }, imageRef);

    return () => {
      ctx.revert();
      ScrollTrigger.getAll().forEach(t => t.kill());
    };
  }, [hydrated]);

  return (
    <div
      ref={imageRef}
      className={`relative overflow-hidden w-full h-full flex items-center justify-center ${className} ${aspectRatio}`}
      {...props}
    >
      <div className="animated-img-inner absolute min-w-full min-h-full">
        <Image
          image={image.url ? image.url : image}
          alt={alt}
          width={width}
          height={height}
            priority={priority}
          className="absolute top-0 left-0 w-full h-full object-cover"
        />
      </div>
    </div>
  );
}
