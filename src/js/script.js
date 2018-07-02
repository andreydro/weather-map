"use strict";
import { displayAuthor } from "./author";
import { displayAbout } from "./about";

window.onhashchange = function() {
	displayPage(window.location.hash || "#main");
};

displayPage(window.location.hash || "#main");

function displayPage(hash) {
	if (hash == "#main") {
		displayMap();
	} else if (hash == "#about") {
		displayAbout();
	} else if (hash == "#author") {
		displayAuthor();
	}
}

function displayMap() {
	var content = document.getElementById("content");
	content.innerHTML = "";

	ymaps.ready(init);

	function init() {
		var myMap;
		myMap = new ymaps.Map(
			"map",
			{
				center: [53.9, 27.5667],
				zoom: 9
			}
		);
		console.log(myMap.geoObjects._map._globalPixelCenter);
	}

	var mainPage = document.getElementById("main");
	content.innerHTML = mainPage.innerHTML;
}

function callWeatherWithJsonp(url, callback) {
    var callbackName = 'jsonp_callback_' + Math.round(100000 * Math.random());
    window[callbackName] = function(data) {
        delete window[callbackName];
        document.body.removeChild(script);
        callback(data);
    };

    var script = document.createElement('script');
    script.src = url + (url.indexOf('?') >= 0 ? '&' : '?') + 'callback=' + callbackName;
    document.body.appendChild(script);
}

callWeatherWithJsonp('https://api.darksky.net/forecast/6243939e87a008b4c9ce2f3c02fdd256/53.9,27.5667', function(data) {
	var weather = document.getElementById("weather");
  var summary = data.currently.summary;
  var timezone = data.timezone;
  var temperatureCelsius = Math.round((data.currently.temperature - 32)/1.8);
  var windSpeed = data.currently.windSpeed;
  var text = "<p>" + "In " + timezone + " currently is " + summary + ", " + "</p>" + temperatureCelsius + " degress, <p> wind speed: " + windSpeed + " mph</p>"; 
  weather.innerHTML = text;
});

function EventBus() {
    this.handlers = {};
}
EventBus.prototype = {
    on(eventName, callback) {
        this.handlers[eventName] = this.handlers[eventName] || [];
        this.handlers[eventName].push(callback);
    },
    off(eventName) {
        var data = [].slice.call(arguments, 1);
        data.forEach(mainElement => {
            this.handlers[eventName] = this.handlers[eventName].filter(
                elem => elem != mainElement
            );
        });
    },
    trigger: function(eventName) {
        var data = [].slice.call(arguments, 1);
        if (this.handlers[eventName]) {
            this.handlers[eventName].forEach(function(element) {
                return element.apply(null, data);
            });
        }
    },
    once: function(eventName, callback) {
        var self = this;
        self.on(eventName, function temp() {
            callback.apply(self, arguments);
            self.off(eventName, temp);
        });
    }
};
