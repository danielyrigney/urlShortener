var express = require('express');
var mongodb = require('mongodb');
var validUrl = require('valid-url');

var app = express();
var MongoClient = mongodb.MongoClient;
var url = 'mongodb://danrigs:123@ds161503.mlab.com:61503/websites';
var websites;

app.use(express.static(__dirname + '/public'));

app.get("/", function (request, response) {
  response.sendfile(__dirname + '/views/index.html');
});


MongoClient.connect(url, function (err, db) {
  if (err) {
    console.log('Unable to connect to the mongoDB server. Error:', err);
  } else {
    console.log('Connection established to', url);
    
    websites = db.collection('websites');
  }
});

app.get('/new/:website(*)', function (request, response) {

  var website = request.params.website;
  //response.send(website);
  
  
  if (validUrl.isHttpUri(website)){
    websites.insert({website: website}, function(err,docIdArr) {
      var docId = docIdArr.insertedIds;
      console.log(docId);
      var newUrl = "https://enshrined-staircase.glitch.me/" + docId;
      response.send({newUrl, website});  
    });
  } else {
      response.send("Not a valid url")
  }
});


app.get("/:urlrequest", function (request, response) {
  var urlrequest = request.params.urlrequest;   
  var id = require('mongodb').ObjectID(urlrequest);
  var query = {"_id": id};
  
  websites.find(query).toArray(function(err, doc) {
    if (err) throw err;
    var newSite = doc[0].website;
    //response.send(typeof newSite);
    response.redirect(newSite);
  }); 
  
  
});

var listener = app.listen("3000", function () {
  console.log('Your app is listening on port ' + listener.address().port);
});