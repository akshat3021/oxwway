import { ImageResponse } from 'next/og';

// Route segment config
export const runtime = 'edge';

// Image metadata
export const size = {
  width: 32,
  height: 32,
};
export const contentType = 'image/png';

// Image generation
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 24,
          background: 'transparent',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <svg viewBox="0 0 200 200" width="32" height="32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <g transform="translate(10, 0) scale(1.1)">
            {/* Horns */}
            <path 
              d="M30 60 C50 20 120 -10 160 30 C120 10 70 30 50 80 Z" 
              fill="white"
            />
            <path 
              d="M100 80 C120 50 160 40 180 70 C150 50 120 70 100 100 Z" 
              fill="white"
            />
            {/* Simple Eye representation */}
            <polygon 
              points="110,120 125,130 115,135 105,125" 
              fill="#E8342A"
            />
          </g>
        </svg>
      </div>
    ),
    { ...size }
  );
}
