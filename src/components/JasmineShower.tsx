import React, { useMemo } from 'react';

interface JasmineFlowerProps {
  id: number;
  left: number;
  size: number;
  duration: number;
  delay: number;
  rotation: number;
  swayAmount: number;
  swayDuration: number;
  opacity: number;
}

export const JasmineShower: React.FC<{ isActive?: boolean }> = ({ isActive = true }) => {
  // Generate a continuous cascade of small, delicately translucent jasmine flowers
  const flowers: JasmineFlowerProps[] = useMemo(() => {
    const count = 28;
    return Array.from({ length: count }).map((_, i) => ({
      id: i,
      // Distribute evenly across width with jitter
      left: Math.min(96, Math.max(2, (i / count) * 100 + (Math.random() * 6 - 3))),
      // Small delicate sizes between 10px and 16px
      size: Math.floor(Math.random() * 7) + 10,
      // Gentle floating speed (8s - 14s)
      duration: Math.random() * 6 + 8,
      // Staggered delays so screen is immediately active with flowers
      delay: -(Math.random() * 10),
      rotation: Math.floor(Math.random() * 360),
      swayAmount: Math.random() * 26 + 14,
      swayDuration: Math.random() * 2.5 + 2.5,
      // Translucent opacity ("little transparent") for an ethereal, gentle atmosphere
      opacity: Math.random() * 0.22 + 0.32,
    }));
  }, []);

  if (!isActive) return null;

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none z-10 overflow-hidden select-none"
    >
      {flowers.map((f) => (
        <div
          key={f.id}
          className="absolute"
          style={{
            left: `${f.left}%`,
            top: '-25px',
            animation: `jasmineFall ${f.duration}s linear ${f.delay}s infinite`,
            opacity: f.opacity,
          }}
        >
          {/* Inner wrapper for gentle wind sway and 3D tumbling */}
          <div
            style={{
              animation: `jasmineSway ${f.swayDuration}s ease-in-out infinite alternate`,
              transform: `rotate(${f.rotation}deg)`,
            }}
          >
            {/* Authentic Delicately Translucent 5-Petal Jasmine Flower */}
            <svg
              width={f.size}
              height={f.size}
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="drop-shadow-[0_1px_2px_rgba(0,0,0,0.25)]"
            >
              <g transform="translate(12, 12)">
                {/* 5 Semi-Transparent White Jasmine Petals */}
                {[0, 72, 144, 216, 288].map((angle, idx) => (
                  <path
                    key={idx}
                    d="M 0,-1.5 C -2.8,-4 -3.6,-8.5 0,-11 C 3.6,-8.5 2.8,-4 0,-1.5 Z"
                    fill="rgba(255, 253, 248, 0.72)"
                    stroke="rgba(237, 229, 216, 0.45)"
                    strokeWidth="0.4"
                    transform={`rotate(${angle})`}
                  />
                ))}
                {/* Translucent Golden Yellow Center Stigma */}
                <circle cx="0" cy="0" r="2.2" fill="rgba(255, 215, 0, 0.78)" />
                <circle cx="0" cy="0" r="1.1" fill="rgba(255, 153, 51, 0.75)" />
              </g>
            </svg>
          </div>
        </div>
      ))}

      <style>{`
        @keyframes jasmineFall {
          0% {
            transform: translateY(-20px);
          }
          100% {
            transform: translateY(105vh);
          }
        }

        @keyframes jasmineSway {
          0% {
            transform: translateX(-16px) rotate(-15deg) scale(0.95);
          }
          50% {
            transform: translateX(12px) rotate(180deg) scale(1);
          }
          100% {
            transform: translateX(18px) rotate(345deg) scale(0.92);
          }
        }
      `}</style>
    </div>
  );
};
