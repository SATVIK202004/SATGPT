import React, { useEffect, useState } from 'react';
import { Bird } from 'lucide-react';

export const API_KEY = 'e2f093c765e5eacc3f15243b94f958ac';
export const BASE_URL = 'https://api.openweathermap.org/data/2.5';

interface BirdAnimation {
  id: number;
  x: number;
  y: number;
  speed: number;
  size: number;
  rotation: number;
  scale: number;
  trail: { x: number; y: number }[];
  angle: number;
}

interface WeatherData {
  main: { temp: number; temp_min: number; temp_max: number };
  weather: { description: string; icon: string }[];
  name: string;
}

interface ForecastData {
  list: {
    dt_txt: string;
    main: { temp: number };
    weather: { description: string; icon: string }[];
  }[];
}

export function SplashScreen() {
  const [birds, setBirds] = useState<BirdAnimation[]>([]);
  const [opacity, setOpacity] = useState(1);
  const [backgroundPosition, setBackgroundPosition] = useState(0);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [forecast, setForecast] = useState<ForecastData | null>(null);
  const [city, setCity] = useState<string>('Guntur'); // Default to Guntur city
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isFetching, setIsFetching] = useState<boolean>(false);

  useEffect(() => {
    // Function to get weather data based on location
    const getWeatherData = async (location: string) => {
      setIsFetching(true);
      try {
        const weatherResponse = await fetch(
          `${BASE_URL}/weather?q=${location}&appid=${API_KEY}&units=metric`
        );
        const weatherData = await weatherResponse.json();
        setWeather(weatherData);

        // Fetch 5-day forecast
        const forecastResponse = await fetch(
          `${BASE_URL}/forecast?q=${location}&appid=${API_KEY}&units=metric`
        );
        const forecastData = await forecastResponse.json();
        setForecast(forecastData);
      } catch (error) {
        console.error('Error fetching weather data:', error);
      }
      setIsFetching(false);
    };

    // Request geolocation for automatic weather fetch
    const getLocationWeather = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            getWeatherData(`lat=${latitude}&lon=${longitude}`);
          },
          () => {
            getWeatherData(city); // Fallback to default city (Guntur)
          }
        );
      } else {
        getWeatherData(city); // Fallback to default city (Guntur)
      }
    };

    getLocationWeather(); // Fetch weather based on geolocation or fallback city

    // Create initial birds with trails
    const initialBirds = Array.from({ length: 12 }, (_, i) => ({
      id: i,
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      speed: 1 + Math.random() * 2,
      size: 16 + Math.random() * 16,
      rotation: Math.random() * 360,
      scale: 1 + Math.random() * 0.5,
      trail: [],
      angle: Math.random() * 360,
    }));
    setBirds(initialBirds);

    // Animate birds and their trails
    const interval = setInterval(() => {
      setBirds(prevBirds =>
        prevBirds.map(bird => {
          const newTrail = [...bird.trail, { x: bird.x, y: bird.y }].slice(-10);

          const xOffset = Math.sin(bird.angle) * bird.speed;
          const yOffset = Math.cos(bird.angle) * bird.speed;

          return {
            ...bird,
            x: (bird.x + xOffset) % window.innerWidth,
            y: (bird.y + yOffset) % window.innerHeight,
            rotation: bird.rotation + bird.speed,
            scale: 1 + Math.sin(bird.x / 200) * 0.2,
            trail: newTrail,
            angle: bird.angle + Math.random() * 2,
          };
        })
      );
    }, 60);

    const timeout = setTimeout(() => {
      setOpacity(0);
    }, 120000);

    const backgroundInterval = setInterval(() => {
      setBackgroundPosition(prev => prev + 0.01);
    }, 20);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
      clearInterval(backgroundInterval);
    };
  }, [city]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const handleSearchSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setCity(searchQuery);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    setMousePosition({ x: e.clientX, y: e.clientY });
  };

  if (opacity === 0) return null;

  return (
    <div
      className="fixed inset-0 bg-gradient-to-br from-blue-800 via-purple-600 to-pink-500 flex items-center justify-center z-50 transition-opacity duration-1000"
      style={{
        opacity,
        backgroundPosition: `${backgroundPosition * 100}% ${backgroundPosition * 100}%`,
        backgroundSize: '200% 200%',
      }}
      onMouseMove={handleMouseMove}
    >
      <div className="relative w-full h-full">
        {weather && (
          <div
            className="absolute top-0 left-0 w-full h-full bg-cover bg-fixed"
            style={{
              backgroundImage: `url('https://source.unsplash.com/1600x900/?${weather.weather[0].main.toLowerCase()}')`,
            }}
          ></div>
        )}

        {birds.map(bird => (
          <div
            key={bird.id}
            className="absolute"
            style={{ left: `${bird.x}px`, top: `${bird.y}px` }}
          >
            {bird.trail.map((point, index) => (
              <div
                key={index}
                className="absolute bg-gradient-to-r from-blue-500 to-pink-500 rounded-full"
                style={{
                  left: `${point.x}px`,
                  top: `${point.y}px`,
                  width: bird.size / 2,
                  height: bird.size / 2,
                  opacity: 1 - index * 0.1,
                  boxShadow: `0 0 15px rgba(255, 255, 255, 0.5)`,
                }}
              />
            ))}
            <Bird
              size={bird.size}
              className="text-white transition-transform duration-300"
              style={{
                transform: `rotate(${bird.rotation}deg) scale(${bird.scale}) translateZ(${bird.angle}px)`,
              }}
            />
          </div>
        ))}

        <div className="absolute inset-0 flex items-center justify-center z-10">
          <div className="text-center animate__animated animate__fadeIn">
            <h1 className="text-6xl font-extrabold text-white mb-4 animate__animated animate__bounceInDown">
              SAT GPT
            </h1>
            <p className="text-lg text-gray-200 animate__animated animate__fadeInUp">Your AI Assistant</p>

            <form onSubmit={handleSearchSubmit} className="mt-4">
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="Search City"
                className="p-2 rounded-full text-black"
                style={{
                  border: '2px solid white',
                  fontSize: '16px',
                }}
              />
            </form>

            {isFetching ? (
              <div className="mt-4 text-gray-100 animate__animated animate__fadeIn">Fetching weather...</div>
            ) : (
              <div className="mt-4 text-gray-100 animate__animated animate__fadeIn">
                {weather
                  ? `Weather in ${weather.name}: ${weather.weather[0].description} | Temp: ${weather.main.temp}°C`
                  : 'Loading weather data...'}
              </div>
            )}

            {forecast && (
              <div className="mt-6">
                <h2 className="text-3xl text-white mb-4">5-Day Forecast</h2>
                <div className="grid grid-cols-5 gap-4 text-white">
                  {forecast.list.slice(0, 5).map((item, index) => (
                    <div key={index} className="text-center">
                      <div className="text-xl">{new Date(item.dt_txt).toLocaleDateString()}</div>
                      <img
                        src={`http://openweathermap.org/img/wn/${item.weather[0].icon}.png`}
                        alt={item.weather[0].description}
                        className="mx-auto"
                      />
                      <div>{item.weather[0].description}</div>
                      <div>{Math.round(item.main.temp)}°C</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
