const API_KEY = '4cf933ce3f3b475447dda1c0f424bd12';
let forecastData=null;

// Function to fetch weather data
async function getWeather(city) {
    const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`;
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}&units=metric`;

    try {
        const weatherResponse = await fetch(weatherUrl);
        const weatherData = await weatherResponse.json();

        if (weatherData.cod !== 200) {
            alert("City not found or API limit reached");
            return;
        }

        const forecastResponse = await fetch(forecastUrl);
        const forecastData = await forecastResponse.json();

        if (forecastData.cod !== "200") {
            alert("City not found or API limit reached");
            return;
        }

        displayWeather(weatherData);
        displayForecast(forecastData);
        generateCharts(forecastData);
        storeForecastData(forecastData); // Store forecast data for chatbot use

       // showTemperaturesAscending(forecastData);
       // showTemperaturesDescending(forecastData);
       // showRainyDays(forecastData);
       // showHighestTemperatureDay(forecastData);
    } catch (error) {
        alert("Error fetching data. Please try again later.");
        console.error(error);
    }
}

// Display weather data on the dashboard
function displayWeather(data) {
    const cityName = document.getElementById('city-name');
    const temperature = document.getElementById('temperature');
    const weatherCondition = document.getElementById('weather-condition');
    const humidity = document.getElementById('humidity');
    const windSpeed = document.getElementById('wind-speed');

    if (cityName && temperature && weatherCondition && humidity && windSpeed) {
        cityName.textContent = data.name;
        temperature.textContent = `${data.main.temp}°C`;
        weatherCondition.textContent = data.weather[0].description;
        humidity.textContent = `${data.main.humidity}%`;
        windSpeed.textContent = `${data.wind.speed} m/s`;
        setWeatherBackground(data.weather[0].main);
        console.log(data.weather[0])
    } else {
        console.error('Weather display elements are missing.');
    }
}

// Change dashboard background based on weather condition
function setWeatherBackground(condition) {
    const widget = document.getElementById('weather-display');
    if (widget) {
        switch (condition) {
            case 'Clouds':
                widget.style.backgroundColor = '#d3d3d3';
                break;
            case 'Rain':
                widget.style.backgroundColor = '#4a90e2';
                break;
            case 'Clear':
                widget.style.backgroundColor = '#f39c12';
                break;
            default:
                widget.style.backgroundColor = '#95a5a6';  // Default background
                break;
        }
    }
}

// Display forecast data on the main page
function displayForecast(data) {
    const tableBody = document.getElementById('table-body');
    if (tableBody) {
        tableBody.innerHTML = '';  // Clear previous data

        // Filter forecast to show only one entry per day (12:00:00 time)
        const dailyForecasts = data.list.filter(item => item.dt_txt.includes('12:00:00'));

        dailyForecasts.forEach(item => {
            const row = document.createElement('tr');
            const date = new Date(item.dt_txt).toLocaleDateString();
            const temp = `${item.main.temp}°C`;
            const weather = item.weather[0].description;

            row.innerHTML = `
                <td>${date}</td>
                <td>${temp}</td>
                <td>${weather}</td>
            `;
            tableBody.appendChild(row);
        });
    } else {
        console.error('Table body element is missing.');
    }
}

// Variables to hold chart instances
let barChartInstance = null;
let doughnutChartInstance = null;
let lineChartInstance = null;

// Generate charts on the dashboard
function generateCharts(data) {
    const dailyForecasts = data.list.filter(item => item.dt_txt.includes('12:00:00'));
    const temperatures = dailyForecasts.map(item => item.main.temp);
    const weatherConditions = dailyForecasts.map(item => item.weather[0].main);

    // Temperature Bar Chart
    const tempBarChart = document.getElementById('tempBarChart');
    if (tempBarChart) {
        if (barChartInstance) {
            barChartInstance.destroy(); // Destroy previous instance
        }
        barChartInstance = new Chart(tempBarChart, {
            type: 'bar',
            data: {
                labels: dailyForecasts.map(item => new Date(item.dt_txt).toLocaleDateString()),
                datasets: [{
                    label: 'Temperature',
                    data: temperatures,
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1
                }]
            }
        });
    } else {
        console.error('Temperature bar chart element is missing.');
    }

    // Weather Condition Doughnut Chart
    const weatherDoughnutChart = document.getElementById('weatherDoughnutChart');
    if (weatherDoughnutChart) {
        if (doughnutChartInstance) {
            doughnutChartInstance.destroy(); // Destroy previous instance
        }
        const conditionCounts = {};
        weatherConditions.forEach(condition => {
            conditionCounts[condition] = (conditionCounts[condition] || 0) + 1;
        });

        doughnutChartInstance = new Chart(weatherDoughnutChart, {
            type: 'doughnut',
            data: {
                labels: Object.keys(conditionCounts),
                datasets: [{
                    data: Object.values(conditionCounts),
                    backgroundColor: ['#f39c12', '#4a90e2', '#d3d3d3', '#95a5a6']
                }]
            }
        });
    } else {
        console.error('Weather doughnut chart element is missing.');
    }

    // Temperature Line Chart
    const tempLineChart = document.getElementById('tempLineChart');
    if (tempLineChart) {
        if (lineChartInstance) {
            lineChartInstance.destroy(); // Destroy previous instance
        }
        lineChartInstance = new Chart(tempLineChart, {
            type: 'line',
            data: {
                labels: dailyForecasts.map(item => new Date(item.dt_txt).toLocaleDateString()),
                datasets: [{
                    label: 'Temperature',
                    data: temperatures,
                    borderColor: '#f39c12',
                    fill: false
                }]
            }
        });
    } else {
        console.error('Temperature line chart element is missing.');
    }
}


