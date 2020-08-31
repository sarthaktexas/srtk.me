require("dotenv").config();

var express = require("express");
var app = express();
var Airtable = require("airtable");
const geoip = require('geo-from-ip')

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log("srtk.me is up and running on port", port);
});

var base = new Airtable({
  apiKey: process.env.AIRTABLE_KEY,
}).base(process.env.AIRTABLE_BASE);

app.get('/', function (req, res) {
  var ip = (req.headers['x-forwarded-for'] || '').split(',')[0] || req.connection.remoteAddress;
  var ipData = geoip.allData(ip);
  base('Logging').create({
    "IP": ip,
    "Slug": "/",
    "City": ipData.city,
    "State": ipData.state,
    "Country": ipData.country,
    "Continent": ipData.continent,
    "Postal": ipData.postal,
    "Location": "(" + ipData.location.latitude + "," + ipData.location.longitude + ")",
    "Accuracy": ipData.accuracy,
    "Time Zone": ipData.time_zone
  }, function (err, record) {
    if (err) {
      console.error(err);
      return;
    }
  });
  res.redirect('https://sarthakmohanty.me');
});

app.get('/:slug', async function (req, res) {
  let url;
  await base('Links').select({
    maxRecords: 1,
    filterByFormula: '{slug} = "' + req.params.slug + '"'
  }).eachPage(function page(records, fetchNextPage) {
    records.forEach(function (record) {
      url = record.get('destination');
      fetchNextPage();
    });
  });
  if (!url.length) {
    res.send('The URL you specified doesn\'t exist sorry!');
  } else {
    var ip = (req.headers['x-forwarded-for'] || '').split(',')[0] || req.connection.remoteAddress;
    var ipData = geoip.allData(ip);
    base('Logging').create({
      "IP": ip,
      "Slug": req.params.slug,
      "City": ipData.city,
      "State": ipData.state,
      "Country": ipData.country,
      "Continent": ipData.continent,
      "Postal": ipData.postal,
      "Location": "(" + ipData.location.latitude + "," + ipData.location.longitude + ")",
      "Accuracy": ipData.accuracy,
      "Time Zone": ipData.time_zone
    }, function (err, record) {
      if (err) {
        console.error(err);
        return;
      }
    });
    res.redirect(url);
  }
});