require("dotenv").config();

var express = require("express");
var app = express();
var Airtable = require("airtable");
var cloudflare = require('cloudflare-express');
const cfUserData = require('cloudflare-user-data');
//app.use(cloudflare.restore());

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log("srtk.me is up and running on port", port);
});



var base = new Airtable({
  apiKey: process.env.AIRTABLE_KEY,
}).base(process.env.AIRTABLE_BASE);

app.get('/', async function (req, res) {
  console.log((req.headers['x-forwarded-for'] || '').split(',')[0] || req.connection.remoteAddress);
  console.log(cfUserData());
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
    res.redirect(url);
    }
});