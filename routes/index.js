var express = require('express');
var router = express.Router();
const request = require('request');
const cron = require('node-cron');
const { google } = require('googleapis');
const OAuth2Data = require('../secret.json');
var app = express();
var db = require('./dbfunctions');

const CLIENT_ID = OAuth2Data.web.client_id;
const CLIENT_SECRET = process.env.GOOGLE_API;
const REDIRECT_URL = OAuth2Data.web.redirect_uris;

const oAuth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URL);

let cities = ['Warsaw', 'Lodz', 'Wroclaw', 'Szczecin', 'Rzeszow', 'Krakow', 'Gdansk', 'Suwalki']

var io = app.get('socketio');

router.get('/', function(req, res, next) {
  res.render('index');
});

router.get('/auth', function(req, res, next) {
  if(!req.session.authed)
  {
    const url = oAuth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: 'https://www.googleapis.com/auth/gmail.readonly'
    });
    res.redirect(url);
  }
  else
  {
    res.redirect('/logged');
  }
});

router.get('/weather', async(req, res) => {
  const daysInDB = await db.getDays();
  res.render('loggedin', {email: 'none', days: daysInDB, cities: cities, lastvisit: 'unknown', counter: 'unknown'});
});

router.get('/logged', async(req, res) => {
  if(req.session.authed == true)
  {
    const gmail = google.gmail({version: 'v1', auth: oAuth2Client});
    const profile = await gmail.users.getProfile({userId: 'me'});
    if(!req.session.user)
      req.session.user = profile.data.emailAddress;
    
    let user = await db.checkIfUserExists(profile.data.emailAddress);
    if(user.rowCount == 1)
      await db.updateUser(profile.data.emailAddress);
    else
    {
      await db.addUser(profile.data.emailAddress);
      user = await db.checkIfUserExists(profile.data.emailAddress);
    }
    const d = new Date(user.rows[0].lastvisit);
    let converted = d.getHours() + ":" + d.getMinutes() + ", " + d.toDateString();
    const daysInDB = await db.getDays();
    res.render('loggedin', {email: req.session.user, days: daysInDB, cities: cities, lastvisit: converted, counter: user.rows[0].counter});
  }
  else
  {
    res.redirect('/');
  }
});

router.get('/logout', function(req, res, next) {
  if(req.session.authed)
  {
    oAuth2Client.revokeToken(req.session.token.access_token, function(err, body) {
      if(err)
      {
        console.log(err);
      }
      else
      {
        req.session.destroy();
        res.redirect('/');
      }
    });
  }
});

router.get('/auth/google/callback', function(req, res){
  const code = req.query.code;
  if(code)
  {
    oAuth2Client.getToken(code, function (err, tokens){
      if(err)
      {
        console.log('Error authenticating');
        console.log(err);
      }
      else
      {
        console.log('Successfully authenticated');
        oAuth2Client.setCredentials(tokens);
        req.session.authed = true;
        req.session.token = tokens;
        res.redirect('/logged')
      }
    });
  }
});

module.exports = {
  router:router,
};
