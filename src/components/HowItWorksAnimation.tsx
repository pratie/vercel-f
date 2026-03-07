'use client';

import { useEffect, useState } from 'react';

export function HowItWorksAnimation() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setStep((prev) => (prev + 1) % 4);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full max-w-2xl mx-auto">
      <svg
        viewBox="0 0 800 260"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-auto"
      >
        <defs>
          {/* Gradient for active elements */}
          <linearGradient id="activeGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#f97316" />
            <stop offset="100%" stopColor="#f59e0b" />
          </linearGradient>
          <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#f97316" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#f97316" stopOpacity="0.1" />
          </linearGradient>
          {/* Glow filter */}
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          {/* Pulse animation */}
          <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2" stdDeviation="4" floodColor="#00000012" />
          </filter>
        </defs>

        {/* ── Step 1: URL Input ── */}
        <g style={{ opacity: step >= 0 ? 1 : 0.3, transition: 'opacity 0.6s ease' }}>
          {/* Card */}
          <rect x="20" y="60" width="160" height="140" rx="16" fill="white" stroke={step === 0 ? '#f97316' : '#e5e7eb'} strokeWidth={step === 0 ? 2 : 1} filter="url(#softShadow)">
            {step === 0 && <animate attributeName="stroke-opacity" values="1;0.5;1" dur="2s" repeatCount="indefinite" />}
          </rect>
          {/* Globe icon */}
          <circle cx="55" cy="100" r="14" fill={step === 0 ? '#fff7ed' : '#f9fafb'} stroke={step === 0 ? '#f97316' : '#d1d5db'} strokeWidth="1.5">
            {step === 0 && <animate attributeName="r" values="14;15;14" dur="2s" repeatCount="indefinite" />}
          </circle>
          <path d="M55 88.5c-6.35 0-11.5 5.15-11.5 11.5s5.15 11.5 11.5 11.5 11.5-5.15 11.5-11.5-5.15-11.5-11.5-11.5zm0 2c1.2 0 2.55 1.8 3.2 5h-6.4c.65-3.2 2-5 3.2-5zm-4.1 5h-3.5c.7-2.2 2.3-4 4.3-4.8-.8 1.2-1.3 2.9-1.6 4.8h.8zm-3.5 2h3.5c.05.7.15 1.35.3 2h-3.1c-.4-.6-.6-1.3-.7-2zm4.3 4.8c-2-0.8-3.6-2.6-4.3-4.8h3.5c.3 1.9.8 3.6 1.6 4.8h-.8zm3.3 1.2c-1.2 0-2.55-1.8-3.2-5h6.4c-.65 3.2-2 5-3.2 5zm3.5-5h.8c-.3-1.9-.8-3.6-1.6-4.8 2 .8 3.6 2.6 4.3 4.8h-3.5zm.8 2h3.5c-.1.7-.3 1.4-.7 2h-3.1c.15-.65.25-1.3.3-2zm.8-6.8c.8 1.2 1.3 2.9 1.6 4.8h-3.5c-.7-2.2-2.3-4-4.3-4.8h6.2z" fill={step === 0 ? '#f97316' : '#9ca3af'} fillRule="evenodd" opacity="0.7" />
          {/* URL text */}
          <rect x="75" y="93" width="90" height="14" rx="3" fill={step === 0 ? '#fff7ed' : '#f3f4f6'} />
          <text x="80" y="103" fontSize="8" fill={step === 0 ? '#ea580c' : '#9ca3af'} fontFamily="ui-monospace, monospace" fontWeight="500">yoursite.com</text>
          {/* Cursor blink on step 0 */}
          {step === 0 && (
            <rect x="137" y="94" width="1.5" height="12" rx="0.5" fill="#f97316">
              <animate attributeName="opacity" values="1;0;1" dur="1s" repeatCount="indefinite" />
            </rect>
          )}
          {/* Label */}
          <text x="100" y="145" textAnchor="middle" fontSize="9" fill="#6b7280" fontFamily="system-ui" fontWeight="600">Paste URL</text>
          {/* Subtitle */}
          <text x="100" y="158" textAnchor="middle" fontSize="7.5" fill="#9ca3af" fontFamily="system-ui">We handle the rest</text>
          {/* Step number */}
          <circle cx="100" cy="52" r="10" fill={step === 0 ? 'url(#activeGrad)' : '#f3f4f6'} />
          <text x="100" y="55.5" textAnchor="middle" fontSize="8" fill={step === 0 ? 'white' : '#9ca3af'} fontFamily="system-ui" fontWeight="700">1</text>
        </g>

        {/* ── Connector 1→2 ── */}
        <g>
          <line x1="185" y1="130" x2="240" y2="130" stroke={step >= 1 ? '#f97316' : '#e5e7eb'} strokeWidth="1.5" strokeDasharray="4 3" style={{ transition: 'stroke 0.6s ease' }}>
            {step === 1 && <animate attributeName="stroke-dashoffset" from="20" to="0" dur="1s" repeatCount="indefinite" />}
          </line>
          <polygon points="237,126 245,130 237,134" fill={step >= 1 ? '#f97316' : '#d1d5db'} style={{ transition: 'fill 0.6s ease' }} />
        </g>

        {/* ── Step 2: AI Scraping ── */}
        <g style={{ opacity: step >= 1 ? 1 : 0.3, transition: 'opacity 0.6s ease' }}>
          <rect x="250" y="60" width="160" height="140" rx="16" fill="white" stroke={step === 1 ? '#f97316' : '#e5e7eb'} strokeWidth={step === 1 ? 2 : 1} filter="url(#softShadow)">
            {step === 1 && <animate attributeName="stroke-opacity" values="1;0.5;1" dur="2s" repeatCount="indefinite" />}
          </rect>
          {/* Python/AI icon - brain with code */}
          <circle cx="295" cy="95" r="10" fill={step === 1 ? '#fff7ed' : '#f9fafb'} stroke={step === 1 ? '#f97316' : '#d1d5db'} strokeWidth="1" />
          <text x="295" y="98.5" textAnchor="middle" fontSize="10" fill={step === 1 ? '#f97316' : '#9ca3af'}>{ '{}'}</text>
          {/* Scanning lines */}
          {[0, 1, 2].map((i) => (
            <g key={`scan-${i}`}>
              <rect x="315" y={88 + i * 10} width={step === 1 ? 70 - i * 15 : 50} height="5" rx="2.5" fill={step === 1 ? (i === 0 ? '#fed7aa' : i === 1 ? '#fdba74' : '#fb923c') : '#f3f4f6'} style={{ transition: 'all 0.6s ease' }}>
                {step === 1 && <animate attributeName="width" values={`${40 - i * 10};${70 - i * 15};${40 - i * 10}`} dur="2s" repeatCount="indefinite" />}
              </rect>
            </g>
          ))}
          {/* Extracting text */}
          <text x="330" y="138" textAnchor="middle" fontSize="9" fill="#6b7280" fontFamily="system-ui" fontWeight="600">AI Extracts</text>
          <text x="330" y="151" textAnchor="middle" fontSize="7.5" fill="#9ca3af" fontFamily="system-ui">Brand, keywords, context</text>
          {/* Spinning indicator */}
          {step === 1 && (
            <g transform="translate(370, 82)">
              <circle cx="0" cy="0" r="5" fill="none" stroke="#f97316" strokeWidth="1.5" strokeDasharray="10 20" strokeLinecap="round">
                <animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="1s" repeatCount="indefinite" />
              </circle>
            </g>
          )}
          <circle cx="330" cy="52" r="10" fill={step === 1 ? 'url(#activeGrad)' : '#f3f4f6'} />
          <text x="330" y="55.5" textAnchor="middle" fontSize="8" fill={step === 1 ? 'white' : '#9ca3af'} fontFamily="system-ui" fontWeight="700">2</text>
        </g>

        {/* ── Connector 2→3 ── */}
        <g>
          <line x1="415" y1="130" x2="470" y2="130" stroke={step >= 2 ? '#f97316' : '#e5e7eb'} strokeWidth="1.5" strokeDasharray="4 3" style={{ transition: 'stroke 0.6s ease' }}>
            {step === 2 && <animate attributeName="stroke-dashoffset" from="20" to="0" dur="1s" repeatCount="indefinite" />}
          </line>
          <polygon points="467,126 475,130 467,134" fill={step >= 2 ? '#f97316' : '#d1d5db'} style={{ transition: 'fill 0.6s ease' }} />
        </g>

        {/* ── Step 3: Find Discussions ── */}
        <g style={{ opacity: step >= 2 ? 1 : 0.3, transition: 'opacity 0.6s ease' }}>
          <rect x="480" y="60" width="160" height="140" rx="16" fill="white" stroke={step === 2 ? '#f97316' : '#e5e7eb'} strokeWidth={step === 2 ? 2 : 1} filter="url(#softShadow)">
            {step === 2 && <animate attributeName="stroke-opacity" values="1;0.5;1" dur="2s" repeatCount="indefinite" />}
          </rect>
          {/* Reddit icon */}
          <circle cx="510" cy="90" r="9" fill={step === 2 ? '#FF4500' : '#d1d5db'} style={{ transition: 'fill 0.6s ease' }}>
            {step === 2 && <animate attributeName="r" values="9;10;9" dur="2s" repeatCount="indefinite" />}
          </circle>
          <text x="510" y="93.5" textAnchor="middle" fontSize="9" fill="white" fontFamily="system-ui" fontWeight="700">R</text>
          {/* X icon */}
          <circle cx="535" cy="90" r="9" fill={step === 2 ? '#111827' : '#d1d5db'} style={{ transition: 'fill 0.6s ease' }}>
            {step === 2 && <animate attributeName="r" values="9;10;9" dur="2s" begin="0.3s" repeatCount="indefinite" />}
          </circle>
          <text x="535" y="93.5" textAnchor="middle" fontSize="9" fill="white" fontFamily="system-ui" fontWeight="700">X</text>
          {/* Discussion cards */}
          {[0, 1, 2].map((i) => (
            <g key={`disc-${i}`} style={{ opacity: step === 2 ? 1 : 0.5, transition: `opacity 0.6s ease ${i * 0.15}s` }}>
              <rect x="497" y={108 + i * 16} width={step >= 2 ? 130 : 100} height="12" rx="4" fill={i === 0 ? '#fef3c7' : i === 1 ? '#dbeafe' : '#f3e8ff'} stroke={i === 0 ? '#fcd34d' : i === 1 ? '#93c5fd' : '#c4b5fd'} strokeWidth="0.5" style={{ transition: 'width 0.6s ease' }}>
                {step === 2 && <animate attributeName="opacity" values="0.7;1;0.7" dur="2s" begin={`${i * 0.2}s`} repeatCount="indefinite" />}
              </rect>
              <rect x="502" y={111 + i * 16} width={45 + i * 8} height="5" rx="2" fill={i === 0 ? '#f59e0b' : i === 1 ? '#3b82f6' : '#8b5cf6'} opacity="0.3" />
            </g>
          ))}
          <text x="560" y="164" textAnchor="middle" fontSize="9" fill="#6b7280" fontFamily="system-ui" fontWeight="600">Find Discussions</text>
          <text x="560" y="177" textAnchor="middle" fontSize="7.5" fill="#9ca3af" fontFamily="system-ui">Reddit, X & more</text>
          <circle cx="560" cy="52" r="10" fill={step === 2 ? 'url(#activeGrad)' : '#f3f4f6'} />
          <text x="560" y="55.5" textAnchor="middle" fontSize="8" fill={step === 2 ? 'white' : '#9ca3af'} fontFamily="system-ui" fontWeight="700">3</text>
        </g>

        {/* ── Connector 3→4 ── */}
        <g>
          <line x1="645" y1="130" x2="700" y2="130" stroke={step >= 3 ? '#f97316' : '#e5e7eb'} strokeWidth="1.5" strokeDasharray="4 3" style={{ transition: 'stroke 0.6s ease' }}>
            {step === 3 && <animate attributeName="stroke-dashoffset" from="20" to="0" dur="1s" repeatCount="indefinite" />}
          </line>
          <polygon points="697,126 705,130 697,134" fill={step >= 3 ? '#f97316' : '#d1d5db'} style={{ transition: 'fill 0.6s ease' }} />
        </g>

        {/* ── Step 4: Results Dashboard ── */}
        <g style={{ opacity: step >= 3 ? 1 : 0.3, transition: 'opacity 0.6s ease' }}>
          <rect x="710" y="60" width="72" height="140" rx="16" fill="white" stroke={step === 3 ? '#f97316' : '#e5e7eb'} strokeWidth={step === 3 ? 2 : 1} filter="url(#softShadow)">
            {step === 3 && <animate attributeName="stroke-opacity" values="1;0.5;1" dur="2s" repeatCount="indefinite" />}
          </rect>
          {/* Chart bars */}
          {[0, 1, 2, 3].map((i) => {
            const heights = [30, 45, 25, 50];
            const colors = ['#f97316', '#3b82f6', '#10b981', '#8b5cf6'];
            return (
              <rect
                key={`bar-${i}`}
                x={725 + i * 12}
                y={step === 3 ? 130 - heights[i] : 120}
                width="8"
                rx="2"
                height={step === 3 ? heights[i] : 10}
                fill={step === 3 ? colors[i] : '#e5e7eb'}
                style={{ transition: 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1)' }}
              >
                {step === 3 && <animate attributeName="height" values={`${heights[i] - 5};${heights[i]};${heights[i] - 5}`} dur="2.5s" begin={`${i * 0.15}s`} repeatCount="indefinite" />}
              </rect>
            );
          })}
          {/* Checkmark */}
          {step === 3 && (
            <g filter="url(#glow)">
              <circle cx="746" cy="160" r="8" fill="#10b981">
                <animate attributeName="r" values="6;8;6" dur="2s" repeatCount="indefinite" />
              </circle>
              <path d="M742 160l2.5 2.5 5-5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            </g>
          )}
          <text x="746" y="185" textAnchor="middle" fontSize="8" fill="#6b7280" fontFamily="system-ui" fontWeight="600">Done!</text>
          <circle cx="746" cy="52" r="10" fill={step === 3 ? 'url(#activeGrad)' : '#f3f4f6'} />
          <text x="746" y="55.5" textAnchor="middle" fontSize="8" fill={step === 3 ? 'white' : '#9ca3af'} fontFamily="system-ui" fontWeight="700">4</text>
        </g>

        {/* ── Bottom progress bar ── */}
        <rect x="100" y="230" width="600" height="3" rx="1.5" fill="#f3f4f6" />
        <rect x="100" y="230" rx="1.5" height="3" fill="url(#activeGrad)" style={{ transition: 'width 0.6s ease' }} width={150 * (step + 1)} />

        {/* Step labels */}
        {['Enter URL', 'AI Scrapes', 'Find Leads', 'Results'].map((label, i) => (
          <text
            key={label}
            x={100 + i * 200}
            y="250"
            textAnchor="middle"
            fontSize="8"
            fill={step === i ? '#f97316' : '#9ca3af'}
            fontFamily="system-ui"
            fontWeight={step === i ? '600' : '400'}
            style={{ transition: 'fill 0.3s ease' }}
          >
            {label}
          </text>
        ))}
      </svg>
    </div>
  );
}
