// Example from Brad Dayley
// https://github.com/bwdbooks/nodejs-mongodb-angularjs-web-development


var http = require('http');
var url = require('url');
var qstring = require('querystring');
var cookie = [
  "foo=bar",
  "location=city",
];
var city = null;
var forecast = null;

function sendResponse(weatherData, res){
  var page = '<html><head><title>Weather</title></head>' +
    '<body>' +
    '<form method="post">' +
    'City: <input name="city"><br>' +
    '<input type="submit" value="Weather">' +
      '<input type="submit" value="Forecast">'
    '</form>';
  if(weatherData){
    
    var obj = JSON.parse(weatherData);
    if(forecast){
        page += '<h1><p>Weather fprecast</h1><p></p><p><b>City:</b> '+obj.list.name+'<p>'+
            '<b>Min Daily Temp:</b>'+ 
            Math.round((obj.list.temp.min - 273.15)*100)/100+'Degrees Celsius<p>' +
            '<b>Max Daily Temp: </b>' +
            Math.round((obj.list.temp.max - 273.15)*100)/100+'Degrees Celsius<p>' +
            '<b>Weather Description:</b>' +obj.list.weather[0].main+'<p>' +
            '<b>Expanded Weather:</b> '+obj.list.weather[0].description+'</p>';
    }
    page += '<h1><p>Weather Info</h1><p></p><p><b>City:</b> '+obj.name+'<p><b>Current Temp:</b> '+Math.round((obj.main.temp - 273.15)*100)/100+' Degrees Celsius<p><b>Weather Description:</b> '+obj.weather[0].main+'<p><b>Expanded Weather:</b> '+obj.weather[0].description+'</p>';
      
  }
  page += '</body></html>';    
  res.end(page);
}

function parseWeather(weatherResponse, res) {
  var weatherData = '';
  weatherResponse.on('data', function (chunk) {
    weatherData += chunk;
  });
  weatherResponse.on('end', function () {
    sendResponse(weatherData, res);
  });
}
// You will need to go get your own free API key to get this to work
function getWeather(city, res){
  var options = {
    host: 'api.openweathermap.org',
    path: '/data/2.5/weather?q=' + city + "&APPID=f9cd3610e9144f965638b5be216a0b1d"
  };
  http.request(options, function(weatherResponse){
    parseWeather(weatherResponse, res);
  }).end();
}

function getForecast(city, res){
  var options = {
    host: 'api.openweathermap.org',
    path: '/data/2.5/forecast?q=' + city + "&APPID=0130241481d186b1670217b245992e16"
  };
  http.request(options, function(weatherResponse){
    parseWeather(weatherResponse, res);
  }).end();
}

//cookies
createCookie('location', 'city' ,30);
function createCookie(name,value,days) {
    var expires = "";
    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days*24*60*60*1000));
        expires = "; expires=" + date.toUTCString();
    }
    cookie = name + "=" + value + expires + "; path=/";
}

function readCookie(name) {
    var nameEQ = name + "=";
    var ca = cookie.split(';');
    for(var i=0;i < ca.length;i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1,c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
    }
    return null;
}

function eraseCookie(name) {
    createCookie(name,"",-1);
}
//end cookies


var x = readCookie('location')
if (x) {
    city = city;
}

http.createServer(function (req, res) {
  console.log(req.method);
  if (req.method == "POST"){
    var reqData = '';
    req.on('data', function (chunk) {
      reqData += chunk;
    });
    req.on('end', function() {
      var postParams = qstring.parse(reqData);
      getWeather(postParams.city, res);
        
    });
  } 
    else{
    sendResponse(null, res);
        
 if (!(req.method == "POST") && !(req.method =="GET"))
     {
         console.log("ERROR")
         page += "<body><html><p> ERROR 405: Method Not Allowed. <a href='localhost:8080'>HOME</a><p></body></html>"
     }

  }
    
    
}).listen(8080);
