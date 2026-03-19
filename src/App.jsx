import { useState, useEffect, useCallback } from 'react'
import WeatherPanel from './components/WeatherPanel'

const BG_GRADIENTS = {
  sunny:  'linear-gradient(160deg, #87CEEB 0%, #E0F0FF 40%, #FFF8E7 100%)',
  cloudy: 'linear-gradient(160deg, #9EAAB8 0%, #C4CDD6 50%, #D8DDE3 100%)',
  rain:   'linear-gradient(160deg, #4A5568 0%, #6B7B8D 50%, #8899A6 100%)',
  snow:   'linear-gradient(160deg, #C8D6E5 0%, #DFE6ED 50%, #F0F4F8 100%)',
  storm:  'linear-gradient(160deg, #2D3748 0%, #4A5568 50%, #5A6577 100%)',
}

export default function App() {
  const [cities, setCities] = useState([])
  const [myCity, setMyCity] = useState(null)
  const [theirCity, setTheirCity] = useState(null)
  const [myWeather, setMyWeather] = useState(null)
  const [theirWeather, setTheirWeather] = useState(null)
  const [loading, setLoading] = useState(false)
  const [bgType, setBgType] = useState('sunny')

  // Fetch city list and restore selections
  useEffect(() => {
    fetch('/api/cities')
      .then(r => r.json())
      .then(cityList => {
        setCities(cityList)
        
        // Restore saved city selections
        const savedMyCityId = localStorage.getItem('weatherdeck_my_city')
        const savedTheirCityId = localStorage.getItem('weatherdeck_their_city')
        
        if (savedMyCityId) {
          const city = cityList.find(c => c.id === parseInt(savedMyCityId))
          if (city) setMyCity(city)
        } else if (cityList.length > 0) {
          // Default to first city
          setMyCity(cityList[0])
        }
        
        if (savedTheirCityId) {
          const city = cityList.find(c => c.id === parseInt(savedTheirCityId))
          if (city) setTheirCity(city)
        } else if (cityList.length > 3) {
          // Default to Tokyo for demo
          setTheirCity(cityList[3])
        }
      })
      .catch(console.error)
  }, [])

  // Fetch weather for a specific city
  const fetchWeather = useCallback(async (city) => {
    try {
      const r = await fetch(`/api/weather?lat=${city.lat}&lon=${city.lon}`)
      const data = await r.json()
      return data
    } catch (err) {
      console.error('Failed to fetch weather for', city.name, err)
      return null
    }
  }, [])

  // Fetch weather when cities change
  useEffect(() => {
    if (!myCity && !theirCity) return
    
    setLoading(true)
    Promise.all([
      myCity ? fetchWeather(myCity) : Promise.resolve(null),
      theirCity ? fetchWeather(theirCity) : Promise.resolve(null)
    ]).then(([myData, theirData]) => {
      setMyWeather(myData)
      setTheirWeather(theirData)
      // Background follows "my city" weather
      if (myData) setBgType(myData.weatherBg || 'sunny')
      setLoading(false)
    })
  }, [myCity, theirCity, fetchWeather])

  const handleMyCityChange = (cityId) => {
    const city = cities.find(c => c.id === cityId)
    setMyCity(city)
    localStorage.setItem('weatherdeck_my_city', cityId.toString())
  }

  const handleTheirCityChange = (cityId) => {
    const city = cities.find(c => c.id === cityId)
    setTheirCity(city)
    localStorage.setItem('weatherdeck_their_city', cityId.toString())
  }

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center transition-all duration-1000"
      style={{ background: BG_GRADIENTS[bgType] || BG_GRADIENTS.sunny }}
    >
      {/* Subtle noise grain overlay — desktop only */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] z-50"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat',
        }}
      />

      <WeatherPanel
        cities={cities}
        myCity={myCity}
        theirCity={theirCity}
        myWeather={myWeather}
        theirWeather={theirWeather}
        loading={loading}
        onMyCityChange={handleMyCityChange}
        onTheirCityChange={handleTheirCityChange}
      />

      {/* Brand badge — desktop only */}
      <div className="fixed bottom-4 right-5 font-[var(--font-label)] text-[11px] tracking-[0.3em] text-black/20 uppercase select-none">
        WeatherDeck
      </div>
    </div>
  )
}
