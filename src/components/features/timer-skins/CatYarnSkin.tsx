'use client';

import { useEffect, useState } from 'react';

interface CatYarnSkinProps {
  percentage: number;
}

export default function CatYarnSkin({ percentage }: CatYarnSkinProps) {
  const [animationFrame, setAnimationFrame] = useState(0);
  
  // Smooth animation loop
  useEffect(() => {
    const interval = setInterval(() => {
      setAnimationFrame(prev => prev + 1);
    }, 50); // 20fps for smooth animation
    return () => clearInterval(interval);
  }, []);
  
  // Circular path parameters
  const centerX = 100;
  const centerY = 100;
  const radius = 55;
  
  // Base angle for circular movement (continuous rotation)
  const baseAngle = (animationFrame * 3) % 360; // Rotates 3 degrees per frame
  
  // Mouse is ahead, cat chases behind
  // Gap between them decreases as percentage decreases
  const gapAngle = (percentage / 100) * 90 + 10; // From 100° gap to 10° gap
  
  // Convert to radians
  const mouseAngleRad = (baseAngle * Math.PI) / 180;
  const catAngleRad = ((baseAngle - gapAngle) * Math.PI) / 180;
  
  // Calculate positions on circle
  const mouseX = centerX + Math.cos(mouseAngleRad) * radius;
  const mouseY = centerY + Math.sin(mouseAngleRad) * radius;
  
  const catX = centerX + Math.cos(catAngleRad) * radius;
  const catY = centerY + Math.sin(catAngleRad) * radius;
  
  // Cat catches mouse when percentage is 0
  const isCaught = percentage === 0;
  
  // Rotation angle for sprites to face movement direction
  const mouseRotation = baseAngle + 90;
  const catRotation = baseAngle - gapAngle + 90;
  
  // Tail wagging animation
  const tailWag = Math.sin(animationFrame / 3) * 10;
  
  // Running leg animation
  const legAnim = Math.sin(animationFrame / 2) * 3;

  return (
    <svg width="288" height="288" viewBox="0 0 200 200" className="mx-auto">
      <defs>
        <filter id="catMouseGlow">
          <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>

      {/* Mouse */}
      {!isCaught && (
        <g transform={`translate(${mouseX}, ${mouseY}) rotate(${mouseRotation})`}>
          {/* Mouse Body */}
          <ellipse
            cx="0"
            cy="0"
            rx="6"
            ry="5"
            fill="#9ca3af"
          />
          
          {/* Mouse Head */}
          <circle
            cx="5"
            cy="0"
            r="4"
            fill="#9ca3af"
          />
          
          {/* Mouse Ears */}
          <ellipse cx="6" cy="-4" rx="2.5" ry="3" fill="#9ca3af" />
          <ellipse cx="6" cy="-4" rx="1.5" ry="2" fill="#fca5a5" />
          
          {/* Mouse Eye */}
          <circle cx="7" cy="-1" r="0.8" fill="#1f2937" />
          
          {/* Mouse Nose */}
          <circle cx="9" cy="0" r="0.6" fill="#be185d" />
          
          {/* Mouse Whiskers */}
          <line x1="9" y1="-1" x2="12" y2="-2" stroke="#6b7280" strokeWidth="0.4" />
          <line x1="9" y1="0" x2="12" y2="0" stroke="#6b7280" strokeWidth="0.4" />
          <line x1="9" y1="1" x2="12" y2="2" stroke="#6b7280" strokeWidth="0.4" />
          
          {/* Mouse Tail */}
          <path
            d="M -6 0 Q -10 -2 -12 0 Q -14 2 -15 1"
            stroke="#9ca3af"
            strokeWidth="1.5"
            fill="none"
            strokeLinecap="round"
          />
          
          {/* Mouse Feet - animated */}
          <circle cx="-2" cy={4 + legAnim} r="1.2" fill="#9ca3af" />
          <circle cx="2" cy={4 - legAnim} r="1.2" fill="#9ca3af" />
        </g>
      )}

      {/* Cat */}
      {!isCaught ? (
        <g transform={`translate(${catX}, ${catY}) rotate(${catRotation})`}>
          {/* Cat Body */}
          <ellipse
            cx="0"
            cy="0"
            rx="12"
            ry="9"
            fill="#f97316"
          />
          
          {/* Cat stripes */}
          <path d="M -5 -3 L -5 3" stroke="#ea580c" strokeWidth="1.5" />
          <path d="M 0 -4 L 0 4" stroke="#ea580c" strokeWidth="1.5" />
          <path d="M 5 -3 L 5 3" stroke="#ea580c" strokeWidth="1.5" />
          
          {/* Cat Head */}
          <ellipse
            cx="10"
            cy="0"
            rx="8"
            ry="7"
            fill="#f97316"
          />
          
          {/* Cat Ears */}
          <path d="M 7 -6 L 9 -2 L 5 -4 Z" fill="#f97316" />
          <path d="M 15 -5 L 13 -1 L 17 -3 Z" fill="#f97316" />
          <path d="M 8 -5 L 9 -3 L 7 -4 Z" fill="#fb923c" />
          <path d="M 14 -4 L 13 -2 L 15 -3 Z" fill="#fb923c" />
          
          {/* Cat Eyes - focused */}
          <ellipse cx="8" cy="0" rx="1.5" ry="2" fill="#fbbf24" />
          <ellipse cx="8" cy="0" rx="0.4" ry="1.2" fill="#1f2937" />
          <ellipse cx="13" cy="0" rx="1.5" ry="2" fill="#fbbf24" />
          <ellipse cx="13" cy="0" rx="0.4" ry="1.2" fill="#1f2937" />
          
          {/* Cat Nose */}
          <path d="M 10 2 L 9 3.5 L 11 3.5 Z" fill="#be185d" />
          
          {/* Cat Mouth */}
          <path d="M 10 3.5 Q 8.5 5 8 4.5" stroke="#be185d" strokeWidth="0.6" fill="none" />
          <path d="M 10 3.5 Q 11.5 5 12 4.5" stroke="#be185d" strokeWidth="0.6" fill="none" />
          
          {/* Cat Whiskers */}
          <line x1="7" y1="2" x2="3" y2="1" stroke="#1f2937" strokeWidth="0.5" />
          <line x1="7" y1="3" x2="3" y2="4" stroke="#1f2937" strokeWidth="0.5" />
          <line x1="14" y1="2" x2="18" y2="1" stroke="#1f2937" strokeWidth="0.5" />
          <line x1="14" y1="3" x2="18" y2="4" stroke="#1f2937" strokeWidth="0.5" />
          
          {/* Cat Tail - wagging */}
          <path
            d={`M -12 0 Q -18 ${tailWag} -22 ${tailWag * 0.5}`}
            stroke="#f97316"
            strokeWidth="4"
            fill="none"
            strokeLinecap="round"
          />
          <circle cx="-15" cy={tailWag * 0.5} r="1" fill="#ea580c" />
          <circle cx="-19" cy={tailWag * 0.7} r="1" fill="#ea580c" />
          
          {/* Cat Paws - animated running */}
          <ellipse cx="-5" cy={8 + legAnim} rx="2.5" ry="3" fill="#f97316" />
          <ellipse cx="0" cy={8 - legAnim} rx="2.5" ry="3" fill="#f97316" />
          <ellipse cx="6" cy={8 + legAnim} rx="2.5" ry="3" fill="#f97316" />
          <ellipse cx="11" cy={8 - legAnim} rx="2.5" ry="3" fill="#f97316" />
        </g>
      ) : (
        /* Cat caught mouse - show in center */
        <g transform={`translate(${centerX}, ${centerY})`}>
          {/* Cat sitting with mouse */}
          <ellipse cx="0" cy="5" rx="15" ry="12" fill="#f97316" />
          
          {/* Cat stripes */}
          <path d="M -6 2 L -6 8" stroke="#ea580c" strokeWidth="1.5" />
          <path d="M 0 1 L 0 9" stroke="#ea580c" strokeWidth="1.5" />
          <path d="M 6 2 L 6 8" stroke="#ea580c" strokeWidth="1.5" />
          
          {/* Cat Head */}
          <ellipse cx="0" cy="-8" rx="10" ry="9" fill="#f97316" />
          
          {/* Cat Ears */}
          <path d="M -8 -15 L -5 -10 L -10 -12 Z" fill="#f97316" />
          <path d="M 8 -15 L 5 -10 L 10 -12 Z" fill="#f97316" />
          <path d="M -7 -13 L -6 -11 L -8 -12 Z" fill="#fb923c" />
          <path d="M 7 -13 L 6 -11 L 8 -12 Z" fill="#fb923c" />
          
          {/* Happy closed eyes */}
          <path d="M -5 -8 Q -3 -6 -1 -8" stroke="#1f2937" strokeWidth="1.5" fill="none" strokeLinecap="round" />
          <path d="M 1 -8 Q 3 -6 5 -8" stroke="#1f2937" strokeWidth="1.5" fill="none" strokeLinecap="round" />
          
          {/* Cat Nose */}
          <path d="M 0 -5 L -1.5 -3 L 1.5 -3 Z" fill="#be185d" />
          
          {/* Happy smile with mouse */}
          <path d="M -3 -2 Q 0 2 3 -2" stroke="#be185d" strokeWidth="1" fill="none" strokeLinecap="round" />
          
          {/* Mouse in mouth - peeking out */}
          <ellipse cx="0" cy="0" rx="3" ry="2" fill="#9ca3af" />
          <circle cx="2" cy="-1" r="1.5" fill="#9ca3af" />
          <ellipse cx="2.5" cy="-2.5" rx="1" ry="1.2" fill="#fca5a5" />
          
          {/* Cat Whiskers */}
          <line x1="-4" y1="-4" x2="-10" y2="-5" stroke="#1f2937" strokeWidth="0.6" />
          <line x1="-4" y1="-3" x2="-10" y2="-2" stroke="#1f2937" strokeWidth="0.6" />
          <line x1="4" y1="-4" x2="10" y2="-5" stroke="#1f2937" strokeWidth="0.6" />
          <line x1="4" y1="-3" x2="10" y2="-2" stroke="#1f2937" strokeWidth="0.6" />
          
          {/* Cat Tail - curled happily */}
          <path
            d="M 12 8 Q 20 5 22 0 Q 24 -5 20 -8"
            stroke="#f97316"
            strokeWidth="4"
            fill="none"
            strokeLinecap="round"
          />
          
          {/* Cat Paws */}
          <ellipse cx="-8" cy="15" rx="3" ry="4" fill="#f97316" />
          <ellipse cx="8" cy="15" rx="3" ry="4" fill="#f97316" />
          <circle cx="-8" cy="16" r="1.5" fill="#fb923c" />
          <circle cx="8" cy="16" r="1.5" fill="#fb923c" />
        </g>
      )}
      
      {/* Circular border with glow */}
      <circle
        cx="100"
        cy="100"
        r="95"
        fill="none"
        stroke="currentColor"
        strokeWidth="4"
        className={percentage > 20 ? 'text-orange-500' : 'text-orange-400'}
        filter="url(#catMouseGlow)"
      />
    </svg>
  );
}


