var Airtable = require("airtable");
var express = require("express");

var app = express();

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log("srtk.me is up and running on port", port);
});

require("dotenv").config();

var base = new Airtable({
  apiKey: process.env.AIRTABLE_KEY,
}).base(process.env.AIRTABLE_BASE);

app.get('/', function (req, res) {
  res.redirect('https://sarthakmohanty.me');
});

app.get('/:slug', async function (req, res) {
  let url;
  await base('Links').select({
    filterByFormula: '{slug} = "' + req.params.slug + '"'
  }).eachPage(function page(records, fetchNextPage) {
    records.forEach(function (record) {
      url = record.get('destination');
      fetchNextPage();
    });
  });
  if (!url.length) {
    res.send('The URL you specified doesn\'t exist sorry!')
  } else {
  res.redirect(url);
  }
});

/*app.get('/:slug', function (req, res) {
  console.log('{slug} = "' + req.params.slug + '"')
  base('Links').select({
    filterByFormula: '{slug} = "' + req.params.slug + '"'
  }).eachPage(function page(records, fetchNextPage) {
    records.forEach(function (record) {
      var url = record.get('destination');
      fetchNextPage();
    }, function done() {
      console.log(url);
    });
  });
});*/