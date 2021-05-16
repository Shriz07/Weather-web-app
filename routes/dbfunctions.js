var express = require('express');
var router = express.Router();
const cron = require('node-cron');
var app = express();

const Client = require('pg').Pool;
const { get } = require('request');
const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});
client.connect();

let cities = ['Warsaw', 'Lodz', 'Wroclaw', 'Szczecin', 'Rzeszow', 'Krakow', 'Gdansk', 'Suwalki']

async function addUser(email) {
  console.log("Adding user");
  const time = Date.now();
  const data = [email, time, time, 1];
  const query = 'insert into users (name, joined, lastvisit, counter) values ($1, to_timestamp($2 / 1000.0), to_timestamp($3 / 1000.0), $4);';
  return await client.query(query, data);
}

async function updateUser(email) {
  console.log("Updating user");
  const time = Date.now();
  const data = [time, email];
  const query = 'update users set counter = counter + 1, lastvisit = to_timestamp($1 / 1000.0) where name = $2';
  return await client.query(query, data);
}

async function checkIfUserExists(email) {
  const query = 'select * from users where name = $1';
  const users = await client.query(query, [email]);
  return users;
}

async function getActualConditions(service)
{
  const query = "select * from weather where weather_service_name=$1 order by timestamp DESC LIMIT 8"
  const allData = await client.query(query, [service]);
  for(let date of allData.rows)
  {
    const d = new Date(date.timestamp);
    let converted = d.getHours() + ":" + d.getMinutes() + ", " + d.toDateString();
    date.timestamp = converted;
  }
  return allData.rows;
}

async function getAvgDaysService(days, service)
{
  const query = "select city, weather_service_name, ROUND(AVG(temperature)::numeric, 2) as temperature, ROUND(AVG(pressure)::numeric, 2) as pressure, ROUND(AVG(humidity)::numeric, 2) AS humidity, ROUND(AVG(rain)::numeric, 2) as rain, ROUND(AVG(wind_speed)::numeric, 2) as wind_speed, ROUND(AVG(wind_dir)::numeric, 2) as wind_dir FROM weather where timestamp > current_date - interval '" + days +"' day GROUP BY city, weather_service_name HAVING weather_service_name=$1;";
  const allData = await client.query(query, [service]);  
  return allData.rows;
}

async function getStandardDev(city, days)
{
  const query = "select weather_service_name, ROUND(stddev(temperature)::numeric, 2) as temperature, ROUND(stddev(pressure)::numeric, 2) as pressure, ROUND(stddev(humidity)::numeric, 2) as humidity, ROUND(stddev(rain)::numeric, 2) as rain, ROUND(stddev(wind_speed)::numeric, 2) as wind_speed, ROUND(stddev(wind_dir)::numeric, 2) as wind_dir FROM weather WHERE timestamp > current_date - interval '" + days +"' day GROUP BY weather_service_name, city HAVING city=$1;";
  const allData = await client.query(query, [city]);
  return allData.rows;
}

async function getDays()
{
  const firstDate = await client.query("select timestamp from weather limit 1");
  var tsdb = firstDate.rows[0].timestamp;
  var ts = Date.now();
  var currentTimestamp = new Date(ts);
  const oneDay = 24 * 60 * 60 * 1000;
  var diffDays = Math.round(Math.abs((tsdb - currentTimestamp) / oneDay)) + 1;
  console.log(diffDays);
  return diffDays;
}

module.exports = {
    router:router,
    getDays:getDays,
    getAvgDaysService:getAvgDaysService,
    getStandardDev:getStandardDev,
    getActualConditions:getActualConditions,
    addUser:addUser,
    updateUser:updateUser,
    checkIfUserExists:checkIfUserExists
  };