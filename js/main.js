var map;
var marker;
var photoPageIndex = 1
var cityState;
var infowindow;
var mode = 'popular';

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
  lat = $.urlParam('lat')
  lon = $.urlParam('lon')
  photoId = $.urlParam('id')
  // photoPageIndex = $.urlParam('page')
  console.log('dom ready. lat:' + lat + ' lon:' + lon);
  
  if (lat !== null) {
      if (photoId !== null) {
      map = initializeMap(lat,lon);
      console.log('lat lon AND image');
      mapClicked(lat,lon); 
      var photoDetails = getSingle500pxImage(photoId);    

      } else {
      map = initializeMap(lat,lon);
      console.log('lat lon but no image');
      mapClicked(lat,lon);
      }
  } else {
    console.log('no params found. starting in default state.')
    map = initializeMap();
    console.log(map + 'has been created');
    // getPanaramioImages(photoData);
    // photoPageIndex = 1;
    // getPopularPhotos();
    get500pxImages();
    if (photoId !== null) {
      var photoDetails = getSingle500pxImage(photoId);
    }
  }

});

$(window).load(function(){
  console.log("images have loaded");
  
  // if mobile breakpoint, load sly
  if($("#logo").css("font-size")=="22px") {
      console.log('mobile breakpoint detected. starting sly.')
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

$('#logo').click( function() {
    removeHash("id");
    removeHash("lon");
    removeHash("lat");
    $('#nowShowing').html(" Showing: Popular");
    $('#backToPopular').hide();
    $( "#slidee" ).empty();
    initializeMap();
    photoPageIndex = 0;
    get500pxImages();
});

$('#backToPopular').click( function() {
  console.log('back clicked');
  $( "#slidee" ).empty();
  $('#nowShowing').html(" Showing: Popular");
  $('#backToPopular').hide();
  photoPageIndex = 0;
  // remove lat lon url params;
  get500pxImages();
  });

$('#next').click( function() {
  ga('send', 'event', 'button', 'click', 'next');
  $( "#slidee" ).empty();
  photoPageIndex++;
  // getPopularPhotos(photoPageIndex);
  get500pxImages();
  });

// function getPopularPhotos (index) {
//    // console.log(photoPageIndex);
//    var photoData = {
//     'set' : 'public',
//     'from' : index,
//     'to' : index + 40,
//     'minx' : '-180',
//     'miny' : '-90',
//     'maxx' : '180',
//     'maxy' : '90',
//     'size' : 'small',
//     'mapfilter' : 'true'
//   };
//   ga('send', 'event', 'button', 'click', 'next');
//   $( "#slidee" ).empty();
//   // getPanaramioImages(photoData); 
//   var lat = null;
//   get500pxImages(photoData,lat);

// }


function initializeMap(lat,lon) {
  if (lat == null) {
    // console.log('Use default location if lat not specified in url params');
    var lat = 37.78000699;
    var lon = -122.394711971282;
  }
  // console.log('maps initialize called: lat: ' + lat + ' lon:' + lon);
  var mapOptions = {
    center: new google.maps.LatLng(lat, lon),
    zoom: 3,
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
    photoPageIndex = 1;
    mapClicked(e.latLng.lat(),e.latLng.lng());
  });

  google.maps.event.addListener(map, 'zoom_changed', function() {
    console.log(map.getZoom());
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
  // infowindow.close();
  console.log('mapclicked called');
  // window.location.hash = '#lat=' + lat + '&lon=' + lon;
  updateHash("lat", lat);
  updateHash("lon", lon);
  removeHash("id");
  ga('send', 'event', 'map', 'click', encodeURI(window.location));

  // console.log(photoData);  
  $( "#slidee" ).empty();
  // getPanaramioImages(photoData);
  get500pxImages();
  cityState = getLocation(lat,lon);
  
}


function get500pxImages() {
  lat = $.urlParam('lat');
  lon = $.urlParam('lon');
  var url = 'https://api.500px.com/v1/photos/search';
  console.log("get500pxImages called. photo index = " + photoPageIndex); 

  var the500pxData = {
    'sort' : 'highest_rating',
    'only' : 'Landscapes,Urban Exploration,Travel',
    'image_size' : '30,4',
    'geo' : '37,-122,12000mi',
    'rpp' : 40,
    'page' : photoPageIndex,
    'consumer_key' : 'ybHVFTDVPaIraKREBQfIlCAboruoo1c5lUoT55OP'
    }   

  if (lat !== null) {
    the500pxData.geo = lat + ',' + lon + ',100mi';
    console.log(the500pxData.geo);
    }
    
  $.ajax({
    "dataType" : "json",
    "url" : url,
    "data" : the500pxData,
    "success" : get500pxImagesRequest,
    "fail" : ga('send', 'event', 'error', '500px api')
    });  

}

function get500pxImagesRequest(photoFeed) {
  // console.log('get500pxImagesRequest has been called!');

  $.each(photoFeed.photos, function(index, photos) {
      // console.log(photos.url);
    $(photos.images).each(function(index, element){
      // console.log(index);
      if(element.size == '4') {
        bigImageUrl = element.url;
        // console.log('found big: ' + bigImageUrl);
        }
      if(element.size == '30') {
        smallImageUrl = element.url;
        // console.log('found small: ' + smallImageUrl);
        }
      })
    // console.log('bigImageUrl = ' + bigImageUrl);
    // console.log('smallImageUrl = ' + smallImageUrl);
    $( "#slidee" ).append("<li><img src='" + photos.image_url + "' class='imageBox' data-lat=" + photos.latitude +" data-lon=" + photos.longitude +  " data-pageUrl=http://500px.com" + photos.url +  " data-title='" + photos.name +  "' data-url=" + smallImageUrl + " data-bigurl=" + bigImageUrl + " data-id=" + photos.id + "></li>");
  });

  }

function getSingle500pxImage(photoId) {
  var url = 'https://api.500px.com/v1/photos/' + photoId;
  // console.log("get500pxImages called");

  var the500pxData = {
    'image_size' : '30,4',
    'consumer_key' : 'ybHVFTDVPaIraKREBQfIlCAboruoo1c5lUoT55OP'
    }   
    
  $.ajax({
    "dataType" : "json",
    "url" : url,
    "data" : the500pxData,
    "success" : mapFields
    });  

  // return(photoDetails);

} 

function mapFields (photo) {
  console.log('Starting mapFields');
  // console.log(photo.photo.images);
  $(photo.photo.images).each(function(index, element){
    // console.log(index);
    if(element.size == '4') {
      bigImageUrl = element.url;
      console.log('found big: ' + bigImageUrl);
      }
    if(element.size == '30') {
      smallImageUrl = element.url;
      console.log('found small: ' + smallImageUrl);
      }
    })

  var photoDetails = {
    "id" : photo.photo.id,
    "title" : photo.photo.name,
    "pageurl" : "http://500px.com" + photo.photo.url,
    "url" : smallImageUrl,
    "bigurl" : bigImageUrl,
    "lat" : photo.photo.latitude,
    "lon" : photo.photo.longitude
    }
  console.log("photoDetails = ");
  console.log(photoDetails);
  launchInfoWindow(photoDetails);

}

// attach click handler to images via event delegation
$('#photos').on('click', '.imageBox', function() {
  // console.log($(this).data());

  launchInfoWindow($(this).data());

});

function launchInfoWindow(photoDetails) {
    var lat = photoDetails.lat;
    // console.log(photoDetails.lat);
    var lon = photoDetails.lon;
    var sw_lat = lat - 1;
    var sw_lon = lon - 1;
    var ne_lat = lat + 1;
    var ne_lon = lon + 1;
    var zoom = map.getZoom();
    var airbnbLink = "<div id=airbnbLink><a href=https://www.airbnb.com/s/?zoom=" + zoom + "&search_by_map=true&sw_lat=" + sw_lat + "&sw_lng=" + sw_lon + "&ne_lat=" + ne_lat + "&ne_lng=" + ne_lon + " target= 'blank'>Stay here:<img src=./img/airbnb_horizontal_lockup_web.png width=75px height=34px></a></div>";

    // var photoId = $(this).data("id");
    var photoId = photoDetails.id;
    updateHash('id',photoId);
    // console.log('Image clicked! Lat=' + lat + ' Lon=' + lon);
    placeMarker(lat,lon);

    var infoWidowContent = 
      "<div id='infoBox'><p>" + 
      photoDetails.title + 
      "</p><a href='" + 
      photoDetails.pageurl + 
      "' target='blank'>Photo Credit<img src=" + photoDetails.bigurl + "></a>" + airbnbLink + "</div>";
    ga('send', 'event', 'photo', 'click', photoDetails.url);
    // console.log(infoWidowContent);

    infoWidowWidth = $('#map-canvas').width() * .7  ;

    var infowindow = new google.maps.InfoWindow({
        content: infoWidowContent,
        // disableAutoPan: true,
        maxWidth: infoWidowWidth
        // maxHeight: 20px
    });
    infowindow.open(map,marker);

    map.panBy(0,-200);
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

function updateHash(key,value) {
  // update hash value if present

  if($.urlParam(key)) {
    currentValue = key + "=" + $.urlParam(key);
    console.log(currentValue);
    var newValue = key + '=' + value;
    window.location.hash = window.location.hash.replace(currentValue, newValue);
  } else {
    // otherwise add hash value
    window.location.hash = window.location.hash + "&" + key + "=" + value;
  }
}

function removeHash(key) {
  var currentHash = window.location.hash.substr(1);
  var currentHashArray = currentHash.split('&');
  var removeIndex;

  $.each(currentHashArray, function( index, element ){
    // console.log( "Index #" + index + ": " + element );
    if(element.search(key) >= 0 ) {
      // console.log("Key is found.")
      removeIndex = index;
    }
  });

  if(removeIndex !== undefined) {
    // console.log('removing index: ' + removeIndex);
    currentHashArray.splice(removeIndex,1);
  };

  // rebuild hash from array
  var newHash = "";
  $.each(currentHashArray, function( index, element) {
    if(index > 0) {
      newHash = newHash + '&';
    }
    // console.log("rebuilding hash. adding... " + element);
    newHash = newHash + element;

  });
  // console.log('new hash = ' + newHash);
  window.location.hash = "#" + newHash;
}



