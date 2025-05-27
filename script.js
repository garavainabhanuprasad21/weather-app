const openWeatherMapApiKey = "d6d855769135388d8a31ebfb94985d09"; // still used for current weather
const weatherApiKey = "e343570b1ce644eaa6c64512252705"; // ✅ new WeatherAPI key

const searchInput = document.getElementById("search");
const searchButton = document.querySelector("button");

const tempElement = document.querySelector(".temp h1");
const cityElement = document.querySelector(".temp h2");
const dateElement = document.querySelectorAll(".temp h2")[1];
const humidityElement = document.querySelector(".humidity");
const windElement = document.querySelector(".wind");
const weatherIcon = document.querySelector(".temp img");

const weeklyForecastContainer = document.querySelector(".weekly-forecast");
const weatherInfoSection = document.querySelector(".weather-info");

// Allow search on button click or Enter key
searchButton.addEventListener("click", handleSearch);
searchInput.addEventListener("keyup", (e) => {
  if (e.key === "Enter") {
    handleSearch();
  }
});

function handleSearch() {
  const city = searchInput.value.trim();
  if (city !== "") {
    weatherInfoSection.classList.add("hidden");
    weeklyForecastContainer.innerHTML = "";

    Promise.all([
      getWeatherFromOpenWeatherMap(city),
      getWeatherFromWeatherAPI(city),
    ])
      .then(() => {
        weatherInfoSection.classList.remove("hidden");
      })
      .catch((error) => {
        alert(error.message || "Error fetching weather data.");
        weatherInfoSection.classList.add("hidden");
      });
  }
}

// OpenWeatherMap for current weather
function getWeatherFromOpenWeatherMap(city) {
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(
    city
  )}&appid=${openWeatherMapApiKey}&units=metric`;

  return fetch(url)
    .then((res) => res.json())
    .then((data) => {
      if (data.cod !== 200) {
        throw new Error("City not found.");
      }

      const temp = data.main.temp;
      const humidity = data.main.humidity;
      const windSpeed = data.wind.speed;
      const weatherMain = data.weather[0].description.toLowerCase();
      const cityName = data.name;

      tempElement.textContent = `${Math.round(temp)}°C`;
      cityElement.textContent = cityName;
      dateElement.textContent = formatDate(new Date());

      humidityElement.innerHTML = `${humidity}%<br>Humidity`;
      windElement.innerHTML = `${Math.round(windSpeed * 3.6)} km/h<br>Wind Speed`;

      updateWeatherIcon(weatherMain);
    });
}

// WeatherAPI.com for daily forecast
function getWeatherFromWeatherAPI(city) {
  const url = `https://api.weatherapi.com/v1/forecast.json?q=${encodeURIComponent(
    city
  )}&key=${weatherApiKey}&days=7&aqi=no&alerts=no`;

  return fetch(url)
    .then((res) => res.json())
    .then((data) => {
      if (!data.forecast || !data.forecast.forecastday) {
        throw new Error("No forecast data available.");
      }

      weeklyForecastContainer.innerHTML = "";

      const forecastDays = data.forecast.forecastday;

      console.log("Forecast days returned:", forecastDays.length);

      // Show next 6 days (excluding today)
      const daysToShow = Math.min(forecastDays.length - 1, 6);

      forecastDays.slice(1, 1 + daysToShow).forEach((day) => {
        const date = new Date(day.date);
        const tempMin = Math.round(day.day.mintemp_c);
        const tempMax = Math.round(day.day.maxtemp_c);
        const weather = day.day.condition.text;
        const icon = day.day.condition.icon;

        const forecastElement = document.createElement("div");
        forecastElement.classList.add("day");

        forecastElement.innerHTML = `
          <div class="day-name">${formatDateShort(date)}</div>
          <img src="https:${icon}" alt="${weather}" class="icon" />
          <div class="day-info">${tempMax}° / ${tempMin}°</div>
        `;

        weeklyForecastContainer.appendChild(forecastElement);
      });
    });
}

// Weather icon logic
function updateWeatherIcon(condition) {
  let iconPath = "images/clear.png";
  if (condition.includes("cloud")) iconPath = "images/clouds.png";
  else if (condition.includes("rain")) iconPath = "images/rain.png";
  else if (condition.includes("drizzle")) iconPath = "images/drizzle.png";
  else if (condition.includes("mist")) iconPath = "images/mist.png";
  else if (condition.includes("snow")) iconPath = "images/snow.png";
  else if (condition.includes("clear")) iconPath = "images/clear.png";

  weatherIcon.src = iconPath;
}

// Format full date (e.g., 27 May 2025)
function formatDate(date) {
  const options = { day: "2-digit", month: "short", year: "numeric" };
  return date.toLocaleDateString("en-GB", options);
}

// Format short date with weekday (e.g., Tue, 28 May)
function formatDateShort(date) {
  const options = { weekday: "short", day: "2-digit", month: "short" };
  return date.toLocaleDateString("en-GB", options);
}
