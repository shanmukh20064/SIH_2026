import React from 'react';

/**
 * High-fidelity Vector Watermark matching Image 1:
 * Tilted certificate document with inner card, text lines,
 * 12-scalloped rosette wax seal, bold checkmark, and notched ribbon tails.
 */
export default function SidebarWatermark({ className = '' }) {
  return (
    <svg
      viewBox="0 0 240 280"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`pointer-events-none select-none ${className}`}
    >
      <defs>
        {/* Subtle glow filter */}
        <filter id="subtle-glow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="1" stdDeviation="2" floodColor="#5D8D7E" floodOpacity="0.3" />
        </filter>
        {/* Soft 3D shadow gradient */}
        <linearGradient id="docShadowGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#0B372F" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#05241D" stopOpacity="0.2" />
        </linearGradient>
      </defs>

      <g transform="rotate(-6 120 140)" filter="url(#subtle-glow)">
        {/* Soft 3D Perspective Shadow under document */}
        <path
          d="M 28 40 L 14 65 L 14 235 L 36 215 Z"
          fill="url(#docShadowGrad)"
          opacity="0.7"
        />

        {/* Main Document Body with Dog-eared Top-Right Corner */}
        <path
          d="M 36 32
             L 138 32
             L 174 68
             L 174 218
             A 14 14 0 0 1 160 232
             L 50 232
             A 14 14 0 0 1 36 218
             Z"
          fill="#0D352C"
          fillOpacity="0.45"
          stroke="#5D8D7E"
          strokeWidth="2.8"
          strokeLinejoin="round"
        />

        {/* Folded Dog-ear Triangle */}
        <path
          d="M 138 32
             L 138 66
             A 2 2 0 0 0 140 68
             L 174 68
             Z"
          fill="#144338"
          stroke="#5D8D7E"
          strokeWidth="2.8"
          strokeLinejoin="round"
        />

        {/* Inner Card Block on Left */}
        <rect
          x="54"
          y="62"
          width="44"
          height="54"
          rx="6"
          fill="#17493D"
          fillOpacity="0.6"
          stroke="#5D8D7E"
          strokeWidth="2.4"
        />

        {/* 3 Horizontal Pill Lines (Top Right) */}
        <line x1="108" y1="68" x2="154" y2="68" stroke="#5D8D7E" strokeWidth="3.2" strokeLinecap="round" />
        <line x1="108" y1="84" x2="154" y2="84" stroke="#5D8D7E" strokeWidth="3.2" strokeLinecap="round" />
        <line x1="108" y1="100" x2="138" y2="100" stroke="#5D8D7E" strokeWidth="3.2" strokeLinecap="round" />

        {/* 2 Horizontal Pill Lines (Lower Half) */}
        <line x1="54" y1="134" x2="114" y2="134" stroke="#5D8D7E" strokeWidth="3.2" strokeLinecap="round" />
        <line x1="54" y1="150" x2="94" y2="150" stroke="#5D8D7E" strokeWidth="3.2" strokeLinecap="round" />

        {/* Hanging Ribbons below Seal with notched swallowtail ends */}
        {/* Left Ribbon */}
        <path
          d="M 140 185
             L 136 226
             L 146 218
             L 154 226
             L 150 185
             Z"
          fill="#144338"
          stroke="#5D8D7E"
          strokeWidth="2.4"
          strokeLinejoin="round"
        />
        {/* Right Ribbon */}
        <path
          d="M 154 185
             L 156 226
             L 165 218
             L 173 226
             L 166 185
             Z"
          fill="#144338"
          stroke="#5D8D7E"
          strokeWidth="2.4"
          strokeLinejoin="round"
        />

        {/* 12-Scalloped Rosette Wax Seal / Medal */}
        <path
          d="M 158 140
             C 160 135, 165 133, 169 135
             C 174 136, 178 133, 180 128
             C 183 124, 188 123, 191 127
             C 195 130, 200 129, 201 124
             C 203 119, 209 119, 211 124
             C 213 129, 218 130, 222 127
             C 225 123, 230 125, 231 130
             C 232 135, 236 138, 241 138
             C 245 138, 248 143, 246 148
             C 244 153, 246 158, 250 161
             C 253 165, 251 170, 246 172
             C 241 174, 238 179, 239 184
             C 239 189, 234 193, 229 191
             C 224 190, 219 193, 217 198
             C 215 203, 209 204, 206 200
             C 202 196, 196 197, 194 202
             C 191 206, 185 205, 184 200
             C 183 195, 178 193, 173 195
             C 168 197, 164 193, 165 188
             C 165 183, 161 179, 156 177
             C 151 175, 150 169, 153 166
             C 156 162, 155 157, 151 153
             C 148 149, 150 144, 155 142
             Z"
          fill="#17493D"
          stroke="#5D8D7E"
          strokeWidth="2.8"
          strokeLinejoin="round"
          transform="translate(-32, -10)"
        />

        {/* Checkmark inside Wax Seal */}
        <path
          d="M 152 154
             L 163 165
             L 182 144"
          stroke="#6FA898"
          strokeWidth="3.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
    </svg>
  );
}
