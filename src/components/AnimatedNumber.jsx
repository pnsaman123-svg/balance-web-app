import React, { useEffect, useState, useRef } from 'react';

export default function AnimatedNumber({ value, currency = '₹', duration = 800, className = '' }) {
  const [displayValue, setDisplayValue] = useState(value);
  const prevValueRef = useRef(value);

  useEffect(() => {
    const startValue = prevValueRef.current;
    const endValue = value;
    prevValueRef.current = value;

    if (startValue === endValue) {
      setDisplayValue(endValue);
      return;
    }

    const startTime = performance.now();

    const updateCounter = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Smooth cubic-out easing
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(startValue + (endValue - startValue) * easeOut);

      setDisplayValue(current);

      if (progress < 1) {
        requestAnimationFrame(updateCounter);
      } else {
        setDisplayValue(endValue);
      }
    };

    requestAnimationFrame(updateCounter);
  }, [value, duration]);

  return (
    <span className={`inline-flex items-baseline ${className}`}>
      {currency && <span className="text-[#777777] font-semibold mr-0.5">{currency}</span>}
      <span>{Number(displayValue || 0).toLocaleString('en-IN')}</span>
    </span>
  );
}
