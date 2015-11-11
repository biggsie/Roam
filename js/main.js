// console.log('hello from main.js');
 
var map;
var marker;
var photoPageIndex = 0
var cityState;


// var photoData = {
//     'set' : 'public',
//     'from' : photoPageIndex,
//     'to' : photoPageIndex + 40,
//     'minx' : '-180',
//     'miny' : '-90',
//     'maxx' : '180',
//     'maxy' : '90',
//     'size' : 'medium',
//     'mapfilter' : 'true'
//   };

$(document).ready(function() {
  lon = $.urlParam('lon')
  lat = $.urlParam('lat')
  photo_id = $.urlParam('id')

  console.log('dom ready. lat:' + lat + ' lon:' + lon);
  
  if (lat !== null) {
      map = initializeMap(lat,lon);
      console.log('lat lon but no image');
      mapClicked(lat,lon);
  } else {
    lat = 37.78000699;
    lon = -122.394711971282;
    map = initializeMap(lat,lon);
    console.log(map + 'has been created');
    // getPanaramioImages(photoData);
    photoPageIndex = 1;
    getPopularPhotos(photoPageIndex);
  }

});

$(window).load(function(){
  console.log("images have loaded");
  
  // if mobile breakpoint, load sly
  if($("#logo").css("font-size")=="22px") {
      console.log('attempting to start sly')
      $('#photos').sly({
        horizontal: 1,
        itemNav: 'basic',
        scrollBy: 1,
        dragging: 1,
        speed: 1500,
        releaseSwing: 1,
        elasticBounds: 1,
        mouseDragging: 1,
        touchDragging: 1,
        activateOn: 'click',
        easing: 'easeOutExpo',
        startAt: 1,
        dragHandle: 1
      });
  }
});



$('#backToPopular').click( function() {
  console.log('back clicked');
  $('#nowShowing').html(" Showing: Popular");
  $('#backToPopular').hide();
  var photoPageIndex = 0;
  getPopularPhotos(photoPageIndex);
  });

$('#next').click( function() {
  photoPageIndex = photoPageIndex + 40;
  getPopularPhotos(photoPageIndex);
  });




function getPopularPhotos (index) {
   console.log(photoPageIndex);
   var photoData = {
    'set' : 'public',
    'from' : index,
    'to' : index + 40,
    'minx' : '-180',
    'miny' : '-90',
    'maxx' : '180',
    'maxy' : '90',
    'size' : 'small',
    'mapfilter' : 'true'
  };
  ga('send', 'event', 'button', 'click', 'next');
  $( "#slidee" ).empty();
  getPanaramioImages(photoData);
}

// attach click handler to images via event delegation
$('#photos').on('mouseover', '.imageBox', function() {
    $('.imageBox').toggleClass('.overState')
});

// attach click handler to images via event delegation
$('#photos').on('click', '.imageBox', function() {
    var lat = $(this).data("lat");
    var lon = $(this).data("lon");
    var sw_lat = lat - 1;
    var sw_lon = lon - 1;
    var ne_lat = lat + 1;
    var ne_lon = lon + 1;
    var zoom = map.getZoom();
    var airbnbLink = "<a href=https://www.airbnb.com/s/?zoom=" + zoom + "&search_by_map=true&sw_lat=" + sw_lat + "&sw_lng=" + sw_lon + "&ne_lat=" + ne_lat + "&ne_lng=" + ne_lon + " target= 'blank'>Stay here on Airbnb</a>";

    var photo_id = $(this).data("id");
    window.location.hash = '#lat=' + lat + '&lon=' + lon + "&id=" + photo_id;
    // console.log('Image clicked! Lat=' + lat + ' Lon=' + lon);
    placeMarker(lat,lon);

    var original_url = $(this).data('url').split("medium").join("original");
    
    var infoWidowContent = 
      "<div id='infoBox'><p>" + 
      $(this).data('title') + 
      "</p><a href='" + 
      $(this).data('pageurl') + 
      "' target='blank'>Credit</a>" + airbnbLink + "<img src=http://static.panoramio.com/photos/medium/" + 
      $(this).data('id') + ".jpg></div>";
    ga('send', 'event', 'photo', 'click', $(this).data('url'));
    // console.log(infoWidowContent);

    infoWidowWidth = $('#map-canvas').width() * .6;

    var infowindow = new google.maps.InfoWindow({
        content: infoWidowContent,
        // disableAutoPan: true,
        maxWidth: infoWidowWidth
    });
    infowindow.open(map,marker);
    // getAirbnbListings(lat,lon);

    // Try to fit infoWindow into viewable map area. 

    // var e = map.getBounds();
    // var NE = e.getNorthEast();
    // var SW = e.getSouthWest();
    // var NElat = NE.lat();
    // var NElon = NE.lng();
    // var SWlat = SW.lat();
    // var SWlon = SW.lng();
    // var centerLat = ((NElat - SWlat) * .9) + SWlat;
    // var centerLon = ((NElon - SWlon) / 2) + SWlon;

    // map.setCenter({lat:centerLat, lng:centerLon});

});


