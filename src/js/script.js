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

function callWeatherApi() {
	var response;
	var xhr = new XMLHttpRequest();
	xhr.open("GET", "https://api.darksky.net/forecast/6243939e87a008b4c9ce2f3c02fdd256/53.9,27.5667", true);
	xhr.send();

	xhr.onreadystatechange = function() {
		if (xhr.readyState != 4) return;

		if (xhr.status != 200) {
			console.log(xhr.status + ": " + xhr.statusText);
		} else {
			response = JSON.parse(xhr.responseText);
			console.log(response);
		}
	};
}

function callWeatherApi();

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
