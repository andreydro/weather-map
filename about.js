function displayAbout() {
	var content = document.getElementById("content");
	content.innerHTML = "";

	var response;
  var xhr = new XMLHttpRequest();
  xhr.open('GET', 'https://api.userinfo.io/userinfos', true);
  xhr.send();

  xhr.onreadystatechange = function() {
	  if(xhr.readyState != 4) return;

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
      var text = "You entered this website from " + city + ", " + country + ". Your IP address: " 
      + ip_address + ". Your coordinates: latitude - " + latitude + ", longtitude - " + longitude;
      content.innerHTML = text;
	  }
  }
}
