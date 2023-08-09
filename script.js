
// Variable declaration
var searchCity = $("#search-city");
var searchButton = $("#search-button");
var clearButton = $("#clear-history");
var currentCity = $("#current-city");
var currentTemperature = $("#temperature");
var currentHumidty= $("#humidity");
var currentWSpeed=$("#wind-speed");
var city="";
var sCity=[];

// API key
var APIKey="3c56c6109bf100e5596c4a3fb3812014";

// Searches the city to see if it exists in the entries from the storage
function find(city){
    for (var i=0; i<sCity.length; i++){
        if(city.toUpperCase()===sCity[i]){
            return -1;
        }
    }
    return 1;
}

// Display the curent and future weather to the user after grabbing the city form the input text box
function displayWeather(event){
    event.preventDefault();
    if(searchCity.val().trim()!==""){
        city=searchCity.val().trim();
        currentWeather(city);
    }
}

// Grabs the current weather for the selected city using fetch
function currentWeather(city) {
    var queryURL = "https://api.openweathermap.org/data/2.5/weather?q=" + city + "&APPID=" + APIKey;

    fetch(queryURL)
        .then(response => response.json())
        .then(data => {
            var weathericon = data.weather[0].icon;
            var iconurl = "https://openweathermap.org/img/wn/" + weathericon + "@2x.png";
            var date = new Date(data.dt * 1000).toLocaleDateString();

            currentCity.html(data.name + " (" + date + ") " + "<img src=" + iconurl + ">");

            var tempF = (data.main.temp - 273.15) * 1.80 + 32;
            currentTemperature.html((tempF).toFixed(2) + " &#8457"); //Farenheit symbol
            currentHumidty.html(data.main.humidity + " %");

            var ws = data.wind.speed;
            var windsmph = (ws * 2.237).toFixed(1);
            currentWSpeed.html(windsmph + " MPH");

            forecast(data.id);

            if (data.cod == 200) {
                sCity = JSON.parse(localStorage.getItem("cityname"));
                console.log(sCity);

                if (sCity == null) {
                    sCity = [];
                    sCity.push(city.toUpperCase());
                    localStorage.setItem("cityname", JSON.stringify(sCity));
                    addToList(city);
                } else {
                    if (find(city) > 0) {
                        sCity.push(city.toUpperCase());
                        localStorage.setItem("cityname", JSON.stringify(sCity));
                        addToList(city);
                    }
                }
            }
        })
        .catch(error => {
            console.error("Error fetching weather data:", error);
        });
}

// Grabs the 5-day forecast for current city using fetch
function forecast(cityid) {
    var queryforcastURL = "https://api.openweathermap.org/data/2.5/forecast?id=" + cityid + "&appid=" + APIKey;

    fetch(queryforcastURL)
        .then(response => response.json())
        .then(data => {
            for (i = 0; i < 5; i++) {
                var date = new Date(data.list[i * 8].dt * 1000).toLocaleDateString();
                var iconcode = data.list[i * 8].weather[0].icon;
                var iconurl = "https://openweathermap.org/img/wn/" + iconcode + ".png";
                var tempK = data.list[i * 8].main.temp;
                var tempF = (((tempK - 273.5) * 1.80) + 32).toFixed(2);
                var humidity = data.list[i * 8].main.humidity;

                $("#Date" + i).html(date);
                $("#Img" + i).html("<img src=" + iconurl + ">");
                $("#Temp" + i).html(tempF + " &#8457");
                $("#Humidity" + i).html(humidity + " %");
            }
        })
        .catch(error => {
            console.error("Error fetching forecast data:", error);
        });
}


// Dynamically add the passed city on the search history
function addToList(city){
    var listEl= $("<li>"+city.toUpperCase()+"</li>");
    listEl.attr("class","btn-primary m-2 rounded"); //Applies styles
    listEl.attr("data-value",city.toUpperCase());
    $(".city-list-group").append(listEl);
}

// Display the past search again when the list group item is clicked in search history
function invokePastSearch(event){
    var liEl=event.target;
    if (event.target.matches("li")){
        city=liEl.textContent.trim();
        currentWeather(city);
    }
}

// Render function
function loadlastCity(){
    $("ul").empty();
    var sCity = JSON.parse(localStorage.getItem("cityname"));
    if(sCity!==null){
        sCity=JSON.parse(localStorage.getItem("cityname"));
        for(i=0; i<sCity.length;i++){
            addToList(sCity[i]);
        }
        city=sCity[i-1];
        currentWeather(city);
    }

}

// Clear the search history from the page
function clearHistory(event){
    event.preventDefault();
    sCity=[];
    localStorage.removeItem("cityname");
    document.location.reload();

}
// Click Handlers
searchButton.on("click",displayWeather);
$(document).on("click",invokePastSearch);
$(window).on("load",loadlastCity);
clearButton.on("click",clearHistory);
