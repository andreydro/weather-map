(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.displayAbout = displayAbout;
function displayAbout() {
	var content = document.getElementById("content");
	content.innerHTML = "";

	var response;
	var xhr = new XMLHttpRequest();
	xhr.open("GET", "https://api.userinfo.io/userinfos", true);
	xhr.send();

	xhr.onreadystatechange = function () {
		if (xhr.readyState != 4) return;

		if (xhr.status != 200) {
			console.log(xhr.status + ": " + xhr.statusText);
		} else {
			response = JSON.parse(xhr.responseText);
			var country = response.country.name;
			var city = response.city.name;
			var ip_address = response.ip_address;
			var latitude = response.position.latitude;
			var longitude = response.position.longitude;
			var text = "<p>" + "You entered this website from " + city + ", " + country + "." + "</p>" + "<p>" + "Your IP address: " + ip_address + "</p>" + "Your coordinates: latitude - " + latitude + ", longtitude - " + longitude;
			content.innerHTML = text;
		}
	};
}

},{}],2:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.displayAuthor = displayAuthor;
function displayAuthor() {
	var content = document.getElementById("content");
	var author = document.getElementById("author");
	content.innerHTML = author.innerHTML;
}

},{}],3:[function(require,module,exports){
"use strict";

var _author = require("./author");

var _about = require("./about");

window.onhashchange = function () {
    displayPage(window.location.hash || "#main");
};

displayPage(window.location.hash || "#main");

function displayPage(hash) {
    if (hash == "#main") {
        displayMap();
    } else if (hash == "#about") {
        (0, _about.displayAbout)();
    } else if (hash == "#author") {
        (0, _author.displayAuthor)();
    }
}

function callWeatherWithJsonp(url, callback) {
    var callbackName = 'jsonp_callback_' + Math.round(100000 * Math.random());
    window[callbackName] = function (data) {
        delete window[callbackName];
        document.body.removeChild(script);
        callback(data);
    };

    var script = document.createElement('script');
    script.src = url + (url.indexOf('?') >= 0 ? '&' : '?') + 'callback=' + callbackName;
    document.body.appendChild(script);
}

function displayMap() {
    var content = document.getElementById("content");
    var map = document.getElementById("map");
    content.innerHTML = "";

    ymaps.ready(init);

    function init() {
        var myMap;
        myMap = new ymaps.Map("map", {
            center: [53.9, 27.5667],
            zoom: 10
        });

        myMap.events.add('actionend', function () {
            var latitude = myMap.getCenter()[0];
            var longitude = myMap.getCenter()[1];
            callWeatherWithJsonp("https://api.darksky.net/forecast/6243939e87a008b4c9ce2f3c02fdd256/" + latitude + "," + longitude, function (data) {
                var weather = document.getElementById("weather");
                var summary = data.currently.summary;
                var timezone = data.timezone;
                var temperatureCelsius = Math.round((data.currently.temperature - 32) / 1.8);
                var windSpeed = data.currently.windSpeed;
                var text = "<p>" + "In " + timezone + " currently is " + summary + ", " + "</p>" + temperatureCelsius + " degress, <p> wind speed: " + windSpeed + " mph</p>";
                weather.innerHTML = text;
            });
        });
    }

    var mainPage = document.getElementById("main");
    content.innerHTML = mainPage.innerHTML;
}

function EventBus() {
    this.handlers = {};
}
EventBus.prototype = {
    on: function on(eventName, callback) {
        this.handlers[eventName] = this.handlers[eventName] || [];
        this.handlers[eventName].push(callback);
    },
    off: function off(eventName) {
        var _this = this;

        var data = [].slice.call(arguments, 1);
        data.forEach(function (mainElement) {
            _this.handlers[eventName] = _this.handlers[eventName].filter(function (elem) {
                return elem != mainElement;
            });
        });
    },

    trigger: function trigger(eventName) {
        var data = [].slice.call(arguments, 1);
        if (this.handlers[eventName]) {
            this.handlers[eventName].forEach(function (element) {
                return element.apply(null, data);
            });
        }
    },
    once: function once(eventName, callback) {
        var self = this;
        self.on(eventName, function temp() {
            callback.apply(self, arguments);
            self.off(eventName, temp);
        });
    }
};

},{"./about":1,"./author":2}]},{},[3]);
