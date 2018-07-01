"use strict";
import {displayAuthor} from './author';
import {displayAbout} from './about';

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

	var mainPage = document.getElementById("main");
	content.innerHTML = mainPage.innerHTML;
}



ymaps.ready(init);

function init() {
	var myMap;
	myMap = new ymaps.Map(
		"map",
		{
			center: [53.9, 27.5667],
			zoom: 9
		},
		{
			searchControlProvider: "yandex#search"
		}
	);
}
