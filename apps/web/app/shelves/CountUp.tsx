import { useEffect, useRef, useState } from 'react';

interface CountUpProps {
  end: number;
  duration?: number; // em ms
  className?: string;
}

export function CountUp({ end, duration = 1000, className = '' }: CountUpProps) {
  const [value, setValue] = useState(0);
  const startTimestamp = useRef<number | null>(null);

  useEffect(() => {
    let raf: number;
    function animate(ts: number) {
      if (!startTimestamp.current) startTimestamp.current = ts;
      const progress = Math.min((ts - startTimestamp.current) / duration, 1);
      setValue(Math.floor(progress * end));
      if (progress < 1) {
        raf = requestAnimationFrame(animate);
      } else {
        setValue(end);
      }
    }
    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [end, duration]);

  return <span className={className}>{value}</span>;
} 