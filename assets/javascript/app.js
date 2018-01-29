// Array to hold city name and corresponding latitude and logitude
var locations = [
    // ['Dubai', 25.0657005, 55.1712799],
    ['Mombasa', -4.0546598, 39.6635895],
    ['Foz do Iguaçu', -25.5477791, -54.5880585],
    ['Empuriabrava', 42.2469101, 3.12059],
    ['Key West', 24.5552406, -81.7816315],
    ['Waialua', 21.5768795, -158.131546]
];

// Variable to store latitude of city for weatherInfo function
var searchLat;
// Variable to store longitude of city search for weatherInfo function
var searchLong;
// To store location place_id for Google Places API Web Services search
var locationPlaceID = [];

// Firebase authentication using Google account Sign In
var config = {
    // Project-1
    apiKey: "AIzaSyB14umVfdO698P_sUXR4J5Xkp755M0LqCA",
    authDomain: "project1-firebase-auth.firebaseapp.com",
    databaseURL: "https://project1-firebase-auth.firebaseio.com",
    projectId: "project1-firebase-auth",
    storageBucket: "project1-firebase-auth.appspot.com",
    messagingSenderId: "558796916951"
 };
 
 firebase.initializeApp(config);
 
 var provider = new firebase.auth.GoogleAuthProvider();
 
 $(document).on("click", ".signIn", function () {
    console.log("Sign In button clicked");
    firebase.auth().signInWithPopup(provider).then(function (result) {
        // This gives you a Google Access Token. You can use it to access the Google API.
        var token = result.credential.accessToken;
        console.log(token);
        // The signed-in user info.
        var user = result.user;
        console.log(user);
        // window.location = '/test-project-1.2/map.html';
 
        // ...
    }).catch(function (error) {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
        console.log(errorMessage);
        // The email of the user's account used.
        var email = error.email;
        // The firebase.auth.AuthCredential type that was used.
        var credential = error.credential;
        // ...
    });
    $(this).removeClass('signIn')
        .addClass('signOut')
        .html('Sign Out Of Google');
 });
 
 $(document).on('click', '.signOut', function () {
    firebase.auth().signOut().then(function () {
        // Sign-out successful.
        // window.location = '/index.html';
    }).catch(function (error) {
        // An error happened.
    });
    $(this).removeClass('signOut')
        .addClass('signIn')
        .html('Sign In with Google');
 });

