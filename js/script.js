const cityInput = document.getElementById('city_input');
const searchBtn = document.getElementById('searchBtn');
const apiKey = 'ce09b250f372859c1e9d28b2cab728ed'; // OpenWeatherMap API Key
const locationBtn = document.getElementById('locationBtn')
// DOM Elements
const currentWeatherCard = document.querySelector('.weather-left .card');
const forecastContainer = document.querySelectorAll('.day-forecast');
const humidityVal = document.getElementById('humidityVal');
const pressureVal = document.getElementById('pressureVal');
const visibilityVal = document.getElementById('visibilityVal');
const windspeedVal = document.getElementById('windspeedVal');
const feelsVal = document.getElementById('feelsVal');
const airQualityIndex = document.querySelector('.air-index');
const sunriseElement = document.querySelector('.sunrise-sunset .item:nth-child(1) h2');
const sunsetElement = document.querySelector('.sunrise-sunset .item:nth-child(2) h2');
const hourlyForecastCard = document.querySelector('.hourly-forecast');


// Function to fetch weather details and air quality
function getWeatherDetails(name, lat, lon, country) {
    const FORECAST_API_URL = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
    const WEATHER_API_URL = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
    const AIR_POLLUTION_API_URL = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${apiKey}`;

    // Fetch current weather
    fetch(WEATHER_API_URL)
        .then(res => {
            if (!res.ok) throw new Error('Failed to fetch current weather');
            return res.json();
        })
        .then(data => {
            updateCurrentWeather(data, name, country);
        })
        .catch(error => {
            alert(error.message);
        });

    // Fetch weather forecast
    fetch(FORECAST_API_URL)
        .then(res => {
            if (!res.ok) throw new Error('Failed to fetch weather forecast');
            return res.json();
        })
        .then(data => {
            updateForecast(data.list);
            updateHourlyForecast(data.list.slice(0, 7))
        })
        .catch(error => {
            alert(error.message);
        });

    // Fetch air quality data
    fetch(AIR_POLLUTION_API_URL)
        .then(res => {
            if (!res.ok) throw new Error('Failed to fetch air quality data');
            return res.json();
        })
        .then(data => {
            updateAirQuality(data);
        })
        .catch(error => {
            alert(error.message);
        });
}

// Function to update current weather details
function updateCurrentWeather(data, name, country) {
    const { temp, humidity, pressure, feels_like } = data.main;
    const { description, icon } = data.weather[0];
    const { speed } = data.wind;
    const visibility = (data.visibility / 1000).toFixed(1);
    const sunrise = new Date(data.sys.sunrise * 1000);
    const sunset = new Date(data.sys.sunset * 1000);

    currentWeatherCard.innerHTML = `
        <div class="current-weather">
            <div class="details">
                <p>Now</p>
                <h2>${temp.toFixed(1)}&deg;C</h2>
                <p>${description}</p>
            </div>
            <div class="weather-icon">
                <img src="https://openweathermap.org/img/wn/${icon}@2x.png" alt="Weather Icon">
            </div>
        </div>
        <hr>
        <div class="card-footer">
            <p><i class="fa-solid fa-calendar-days"></i> ${new Date().toLocaleDateString()}</p>
            <p><i class="fa-solid fa-location-dot"></i> ${name}, ${country}</p>
        </div>
    `;

    humidityVal.textContent = `${humidity}%`;
    pressureVal.textContent = `${pressure} hPa`;
    visibilityVal.textContent = `${visibility} km`;
    windspeedVal.textContent = `${speed} m/s`;
    feelsVal.textContent = `${feels_like.toFixed(1)}°C`;

    sunriseElement.textContent = sunrise.toLocaleTimeString();
    sunsetElement.textContent = sunset.toLocaleTimeString();
}

// Function to update weather forecast
function updateForecast(forecastList) {
    forecastContainer.forEach((forecast, index) => {
        const forecastData = forecastList[index * 8]; // Data every 24 hours
        if (!forecastData) return;

        const date = new Date(forecastData.dt * 1000);
        const { temp } = forecastData.main;
        const { description, icon } = forecastData.weather[0];

        forecast.innerHTML = `
            <div class="forecast-item">
                <div class="icon-wrapper">
                    <img src="https://openweathermap.org/img/wn/${icon}.png" alt="Weather Icon">
                    <span>${temp.toFixed(1)}&deg;C</span>
                </div>
                <p>${date.toDateString()}</p>
                <p>${description}</p>
            </div>
        `;
    });
}
// Function to update hourly forecast
function updateHourlyForecast(hourlyData) {
    const hourlyForecastCards = document.querySelectorAll('.hourly-forecast .card');

    // Loop through each card and update the forecast based on the hourly data
    hourlyForecastCards.forEach((card, index) => {
        // Fetch the corresponding hourly data
        const hourData = hourlyData[index];

        if (!hourData) return;

        // Get the time, temperature, and weather details
        const time = new Date(hourData.dt * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const { temp } = hourData.main;
        const { description, icon } = hourData.weather[0];

        // Update each card with the respective hour's data
        card.innerHTML = `
            <p>${time}</p>
            <img src="https://openweathermap.org/img/wn/${icon}.png" alt="${description}">
            <p>${temp.toFixed(1)}°C</p>
        `;
    });
}

// Function to update air quality data
function updateAirQuality(data) {
    const aqi = data.list[0].main.aqi; // AQI level (1-5)
    const components = data.list[0].components; // Pollutant concentrations

    // Update AQI index
    airQualityIndex.textContent = getAQILevel(aqi);
    airQualityIndex.className = `air-index aqi-${aqi}`;

    document.querySelector('.aqi-pm25 h2').textContent = `${components.pm2_5} `;
    document.querySelector('.aqi-pm10 h2').textContent = `${components.pm10} `;
    document.querySelector('.aqi-so2 h2').textContent = `${components.so2} `;
    document.querySelector('.aqi-co h2').textContent = `${components.co} `;
    document.querySelector('.aqi-no h2').textContent = `${components.no} `;
    document.querySelector('.aqi-no2 h2').textContent = `${components.no2} `;
    document.querySelector('.aqi-nh3 h2').textContent = `${components.nh3} `;
    document.querySelector('.aqi-o3 h2').textContent = `${components.o3} `;
}

// Helper function to return AQI levels as text
function getAQILevel(aqi) {
    switch (aqi) {
        case 1: return 'Good';
        case 2: return 'Fair';
        case 3: return 'Moderate';
        case 4: return 'Poor';
        case 5: return 'Very Poor';
        default: return 'Unknown';
    }
}

// Function to get city coordinates via Geocoding API
function getCityCoordinates() {
    const cityName = cityInput.value.trim();
    cityInput.value = '';

    if (!cityName) {
        alert('Please enter a city name');
        return;
    }

    const GEOCODING_API_URL = `https://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${apiKey}`;

    fetch(GEOCODING_API_URL)
        .then(res => {
            if (!res.ok) throw new Error('Failed to get coordinates');
            return res.json();
        })
        .then(data => {
            if (data.length === 0) {
                alert(`No coordinates found for "${cityName}"`);
                return;
            }
            const { name, lat, lon, country } = data[0];
            getWeatherDetails(name, lat, lon, country);
        })
        .catch(error => {
            alert(error.message);
        });
}
function getUserCoordinates() {
    navigator.geolocation.getCurrentPosition(position => {

        let { latitude, longitude } = position.coords;
        let REVERSE_GEOCODING_URL = `http://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${apiKey}`;
        fetch(REVERSE_GEOCODING_URL).then(res => res.json()).then(data => {

            let { name, country, state } = data[0];
            getWeatherDetails(name, latitude, longitude, country, state);
        }).catch(error => {
            alert(error.message);
        });
    }, error => {

        if (error.code === error.PERMISSION_DENIED) {

            alert('please enable loctation permission')
        }
    })

}

window.onload = () => {
    if (navigator.geolocation) {

        getUserCoordinates();
    } else {
        alert('Geolocation is not supported by your browser.');
    }
};
// Event listener for search button
searchBtn.addEventListener('click', getCityCoordinates);
locationBtn.addEventListener('click', getUserCoordinates)
cityInput.addEventListener('keyup', e => e.key === 'Enter' && getCityCoordinates())