// Unit conversion function
function toggleTemperatureUnit() {
    const temperatureElement = document.getElementById('temperature');
    const currentTemp = parseFloat(temperatureElement.textContent);
    const isCelsius = temperatureElement.textContent.includes('°C');
    console.log(isCelsius);

    if (isCelsius) {
        // Convert to Fahrenheit
        const fahrenheitTemp = (currentTemp * 9/5) + 32;
        temperatureElement.textContent = `${fahrenheitTemp.toFixed(2)}°F`;
        
    } else {
        // Convert to Celsius
        const celsiusTemp = (currentTemp - 32) * 5/9;
        temperatureElement.textContent = `${celsiusTemp.toFixed(2)}°C`;
    }
}

// Store forecast data for chatbot queries
let storedForecastData = [];

function storeForecastData(data) {
    const dailyForecasts = data.list.filter(item => item.dt_txt.includes('12:00:00'));
    storedForecastData = dailyForecasts.map(item => ({
        date: new Date(item.dt_txt).toLocaleDateString(),
        temp: item.main.temp,
        weather: item.weather[0].description
    }));
}

// Function to calculate highest, lowest, and average temperature
function calculateTemperatureStats() {
    if (storedForecastData.length === 0) return null;

    const temperatures = storedForecastData.map(item => item.temp);
    const highestTemp = Math.max(...temperatures);
    const lowestTemp = Math.min(...temperatures);
    const avgTemp = (temperatures.reduce((sum, temp) => sum + temp, 0) / temperatures.length).toFixed(2);

    console.log(temperatures);

    return {
        highest: highestTemp,
        lowest: lowestTemp,
        average: avgTemp
    
    };
}

// Function to display chatbot response
function displayResponse(responseText) {
    const chatResponse = document.getElementById('chatbot-response');
    if (chatResponse) {
        chatResponse.textContent = responseText;
        console.log(responseText);
    } else {
        console.error('Chat response element is missing.');
    }
}

