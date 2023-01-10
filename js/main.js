// Map initialization

var map = L.map('map', {
    crs: L.CRS.Simple,
    minZoom: -2,
    maxZoom: 2
});
var bounds = [[0, 0], [3000, 4000]];
var image = L.imageOverlay('img/Imogen.jpg', bounds).addTo(map);
map.fitBounds(bounds);
map.setZoom(-2);

// click to find coordinates

// obtaining coordinates after clicking on the map
map.on("click", function (e) {
    const markerPlace = document.querySelector(".marker-position");
    markerPlace.textContent = e.latlng;
});

// layer control

