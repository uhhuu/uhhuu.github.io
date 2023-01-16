// Configuration - moved to index.html

// global variables
var map;
var homeLat = -1, homeLng = -1;
var isDoneParseCsvMapOverlays = true;
var mapImageOverlays = [];

window.addEventListener("DOMContentLoaded", init);

/*
  init() function is called when page is loaded
*/
function init() {
    if (!isEmptyNull(titleText)) {
        document.title = titleText;
    }

    // Base map initialization
    map = L.map('map', {
        crs: L.CRS.Simple,
        minZoom: mapZoom[0],
        maxZoom: mapZoom[1]
    });
    // map.attributionControl.addAttribution(baseMapAttribution);

    let bounds = [[0, 0], mapBoundsMax]
    let image = L.imageOverlay(baseMapUrl, bounds).addTo(map);
    homeLat = mapBoundsMax[0] / 2
    homeLng = mapBoundsMax[1] / 2
    map.fitBounds(bounds);
    map.setView([homeLat, homeLng], mapZoom[2]);

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

    // Parse the master csv table. Note that this runs asynchronously, don't expect it to have completed after this code block
    try {
        Papa.parse(csvMasterUrl, {
            download: true,
            header: true,
            complete: parseCsvMaster,
        });
    } catch (err) {
        console.log(err)
        alert(err)
    }

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
            // map.flyTo([homeLat, homeLng], mapZoom[2]);
            map.flyTo([homeLat, homeLng]);
        });

        map.on("moveend", () => {
            const { lat: latCenter, lng: lngCenter } = map.getCenter();

            const latC = latCenter.toFixed(3) * 1;
            const lngC = lngCenter.toFixed(3) * 1;

            const defaultCoordinate = [+homeLat.toFixed(3), +homeLng.toFixed(3)];

            const centerCoordinate = [latC, lngC];

            if (compareTwoArrays(centerCoordinate, defaultCoordinate)) {
                buttonBackToHome.classList.add("hidden");
            }
        });
    }

    // add handler for zoom change
    map.on('zoomend', function () {
        zoom = map.getZoom();
        console.log("zoomend:", zoom)
        for (let i = 0; i < mapImageOverlays.length; i++) {
            for (let j = 0; j < mapImageOverlays[i].zoomOpacitys.length; j++) {
                if (zoom <= mapImageOverlays[i].zoomOpacitys[j].minZoom) {
                    mapImageOverlays[i].imageOverlay.setOpacity(mapImageOverlays[i].zoomOpacitys[j].opacity)
                    break;
                }
            }

        }
        // if (zoom < 0) image2.setOpacity(0);
        // else if (zoom >= 0 && zoom <= 2) image2.setOpacity((zoom+1)*0.2);
        // else image2.setOpacity(1);
    });

}

// compare arrays
const compareTwoArrays = (a, b) => JSON.stringify(a) === JSON.stringify(b);


/*
    parseCsvMaster() is the callback function to parse master csv table
*/
function parseCsvMaster(data) {
    data = data.data;

    // for each row in table
    for (let row = 0; row < data.length; row++) {
        console.log("csvMaster: ", data[row]);
        // ignore comment lines (comment field starts with / or #)
        if (data[row].comment[0] === "/" || data[row].comment[0] === "#") {
            continue;
        }

        // change map attribution, if present
        let mapAttribution = data[row].mapAttribution;
        if (!isEmptyNull(mapAttribution)) {
            map.attributionControl.addAttribution(mapAttribution);
        }
        // set page title, if present
        let pageTitle = String(data[row].pageTitle).trim();
        if (!isEmptyNull(pageTitle)) {
            document.title = pageTitle;
        }

        // parse map overlays csv, if present
        let csvMapOverlaysUrl = String(data[row].csvMapOverlaysUrl).trim()
        if (!isEmptyNull(csvMapOverlaysUrl)) {

            // Parse the map markers csv table. Note that this runs asynchronously, don't expect it to have completed after this code block

            // use a global variable to wait until this is done before moving on, otherwise some stuff (like flyto home marker) wont work
            isDoneParseCsvMapOverlays = false;

            try {
                Papa.parse(csvMapOverlaysUrl, {
                    download: true,
                    header: true,
                    complete: parseCsvMapOverlays,
                });
            } catch (err) {
                console.log(err);
                alert(err);
            }

            // TODO: put a timeout here
            // while (!isDoneParseCsvMapOverlays) { }

        }

        // parse map markers csv, if present
        let csvMapMarkersUrl = String(data[row].csvMapMarkersUrl).trim();
        if (!isEmptyNull(csvMapMarkersUrl)) {

            // Parse the map markers csv table. Note that this runs asynchronously, don't expect it to have completed after this code block
            try {
                Papa.parse(csvMapMarkersUrl, {
                    download: true,
                    header: true,
                    complete: parseCsvMapMarkers,
                });
            } catch (err) {
                console.log(err);
                alert(err);
            }

        }

    }
}

