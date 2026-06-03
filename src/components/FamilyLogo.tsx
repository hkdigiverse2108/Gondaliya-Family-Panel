import React from 'react';

interface FamilyLogoProps {
  size?: number | string;
  showText?: boolean;
  variant?: 'full' | 'badge' | 'tree-only';
}

export const FamilyLogo: React.FC<FamilyLogoProps> = ({ 
  size = '100%', 
  variant = 'full'
}) => {
  // Center of our SVG grid
  const cx = 200;
  const cy = 180;
  const rOuter = 145;
  const rInner = 138;
  const rGreenCircle = 110;

  // Programmatically generate a beautiful scalloped (serrated) circle path for the outer badge
  const generateScallops = (steps: number) => {
    const points = [];
    const rOut = rOuter;
    const rIn = rInner;
    
    for (let i = 0; i < steps; i++) {
      const angle1 = (i * 2 * Math.PI) / steps;
      const angle2 = ((i + 0.5) * 2 * Math.PI) / steps;
      const angle3 = ((i + 1) * 2 * Math.PI) / steps;
      
      const x1 = cx + rOut * Math.cos(angle1);
      const y1 = cy + rOut * Math.sin(angle1);
      const x3 = cx + rOut * Math.cos(angle3);
      const y3 = cy + rOut * Math.sin(angle3);
      
      if (i === 0) {
        points.push(`M ${x1} ${y1}`);
      }
      // Draw a quadratic curve bending outwards slightly to form perfect round scallops
      const ctrlX = cx + (rIn * 1.06) * Math.cos(angle2);
      const ctrlY = cy + (rIn * 1.06) * Math.sin(angle2);
      points.push(`Q ${ctrlX} ${ctrlY} ${x3} ${y3}`);
    }
    return points.join(' ') + ' Z';
  };

  const scallopedPath = generateScallops(64);

  // SVG text path: a perfect semicircle for circular text at the top
  // Path goes from left to right over the top: M (cx-r),cy A r,r 0 0,1 (cx+r),cy
  const textPathR = 122;
  const topTextPath = `M ${cx - textPathR},${cy} A ${textPathR},${textPathR} 0 0,1 ${cx + textPathR},${cy}`;

  // SVG path for bottom circular text if needed, but the ribbon handles the bottom text
  
  if (variant === 'tree-only') {
    return (
      <svg viewBox="0 0 240 240" width={size} height={size} style={{ display: 'block' }}>
        {/* Simple elegant circular tree for minimal spaces */}
        <circle cx="120" cy="120" r="100" fill="#129B63" />
        <circle cx="120" cy="120" r="95" fill="none" stroke="#ffffff" strokeWidth="2" />
        <g transform="translate(-80, -60)">
          {/* Main Tree Trunk */}
          <path d="M190,260 L210,260 C210,225 215,210 220,195 C230,175 235,160 215,140 C210,135 200,140 195,145 C185,155 175,170 180,195 C185,210 190,225 190,260 Z" fill="#ffffff" />
          {/* Trunk branches */}
          <path d="M185,200 C165,190 150,175 145,150 C160,150 170,165 180,180 Z" fill="#ffffff" />
          <path d="M215,205 C235,195 245,175 250,155 C235,155 225,170 215,185 Z" fill="#ffffff" />
          <path d="M200,180 C200,160 195,140 185,120 C195,115 205,125 205,145 Z" fill="#ffffff" />
          
          {/* Leaves - Figures */}
          {/* Top Center Figure */}
          <circle cx="195" cy="100" r="6" fill="#ffffff" />
          <path d="M185,120 C185,108 205,108 205,120 C198,116 192,116 185,120 Z" fill="#ffffff" />
          {/* Left Top Figure */}
          <circle cx="155" cy="115" r="6" fill="#ffffff" />
          <path d="M145,135 C145,123 165,123 165,135 C158,131 152,131 145,135 Z" fill="#ffffff" />
          {/* Right Top Figure */}
          <circle cx="235" cy="115" r="6" fill="#ffffff" />
          <path d="M225,135 C225,123 245,123 245,135 C238,131 232,131 225,135 Z" fill="#ffffff" />
          {/* Mid Left Figure */}
          <circle cx="130" cy="142" r="6" fill="#ffffff" />
          <path d="M120,160 C120,148 140,148 140,160 C133,156 127,156 120,160 Z" fill="#ffffff" />
          {/* Mid Right Figure */}
          <circle cx="260" cy="142" r="6" fill="#ffffff" />
          <path d="M250,160 C250,148 270,148 270,160 C263,156 257,156 250,160 Z" fill="#ffffff" />
        </g>
      </svg>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: size === '100%' ? '100%' : undefined }}>
      <svg 
        viewBox="0 0 400 400" 
        width={size} 
        height={size} 
        style={{ display: 'block', overflow: 'visible', filter: 'drop-shadow(0px 8px 24px rgba(46, 49, 146, 0.15))' }}
      >
        <defs>
          {/* Soft premium shadow definition */}
          <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="8" stdDeviation="6" floodColor="#000000" floodOpacity="0.2" />
          </filter>
          
          {/* Metallic gradient for ribbon borders */}
          <linearGradient id="ribbonGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#129B63" />
            <stop offset="50%" stopColor="#17C37D" />
            <stop offset="100%" stopColor="#0B6A43" />
          </linearGradient>
          
          {/* Path for text to curve around */}
          <path id="curve-text" d={topTextPath} />
        </defs>

        {/* 1. Scalloped Outer Badge in Gondaliya Navy Blue */}
        <path 
          d={scallopedPath} 
          fill="#2E3192" 
          stroke="#ffffff" 
          strokeWidth="3.5"
          filter="url(#shadow)"
        />

        {/* 2. White Circle Divider */}
        <circle cx={cx} cy={cy} r={rGreenCircle + 6} fill="none" stroke="#ffffff" strokeWidth="2.5" strokeDasharray="6,4" opacity="0.8" />

        {/* 3. Emerald Green Inner Circle */}
        <circle 
          cx={cx} 
          cy={cy} 
          r={rGreenCircle} 
          fill="#129B63" 
          stroke="#ffffff" 
          strokeWidth="3"
        />

        {/* 4. Elegant circular text running across the top navy space */}
        <text fill="#ffffff" style={{ fontFamily: '"Plus Jakarta Sans", "Outfit", sans-serif', fontWeight: 800, letterSpacing: '2.5px', fontSize: '15.5px' }}>
          <textPath href="#curve-text" startOffset="50%" textAnchor="middle">
            સમસ્ત ગોંડલીયા પટેલ પરિવાર
          </textPath>
        </text>

        {/* Decorative side dots on the navy ring */}
        <circle cx={cx - 128} cy={cy + 40} r="4" fill="#ffffff" />
        <circle cx={cx - 122} cy={cy + 52} r="3" fill="#ffffff" />
        <circle cx={cx - 114} cy={cy + 63} r="2" fill="#ffffff" />
        
        <circle cx={cx + 128} cy={cy + 40} r="4" fill="#ffffff" />
        <circle cx={cx + 122} cy={cy + 52} r="3" fill="#ffffff" />
        <circle cx={cx + 114} cy={cy + 63} r="2" fill="#ffffff" />

        {/* 5. The Family Tree of Life (White Silhouette) */}
        <g id="family-tree" transform="translate(10, 10)">
          {/* Main Solid Trunk */}
          <path 
            d="M 190,260 C 190,240 185,225 180,215 C 172,203 162,192 162,175 C 162,160 178,145 190,145 C 202,145 218,160 218,175 C 218,192 208,203 200,215 C 195,225 190,240 190,260 Z" 
            fill="#ffffff" 
          />
          {/* Left Branch */}
          <path 
            d="M 175,200 C 158,192 145,178 140,158 C 152,158 162,170 170,182 Z" 
            fill="#ffffff" 
          />
          {/* Right Branch */}
          <path 
            d="M 205,200 C 222,192 235,178 240,158 C 228,158 218,170 210,182 Z" 
            fill="#ffffff" 
          />
          {/* Inner Branches */}
          <path 
            d="M 183,170 C 173,158 170,140 170,128 C 178,135 183,148 187,158 Z" 
            fill="#ffffff" 
          />
          {/* Right Inner Branch */}
          <path 
            d="M 197,170 C 207,158 210,140 210,128 C 202,135 197,148 193,158 Z" 
            fill="#ffffff" 
          />

          {/* 6. Human Leaves (Heads & Arcs for upraised arms/bodies) */}
          {/* Center Main Leaf (The Leader) */}
          <circle cx="190" cy="110" r="7.5" fill="#ffffff" />
          <path d="M 176,132 C 176,118 204,118 204,132 C 196,128 184,128 176,132 Z" fill="#ffffff" />

          {/* Left Top Leaf */}
          <circle cx="152" cy="120" r="7" fill="#ffffff" />
          <path d="M 139,140 C 139,127 165,127 165,140 C 158,136 146,136 139,140 Z" fill="#ffffff" />

          {/* Right Top Leaf */}
          <circle cx="228" cy="120" r="7" fill="#ffffff" />
          <path d="M 215,140 C 215,127 241,127 241,140 C 234,136 222,136 215,140 Z" fill="#ffffff" />

          {/* Middle Left Leaf */}
          <circle cx="126" cy="144" r="7" fill="#ffffff" />
          <path d="M 113,164 C 113,151 139,151 139,164 C 132,160 120,160 113,164 Z" fill="#ffffff" />

          {/* Middle Right Leaf */}
          <circle cx="254" cy="144" r="7" fill="#ffffff" />
          <path d="M 241,164 C 241,151 267,151 267,164 C 260,160 248,160 241,164 Z" fill="#ffffff" />

          {/* Lower Left Leaf */}
          <circle cx="118" cy="178" r="6" fill="#ffffff" />
          <path d="M 107,195 C 107,184 129,184 129,195 C 123,191 113,191 107,195 Z" fill="#ffffff" />

          {/* Lower Right Leaf */}
          <circle cx="262" cy="178" r="6" fill="#ffffff" />
          <path d="M 251,195 C 251,184 273,184 273,195 C 267,191 257,191 251,195 Z" fill="#ffffff" />

          {/* Tiny Inner Growth Leaves */}
          <circle cx="174" cy="98" r="5" fill="#ffffff" />
          <path d="M 166,112 Q 174,106 182,112 Z" fill="#ffffff" />
          
          <circle cx="206" cy="98" r="5" fill="#ffffff" />
          <path d="M 198,112 Q 206,106 214,112 Z" fill="#ffffff" />
        </g>

        {/* 7. Beautiful Flowing Bottom Motto Ribbon (3D Effect) */}
        {variant === 'full' && (
          <g id="ribbon" filter="url(#shadow)">
            {/* Left Fold Shadows */}
            <path d="M 52,342 L 80,314 L 80,344 Z" fill="#094A30" />
            <path d="M 80,344 L 102,320 L 102,352 Z" fill="#0B6A43" />
            
            {/* Right Fold Shadows */}
            <path d="M 348,342 L 320,314 L 320,344 Z" fill="#094A30" />
            <path d="M 320,344 L 298,320 L 298,352 Z" fill="#0B6A43" />

            {/* Left Ribbon End (Split tail) */}
            <path d="M 48,350 L 80,314 L 80,344 L 52,364 Z" fill="#129B63" stroke="#0B6A43" strokeWidth="1.5" />
            
            {/* Right Ribbon End (Split tail) */}
            <path d="M 352,350 L 320,314 L 320,344 L 348,364 Z" fill="#129B63" stroke="#0B6A43" strokeWidth="1.5" />

            {/* Front Ribbon Face (Gracefully Curved Banner) */}
            <path 
              d="M 74,320 C 130,346 270,346 326,320 L 326,355 C 270,381 130,381 74,355 Z" 
              fill="url(#ribbonGrad)" 
              stroke="#ffffff" 
              strokeWidth="2" 
            />

            {/* Motto Ribbon Text in Gujarati "સેવા • સહકાર • સંગઠન" */}
            <text 
              x={cx} 
              y={348} 
              textAnchor="middle" 
              fill="#ffffff" 
              style={{ 
                fontFamily: '"Plus Jakarta Sans", "Outfit", sans-serif', 
                fontWeight: 900, 
                fontSize: '15.5px', 
                letterSpacing: '1px',
                filter: 'drop-shadow(0px 2px 4px rgba(0,0,0,0.5))'
              }}
            >
              સેવા • સહકાર • સંગઠન
            </text>
          </g>
        )}
      </svg>
    </div>
  );
};

export default FamilyLogo;
