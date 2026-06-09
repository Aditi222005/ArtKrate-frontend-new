
import { useState, useEffect } from "react";

interface FloatingArtworkProps {
  src: string;
  alt: string;
  className?: string;
  delay?: number;
}

const FloatingArtwork = ({ src, alt, className = "", delay = 0 }: FloatingArtworkProps) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div 
      className={`transform transition-all duration-1000 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'} ${className}`}
    >
      <div className="relative group cursor-pointer">
        <div className="absolute inset-0 bg-gradient-to-r from-gray-600 to-black rounded-2xl blur opacity-20 group-hover:opacity-40 transition-opacity"></div>
        <img 
          src={src} 
          alt={alt}
          className="relative w-full h-full object-cover rounded-2xl shadow-lg group-hover:shadow-2xl transition-all duration-300 transform group-hover:scale-105"
        />
      </div>
    </div>
  );
};

export default FloatingArtwork;
