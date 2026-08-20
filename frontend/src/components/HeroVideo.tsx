import { useEffect, useRef, useState } from 'react';

interface HeroVideoProps {
  src: string;
  poster: string;
  alt: string;
  className?: string;
}

export function HeroVideo({ src, poster, alt, className = '' }: HeroVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [allowVideo, setAllowVideo] = useState(false);

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    setAllowVideo(!query.matches);

    const handleChange = (event: MediaQueryListEvent) => setAllowVideo(!event.matches);
    query.addEventListener('change', handleChange);
    return () => query.removeEventListener('change', handleChange);
  }, []);

  useEffect(() => {
    if (allowVideo) {
      videoRef.current?.play().catch(() => {
        /* autoplay may be blocked; poster remains visible */
      });
    }
  }, [allowVideo]);

  return (
    <>
      <img src={poster} alt={alt} className={className} loading="eager" />
      {allowVideo && (
        <video
          ref={videoRef}
          className={`${className} absolute inset-0 opacity-0 transition-opacity duration-700`}
          poster={poster}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          onCanPlay={(e) => {
            e.currentTarget.classList.remove('opacity-0');
            e.currentTarget.classList.add('opacity-100');
          }}
        >
          <source src={src} type="video/mp4" />
        </video>
      )}
    </>
  );
}
