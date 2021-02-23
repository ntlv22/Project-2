// global
var myMap = "";

$(document).ready(function() {
    makeMap();
});

function makeMap() {
    var queryUrl = "static/data/Stores.geojson"

    // Perform a GET request to the query URL
    $.ajax({
        type: "GET",
        url: queryUrl,
        success: function(data_starb) {
            starbucksData = data_starb;
            d3.csv("static/data/worldcities.csv").then(function(data_c) {
                worldData = data_c;
                buildMap(worldData, starbucksData);
            })

        },
        error: function(XMLHttpRequest, textStatus, errorThrown) {
            alert("Status: " + textStatus);
            alert("Error: " + errorThrown);
        }
    });
}

function buildMap(worldData, starbucksData) {
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
        zoom: 8,
        layers: [dark_mode, satellite_mode, light_mode]
    });
    var marker_clusters = L.markerClusterGroup();
    var heatmap_list = [];
    starbucksData.features.forEach(function(starbucks) {
        var marker = L.marker([starbucks.geometry.coordinates[1], starbucks.geometry.coordinates[0]], {
            draggable: false
        });
        marker.bindPopup(`<strong>${starbucks.properties['Store Name']}</strong> <hr> <strong>${starbucks.properties.City}, ${starbucks.properties['State/Province']}</strong>`);
        marker_clusters.addLayer(marker);
    });
    worldData.forEach(function(city) {
        var addressPoints = [city.lat, city.lng, city.population]
        heatmap_list.push(addressPoints);
    });
    var heat_layer = L.heatLayer(heatmap_list, {
        radius: 15,
        blur: 40
    });
    heat_layer.addTo(myMap);
    marker_clusters.addTo(myMap);
    // Create Layer Legend
    var baseMaps = {
        "Satellite": satellite_mode,
        "Light Mode": light_mode,
        "Dark Mode": dark_mode

    };
    var overlayMaps = {
        "Markers": marker_clusters,
        "Heatmap": heat_layer
    };
    // Slap Layer Legend onto the map
    L.control.layers(baseMaps, overlayMaps).addTo(myMap);
}