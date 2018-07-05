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
			console.log(response);
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

// Router

function HashRouter(options) {
  options = options || {};
  this.routes = options.routes || [];
  this.handleUrl(getHash());
  window.addEventListener('hashchange', function () {
    this.handleUrl(getHash());
  }.bind(this));
}

HashRouter.prototype = {
  handleUrl: function handleUrl(url) {
    var _this = this;

    var routes = this.routes || [];
    var result = findRoute(routes, url);
    var route = result[0];
    var params = result[1];
    if (!route) {
      return;
    }

    Promise.resolve().then(function () {
      if (_this.prevRoute && _this.prevRoute.onLeave) {
        return _this.prevRoute.onLeave.call(_this.prevRoute, _this.prevParams);
      }
    }).then(function () {
      if (route.onBeforeEnter) {
        return route.onBeforeEnter.call(route, params);
      }
    }).then(function () {
      _this.prevRoute = route;
      _this.prevParams = params;
      if (route.onEnter) {
        return route.onEnter.call(route, params);
      }
    });
  }
};
function getHash() {
  return decodeURI(window.location.hash).slice(1);
}
function findRoute(routeList, url) {
  var result = [null, null];
  routeList.forEach(function (route) {
    if (result[0]) {
      return;
    }
    if (route.match === url) {
      result = [route, url];
    } else if (route.match instanceof RegExp && route.match.test(url)) {
      result = [route, url.match(route.match)];
    } else if (typeof route.match === 'function' && route.match.call(this, url)) {
      result = [route, route.match.call(this, url)];
    }
  });
  return result;
}

var router = new HashRouter({
  routes: [{
    name: 'coordinates',
    match: /coordinates/,
    onBeforeEnter: function onBeforeEnter() {
      return console.log('onBeforeEnter coordinates');
    },
    onEnter: function onEnter() {
      console.log("onEnter coordinates");
      displayMap();
    },
    onLeave: function onLeave() {
      console.log('onLeave coordinates');
      content.innerHTML = "";
    }
  }, {
    name: 'city',
    match: /city=(.+)/,
    onBeforeEnter: function onBeforeEnter(city) {
      getCityCoordinate(city).then(function (ll) {
        return window.local.hash = 'coordinates=' + ll;
      });
    },
    onEnter: function onEnter(city) {
      return console.log("onEnter city:" + city);
    },
    onLeave: function onLeave(city) {
      return console.log("onLeave city:" + city);
    }
  }, {
    name: 'about',
    match: function match(text) {
      return text === 'about';
    },
    onBeforeEnter: function onBeforeEnter() {
      return console.log("onBeforeEnter about");
    },
    onEnter: function onEnter() {
      console.log("onEnter about");
      (0, _about.displayAbout)();
    },
    onLeave: function onLeave() {
      console.log("onLeave about");
      content.innerHTML = "";
    }
  }, {
    name: 'author',
    match: function match(text) {
      return text === 'author';
    },
    onBeforeEnter: function onBeforeEnter() {
      return console.log('onBeforeEnter author');
    },
    onEnter: function onEnter() {
      console.log('onEnter author');
      (0, _author.displayAuthor)();
    },
    onLeave: function onLeave() {
      console.log('onLeave author');
      content.innerHTML = "";
    }
  }]
});

// Track weather forecast following coordinates

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

// Yandex Map

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

  // Search weather by coordinates

  var searchInput = document.getElementById("search-input");
  var searchBox = document.querySelector("form.search-box");

  searchBox.addEventListener("submit", function (el) {
    el.preventDefault();
    console.log(searchInput.value);
  });
}

// Event Bus

function EventBus() {
  this.handlers = {};
}
EventBus.prototype = {
  on: function on(eventName, callback) {
    this.handlers[eventName] = this.handlers[eventName] || [];
    this.handlers[eventName].push(callback);
  },
  off: function off(eventName) {
    var _this2 = this;

    var data = [].slice.call(arguments, 1);
    data.forEach(function (mainElement) {
      _this2.handlers[eventName] = _this2.handlers[eventName].filter(function (elem) {
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
