// google sheets table URL (the table must be published to Web in csv format)
let gsheetURL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRgYjnAPdiJiOVcu6T1kCYIEnz27r_7It7Ipd1-G-hVXeVSHuGsU0NIl9QcB0y-qnXj_bY9ko8zfV5V/pub?output=csv"
let map

window.addEventListener("DOMContentLoaded", init);

/*
  init() function is called when page is loaded
*/
function init() {
    // Map initialization
    const bounds = [L.latLng(0, 0), L.latLng(3000, 4000)];

    map = L.map('map', {
        crs: L.CRS.Simple,
        minZoom: -2,
        maxZoom: 2
    });
    var image = L.imageOverlay('img/imogen_map.jpg', bounds).addTo(map);
    map.fitBounds(bounds);
    map.setZoom(-2);

    // click to find coordinates
    // obtaining coordinates after clicking on the map
    map.on("click", function (e) {
        const markerPlace = document.querySelector(".marker-position");
        markerPlace.textContent = e.latlng;
    });

    // code for getting data from google sheets url
    Papa.parse(gsheetURL, {
        download: true,
        header: true,
        complete: parseSheet,
    });
}

/*
    parseSheet() is the callback function to parse google sheet data
*/
function parseSheet(data) {
    data = data.data;

    // for each row in table
    for (let row = 0; row < data.length; row++) {
        // check that there are coordinates in the row
        let lat = parseFloat(data[row].lat);
        let lng = parseFloat(data[row].lng);
        console.log(data[row]);

        if (typeof (lat) == "number" && typeof (lng) == "number") {

            // TODO: group markers to layers
            let layer = data[row].layer;

            // if there is an icon or popup text defined, show a popup icon
            let iconName = data[row].icon
            let popupText = data[row].popupText

            var marker = L.marker(L.latLng([lat, lng]));

            // use custom icon, if iconName is specified
            if (!(iconName === null || iconName.trim() === "") || !(popupText === null || popupText.trim() === "")) {
                if (!(iconName === null || iconName.trim() === "")) {
                    // check for font awesome
                    if (iconName.substring(0, 2) === "fa") {
                        // TODO: doesnt work, needs fixing
                        markerIcon = L.divIcon({
                            html: '<i class=' + iconName + '</i>',
                            iconSize: [20, 20],
                            className: 'myDivIcon'
                        });
                    } else {
                        markerIcon = L.icon({
                            iconUrl: iconName,
                            iconSize: [20, 20]
                        });
                    }
                    console.log(markerIcon);
                    marker.setIcon(markerIcon);
                }
                console.log(marker);
                marker.addTo(map).bindPopup(data[row].popupText);
            }

            // TODO: if a mapText is defined, display text directly on map

            // if the coordinates are set to show a home icon, set the home icon

        }
    }
}