function initializeMap(lat,lon) {
  console.log('maps initialize called: lat: ' + lat + ' lon:' + lon);
  var mapOptions = {
    center: new google.maps.LatLng(lat, lon),
    zoom: 8,
    mapTypeId: google.maps.MapTypeId.ROADMAP,
    mapTypeControl: false,
    streetViewControl: false
    // disableDefaultUI: true
  };

  var map = new google.maps.Map(document.getElementById("map-canvas"), mapOptions);
  marker =  new google.maps.Marker({
      position: {lat:lat, lng:lon}, 
      map: map
    });

  google.maps.event.addListener(map, 'click', function(e) {
    console.log('lat = ' + e.latLng.lat() + 'lon = ' + e.latLng.lng() );
    mapClicked(e.latLng.lat(),e.latLng.lng());
  });

  // google.maps.event.addListener(map, 'bounds_changed', function() {
  //   console.log('change');
  //   var e = map.getBounds();
  //   var NE = e.getNorthEast();
  //   var SW = e.getSouthWest();
  //   var NElat = NE.lat();
  //   var NElon = NE.lng();
  //   var SWlat = SW.lat();
  //   var SWlon = SW.lng();
    
  //   // console.log("NELat " + NElat);
  //   // console.log("NELon " + NElon);
  //   // console.log("SWLat " + SWlat);
  //   // console.log("SWLon " + SWlon);  


  // });
  return map;
}

function mapClicked(lat,lon) {
  // TODO fix placemarker by adding loaded callback to google map load.
  // placeMarker(lat,lon);
  console.log('mapclicked called');
  window.location.hash = '#lat=' + lat + '&lon=' + lon;
  ga('send', 'event', 'map', 'click', encodeURI(window.location));
  //getImagesWithLatLong(lat,Lng);

  var photoData = {
      'set' : 'public',
      'from' : '0',
      'to' : '40',
      'minx' : Number(lon) - .25,
      'miny' : Number(lat) - .25,
      'maxx' : Number(lon) + .25,
      'maxy' : Number(lat) + .25,
      'size' : 'small',
      'mapfilter' : 'true'
  };
  console.log(photoData);
  $( "#slidee" ).empty();
  getPanaramioImages(photoData);
  cityState = getLocation(lat,lon);
  
}




function getPanaramioImages(photoData) {
  var url = 'http://www.panoramio.com/map/get_panoramas.php';

  $.ajax({
    "dataType" : "jsonp",
    "url" : url,
    "data" : photoData,
    "success" : getImagesRequest
  });
}

function getImagesRequest(photoFeed) {
  console.log('getImages has been called!');

  $.each(photoFeed.photos, function(index, photos) {
      // console.log(photos.photo_file_url);

    $( "#slidee" ).append("<li><img src='" + photos.photo_file_url + "' class='imageBox' data-lat=" + photos.latitude +" data-lon=" + photos.longitude +  " data-pageUrl=" + photos.photo_url +  " data-title='" + photos.photo_title +  "' data-url=" + photos.photo_file_url + " data-id=" + photos.photo_id + "></li>");
  });

  }

function placeMarker(lat,lon) {
  // console.log('placeMarker called, lat =' + lat + ' lon =' + lon + " map = " + map);
  // clear old marker
  marker.setMap();
  map.panTo({lat: lat, lng: lon});
  marker =  new google.maps.Marker({
      position: {lat: lat, lng: lon}, 
      map: map
    });
  // console.log('marker = ' + marker);
}

function getLocation(lat,lon) {
  var url = 'https://maps.googleapis.com/maps/api/geocode/json';
  var latLng = lat + ',' + lon;
  // console.log('latLng = ' + latLng);
  var data = { 
    'latlng' : latLng,
    'key' : 'AIzaSyAMD2fa_Kp1nkkhiVZzmcmiAY3mrJXuN1c'
        };
  
  // console.log(data);

  $.ajax ({
    url: url,
    data: data,
    dataType: 'json'
    }).done(function(data) {
      var cityState = data.results[0].formatted_address;
      // console.log("SUCCESS!");
      // console.log('just retrieved' + cityState);  
      showLocation(cityState);
      return cityState;
    }).fail(function(jqXHR, textStatus, errorThrown){
      console.log(data);
      console.log("FAIL!");
    });
}

function showLocation(cityState) {
  // console.log('trying to display location:' + cityState);
  $('#backToPopular').show();
  $('#nowShowing').html(" Showing: " + cityState);
}

$.urlParam = function(name){
  var results = new RegExp('[\?#&]' + name + '=([^&#]*)').exec(window.location.href);
  if (results==null){
    return null;
    }
    else{
      return results[1] || 0;
    }
  };



