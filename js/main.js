// Configuration - moved to index.html

// global variables
let map
let homeLat = (boundsMaxLat - boundsMinLat) / 2
let homeLng = (boundsMaxLng - boundsMinLng) / 2
const defaultZoom = 0

window.addEventListener("DOMContentLoaded", init);

/*
  init() function is called when page is loaded
*/
function init() {
    document.title = titleText

    // Map initialization
    const bounds = [L.latLng(boundsMinLat, boundsMinLng), L.latLng(boundsMaxLat, boundsMaxLng)];

    map = L.map('map', {
        crs: L.CRS.Simple,
        minZoom: -2,
        maxZoom: 4
    });
    map.attributionControl.addAttribution(baseMapAttribution);
    let image = L.imageOverlay(baseMapURL, bounds).addTo(map);
    map.fitBounds(bounds);
    map.setView([homeLat, homeLng], defaultZoom);

/*    
    // test an image overlay at specific pos
    //    var bounds2 = [[1210, 2795], [1110, 2900.66]]
    var bounds2 = [[1090, 2775], [1215, 2908]]
    let image2 = L.imageOverlay("img/map_city_test.png", bounds2, { opacity: 0 }).addTo(map);
    map.on('zoomend', function () {
        zoom = map.getZoom();
        if (zoom < 0) image2.setOpacity(0);
        else if (zoom >= 0 && zoom <= 2) image2.setOpacity((zoom+1)*0.2);
        else image2.setOpacity(1);
    });
*/
    // click to find coordinates
    // obtaining coordinates after clicking on the map
    map.on("click", function (e) {
        const markerPlace = document.querySelector(".marker-position");
        markerPlace.innerHTML = '<i class="fa fa-map-marker"></i> ' + e.latlng

        var textArea = document.createElement("textarea");
        textArea.value = e.latlng.lat + ", " + e.latlng.lng;

        // Avoid scrolling to bottom
        textArea.style.top = "0";
        textArea.style.left = "0";
        textArea.style.position = "fixed";

        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try {
            let successful = document.execCommand('copy');
            markerPlace.innerHTML += " copied to clipboard";
        } catch (err) {
            markerPlace.innerHTML += " (Ctr+C to copy to clipboard)";
        }
    });

    try {
        Papa.parse(gsheetURL, {
            download: true,
            header: true,
            complete: parseSheet,
        });
    } catch (err) {
        console.log(err)
        alert(err)
    }

    console.log("after gsheet parse")

    // add Home button
    const htmlTemplate =
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><path d="M32 18.451L16 6.031 0 18.451v-5.064L16 .967l16 12.42zM28 18v12h-8v-8h-8v8H4V18l12-9z" /></svg>';

    // create custom button
    const customControl = L.Control.extend({
        // button position
        options: {
            position: "topleft",
        },

        // method
        onAdd: function (map) {
            // console.log(map.getCenter());
            // create button
            const btn = L.DomUtil.create("button");
            btn.title = "back to home";
            btn.innerHTML = htmlTemplate;
            btn.className += "leaflet-bar back-to-home hidden";

            return btn;
        },
    });

    // adding new button to map control
    map.addControl(new customControl());

    // on drag end
    map.on("moveend", getCenterOfMap);

    const buttonBackToHome = document.querySelector(".back-to-home");

    function getCenterOfMap() {
        buttonBackToHome.classList.remove("hidden");

        buttonBackToHome.addEventListener("click", () => {
            // to change zoom or not to change, that is the question
            // map.flyTo([homeLat, homeLng], defaultZoom);
            map.flyTo([homeLat, homeLng]);
        });

        map.on("moveend", () => {
            const { lat: latCenter, lng: lngCenter } = map.getCenter();

            const latC = latCenter.toFixed(3) * 1;
            const lngC = lngCenter.toFixed(3) * 1;

            const defaultCoordinate = [+homeLat.toFixed(3), +homeLng.toFixed(3)];

            const centerCoordinate = [latC, lngC];

            if (compareToArrays(centerCoordinate, defaultCoordinate)) {
                buttonBackToHome.classList.add("hidden");
            }
        });
    }

    const compareToArrays = (a, b) => JSON.stringify(a) === JSON.stringify(b);

}

/*
    parseSheet() is the callback function to parse google sheet data
*/
function parseSheet(data) {
    data = data.data;

    // for each row in table
    for (let row = 0; row < data.length; row++) {
        console.log(data[row]);

        // ignore comment lines (comment field starts with / or #)
        if (data[row].comment[0] === "/" || data[row].comment[0] === "#") {
            continue
        }

        // check that there are coordinates in the row
        let latlng = data[row].latlng
        let commaPos = latlng.indexOf(',')
        if (commaPos >= 0) {
            let lat = parseFloat(latlng.substr(0, commaPos))
            let lng = parseFloat(latlng.substr(commaPos + 1))

            // TODO: group markers to layers
            let layer = data[row].layer;

            // if there is an icon or popup text defined, show a popup icon
            let iconName = data[row].icon
            let popupText = data[row].popupText

            let marker = L.marker(L.latLng([lat, lng]));
            let hasMarker = false

            // use custom icon, if iconName is specified
            if (!(iconName === null || iconName.trim() === "") || !(popupText === null || popupText.trim() === "")) {
                if (!(iconName === null || iconName.trim() === "")) {
                    // check for font awesome
                    if (iconName.substring(0, 3) === "fa-") {
                        // not perfect, but a start.. low prio, since openclipart has much better selection
                        markerIcon = L.AwesomeMarkers.icon({ icon: iconName.substring(3), prefix: 'fa', iconColor: 'white' })
                    } else {
                        markerIcon = L.icon({
                            iconUrl: iconName,
                            iconSize: [30, 30]
                        });
                    }
                    // console.log(markerIcon);
                    marker.setIcon(markerIcon);
                }
                marker.addTo(map).bindPopup(data[row].popupText);
                hasMarker = true
            }

            // if a mapText is defined, display text directly on map using tooltip
            const mapText = data[row].mapText
            if (!(mapText === null || mapText.trim() === "")) {
                let tooltipOptions = {
                    permanent: true,
                    offset: [0, 0],
                    opacity: 0.6,
                    className: 'my-tooltip'
                }
                // if marker is on map, add to marker, otherwise standalone
                if (hasMarker) {
                    marker.opacity = 0
                    marker.bindTooltip(mapText, tooltipOptions);
                    marker.addTo(map);
                } else {
                    var tooltip = L.tooltip(tooltipOptions).setLatLng([lat, lng]).setContent(mapText).addTo(map);
                }
                console.log(marker);
            }

            // if the coordinates are set to show a home icon, set the home icon
            isHome = data[row].home
            if (!(isHome === null || isHome.trim() === "")) {
                homeLng = lng
                homeLat = lat
            }

        }
    }

    // fly to home position
    map.flyTo([homeLat, homeLng]);

}