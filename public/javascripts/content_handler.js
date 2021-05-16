let ID = "";
var socket = io('https://weather-pki.herokuapp.com/');
var table = document.getElementById("tableContent");

const service = document.getElementById("service");
const city = document.getElementById("city");
const days = document.getElementById("days");
city.style.display = "none";
days.style.display = "none";
var choice = 0;
var dInput = 1;
var sSelected = "";
const uname = username;

socket.emit('join', { username: uname });

socket.on('send data', (data) => {
    ID = data.id;
});

socket.on('actual condition data', (data) => {
    console.log('Recived data');
    weatherData = data.weatherData;
    $("#table").empty();

    $("#table").append("<table class='table table-striped table-dark mt-5 text-center'>" +
        "<thead>" +
        "<tr><th colspan='9'>" + sSelected + "</th></tr>" +
        "<tr id='cities'>" +
        "<th>" + "Date collected: " + String(weatherData[0].timestamp) + "</th>" +
        "</tr>" +
        "</thead>" +
        "<tbody id='tableContent'>" +
        "<tr id='temperature'><td>Temperature [Celsius]</td></tr>" +
        "<tr id='pressure'><td>Pressure [hPa]</th></td>" +
        "<tr id='humidity'><td>Humidity [%]</th></td>" +
        "<tr id='rain'><td>Precipitation [mm]</th></td>" +
        "<tr id='wind_speed'><td>Wind speed [m/s]</th></td>" +
        "<tr id='wind_dir'><td>Wind direction [dg]</th></td>" +
        "</tbody>" +
        "</table>");

    for (let data of weatherData) {
        $("#cities").append("<th>" + String(data.city) + "</th>");
        $("#temperature").append("<td>" + String(data.temperature) + "</td>");
        $("#pressure").append("<td>" + String(data.pressure) + "</td>");
        $("#humidity").append("<td>" + String(data.humidity) + "</td>");
        $("#rain").append("<td>" + String(data.rain) + "</td>");
        $("#wind_speed").append("<td>" + String(data.wind_speed) + "</td>");
        $("#wind_dir").append("<td>" + String(data.wind_dir) + "</td>");
    }
});

socket.on('avarage data', (data) => {
    console.log('Recived data');
    weatherData = data.weatherData;

    $("#table").empty();

    $("#table").append("<table class='table table-striped table-dark mt-5 text-center'>" +
        "<thead>" +
        "<tr><th colspan='9'>" + sSelected + "</th></tr>" +
        "<tr id='cities'>" +
        "<th>" + "Avarage of " + dInput + " days" + "</th>" +
        "</tr>" +
        "</thead>" +
        "<tbody id='tableContent'>" +
        "<tr id='temperature'><td>Temperature [Celsius]</td></tr>" +
        "<tr id='pressure'><td>Pressure [hPa]</td></td>" +
        "<tr id='humidity'><td>Humidity [%]</td></td>" +
        "<tr id='rain'><td>Precipitation [mm]</td></td>" +
        "<tr id='wind_speed'><td>Wind speed [m/s]</td></td>" +
        "<tr id='wind_dir'><td>Wind direction [dg]</td></td>" +
        "</tbody>" +
        "</table>");

    for (let data of weatherData) {
        $("#cities").append("<th>" + String(data.city) + "</th>");
        $("#temperature").append("<td>" + String(data.temperature) + "</td>");
        $("#pressure").append("<td>" + String(data.pressure) + "</td>");
        $("#humidity").append("<td>" + String(data.humidity) + "</td>");
        $("#rain").append("<td>" + String(data.rain) + "</td>");
        $("#wind_speed").append("<td>" + String(data.wind_speed) + "</td>");
        $("#wind_dir").append("<td>" + String(data.wind_dir) + "</td>");
    }
})

socket.on('standard deviataion data', (data) => {
    console.log('Recived data');
    weatherData = data.weatherData;

    $("#table").empty();

    $("#table").append("<table class='table table-striped table-dark mt-5 text-center'>" +
        "<thead>" +
        "<tr><th colspan='9'>Standard deviation of " + dInput + " days</th></tr>" +
        "<tr id='cities'>" +
        "<th>" + citySelect.options[citySelect.selectedIndex].text + "</th>" +
        "</tr>" +
        "</thead>" +
        "<tbody id='tableContent'>" +
        "<tr id='temperature'><td>Temperature [Celsius]</td></tr>" +
        "<tr id='pressure'><td>Pressure [hPa]</td></tr>" +
        "<tr id='humidity'><td>Humidity [%]</td></tr>" +
        "<tr id='rain'><td>Precipitation [mm]</td></tr>" +
        "<tr id='wind_speed'><td>Wind speed [m/s]</td></tr>" +
        "<tr id='wind_dir'><td>Wind direction [dg]</td></tr>" +
        "</tbody>" +
        "</table>");

    for (let data of weatherData) {
        $("#cities").append("<th>" + String(data.weather_service_name) + "</th>");
        $("#temperature").append("<td>" + String(data.temperature) + "</td>");
        $("#pressure").append("<td>" + String(data.pressure) + "</td>");
        $("#humidity").append("<td>" + String(data.humidity) + "</td>");
        $("#rain").append("<td>" + String(data.rain) + "</td>");
        $("#wind_speed").append("<td>" + String(data.wind_speed) + "</td>");
        $("#wind_dir").append("<td>" + String(data.wind_dir) + "</td>");
    }

});

function updateData() 
{
    var serviceSelect = document.getElementById("serviceSelect");
    var citySelect = document.getElementById("citySelect");

    sSelected = serviceSelect.options[serviceSelect.selectedIndex].text;
    var cSelected = citySelect.options[citySelect.selectedIndex].text;
    dInput = document.getElementById("daysInput").value;

    if (dInput < 1 || dInput > daysDB)
    dInput = daysDB;

    if (choice == 0) {
        socket.emit('get actual conditions', { email: uname, service: sSelected.replace(/\s/g, ''), days: dInput });
    }
    else if (choice == 1) {
        socket.emit('get avarage', { email: uname, service: sSelected.replace(/\s/g, ''), days: dInput });
    }
    else if (choice == 2) {
        socket.emit('get standard deviataion', { email: uname, city: cSelected, days: dInput });
    }
}

function checkDays()
{
    var text = "Valid days are between 1 and " + daysDB;
    var x = document.getElementById("daysInput").value;

    if(isNaN(x) || x < 1 || x > daysDB)
        document.getElementById("daysWarning").innerHTML = text;
    else
        document.getElementById("daysWarning").innerHTML = "";
}

function changeType(id) 
{
    if (id == 0)//Actual conditions
    {
        choice = id;
        service.style.display = "flex";
        city.style.display = "none";
        days.style.display = "none";
    }
    else if (id == 1)//Avarage
    {
        choice = id;
        service.style.display = "flex";
        city.style.display = "none";
        days.style.display = "flex";
    }
    else if (id == 2)//Standard deviataion
    {
        choice = id;
        service.style.display = "none";
        city.style.display = "flex";
        days.style.display = "flex";
    }
};