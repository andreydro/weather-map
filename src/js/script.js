"use strict";
import { displayAuthor } from "./author";
import { displayAbout } from "./about";

// Router

function HashRouter(options) {
  options = options || {};
  this.routes = options.routes || [];
  this.handleUrl(getHash());
  window.addEventListener('hashchange', function() {
    this.handleUrl(getHash());
  }.bind(this));
}

HashRouter.prototype = {
  handleUrl: function(url) {
    var routes = this.routes || [];
    var result = findRoute(routes, url);
    var route = result[0];
    var params = result[1];
    if(!route) { return; }
    
    Promise.resolve()
      .then(()=> {
        if(this.prevRoute && this.prevRoute.onLeave) {
          return this.prevRoute.onLeave.call(this.prevRoute, this.prevParams);
        }
      })
      .then(() => {
        if(route.onBeforeEnter) {
         return route.onBeforeEnter.call(route, params);
        }
      })
      .then(() => {
        this.prevRoute = route;
        this.prevParams = params;
        if(route.onEnter) {
          return route.onEnter.call(route, params); 
        }
      });
  },
}
function getHash() {
  return decodeURI(window.location.hash).slice(1);
}
function findRoute(routeList, url) {
  var result = [null, null];
  routeList.forEach(function(route) {
    if(result[0]) { return; }
    if(route.match === url) {
       result = [route, url];
    } else if(route.match instanceof RegExp && route.match.test(url)) {
       result = [route, url.match(route.match)];
    } else if(typeof route.match === 'function' && route.match.call(this, url)) {
       result = [route, route.match.call(this, url)];      
    }
  });
  return result;
}

var router = new HashRouter({
  routes: [{
    name: 'coordinates',
    match: /coordinates/,
    onBeforeEnter: () => console.log('onBeforeEnter coordinates'),
    onEnter: () => {console.log(`onEnter coordinates`)
    	              displayMap();
    },
    onLeave: () => { console.log('onLeave coordinates');
                     content.innerHTML = "";
                   }
  },{
    name: 'city',
    match: /city=(.+)/,
    onBeforeEnter: (city) => {
      getCityCoordinate(city).then((ll) => window.local.hash='coordinates=' + ll); 
    },
    onEnter: (city) => console.log(`onEnter city:${city}`),
    onLeave: (city) => console.log(`onLeave city:${city}`)
  },{
    name: 'about',
    match: (text) => text === 'about',
    onBeforeEnter: () => console.log(`onBeforeEnter about`),
    onEnter: () => {
      console.log(`onEnter about`);
      displayAbout();
    },
    onLeave: () => {
      console.log(`onLeave about`);
      content.innerHTML = "";
    }
  },{
    name: 'author',
    match: (text) => text === 'author',
    onBeforeEnter: () => console.log('onBeforeEnter author'),
    onEnter: () => {console.log('onEnter author');
                    displayAuthor();
    },
    onLeave: () => {console.log('onLeave author');
                    content.innerHTML = "";
    }
  }]
});

// Track weather forecast following coordinates

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

// Yandex Map

function displayMap() {
	var content = document.getElementById("content");
	var map = document.getElementById("map");	
	content.innerHTML = "";

	ymaps.ready(init);

	function init() {
		var myMap;
		myMap = new ymaps.Map(
			"map",
			{
				center: [53.9, 27.5667],
				zoom: 10
			}
		);

		myMap.events.add('actionend', function(){
			var latitude = myMap.getCenter()[0];
			var longitude = myMap.getCenter()[1];

			callWeatherWithJsonp(`https://api.darksky.net/forecast/6243939e87a008b4c9ce2f3c02fdd256/${latitude},${longitude}`, function(data) {
			  var weather = document.getElementById("weather");
		    var summary = data.currently.summary;
		    var timezone = data.timezone;
		    var temperatureCelsius = Math.round((data.currently.temperature - 32)/1.8);
		    var windSpeed = data.currently.windSpeed;
		    var text = "<p>" + "In " + timezone + " currently is " + summary + ", " + "</p>" + temperatureCelsius + " degress, <p> wind speed: " + windSpeed + " mph</p>"; 
		    weather.innerHTML = text;
      });
		})
		
	}

	var mainPage = document.getElementById("main");
	content.innerHTML = mainPage.innerHTML;

  // Search weather by coordinates
  
	var searchInput = document.getElementById("search-input");
  var searchBox = document.querySelector("form.search-box");

  searchBox.addEventListener("submit", function(el){
	  el.preventDefault();
	  console.log(searchInput.value);
  });
}

// Event Bus

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

