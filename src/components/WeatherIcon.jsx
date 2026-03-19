// LCD-style line-art weather icons — single color, glowing stroke
// All icons use a 48x48 viewBox, wrapped in <g> with transform for visual centering

const ICONS = {
  sunny: {
    // Circle + 8 rays — already symmetric around 24,24
    offset: [0, 0],
    paths: (
      <>
        <circle cx="24" cy="24" r="7" fill="none" strokeWidth="1.5" />
        {[0, 45, 90, 135, 180, 225, 270, 315].map(angle => {
          const rad = (angle * Math.PI) / 180
          return (
            <line
              key={angle}
              x1={24 + 11 * Math.cos(rad)}
              y1={24 + 11 * Math.sin(rad)}
              x2={24 + 15 * Math.cos(rad)}
              y2={24 + 15 * Math.sin(rad)}
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          )
        })}
      </>
    ),
  },

  cloudy: {
    // Cloud: x 6→34, y 13→30 → center at (20, 21.5), shift to (24, 24)
    offset: [0, 0],
    paths: (
      <path
        d="M11 30 C7.5 30 5 27.5 5 24.5 C5 22 7 20 9.5 19.5 C10 16 13 13.5 16.5 13.5 C19.5 13.5 22 15.5 23 18 C23.5 17.8 24 17.7 24.5 17.7 C27.5 17.7 30 20 30 23 C30 23.5 29.9 24 29.8 24.4 C31.5 25 33 26.5 33 28.5 C33 30 31 30.5 29 30.5 L11 30 Z"
        fill="none"
        strokeWidth="1.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    ),
  },

  rain: {
    offset: [0, 0],
    paths: (
      <>
        <path
          d="M11 24 C8 24 5.5 22 5.5 19.5 C5.5 17.3 7.5 15.5 9.5 15.1 C10 12.2 12.5 10 15.5 10 C18 10 20.2 11.5 21.2 13.7 C21.7 13.5 22.2 13.4 22.7 13.4 C25 13.4 27 15.3 27 17.8 C27 18.2 26.9 18.5 26.8 18.9 C28.5 19.3 30 20.8 30 22.5 C30 24 28.5 24.5 27 24.5"
          fill="none"
          strokeWidth="1.5"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        <line x1="12" y1="28" x2="10.5" y2="32" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="18" y1="28" x2="16.5" y2="32" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="24" y1="28" x2="22.5" y2="32" strokeWidth="1.5" strokeLinecap="round" />
      </>
    ),
  },

  snow: {
    offset: [0, 0],
    paths: (
      <>
        <path
          d="M11 24 C8 24 5.5 22 5.5 19.5 C5.5 17.3 7.5 15.5 9.5 15.1 C10 12.2 12.5 10 15.5 10 C18 10 20.2 11.5 21.2 13.7 C21.7 13.5 22.2 13.4 22.7 13.4 C25 13.4 27 15.3 27 17.8 C27 18.2 26.9 18.5 26.8 18.9 C28.5 19.3 30 20.8 30 22.5 C30 24 28.5 24.5 27 24.5"
          fill="none"
          strokeWidth="1.5"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        <circle cx="12" cy="30" r="1.5" fill="none" strokeWidth="1.2" />
        <circle cx="18" cy="32" r="1.5" fill="none" strokeWidth="1.2" />
        <circle cx="24" cy="29" r="1.5" fill="none" strokeWidth="1.2" />
      </>
    ),
  },

  storm: {
    offset: [0, 0],
    paths: (
      <>
        <path
          d="M11 22 C8 22 5.5 20 5.5 17.5 C5.5 15.3 7.5 13.5 9.5 13.1 C10 10.2 12.5 8 15.5 8 C18 8 20.2 9.5 21.2 11.7 C21.7 11.5 22.2 11.4 22.7 11.4 C25 11.4 27 13.3 27 15.8 C27 16.2 26.9 16.5 26.8 16.9 C28.5 17.3 30 18.8 30 20.5 C30 22 28.5 22.5 27 22.5"
          fill="none"
          strokeWidth="1.5"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        <polyline
          points="20,24 16,30 21,30 17,36"
          fill="none"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </>
    ),
  },
}

const BG_TO_ICON = {
  sunny: 'sunny',
  cloudy: 'cloudy',
  rain: 'rain',
  snow: 'snow',
  storm: 'storm',
}

export default function WeatherIcon({ weatherBg, color, glowColor, size = 52 }) {
  const iconKey = BG_TO_ICON[weatherBg] || 'cloudy'
  const icon = ICONS[iconKey]

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 38 38"
      fill="none"
      stroke={color}
      style={{
        filter: `drop-shadow(0 0 6px ${glowColor})`,
        transition: 'filter 0.3s',
      }}
    >
      <g transform={`translate(${icon.offset[0]}, ${icon.offset[1]})`}>
        {icon.paths}
      </g>
    </svg>
  )
}
