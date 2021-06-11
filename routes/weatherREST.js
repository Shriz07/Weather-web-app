var express = require('express');
var router = express.Router();
const request = require('request');
const cron = require('node-cron');

const Client = require('pg').Pool;
const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});
client.connect();

cron.schedule('00 8,16 * * *', async () => {
  await getAllWeathers();
});


const openWeatherApi = process.env.OPEN_WEATHER_API;
const weatherBitApi = process.env.WEATHER_BIT_API;
const accuWeatherApi = process.env.ACCU_WEATHER_API;

let citiesAccu = {
  Warsaw: '274663',
  Lodz: "1-274340_1_AL",
  Wroclaw: "2-273125_1_AL",
  Szczecin: "276655",
  Rzeszow: "265516",
  Krakow: "2-274455_1_AL",
  Gdansk: "275174",
  Suwalki: "265549"
};

let cities = ['Warsaw', 'Lodz', 'Wroclaw', 'Szczecin', 'Rzeszow', 'Krakow', 'Gdansk', 'Suwalki'];

function getOpenWeather(city, callback)
{
  var url = "https://api.openweathermap.org/data/2.5/weather?q=" + city + "&units=metric&appid=" + openWeatherApi;
  request(url, { json: true }, (err, res, body) => {
    if (err) { return console.log(err); }
    if(body.Code == '400')
    {
      console.log('Failed to recive data from AccuWeather');
      console.log(body);
      callback(null, null);
    }
    var rain = 0;
    if(body.main.rain != undefined)
      rain = body.main.rain["3h"];
    let weather = {
      station: 'OpenWeather',
      city: city,
      temperature: body.main.temp,
      pressure: body.main.pressure,
      humidity: body.main.humidity,
      rain: rain,
      wSpeed: body.wind.speed,
      wDirection: body.wind.deg
    };
    console.log(weather);
    callback(null, weather);
  });
}

function getWeatherBit(city, callback)
{
  var url = "http://api.weatherbit.io/v2.0/current?city=" + city + "&key=" + weatherBitApi;
  request(url, { json: true }, (err, res, body) => {
    if (err) { return console.log(err); }
    if(body.Code == '400')
    {
      console.log('Failed to recive data from WeatherBit');
      console.log(body);
      callback(null, null);
    }
    let weather = {
      station: 'WeatherBit',
      city: city,
      temperature: body.data[0].temp,
      pressure: body.data[0].pres,
      humidity: body.data[0].rh,
      rain: body.data[0].precip,
      wSpeed: body.data[0].wind_spd,
      wDirection: body.data[0].wind_dir
    };
    callback(null, weather);
  });
}

function getAccuWeeather(city, callback)
{
  var cityCode = citiesAccu[city];
  var url = "http://dataservice.accuweather.com/currentconditions/v1/" + cityCode + "?apikey=" + accuWeatherApi + "&details=true";
  request(url, { json: true }, (err, res, body) => {
    if (err) { return console.log(err); }
    if(body.Code == '400')
    {
      console.log('Failed to recive data from AccuWeather');
      console.log(body);
      callback(null, null);
    }
    else
    {
      let weather = {
        station: 'AccuWeather',
        city: city,
        temperature: body[0].Temperature.Metric.Value,
        pressure: body[0].Pressure.Metric.Value,
        humidity: body[0].RelativeHumidity,
        rain: body[0].Precip1hr.Metric.Value,
        wSpeed: body[0].Wind.Speed.Metric.Value,
        wDirection: body[0].Wind.Direction.Degrees
      };
      callback(null, weather);
    }
  });
}

async function getAllWeathers()
{
  console.log("Getting data from Open Weather");
  for(var j = 0; j < 8; j++)
  {
    var city = cities[j];
    var body;
    getOpenWeather(city, function(err, body) {
      saveWeather(body);
    });
  }
  console.log("Getting data from Weather Bit");
  for(var j = 0; j < 8; j++)
  {
    var city = cities[j];
    var body;
    getWeatherBit(city, function(err, body) {
      saveWeather(body);
    });
  }
  console.log("Getting data from Accu Weather");
  for(city in citiesAccu)
  {
    var city
    var body;
    getAccuWeeather(city, function(err, body) {
      saveWeather(body);
    });
  }
}

async function saveWeather(weather)
{
  console.log("Adding weather data...");
  const data = [weather.station, weather.temperature, weather.pressure, weather.humidity, weather.rain, weather.wSpeed, weather.wDirection, weather.city];
  const query = 'insert into weather (weather_service_name, temperature, pressure, humidity, rain, wind_speed, wind_dir, city) values ($1, $2, $3, $4, $5, $6, $7, $8);';
  return await client.query(query, data);
}

router.get('/', function(req, res, next) {
    getOpenWeather("Warsaw", null);
    res.render('testView');
});

module.exports = router;