/*
    parseMapOverlays() is the callback function to parse master csv table
*/
function parseCsvMapOverlays(data) {
    data = data.data;

    // for each row in table
    for (let row = 0; row < data.length; row++) {
        console.log("csvMapOverlays: ", data[row]);
        // ignore comment lines (comment field starts with / or #)
        if (data[row].comment[0] === "/" || data[row].comment[0] === "#") {
            continue;
        }

        let mapOverlayUrl = data[row].mapOverlayUrl;
        if (!(isEmptyNull(mapOverlayUrl))) {
            console.log("new imageOverlay: " + mapOverlayUrl);
            let boundsMin = String(data[row].boundsMin).split(',');
            let boundsMax = String(data[row].boundsMax).split(',');
            let image = L.imageOverlay(mapOverlayUrl, [boundsMin, boundsMax]).addTo(map);
            let mainMap = String(data[row].mainMap).trim().toUpperCase();
            let overlayObject = { imageOverlay: image, zoomOpacitys: [] }
            let zoomOpacitys = String(data[row].zoomOpacitys).split(',');
            console.log("zoomOpacitys", zoomOpacitys)
            for (let i = 0; i < zoomOpacitys.length; i++) {
                let zoomOpacity = String(zoomOpacitys[i]).split(':')
                overlayObject.zoomOpacitys.push({ minZoom: zoomOpacity[0], opacity: zoomOpacity[1] });
            }
            mapImageOverlays.push(overlayObject)
        }
    }
    isDoneParseCsvMapOverlays = true;
}

/*
    parseCsvMapMarkers() is the callback function to parse map markers csv table data
*/
function parseCsvMapMarkers(data) {
    data = data.data;
    let newHome = false;

    // for each row in table
    for (let row = 0; row < data.length; row++) {
        console.log("csvMapMarkers: ", data[row]);

        // ignore comment lines (comment field starts with / or #)
        if (data[row].comment[0] === "/" || data[row].comment[0] === "#") {
            continue;
        }

        // check that there are coordinates in the row
        let latlng = data[row].latlng;
        let commaPos = latlng.indexOf(',');
        if (latlng.indexOf(',') >= 0) {
            latlng = String(latlng).split(',');
            let lat = parseFloat(latlng[0]);
            let lng = parseFloat(latlng[1]);

            // TODO: group markers to layers
            let layer = data[row].layer;

            let iconName = data[row].icon;
            let popupText = data[row].popupText;

            let marker = L.marker(L.latLng([lat, lng]));
            let hasMarker = false;

            // if there is an icon or popup text defined, show a popup icon
            if (!isEmptyNull(iconName) || !isEmptyNull(popupText)) {
                // use custom icon, if iconName is specified
                if (!isEmptyNull(iconName)) {
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
            if (!isEmptyNull(mapText)) {
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
            isHome = String(data[row].home).trim()
            if (isHome.toUpperCase() === "YES" || isHome.toUpperCase() === "TRUE") {
                homeLng = lng;
                homeLat = lat;
                newHome = true;
            }

        }
    }

    // fly to home position
    if (newHome) map.flyTo([homeLat, homeLng]);

}

/* 
  isEmptyNull() - tests if variable is undefined, null or empty string
*/
function isEmptyNull(tst) {
    return (tst === undefined || tst === null || String(tst).trim() === "");
}

