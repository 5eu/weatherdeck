import { useRef, useState, useEffect } from 'react'
import LCDScreen from './LCDScreen'
import TimeGap from './TimeGap'

function isNightTime(timezone) {
  if (!timezone) return false
  try {
    const now = new Date()
    const localTime = new Date(now.toLocaleString("en-US", { timeZone: timezone }))
    const hour = localTime.getHours()
    return hour >= 22 || hour < 6
  } catch {
    return false
  }
}

export default function WeatherPanel({ 
  cities, 
  myCity, 
  theirCity, 
  myWeather, 
  theirWeather, 
  loading, 
  onMyCityChange, 
  onTheirCityChange 
}) {
  const panelRef = useRef(null)
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <div
      ref={panelRef}
      className="relative"
      style={{
        width: isMobile ? '100%' : '920px',
        maxWidth: isMobile ? '100%' : '95vw',
        minHeight: isMobile ? '100vh' : 'auto',
        background: 'linear-gradient(175deg, #F8F3EB 0%, #F5F0E8 30%, #EDE7DB 100%)',
        borderRadius: isMobile ? '0' : '24px',
        padding: isMobile ? '20px 16px 24px' : '48px 40px 44px',
        boxShadow: isMobile ? 'none' : `
          0 20px 60px rgba(0,0,0,0.15),
          0 8px 24px rgba(0,0,0,0.08),
          inset 0 2px 0 rgba(255,255,255,0.7),
          inset 0 -1px 0 rgba(0,0,0,0.04)
        `,
        border: isMobile ? 'none' : '1px solid rgba(0,0,0,0.06)',
      }}
    >
      {/* Top edge highlight — desktop only */}
      {!isMobile && <div
        className="absolute top-0 left-[10%] right-[10%] h-[1px]"
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.9) 30%, rgba(255,255,255,0.9) 70%, transparent)',
          borderRadius: '24px 24px 0 0',
        }}
      />}

      {/* Brand plate */}
      <div className="flex items-center justify-between" style={{ marginBottom: isMobile ? '12px' : '32px' }}>
        <div>
          <h1
            className="font-[var(--font-label)] tracking-[0.25em]"
            style={{ fontSize: isMobile ? '22px' : '28px' }}
            style={{ color: '#2A2420', lineHeight: 1, margin: 0, padding: 0, fontWeight: 400 }}
          >
            WEATHERDECK
          </h1>
          <p
            className="font-[var(--font-body)] text-[9px] md:text-[10px] tracking-[0.15em] uppercase"
            style={{ color: '#8B7355', margin: '4px 0 0 0' }}
          >
            Digital Weather Instrument
          </p>
        </div>
        {/* Status indicator */}
        <div className="flex items-center gap-2">
          <div
            className="w-2 h-2 rounded-full"
            style={{
              background: loading ? '#E84E0F' : '#4CAF50',
              boxShadow: loading
                ? '0 0 8px rgba(232,78,15,0.5)'
                : '0 0 6px rgba(76,175,80,0.4)',
              transition: 'all 0.3s ease',
            }}
          />
          <span className="font-[var(--font-body)] text-[9px] tracking-[0.1em] uppercase" style={{ color: '#8B7355' }}>
            {loading ? 'SYNCING' : 'SIGNAL'}
          </span>
        </div>
      </div>

      {/* Recessed separator line */}
      <div
        style={{
          height: '1px',
          background: 'linear-gradient(90deg, transparent, #C4B89C 20%, #C4B89C 80%, transparent)',
          boxShadow: '0 1px 0 rgba(255,255,255,0.5)',
          marginBottom: '16px',
        }}
      />

      {/* Desktop: horizontal | Mobile: vertical */}
      {!isMobile && <div className="flex items-stretch gap-6">
        <div className="flex-1 min-w-0">
          <LCDScreen 
            weather={myWeather} 
            loading={loading}
            timezone={myCity?.tz}
            isNightTime={false}
            label="ME"
            cityName={myCity?.displayName}
            cities={cities}
            onCityChange={onMyCityChange}
          />
        </div>

        <div 
          className="relative w-[120px] shrink-0"
          style={{
            background: 'linear-gradient(175deg, #1A2012 0%, #151A0E 50%, #121810 100%)',
            borderRadius: '12px',
            boxShadow: `
              inset 0 3px 12px rgba(0,0,0,0.6),
              inset 0 1px 3px rgba(0,0,0,0.4),
              0 1px 0 rgba(255,255,255,0.15),
              0 2px 0 rgba(255,255,255,0.05)
            `,
            border: '2px solid #0E120A',
          }}
        >
          <TimeGap 
            myTimezone={myCity?.tz}
            theirTimezone={theirCity?.tz}
            myWeather={myWeather}
            theirWeather={theirWeather}
          />
        </div>

        <div className="flex-1 min-w-0">
          <LCDScreen 
            weather={theirWeather} 
            loading={loading}
            timezone={theirCity?.tz}
            isNightTime={isNightTime(theirCity?.tz)}
            variant="blue"
            label="THEM"
            cityName={theirCity?.displayName}
            cities={cities}
            onCityChange={onTheirCityChange}
          />
        </div>
      </div>}

      {isMobile && <div className="flex flex-col gap-3">
        <LCDScreen 
          weather={myWeather} 
          loading={loading}
          timezone={myCity?.tz}
          isNightTime={false}
          label="ME"
          cityName={myCity?.displayName}
          cities={cities}
          onCityChange={onMyCityChange}
        />

        {/* TimeGap as horizontal bar */}
        <div 
          style={{
            background: 'linear-gradient(175deg, #1A2012 0%, #151A0E 50%, #121810 100%)',
            borderRadius: '10px',
            boxShadow: `
              inset 0 3px 12px rgba(0,0,0,0.6),
              inset 0 1px 3px rgba(0,0,0,0.4),
              0 1px 0 rgba(255,255,255,0.15),
              0 2px 0 rgba(255,255,255,0.05)
            `,
            border: '2px solid #0E120A',
          }}
        >
          <TimeGap 
            myTimezone={myCity?.tz}
            theirTimezone={theirCity?.tz}
            myWeather={myWeather}
            theirWeather={theirWeather}
            horizontal
          />
        </div>

        <LCDScreen 
          weather={theirWeather} 
          loading={loading}
          timezone={theirCity?.tz}
          isNightTime={isNightTime(theirCity?.tz)}
          variant="blue"
          label="THEM"
          cityName={theirCity?.displayName}
          cities={cities}
          onCityChange={onTheirCityChange}
        />
      </div>}

      {/* Bottom screw holes — desktop only */}
      {!isMobile && <div className="flex justify-between mt-8 px-2">
        {[0, 1, 2, 3].map(i => (
          <div
            key={i}
            className="w-[6px] h-[6px] rounded-full"
            style={{
              background: 'radial-gradient(circle at 35% 35%, #D4C8B0, #A89880)',
              boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.3), 0 1px 0 rgba(255,255,255,0.3)',
            }}
          />
        ))}
      </div>}
    </div>
  )
}
