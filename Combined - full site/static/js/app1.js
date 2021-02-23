// global
var myMap = "";

$(document).ready(function() {
    makeMap();
});

//this function is going to grab the data needed for the map
function makeMap() {
    var queryUrl = "static/data/Stores.geojson"

    // Perform a GET request to the query URL
    $.ajax({
        type: "GET",
        url: queryUrl,
        success: function(data) {
            buildMap(data);
        },
        error: function(XMLHttpRequest, textStatus, errorThrown) {
            alert("Status: " + textStatus);
            alert("Error: " + errorThrown);
        }
    });
}

function buildMap(data) {

    var dark_mode = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
        attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
        tileSize: 512,
        maxZoom: 18,
        zoomOffset: -1,
        id: "mapbox/dark-v10",
        accessToken: API_KEY
    });

    var light_mode = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
        attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
        tileSize: 512,
        maxZoom: 18,
        zoomOffset: -1,
        id: "mapbox/light-v10",
        accessToken: API_KEY
    });

    var satellite_mode = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
        attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
        tileSize: 512,
        maxZoom: 18,
        zoomOffset: -1,
        id: "mapbox/satellite-v9",
        accessToken: API_KEY
    });

    myMap = L.map("map", {
        center: [32.7767, -96.7970],
        zoom: 12,
        layers: [dark_mode, satellite_mode, light_mode]
    });
    var marker_clusters = L.markerClusterGroup();
    data.features.forEach(function(starbuck) {
        var marker = L.marker([starbuck.geometry.coordinates[1], starbuck.geometry.coordinates[0]], {
            draggable: false
        });
        marker.bindPopup(`<strong>${starbuck.properties['Store Name']}</strong> <hr> <strong>${starbuck.properties.City}, ${starbuck.properties['State/Province']}</strong>`);
        marker_clusters.addLayer(marker);
    });

    marker_clusters.addTo(myMap);

    var baseMaps = {
        "Light Mode": light_mode,
        "Dark Mode": dark_mode,
        "Satellite": satellite_mode
    };
    var overlayMaps = {
        "Markers": marker_clusters
    };
    // Slap Layer Legend onto the map
    L.control.layers(baseMaps, overlayMaps).addTo(myMap);
}