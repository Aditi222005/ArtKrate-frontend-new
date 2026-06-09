import { useEffect, useState } from "react";

interface AnimatedCounterProps {
  end: number;
  suffix?: string;
}

const AnimatedCounter: React.FC<AnimatedCounterProps> = ({ end, suffix = "" }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const duration = 1000;
    const stepTime = 10;
    const totalSteps = duration / stepTime;
    const increment = end / totalSteps;

    const interval = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(interval);
      } else {
        setCount(Math.floor(start));
      }
    }, stepTime);

    return () => clearInterval(interval);
  }, [end]);

  return (
    <span>{count}{suffix}</span>
  );
};

export default AnimatedCounter;