// Function that initializes and adds the map when the web page loads
function initMap() {
    // Variable for map
    var map;
    // variable for infoWindow
    var infowindow;
    // new google.maps.Map() creates a new Google maps object
    //  getElementById() function to find the map div on the web page
    map = new google.maps.Map(document.getElementById('map'), {
        // Zoom property specifies the zoom level for the map
        zoom: 3,
        // Center property tells the API where to center the map. The map coordinates are set in the order: latitude, longitude.Given below are latitude and logitude of Kenya so that user can see all pinned cities when map loads. 
        center: new google.maps.LatLng(16.716049, -50.168414),
        mapTypeId: google.maps.MapTypeId.ROADMAP
    });

    // InfoWindow displays content (usually text or images) in a popup window above the map, at a given location when user click or mouseover
    infowindow = new google.maps.InfoWindow();

    // For loop to mark/pin each city from the array with marker based on latitude and longitude
    for (var i = 0; i < locations.length; i++) {
        (function (i) {
            var marker = new google.maps.Marker({
                position: new google.maps.LatLng(locations[i][1], locations[i][2]),
                map: map
            });

            google.maps.event.addListener(marker, 'mouseover', (function (marker, i) {
                return function () {

                    infowindow.setContent(locations[i][0]);
                    infowindow.open(map, marker);
                }
            })(marker, i));
            marker.addListener('mouseout', function () {
                infowindow.close();
            });

            // Listener event function to display nearby skydiving locations when user cick on city
            google.maps.event.addListener(marker, 'click', (function () {

                var cityName = infowindow.getContent();
                console.log("City is " + cityName);
                var searchLocation;

                // Zoom map closer to city
                map.setZoom(9);
                map.panTo(marker.position);

                // Assiging the latitude and longitude to variables when user click on the city
                if (cityName == "Waialua") {
                    searchLocation = new google.maps.LatLng(locations[4][1], locations[4][2]);
                    searchLat = locations[4][1];
                    searchLong = locations[4][2];
                } else if (cityName == "Key West") {
                    searchLocation = new google.maps.LatLng(locations[3][1], locations[3][2]);
                    searchLat = locations[3][1];
                    searchLong = locations[3][2];
                } else if (cityName == "Empuriabrava") {
                    searchLocation = new google.maps.LatLng(locations[2][1], locations[2][2]);
                    searchLat = locations[2][1];
                    searchLong = locations[2][2];
                } else if (cityName == "Foz do Iguaçu") {
                    searchLocation = new google.maps.LatLng(locations[1][1], locations[1][2]);
                    searchLat = locations[1][1];
                    searchLong = locations[1][2];
                } else if (cityName == "Mombasa") {
                    searchLocation = new google.maps.LatLng(locations[0][1], locations[0][2]);
                    searchLat = locations[0][1];
                    searchLong = locations[0][2];
                }

                //Parameters for our places request
                var request = {
                    location: searchLocation,
                    radius: 30000,
                    keyword: ['skydiving center']
                };
                //Make the service call to google
                var callPlaces = new google.maps.places.PlacesService(map);
                var iconImage = {
                    url: 'assets/images/skydiving.png', // image is 200 x 200
                    scaledSize: new google.maps.Size(32, 32),
                };
                callPlaces.search(request, function (results, status) {

                    locationPlaceID = results[0].place_id;

                    $.each(results, function (i, place) {
                        var placeLoc = place.geometry.location;
                        var thisplace = new google.maps.Marker({
                            map: map,
                            position: placeLoc,
                            icon: iconImage,
                            title: place.name
                        });
                    })
                    // Call skydivingLocationDetails function to get skydiving location details
                    skydivingLocationDetails();
                });
                // Call wetherInfo function to get weather details of city when user click on city icon
                weatherInfo();
                //call weatherForrecast function to get 5 day forecast when user clicks on city
                $(".btn").show();
                $(".btn").on("click", weatherForecast());
            }));
        })(i);
    }
}

// Function to get current weather info of each city
function weatherInfo() {
    /// API key for weather
    var APIKey = "999df4c3925000e8f0fcd5765a05caf2";
    // Here we are building the URL we need to query the database
    var queryURL = "https://api.openweathermap.org/data/2.5/weather?lat=" + searchLat + "&lon=" + searchLong + "&units=imperial&appid=" + APIKey;
    // Here we run our AJAX call to the OpenWeatherMap API and store all of the retrieved data inside of an object called "response"
    $.ajax({
        url: queryURL,
        method: "GET"
    }).done(function (response) {
        // Transfer content to HTML
        $(".city").html("<strong><h3>" + response.name + " Weather Details:</strong></h3>");
        $(".temp").text("Current Temperature(F): " + response.main.temp + "\xB0");
        $(".desc").text("Weather Descritption:  " + response.weather[0].description);
        $(".humidity").text("Humidity: " + response.main.humidity + "\xB0");
        $(".wind").text("Wind Speed: " + response.wind.speed + " m/s ");
        $(".max").text("Maximum Temperature(F): " + response.main.temp_max + "\xB0");
        $(".min").text("Minimum Temperature(F): " + response.main.temp_min + "\xB0");
    });
}

