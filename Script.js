const apiKey = 'ca39f0834c8943251d528a0babb6d2ed'; // Replace with your OpenWeatherMap API key
const weatherUrl = 'https://api.openweathermap.org/data/2.5/weather';
const forecastUrl = 'https://api.openweathermap.org/data/2.5/forecast';

const locationInput = document.getElementById('locationInput');
const searchButton = document.getElementById('searchButton');
const cityElement = document.getElementById('city');
const temperatureElement = document.getElementById('temperature');
const conditionElement = document.getElementById('condition');
const highLowElement = document.getElementById('high-low');
const hourlyList = document.getElementById('hourly-list');
const dailyList = document.getElementById('daily-list');

// Set default data on page load
document.addEventListener('DOMContentLoaded', () => {
    // Default data matching the interface (Cupertino)
    cityElement.textContent = 'Cupertino';
    temperatureElement.textContent = '72°F';
    conditionElement.textContent = 'Sunny';
    highLowElement.textContent = 'H:87° L:61°';

    // Default hourly forecast
    hourlyList.innerHTML = `
        <div class="hour"><span>Now</span><span>72°</span></div>
        <div class="hour"><span>10 AM</span><span>73°</span></div>
        <div class="hour"><span>11 AM</span><span>75°</span></div>
        <div class="hour"><span>12 PM</span><span>78°</span></div>
        <div class="hour"><span>1 PM</span><span>80°</span></div>
    `;

    // Default 5-day forecast
    dailyList.innerHTML = `
        <div class="day"><span>Tuesday</span><span>61° - 87°</span></div>
        <div class="day"><span>Wednesday</span><span>59° - 91°</span></div>
        <div class="day"><span>Thursday</span><span>63° - 95°</span></div>
    `;
});

searchButton.addEventListener('click', () => {
    const location = locationInput.value;
    if (location) {
        fetchWeather(location);
        fetchForecast(location);
    }
});

function fetchWeather(location) {
    const proxy = "https://corsproxy.io/?";
    const url = proxy + `${weatherUrl}?q=${location}&appid=${apiKey}&units=imperial`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            cityElement.textContent = data.name;
            temperatureElement.textContent = `${Math.round(data.main.temp)}°F`;
            conditionElement.textContent = data.weather[0].description;
            highLowElement.textContent = `H:${Math.round(data.main.temp_max)}° L:${Math.round(data.main.temp_min)}°`;

            cityElement.style.color = 'inherit'; // Reset color
            document.querySelector('.hourly-forecast').style.display = 'block';
            document.querySelector('.daily-forecast').style.display = 'block';
            fetchForecast(location);
        })
        .catch(error => {
            console.error('Error fetching weather data:', error);
            cityElement.textContent = 'City not found'; 
            cityElement.style.color = 'navy'; // Change color to navy on error
            temperatureElement.textContent = '';
            conditionElement.textContent = '';
            highLowElement.textContent = '';
            // Hide forecast sections
            document.querySelector('.hourly-forecast').style.display = 'none';
            document.querySelector('.daily-forecast').style.display = 'none';
        });
}

function fetchForecast(location) {
    const proxy = "https://corsproxy.io/?";
    const url = proxy + `${forecastUrl}?q=${location}&appid=${apiKey}&units=imperial`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            hourlyList.innerHTML = '';
            const hourlyData = data.list.slice(0, 5);
            hourlyData.forEach(item => {
                const date = new Date(item.dt * 1000);
                const time = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                const temp = Math.round(item.main.temp);
                const hourDiv = document.createElement('div');
                hourDiv.className = 'hour';
                hourDiv.innerHTML = `<span>${time}</span><span>${temp}°</span>`;
                hourlyList.appendChild(hourDiv);
            });

            dailyList.innerHTML = '';
            const dailyData = {};
            data.list.forEach(item => {
                const date = new Date(item.dt * 1000).toLocaleDateString('en-US', { weekday: 'long' });
                if (!dailyData[date]) {
                    dailyData[date] = { max: -Infinity, min: Infinity };
                }
                dailyData[date].max = Math.max(dailyData[date].max, item.main.temp_max);
                dailyData[date].min = Math.min(dailyData[date].min, item.main.temp_min);
            });
            const days = Object.keys(dailyData).slice(0, 3);
            days.forEach(day => {
                const dayDiv = document.createElement('div');
                dayDiv.className = 'day';
                dayDiv.innerHTML = `<span>${day}</span><span>${Math.round(dailyData[day].min)}° - ${Math.round(dailyData[day].max)}°</span>`;
                dailyList.appendChild(dayDiv);
            });
        })
        .catch(error => {
            console.error('Error fetching forecast data:',error);
            
        });
}