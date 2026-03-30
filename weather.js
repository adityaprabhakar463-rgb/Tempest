// Weather App JavaScript
let currentWeatherData = null;
let currentUnit = 'C';
let savedCities = JSON.parse(localStorage.getItem('savedCities')) || [];
let currentCityName = '';

document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const cityInput = document.getElementById('city-input');
    const searchButton = document.getElementById('search-button');
    const weatherCard = document.getElementById('weather-card');
    const cityName = document.getElementById('city-name');
    const weatherIcon = document.getElementById('weather-icon');
    const temperature = document.getElementById('temperature');
    const weatherDescription = document.getElementById('weather-description');
    const humidity = document.getElementById('humidity');
    const feelsLike = document.getElementById('feels-like');
    const windSpeed = document.getElementById('wind-speed');
    const errorMessage = document.getElementById('error-message');
    const loadingIndicator = document.getElementById('loading-indicator');
    const unitC = document.getElementById('unit-c');
    const unitF = document.getElementById('unit-f');
    const forecastGrid = document.getElementById('forecast-grid');
    const saveCityBtn = document.getElementById('save-city-btn');
    const favoritesBtn = document.getElementById('favorites-btn');
    const favoritesDropdown = document.getElementById('favorites-dropdown');
    const dropdownList = document.getElementById('dropdown-list');
    const effectsContainer = document.getElementById('weather-effects');

    // Load saved cities
    renderSavedCities();

    favoritesBtn.addEventListener('click', () => {
        favoritesDropdown.classList.toggle('show');
    });

    document.addEventListener('click', (e) => {
        if (!favoritesBtn.contains(e.target) && !favoritesDropdown.contains(e.target)) {
            favoritesDropdown.classList.remove('show');
        }
    });

    // Check localStorage for last searched city on page load
    const lastCity = localStorage.getItem('lastSearchedCity');
    console.log('Last city from localStorage:', lastCity);
    if (lastCity) {
        cityInput.value = lastCity;
        // Delay the automatic fetch to ensure DOM is ready
        setTimeout(() => {
            fetchWeather(lastCity);
        }, 100);
    }

    // Add click handlers for detail chips
    document.querySelectorAll('.detail-chip').forEach(chip => {
        chip.addEventListener('click', function() {
            // Add a quick scale animation
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = '';
            }, 150);

            // Copy value to clipboard (optional feature)
            const value = this.querySelector('.detail-value').textContent;
            navigator.clipboard.writeText(value).then(() => {
                // Show temporary feedback
                const originalText = this.querySelector('.detail-value').textContent;
                this.querySelector('.detail-value').textContent = 'Copied!';
                this.querySelector('.detail-value').style.color = 'var(--accent)';
                setTimeout(() => {
                    this.querySelector('.detail-value').textContent = originalText;
                    this.querySelector('.detail-value').style.color = '';
                }, 1000);
            }).catch(() => {
                // Fallback if clipboard not available
                console.log('Value:', value);
            });
        });
    });

    // Make error message clickable to retry
    errorMessage.addEventListener('click', function() {
        if (cityInput.value.trim()) {
            fetchWeather(cityInput.value.trim());
        }
    });

    // Event listeners for search and unit toggles
    unitC.addEventListener('click', () => {
        if (currentUnit === 'C') return;
        currentUnit = 'C';
        unitC.classList.add('active');
        unitF.classList.remove('active');
        if (currentWeatherData) reRenderUI();
    });

    unitF.addEventListener('click', () => {
        if (currentUnit === 'F') return;
        currentUnit = 'F';
        unitF.classList.add('active');
        unitC.classList.remove('active');
        if (currentWeatherData) reRenderUI();
    });

    function reRenderUI() {
        const currentCondition = currentWeatherData.current_condition[0];
        const nearestArea = currentWeatherData.nearest_area[0];
        updateWeatherUI(currentWeatherData, currentCondition, nearestArea);
    }

    searchButton.addEventListener('click', handleSearch);
    cityInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            handleSearch();
        }
    });

    function handleSearch() {
        const city = cityInput.value.trim();
        if (!city) {
            showError('Please enter a city name');
            return;
        }

        // Add click animation to button
        searchButton.style.transform = 'scale(0.95)';
        setTimeout(() => {
            searchButton.style.transform = '';
        }, 150);

        fetchWeather(city);
    }

    async function fetchWeather(city) {
        console.log('Fetching weather for:', city);
        // Show loading, hide weather card and error
        showLoading();

        try {
            const response = await fetch(`https://wttr.in/${encodeURIComponent(city)}?format=j1`);
            console.log('Response status:', response.status);

            if (!response.ok) {
                throw new Error('City not found');
            }

            const data = await response.json();
            console.log('Received data:', data);

            // Extract weather data
            const currentCondition = data.current_condition[0];
            const nearestArea = data.nearest_area[0];

            // Save state
            currentWeatherData = data;

            // Update UI with weather data
            updateWeatherUI(data, currentCondition, nearestArea);

            // Save city to localStorage
            localStorage.setItem('lastSearchedCity', city);

        } catch (error) {
            console.error('Error fetching weather:', error);
            if (error.message === 'City not found') {
                showError('City not found');
            } else {
                showError('Network error. Check connection.');
            }
        }
    }

    function updateWeatherUI(data, current, area) {
        console.log('Updating weather UI with data:', data);
        // City name and country
        const city = area.areaName[0].value;
        const country = area.country[0].value;
        currentCityName = city;
        updateSaveButtonState();
        cityName.textContent = `${city}, ${country}`;

        // Weather icon
        let iconUrl = current.weatherIconUrl[0].value;
        if (iconUrl.startsWith('http://')) {
            iconUrl = iconUrl.replace('http://', 'https://');
        } else if (iconUrl.startsWith('//')) {
            iconUrl = `https:${iconUrl}`;
        }
        weatherIcon.src = iconUrl;
        weatherIcon.alt = current.weatherDesc[0].value;

        // Temperature
        if (currentUnit === 'C') {
            temperature.textContent = `${current.temp_C}°C`;
        } else {
            temperature.textContent = `${current.temp_F}°F`;
        }

        // Weather description
        const descText = current.weatherDesc[0].value;
        weatherDescription.textContent = descText;
        
        // Update background based on weather
        const desc = descText.toLowerCase();
        let weatherClass = '';
        if (desc.includes('clear') || desc.includes('sunny')) {
            weatherClass = 'weather-clear';
            createEffects('none');
        } else if (desc.includes('cloud') || desc.includes('overcast') || desc.includes('fog') || desc.includes('mist')) {
            weatherClass = 'weather-clouds';
            createEffects('none');
        } else if (desc.includes('rain') || desc.includes('drizzle') || desc.includes('shower')) {
            weatherClass = 'weather-rain';
            createEffects('rain');
        } else if (desc.includes('snow') || desc.includes('ice') || desc.includes('blizzard') || desc.includes('pellets') || desc.includes('sleet')) {
            weatherClass = 'weather-snow';
            createEffects('snow');
        } else if (desc.includes('thunder') || desc.includes('storm')) {
            weatherClass = 'weather-thunder';
            createEffects('none');
        } else {
            createEffects('none');
        }
        document.body.className = weatherClass;

        // Details
        humidity.innerHTML = `<span class="detail-label">Humidity</span><span class="detail-value">💧 ${current.humidity}%</span>`;
        if (currentUnit === 'C') {
            feelsLike.innerHTML = `<span class="detail-label">Feels Like</span><span class="detail-value">🌡️ ${current.FeelsLikeC}°C</span>`;    
        } else {
            feelsLike.innerHTML = `<span class="detail-label">Feels Like</span><span class="detail-value">🌡️ ${current.FeelsLikeF}°F</span>`;    
        }
        windSpeed.innerHTML = `<span class="detail-label">Wind</span><span class="detail-value">💨 ${current.windspeedKmph} km/h</span>`;

        // Configure Forecast
        renderForecast(data.weather);

        // Show weather card, hide loading
        hideLoading();
        showWeatherCard();
    }

    function renderForecast(weatherArray) {
        if (!forecastGrid) return;
        forecastGrid.innerHTML = '';
        if (!weatherArray || weatherArray.length === 0) return;
        
        const days = weatherArray.slice(0, 3);
        days.forEach(day => {
            const dateObj = new Date(day.date);
            const dateDisplay = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            
            const maxTemp = currentUnit === 'C' ? day.maxtempC : day.maxtempF;
            const minTemp = currentUnit === 'C' ? day.mintempC : day.mintempF;
            
            const hourly = day.hourly[4] || day.hourly[0];
            const iconUrl = hourly && hourly.weatherIconUrl ? hourly.weatherIconUrl[0].value : '';
            const secureIconUrl = iconUrl.replace('http://', 'https://');
            
            const div = document.createElement('div');
            div.className = 'forecast-item abstract-glass';
            div.innerHTML = `
                <div class="forecast-date">${dateDisplay}</div>
                <img src="${secureIconUrl}" alt="weather" style="width: 40px; height: 40px; margin-bottom: 8px;">
                <div class="forecast-temp">${maxTemp}°<span class="min">${minTemp}°</span></div>
            `;
            forecastGrid.appendChild(div);
        });
    }

    saveCityBtn.addEventListener('click', () => {
        if (!currentCityName) return;
        const index = savedCities.indexOf(currentCityName);
        if (index > -1) {
            savedCities.splice(index, 1);
        } else {
            savedCities.unshift(currentCityName);
        }
        localStorage.setItem('savedCities', JSON.stringify(savedCities));
        updateSaveButtonState();
        renderSavedCities();
    });

    function updateSaveButtonState() {
        if (!saveCityBtn) return;
        if (savedCities.includes(currentCityName)) {
            saveCityBtn.classList.add('saved');
        } else {
            saveCityBtn.classList.remove('saved');
        }
    }

    function renderSavedCities() {
        if (!dropdownList) return;
        dropdownList.innerHTML = '';
        if (savedCities.length === 0) {
            dropdownList.innerHTML = '<div style="padding: 10px; color: rgba(255,255,255,0.4); font-size: 13px; text-align: center;">No saved cities</div>';
            return;
        }
        savedCities.forEach(city => {
            const item = document.createElement('div');
            item.className = 'dropdown-item';
            item.innerHTML = `<span>${city}</span> <span class="remove-city">×</span>`;
            
            item.addEventListener('click', () => {
                favoritesDropdown.classList.remove('show');
                cityInput.value = city;
                fetchWeather(city);
            });
            
            item.querySelector('.remove-city').addEventListener('click', (e) => {
                e.stopPropagation();
                savedCities = savedCities.filter(c => c !== city);
                localStorage.setItem('savedCities', JSON.stringify(savedCities));
                updateSaveButtonState();
                renderSavedCities();
            });
            
            dropdownList.appendChild(item);
        });
    }

    function createEffects(type) {
        if (!effectsContainer) return;
        effectsContainer.innerHTML = '';
        const count = type === 'snow' ? 60 : type === 'rain' ? 120 : 0;
        for(let i=0; i<count; i++) {
            const drop = document.createElement('div');
            drop.classList.add(type === 'snow' ? 'snowflake' : 'raindrop');
            drop.style.left = Math.random() * 100 + 'vw';
            drop.style.animationDuration = Math.random() * 1.5 + 0.5 + 's';
            drop.style.animationDelay = Math.random() * 2 + 's';
            if(type==='snow') {
                const size = Math.random() * 4 + 2;
                drop.style.width = size + 'px';
                drop.style.height = size + 'px';
            }
            effectsContainer.appendChild(drop);
        }
    }

    function showLoading() {
        weatherCard.style.display = 'none';
        errorMessage.style.display = 'none';
        loadingIndicator.style.display = 'block';
    }

    function hideLoading() {
        loadingIndicator.style.display = 'none';
    }

    function showWeatherCard() {
        console.log('Showing weather card');
        weatherCard.style.display = 'block';
        errorMessage.style.display = 'none';
        loadingIndicator.style.display = 'none';
    }

    function showError(message) {
        console.log('Showing error:', message);
        weatherCard.style.display = 'none';
        loadingIndicator.style.display = 'none';
        errorMessage.textContent = message;
        errorMessage.style.display = 'block';
    }
});