// Function to get weather info from city
function weatherForecast() {
    /// API key for weather
    var APIKey = "999df4c3925000e8f0fcd5765a05caf2";
    // Query URL
    var forecastURL = "https://api.openweathermap.org/data/2.5/forecast?lat=" + searchLat + "&lon=" + searchLong + "&units=imperial&appid=" + APIKey;
    // ajax call
    $.ajax({
        url: forecastURL,
        method: "GET"
    }).done(function (response) {
        // Appending data from weather API to table on html - to show as a modal
        $("#train-table > tbody").append(
            "<tr><td>" + response.list[1].dt_txt +
            "</td><td>" + response.list[1].main.temp + "\xB0" +
            //"</td><td" + response.list[1].weather.icon +

            "</tr><td>" + response.list[2].dt_txt +
            "</td><td>" + response.list[2].main.temp + "\xB0" +

            "</tr><td>" + response.list[3].dt_txt +
            "</td><td>" + response.list[3].main.temp + "\xB0" +

            "</tr><td>" + response.list[4].dt_txt +
            "</td><td>" + response.list[4].main.temp + "\xB0" +

            "</tr><td>" + response.list[5].dt_txt +
            "</td><td>" + response.list[5].main.temp + "\xB0" +

            "</tr><td>" + response.list[6].dt_txt +
            "</td><td>" + response.list[6].main.temp + "\xB0" +

            "</tr><td>" + response.list[7].dt_txt +
            "</td><td>" + response.list[7].main.temp + "\xB0" +

            "</tr><td>" + response.list[8].dt_txt +
            "</td><td>" + response.list[8].main.temp + "\xB0" +

            "</tr><td>" + response.list[9].dt_txt +
            "</td><td>" + response.list[9].main.temp + "\xB0" +

            "</tr><td>" + response.list[10].dt_txt +
            "</td><td>" + response.list[10].main.temp + "\xB0" +

            "</tr><td>" + response.list[11].dt_txt +
            "</td><td>" + response.list[11].main.temp + "\xB0" +

            "</tr><td>" + response.list[12].dt_txt +
            "</td><td>" + response.list[12].main.temp + "\xB0" +

            "</tr><td>" + response.list[13].dt_txt +
            "</td><td>" + response.list[13].main.temp + "\xB0" +

            "</tr><td>" + response.list[14].dt_txt +
            "</td><td>" + response.list[14].main.temp + "\xB0" +

            "</tr><td>" + response.list[15].dt_txt +
            "</td><td>" + response.list[15].main.temp + "\xB0" +

            "</tr><td>" + response.list[16].dt_txt +
            "</td><td>" + response.list[16].main.temp + "\xB0" +

            "</tr><td>" + response.list[17].dt_txt +
            "</td><td>" + response.list[17].main.temp + "\xB0" +

            "</tr><td>" + response.list[18].dt_txt +
            "</td><td>" + response.list[18].main.temp + "\xB0" +

            "</tr><td>" + response.list[19].dt_txt +
            "</td><td>" + response.list[19].main.temp + "\xB0" +

            "</tr><td>" + response.list[20].dt_txt +
            "</td><td>" + response.list[20].main.temp + "\xB0" +

            "</tr><td>" + response.list[21].dt_txt +
            "</td><td>" + response.list[21].main.temp + "\xB0" +

            "</tr><td>" + response.list[22].dt_txt +
            "</td><td>" + response.list[22].main.temp + "\xB0" +

            "</tr><td>" + response.list[23].dt_txt +
            "</td><td>" + response.list[23].main.temp + "\xB0" +

            "</tr><td>" + response.list[24].dt_txt +
            "</td><td>" + response.list[24].main.temp + "\xB0" +

            "</tr><td>" + response.list[25].dt_txt +
            "</td><td>" + response.list[25].main.temp + "\xB0" +

            "</tr><td>" + response.list[26].dt_txt +
            "</td><td>" + response.list[26].main.temp + "\xB0" +

            "</tr><td>" + response.list[27].dt_txt +
            "</td><td>" + response.list[27].main.temp + "\xB0" +

            "</tr><td>" + response.list[28].dt_txt +
            "</td><td>" + response.list[28].main.temp + "\xB0" +

            "</tr><td>" + response.list[29].dt_txt +
            "</td><td>" + response.list[29].main.temp + "\xB0" +

            "</tr><td>" + response.list[30].dt_txt +
            "</td><td>" + response.list[30].main.temp + "\xB0" +

            "</tr><td>" + response.list[31].dt_txt +
            "</td><td>" + response.list[31].main.temp + "\xB0" +

            "</tr><td>" + response.list[32].dt_txt +
            "</td><td>" + response.list[32].main.temp + "\xB0" +

            "</tr><td>" + response.list[33].dt_txt +
            "</td><td>" + response.list[33].main.temp + "\xB0" +

            "</tr><td>" + response.list[34].dt_txt +
            "</td><td>" + response.list[34].main.temp + "\xB0" +

            "</tr><td>" + response.list[35].dt_txt +
            "</td><td>" + response.list[35].main.temp + "\xB0" +

            "</tr><td>" + response.list[36].dt_txt +
            "</td><td>" + response.list[36].main.temp + "\xB0" +

            "</tr><td>" + response.list[37].dt_txt +
            "</td><td>" + response.list[37].main.temp + "\xB0" +

            "</tr><td>" + response.list[38].dt_txt +
            "</td><td>" + response.list[38].main.temp + "\xB0" +

            //   "</tr><td>" + response.list[39].dt_txt +
            //"</td><td>" + response.list[39].main.temp + "\xB0"  +

            "</td></tr>");
    });
}

