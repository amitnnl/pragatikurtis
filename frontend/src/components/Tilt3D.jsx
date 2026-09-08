import { useState, useRef, useEffect } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

/**
 * Tilt3D - Hardware-accelerated 3D dynamic tilt container
 * Applies 3D perspective rotation and specular glare on mouse movement.
 * Automatically falls back gracefully on mobile touch screens.
 */
export default function Tilt3D({ 
  children, 
  className = "", 
  maxTilt = 8, 
  glare = true, 
  scale = 1.02,
  perspective = 1000 
}) {
  const ref = useRef(null);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0);
  }, []);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Smooth physics-based spring smoothing
  const springConfig = { damping: 20, stiffness: 220, mass: 0.6 };
  const mouseXSpring = useSpring(x, springConfig);
  const mouseYSpring = useSpring(y, springConfig);

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], [maxTilt, -maxTilt]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], [-maxTilt, maxTilt]);

  // Glare position
  const [glarePos, setGlarePos] = useState({ x: 50, y: 50 });

  const handleMouseMove = (e) => {
    if (isTouchDevice || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;

    x.set(xPct);
    y.set(yPct);

    if (glare) {
      setGlarePos({
        x: Math.round((mouseX / width) * 100),
        y: Math.round((mouseY / height) * 100)
      });
    }
  };

  const handleMouseEnter = () => {
    if (!isTouchDevice) setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    x.set(0);
    y.set(0);
  };

  if (isTouchDevice) {
    return (
      <div className={`relative ${className}`}>
        {children}
      </div>
    );
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        perspective: `${perspective}px`,
        transformStyle: "preserve-3d",
        rotateX,
        rotateY,
        scale: isHovered ? scale : 1,
      }}
      transition={{ scale: { duration: 0.25, ease: "easeOut" } }}
      className={`relative will-change-transform ${className}`}
    >
      <div style={{ transformStyle: "preserve-3d" }} className="w-full h-full">
        {children}
      </div>

      {/* Dynamic Specular Glare Reflection */}
      {glare && (
        <motion.div
          animate={{ opacity: isHovered ? 0.35 : 0 }}
          transition={{ duration: 0.3 }}
          style={{
            background: `radial-gradient(circle 280px at ${glarePos.x}% ${glarePos.y}%, rgba(255, 255, 255, 0.65), transparent 70%)`,
          }}
          className="pointer-events-none absolute inset-0 rounded-2xl z-30 mix-blend-overlay"
        />
      )}
    </motion.div>
  );
}