// Event listeners
document.addEventListener("DOMContentLoaded", function() {
    // Initialize the app on form submission for the search form
    const searchForm = document.getElementById('search-form');
    if (searchForm) {
        searchForm.addEventListener('submit', function(event) {
            event.preventDefault();
            const cityInput = document.getElementById('city-input').value.trim();
            if (cityInput) {
                // Store the city name in localStorage
                localStorage.setItem('city', cityInput);
                getWeather(cityInput); // Fetch weather for the entered city
            } else {
                alert('Please enter a city name.');
            }
        });
    } else {
        console.error('Search form element is missing.');
    }

  // Initialize the app on form submission for the question form
const questionForm = document.getElementById("question-form");
if (questionForm) {
    questionForm.addEventListener("submit", function(event) {
        event.preventDefault(); // Prevent form from submitting normally

        const userQuestion = document.getElementById("user-question").value.trim();

        // Split the user question into individual questions
        const questions = userQuestion.split(/,|\band\b/i).map(q => q.trim());

        // Calculate the temperature stats
        const stats = calculateTemperatureStats();

        // Check if stats are available
        if (!stats) {
            displayResponse("Please fetch the weather data first.");
            return;
        }

        let responses = [];

        // Check each question for keywords and respond accordingly
        questions.forEach(question => {
            if (question.match(/highest/i)) {
                responses.push(`The highest temperature is ${stats.highest}°C.`);
            } else if (question.match(/lowest/i)) {
                responses.push(`The lowest temperature is ${stats.lowest}°C.`);
            } else if (question.match(/average/i)) {
                responses.push(`The average temperature is ${stats.average}°C.`);
            } else {
                responses.push("I'm sorry, I can only answer questions about highest, lowest, and average temperatures.");
            }
        });

        // Display all responses combined
        displayResponse(responses.join(" "));
    });
} else {
    console.error('Question form element is missing.');
}


    // Load the last searched city from localStorage if available
    const lastCity = localStorage.getItem('city');
    if (lastCity) {
        getWeather(lastCity); // Fetch weather for the last searched city
    }
    document.getElementById('toggle-unit').addEventListener('click', toggleTemperatureUnit);

    let forecastData = null; // Ensure forecastData is initialized globally

    // Fetch weather data for the specified city
    async function fetchWeatherData(city) {
        try {
            const apiKey = '4cf933ce3f3b475447dda1c0f424bd12';
            const response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${apiKey}`);
            if (!response.ok) throw new Error('Failed to fetch weather data');
            forecastData = await response.json();  // Assign fetched data to forecastData
            console.log(forecastData); // Check if forecastData is populated correctly
            enableFilterButtons();  // Enable buttons only after data is fetched
        } catch (error) {
            alert('Error fetching weather data');
            console.error(error);
        }
    }
    
    // Call this function when the user submits the form or presses a button to fetch weather data
    document.getElementById('get-weather-btn').addEventListener('click', () => {
        const city = document.getElementById('city-input').value;  // Get city from input field
        if (city) {
            fetchWeatherData(city); // Fetch weather data for the city
        } else {
            alert('Please enter a city name');
        }
    });
    
    // Enable filter buttons after data is fetched
    function enableFilterButtons() {
        document.getElementById('ascending-temp-btn').disabled = false;
        document.getElementById('descending-temp-btn').disabled = false;
        document.getElementById('filter-rain-btn').disabled = false;
        document.getElementById('highest-temp-btn').disabled = false;
    }
    
    // Initially disable filter buttons until data is fetched
    document.getElementById('ascending-temp-btn').disabled = true;
    document.getElementById('descending-temp-btn').disabled = true;
    document.getElementById('filter-rain-btn').disabled = true;
    document.getElementById('highest-temp-btn').disabled = true;
    
    // FILTER FUNCTIONALITY BELOW
    
    // Show temperatures in ascending order
    document.getElementById('ascending-temp-btn').addEventListener('click', () => {
        if (!forecastData || !forecastData.list || forecastData.list.length === 0) {
            return alert('Please get weather data first');
        }
        const sortedTemps = forecastData.list.slice().sort((a, b) => a.main.temp - b.main.temp);
        displayFilteredResults(sortedTemps);
    });
    
    // Show temperatures in descending order
    document.getElementById('descending-temp-btn').addEventListener('click', () => {
        if (!forecastData || !forecastData.list || forecastData.list.length === 0) {
            return alert('Please get weather data first');
        }
        const sortedTemps = forecastData.list.slice().sort((a, b) => b.main.temp - a.main.temp);
        displayFilteredResults(sortedTemps);
    });
    
    // Filter out days without rain
    document.getElementById('filter-rain-btn').addEventListener('click', () => {
        if (!forecastData || !forecastData.list || forecastData.list.length === 0) {
            return alert('Please get weather data first');
        }
        const rainyDays = forecastData.list.filter(item => item.weather[0].description.toLowerCase().includes('rain'));
        displayFilteredResults(rainyDays);
    });
    
    // Show the day with the highest temperature
    document.getElementById('highest-temp-btn').addEventListener('click', () => {
        if (!forecastData || !forecastData.list || forecastData.list.length === 0) {
            return alert('Please get weather data first');
        }
        const highestTempDay = forecastData.list.reduce((max, item) => item.main.temp > max.main.temp ? item : max, forecastData.list[0]);
        displayFilteredResults([highestTempDay]);
    });
    
    // Function to display filtered results in the new section
    function displayFilteredResults(data) {
        const resultsTable = document.getElementById('filtered-results-table');
        let tableHTML = `<table>
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Temperature (°C)</th>
                                    <th>Condition</th>
                                </tr>
                            </thead>
                            <tbody>`;
        data.forEach(item => {
            tableHTML += `<tr>
                            <td>${new Date(item.dt_txt).toLocaleDateString()}</td>
                            <td>${item.main.temp}°C</td>
                            <td>${item.weather[0].description}</td>
                        </tr>`;
        });
        tableHTML += `</tbody></table>`;
        resultsTable.innerHTML = tableHTML;
    }
    
});
