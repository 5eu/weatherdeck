import { useState, useEffect } from 'react'

function getStatusMessage(myTime, theirTime, myWeather, theirWeather) {
  const myHour = myTime.getHours()
  const theirHour = theirTime.getHours()
  
  const myAwake = myHour >= 6 && myHour < 22
  const theirAwake = theirHour >= 6 && theirHour < 22
  
  // Sleep status priority
  if (myAwake && theirAwake) {
    // Both awake - check weather conditions
    const myRaining = myWeather?.weatherLabel?.includes('RAIN') || myWeather?.weatherLabel?.includes('DRIZZLE') || myWeather?.weatherLabel?.includes('SHOWER')
    const theirRaining = theirWeather?.weatherLabel?.includes('RAIN') || theirWeather?.weatherLabel?.includes('DRIZZLE') || theirWeather?.weatherLabel?.includes('SHOWER')
    
    if (myRaining) return "BRING UMBRELLA"
    if (theirRaining) return "REMIND THEM: UMBRELLA"
    
    // Temperature gap
    if (myWeather?.temperature && theirWeather?.temperature) {
      const tempGap = Math.abs(myWeather.temperature - theirWeather.temperature)
      if (tempGap > 15) return "BIG TEMP GAP"
    }
    
    return "BOTH AWAKE"
  } else if (!myAwake && theirAwake) {
    return "YOU'RE UP LATE"
  } else if (myAwake && !theirAwake) {
    return "THEY'RE SLEEPING"
  } else {
    return "BOTH SLEEPING"
  }
}

function calculateTimeGap(myTime, theirTime) {
  const diffMs = theirTime.getTime() - myTime.getTime()
  const diffHours = Math.round(diffMs / (1000 * 60 * 60))
  
  if (diffHours === 0) return "0H"
  return diffHours > 0 ? `+${diffHours}H` : `${diffHours}H`
}

export default function TimeGap({ myTimezone, theirTimezone, myWeather, theirWeather, horizontal = false }) {
  const [timeGap, setTimeGap] = useState("0H")
  const [statusMessage, setStatusMessage] = useState("CALCULATING...")

  useEffect(() => {
    if (!myTimezone || !theirTimezone) return

    const updateTimeInfo = () => {
      try {
        const now = new Date()
        const myTime = new Date(now.toLocaleString("en-US", { timeZone: myTimezone }))
        const theirTime = new Date(now.toLocaleString("en-US", { timeZone: theirTimezone }))
        
        setTimeGap(calculateTimeGap(myTime, theirTime))
        setStatusMessage(getStatusMessage(myTime, theirTime, myWeather, theirWeather))
      } catch (error) {
        console.error('Error calculating time:', error)
        setTimeGap("--")
        setStatusMessage("TIME ERROR")
      }
    }

    updateTimeInfo()
    const interval = setInterval(updateTimeInfo, 30000) // Update every 30s

    return () => clearInterval(interval)
  }, [myTimezone, theirTimezone, myWeather, theirWeather])

  if (horizontal) {
    return (
      <div className="flex items-center justify-center gap-6 px-4 py-3">
        <div
          className="font-[var(--font-lcd)] text-[9px] tracking-[0.3em]"
          style={{ color: '#3A7A30' }}
        >
          OFFSET
        </div>
        <div
          className="font-[var(--font-lcd)] text-[22px] leading-none"
          style={{
            color: '#7EFF6B',
            textShadow: '0 0 12px rgba(126,255,107,0.2)',
            letterSpacing: '0.05em',
          }}
        >
          {timeGap}
        </div>
        <div style={{ width: '1px', height: '16px', background: '#3A7A30', opacity: 0.5 }} />
        <div
          className="font-[var(--font-lcd)] text-[9px] tracking-[0.1em]"
          style={{ color: '#3A7A30' }}
        >
          ▸ {statusMessage}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center h-full px-4 py-6">
      {/* Content */}
      <div className="text-center">
        {/* Label */}
        <div
          className="font-[var(--font-lcd)] text-[9px] tracking-[0.3em] mb-2"
          style={{ color: '#3A7A30' }}
        >
          OFFSET
        </div>

        {/* Time gap */}
        <div
          className="font-[var(--font-lcd)] text-[28px] leading-none mb-4"
          style={{
            color: '#7EFF6B',
            textShadow: '0 0 12px rgba(126,255,107,0.2)',
            letterSpacing: '0.05em',
          }}
        >
          {timeGap}
        </div>

        {/* Divider */}
        <div style={{ width: '24px', height: '1px', background: '#3A7A30', margin: '0 auto 12px', opacity: 0.5 }} />
        
        {/* Status message */}
        <div
          className="font-[var(--font-lcd)] text-[9px] tracking-[0.1em] leading-relaxed"
          style={{ color: '#3A7A30' }}
        >
          ▸ {statusMessage}
        </div>
      </div>
    </div>
  )
}