// Function to get weather info from city
function skydivingLocationDetails() {
    /// API key for Google Places API Web Service
    // var googleWebServiceAPIKey = "AIzaSyCopXFH0eqDJPzFsLPyq27LHvsVcWwQk9s";
    var googleWebServiceAPIKey = "AIzaSyD6TtKmU29ucB4bMn_4ag_XpsPK7IUR-C4";
    // Query URL
    var locationQueryURL = "https://maps.googleapis.com/maps/api/place/details/json?placeid=" + locationPlaceID + "&key=" + googleWebServiceAPIKey;

    // Code to fix CORS issue
    jQuery.ajaxPrefilter(function (options) {
        if (options.crossDomain && jQuery.support.cors) {
            options.url = 'https://cors-anywhere.herokuapp.com/' + options.url;
        }
    });

    // Ajax Call
    $.ajax({
        url: locationQueryURL,
        method: "GET"
    }).done(function (locationResponse) {
        // Storing result of search in a variable
        var searchResults = locationResponse.result;

        // Transfer content to HTML
        $(".locationDetails").html("<h3>Skydiving Location Details: </h3");
        $(".locationName").text("Name: " + searchResults.name);
        $(".locationAddress").text("Address: " + searchResults.formatted_address);
        $(".locationPhone").text("International Phone Number: " + searchResults.international_phone_number);
        $(".locationWebsite").text("Website: ")
        $(".locationWebsite").append("<a href='" + searchResults.website + "' target='_blank'>" + searchResults.website + "</a>");
        $(".locationRating").text("Rating: " + searchResults.rating);

        // To Pull and Display Location Operating Hours
        var locationOpHours = searchResults.opening_hours;
        if (locationOpHours != undefined) {
            var locationHours = searchResults.opening_hours.weekday_text;
            for (var i = 0; i < locationHours.length; i++) {
                var hourDiv = $("<div>");
                var testHour = $("<p>");
                testHour = locationHours[i];
                hourDiv.append(testHour);
                hourDiv.append($("<br>"));
                $(".locationHours").append(testHour);
                $(".locationHours").append($("<br>"));
            }
        }

        // To Pull and Display Location Photos
        var pictures = searchResults.photos;
        for (var i = 0; i < pictures.length; i++) {
            var imageDiv = $("<div class='image-div'>");
            var testImage = $("<img>");
            var imgRef = pictures[i].photo_reference;
            var photoURL = "https://maps.googleapis.com/maps/api/place/photo?photoreference=" + imgRef + "&sensor=false&maxheight=500&maxwidth=500&key=" + googleWebServiceAPIKey;
            testImage.attr("src", photoURL);
            imageDiv.append(testImage);
            $(".locationPhotos").append(imageDiv);
        }
    });
}

// Ready Function
$(document)
    .ready(function () {
        $(".btn").show();
        initMap();
    });