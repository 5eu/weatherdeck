import { useRef, useEffect, useState } from 'react'
import gsap from 'gsap'
import WeatherIcon from './WeatherIcon'

// Color variants for dual-frequency look
const LCD_THEMES = {
  green: {
    bright: '#7EFF6B',
    dim: '#3A7A30',
    glow: 'rgba(126,255,107,0.3)',
    glowSoft: 'rgba(126,255,107,0.2)',
    glowFaint: 'rgba(126,255,107,0.1)',
    glowData: 'rgba(126,255,107,0.15)',
  },
  blue: {
    bright: '#6BC5FF',
    dim: '#2A6A8A',
    glow: 'rgba(107,197,255,0.3)',
    glowSoft: 'rgba(107,197,255,0.2)',
    glowFaint: 'rgba(107,197,255,0.1)',
    glowData: 'rgba(107,197,255,0.15)',
  },
}

export default function LCDScreen({ weather, loading, timezone, isNightTime = false, variant = 'green', label = '', cityName = '', cities = [], onCityChange }) {
  const theme = LCD_THEMES[variant] || LCD_THEMES.green
  const [showCityList, setShowCityList] = useState(false)
  const tempRef = useRef(null)
  const dropdownRef = useRef(null)

  // Close dropdown on click outside
  useEffect(() => {
    if (!showCityList) return
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowCityList(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showCityList])

  const [displayTemp, setDisplayTemp] = useState('--')
  const [displayFeels, setDisplayFeels] = useState('--')
  const [displayLabel, setDisplayLabel] = useState('AWAITING SIGNAL')
  const [currentTime, setCurrentTime] = useState('')
  const [currentDate, setCurrentDate] = useState('')
  const containerRef = useRef(null)

  useEffect(() => {
    if (!weather) return

    // Animate LCD flicker on data change
    if (containerRef.current) {
      gsap.fromTo(containerRef.current,
        { opacity: 0.3 },
        { opacity: 1, duration: 0.4, ease: 'power2.out' }
      )
    }

    // Number roll animation for temperature
    const obj = { val: parseInt(displayTemp) || 0 }
    gsap.to(obj, {
      val: weather.temperature,
      duration: 0.8,
      ease: 'power2.out',
      onUpdate: () => setDisplayTemp(Math.round(obj.val).toString()),
    })

    const feelsObj = { val: parseInt(displayFeels) || 0 }
    gsap.to(feelsObj, {
      val: weather.apparentTemp,
      duration: 0.8,
      ease: 'power2.out',
      onUpdate: () => setDisplayFeels(Math.round(feelsObj.val).toString()),
    })

    setDisplayLabel(weather.weatherLabel || 'UNKNOWN')
  }, [weather])

  // Update clock every second
  useEffect(() => {
    if (!timezone) return

    const updateClock = () => {
      try {
        const now = new Date()
        const timeOptions = { 
          timeZone: timezone, 
          hour12: false, 
          hour: '2-digit', 
          minute: '2-digit' 
        }
        const dateOptions = { 
          timeZone: timezone, 
          weekday: 'short', 
          month: 'short', 
          day: '2-digit' 
        }
        
        setCurrentTime(now.toLocaleTimeString('en-US', timeOptions))
        setCurrentDate(now.toLocaleDateString('en-US', dateOptions).toUpperCase())
      } catch (error) {
        setCurrentTime('--:--')
        setCurrentDate('INVALID TZ')
      }
    }

    updateClock()
    const interval = setInterval(updateClock, 1000)
    return () => clearInterval(interval)
  }, [timezone])

  return (
    <div
      ref={containerRef}
      className="relative overflow-hidden"
      style={{
        background: 'linear-gradient(175deg, #1A2012 0%, #151A0E 50%, #121810 100%)',
        borderRadius: '12px',
        padding: '28px 28px',
        minHeight: '280px',
        opacity: isNightTime ? 0.6 : 1,
        transition: 'opacity 0.5s ease',
        /* Recessed screen effect */
        boxShadow: `
          inset 0 3px 12px rgba(0,0,0,0.6),
          inset 0 1px 3px rgba(0,0,0,0.4),
          0 1px 0 rgba(255,255,255,0.15),
          0 2px 0 rgba(255,255,255,0.05)
        `,
        border: '2px solid #0E120A',
      }}
    >
      {/* Scanline overlay */}
      <div
        className="absolute inset-0 pointer-events-none z-10"
        style={{
          background: `repeating-linear-gradient(
            0deg,
            transparent,
            transparent 3px,
            rgba(0,0,0,0.08) 3px,
            rgba(0,0,0,0.08) 4px
          )`,
        }}
      />

      {/* Screen reflection / glass effect */}
      <div
        className="absolute inset-0 pointer-events-none z-10"
        style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.04) 0%, transparent 50%, rgba(0,0,0,0.02) 100%)',
          borderRadius: '10px',
        }}
      />

      {/* Content */}
      <div className="relative z-20">
        {/* Two column layout: left=data, right=city+icon */}
        <div className="flex gap-6" ref={dropdownRef}>
          {/* Left column: label + status + temp + feels */}
          <div className="flex-1">
            <div
              className="font-[var(--font-lcd)] text-[11px] tracking-[0.3em] uppercase mb-3"
              style={{ color: theme.dim }}
            >
              {label}
            </div>

            <div
              className="font-[var(--font-lcd)] text-[12px] tracking-[0.2em] mb-3"
              style={{
                color: loading ? theme.dim : theme.bright,
                textShadow: loading ? 'none' : `0 0 10px ${theme.glow}`,
                transition: 'color 0.3s',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                maxWidth: '180px',
              }}
            >
              {loading ? '► TUNING...' : `► ${displayLabel}`}
            </div>

            <div className="flex items-baseline gap-1 mb-2">
              <span
                className="font-[var(--font-lcd)] leading-none"
                ref={tempRef}
                style={{
                  fontSize: '72px',
                  color: theme.bright,
                  textShadow: `0 0 20px ${theme.glowSoft}, 0 0 40px ${theme.glowFaint}`,
                  letterSpacing: '0.04em',
                }}
              >
                {displayTemp}
              </span>
              <span
                className="font-[var(--font-lcd)] text-[24px]"
                style={{
                  color: theme.bright,
                  textShadow: `0 0 10px ${theme.glowSoft}`,
                }}
              >
                °C
              </span>
            </div>

            <div
              className="font-[var(--font-lcd)] text-[13px] tracking-[0.1em]"
              style={{ color: theme.dim, whiteSpace: 'nowrap' }}
            >
              FEELS LIKE {displayFeels}°C
            </div>
          </div>

          {/* Right column: city name + icon, stacked, right-aligned */}
          <div className="flex flex-col items-end relative">
            <button
              onClick={() => setShowCityList(!showCityList)}
              className="font-[var(--font-lcd)] text-[15px] tracking-[0.15em] uppercase cursor-pointer border-none bg-transparent text-right"
              style={{
                color: theme.bright,
                textShadow: `0 0 12px ${theme.glowSoft}`,
                padding: 0,
                transition: 'text-shadow 0.2s',
                whiteSpace: 'nowrap',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.textShadow = `0 0 20px ${theme.glow}` }}
              onMouseLeave={(e) => { e.currentTarget.style.textShadow = `0 0 12px ${theme.glowSoft}` }}
            >
              {cityName || 'SELECT'}<span style={{ fontSize: '12px', opacity: 0.6, marginLeft: '4px' }}>▾</span>
            </button>

            <div style={{ marginTop: '12px' }}>
              <WeatherIcon
                weatherBg={weather?.weatherBg}
                color={theme.bright}
                glowColor={theme.glowSoft}
                size={72}
              />
            </div>

            {/* Dropdown city list */}
            {showCityList && (
              <div
                className="absolute right-0 top-8 z-30 rounded-md overflow-hidden"
                style={{
                  background: '#0E120A',
                  border: `1px solid ${theme.dim}`,
                  boxShadow: '0 4px 16px rgba(0,0,0,0.6)',
                  minWidth: '140px',
                }}
              >
                {cities.map(city => (
                  <button
                    key={city.id}
                    onClick={() => { onCityChange(city.id); setShowCityList(false) }}
                    className="block w-full text-left font-[var(--font-lcd)] text-[11px] tracking-[0.1em] border-none cursor-pointer"
                    style={{
                      color: city.displayName === cityName ? theme.bright : theme.dim,
                      background: city.displayName === cityName ? 'rgba(255,255,255,0.05)' : 'transparent',
                      padding: '8px 14px',
                      transition: 'all 0.15s',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = theme.bright }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = city.displayName === cityName ? 'rgba(255,255,255,0.05)' : 'transparent'; e.currentTarget.style.color = city.displayName === cityName ? theme.bright : theme.dim }}
                  >
                    {city.displayName}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Divider — LCD segment style */}
        <div
          className="mb-4"
          style={{
            height: '1px',
            background: `linear-gradient(90deg, ${theme.dim}, ${theme.dim} 60%, transparent)`,
          }}
        />

        {/* Clock section */}
        <div className="mb-6">
          <div
            className="font-[var(--font-lcd)] text-[32px] leading-none mb-1"
            style={{
              color: theme.bright,
              textShadow: `0 0 15px ${theme.glowSoft}`,
              letterSpacing: '0.05em',
            }}
          >
            {currentTime}
          </div>
          <div
            className="font-[var(--font-lcd)] text-[11px] tracking-[0.15em]"
            style={{ color: theme.dim }}
          >
            {currentDate}
          </div>
        </div>

        {/* Divider */}
        <div
          className="mb-4"
          style={{
            height: '1px',
            background: `linear-gradient(90deg, ${theme.dim}, ${theme.dim} 60%, transparent)`,
          }}
        />

        {/* Bottom row: compact data */}
        <div className="flex gap-8">
          <DataCell label="HUMID" value={weather?.humidity ?? '--'} unit="%" theme={theme} />
          <DataCell label="WIND" value={weather?.windSpeed ?? '--'} unit="km/h" theme={theme} />
          <DataCell label="CLOUD" value={weather?.cloudCover ?? '--'} unit="%" theme={theme} />
        </div>
      </div>
    </div>
  )
}

function DataCell({ label, value, unit, theme }) {
  return (
    <div>
      <div
        className="font-[var(--font-lcd)] text-[9px] tracking-[0.2em] mb-1"
        style={{ color: theme.dim }}
      >
        {label}
      </div>
      <div className="flex items-baseline gap-1">
        <span
          className="font-[var(--font-lcd)] text-[22px]"
          style={{ color: theme.bright, textShadow: `0 0 8px ${theme.glowData}` }}
        >
          {value}
        </span>
        <span
          className="font-[var(--font-lcd)] text-[11px]"
          style={{ color: theme.dim }}
        >
          {unit}
        </span>
      </div>
    </div>
  )
}
