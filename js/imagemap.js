// Configuration - moved to index.html

// global variables
var map;
var homeLat = -1, homeLng = -1;
var isEnabledHome = false;
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

    // add a control button to show whole world
    // html template for world button
    // use svg or fontawesome
    //    const htmlTemplate_world = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><g>< path class="hatch_twee" d = "M29.279,12.014c0.118,0.361,0.219,0.732,0.31,1.104l-2.164,2.164c-0.285-0.266-0.491-0.521-0.583-0.831   L29.279,12.014z M15.871,30.839l7.168-7.171c-0.052-0.041-0.095-0.085-0.147-0.131c-0.173-0.153-0.362-0.312-0.626-0.51   l-5.571,5.571c0.057,0.134,0.102,0.286,0.078,0.433c-0.063,0.386-0.275,0.733-0.314,0.812   C16.451,29.863,15.871,30.822,15.871,30.839z M12.539,20.754c0.169-0.015,0.336-0.027,0.489-0.027c0.32,0,0.595,0.042,0.848,0.105   l0.437-0.437c-0.345-0.13-0.671-0.274-0.985-0.429L12.539,20.754z M18.649,30.644c0.699-0.156,1.368-0.357,2.025-0.611l1.955-1.955   c0.049-0.142,0.088-0.277,0.134-0.422c0.121-0.383,0.245-0.778,0.433-1.165c0.087-0.18,0.178-0.41,0.238-0.631L18.649,30.644z    M15.171,22.743c-0.035,0.108-0.224,0.382-0.314,0.459c-0.034,0.029-0.716,0.489-0.808,1.455l3.585-3.584   c-0.45,0.058-0.888-0.003-1.321-0.093l-1.138,1.138C15.23,22.497,15.187,22.69,15.171,22.743z M11.727,9.925L11.49,9.803   L5.223,16.07c0.005,0.296,0.089,0.543,0.249,0.769c0.05,0.071,0.108,0.149,0.168,0.229l6.81-6.81   C12.176,10.161,11.922,10.029,11.727,9.925z M20.107,21.186l-5.37,5.367c0.219,0.262,0.465,0.495,0.706,0.712l5.513-5.514   C20.697,21.53,20.416,21.337,20.107,21.186z M29.384,17.323l0.618-0.618C30.004,16.631,30,16.574,30,16.5   c0-0.389-0.012-0.783-0.043-1.164l-1.192,1.192C28.984,16.792,29.194,17.065,29.384,17.323z M9.749,3.544l-6.87,6.87   c0.608-0.306,1.288-0.518,1.893-0.479l5.979-5.979C10.424,3.816,10.088,3.677,9.749,3.544z M12.015,18.692   c-0.151-0.385-0.229-0.799-0.229-1.185l-2.634,2.634c0.322,0.159,0.662,0.292,1.015,0.399L12.015,18.692z M16.3,12.988   l-2.877,2.881c0.072-0.001,0.132-0.019,0.208-0.014c0.618,0.019,1.352-0.546,2.074-1.75C15.895,13.788,16.141,13.354,16.3,12.988z    M6.256,12.451l3.821-3.821c-0.02-0.046-0.053-0.081-0.069-0.13c-0.223-0.693,0.544-1.352,1.568-2.14   c0.16-0.122,0.294-0.224,0.37-0.294l0.265-0.237c0.267-0.233,0.562-0.493,0.734-0.749C12.848,5,12.689,4.901,12.5,4.793   l-6.241,6.241C6.4,11.462,6.373,11.949,6.256,12.451z M17.979,8.728c-0.272-0.154-0.662-0.301-1.007-0.407L6.838,18.455   c0.229,0.225,0.479,0.449,0.747,0.667L17.979,8.728z M23.099,6.194c0.086,0.181,0.191,0.348,0.332,0.486   c0.087,0.086,0.23,0.148,0.4,0.196l1.24-1.24c-0.251-0.222-0.513-0.431-0.779-0.635L23.099,6.194z" style = "fill: #FFC5BB;" /><path class="hatch_een" d="M31,16.5C31,7.94,24.06,1,15.5,1S0,7.94,0,16.5S6.94,32,15.5,32C24.194,32,31,24.924,31,16.5z    M29.621,17.644c-0.399-0.541-1.024-1.42-1.51-1.796c-0.782-0.606-1.265-1.013-1.323-1.696c-0.092-1.078,1.34-2.135,2.301-2.662   C29.668,13.054,30,14.737,30,16.5c0,0.541-0.035,1.073-0.093,1.598C29.79,17.905,29.668,17.708,29.621,17.644z M26.362,6.927   c-1.078,0.091-2.552,0.127-2.931-0.246c-0.599-0.588-0.681-1.814-0.692-2.725C24.104,4.746,25.325,5.751,26.362,6.927z M10.008,8.5   c0.204,0.639,0.833,1.031,1.403,1.308c0.587,0.286,1.434,0.733,2.093,0.49c0.386-0.142,0.622-0.556,0.89-0.844   c0.328-0.352,0.678-0.684,1.091-0.935c0.334-0.203,0.606-0.309,0.854-0.333c0.371,0.001,1.61,0.422,1.91,0.737   c-0.016,0.01-1.21,0.771-1.444,1.525c-0.1,0.318-0.102,0.629-0.104,0.903c-0.008,0.95-0.517,1.955-0.996,2.753   c-0.723,1.204-1.456,1.769-2.074,1.75c-0.992-0.065-1.682,0.394-1.824,1.218c-0.102,0.584,0.006,1.233,0.251,1.769   c0.269,0.587,0.81,0.951,1.384,1.201c0.702,0.306,1.41,0.573,2.152,0.768c0.708,0.187,1.589,0.418,2.397,0.195   c1.117-0.311,2.114,0.079,2.973,0.797c0.419,0.351,0.799,0.746,1.192,1.126c0.357,0.345,0.935,0.672,1.172,1.104   c0.401,0.733,0.216,1.74-0.132,2.458c-0.188,0.387-0.312,0.782-0.433,1.165c-0.175,0.554-0.358,1.223-0.709,1.761   c-1.89,0.963-4.014,1.524-6.266,1.568c0.001-0.064,0.967-1.44,0.99-1.965c0.023-0.57-0.475-1.006-1.052-1.51   c-0.618-0.541-1.388-1.214-1.608-2.113c-0.122-0.496-0.086-1.017,0.141-1.477c0.193-0.39,0.5-0.576,0.766-0.895   c0.355-0.427,0.148-1.245-0.164-1.628c-0.597-0.733-1.649-0.717-2.501-0.631c-0.915,0.092-1.843-0.063-2.696-0.401   c-1.475-0.585-2.717-1.674-3.71-2.893c-0.167-0.206-0.329-0.416-0.482-0.633c-0.512-0.721-0.08-1.878,0.337-2.998   c0.493-1.321,1.106-2.965-0.362-3.734c-0.944-0.496-2.356,0.099-3.294,0.732c1.396-3.279,3.974-5.929,7.188-7.446   c1.457,0.559,3.159,1.32,3.605,1.688c-0.214,0.316-0.559,0.576-0.842,0.827c-0.488,0.435-1.033,0.81-1.503,1.265   C10.254,7.507,9.841,7.979,10.008,8.5z M1,16.5c0-1.203,0.164-2.366,0.441-3.485c0.353-0.727,2.525-2.559,3.54-2.023   c0.623,0.326,0.445,1.012-0.109,2.499c-0.485,1.301-1.034,2.774-0.215,3.928c1.025,1.443,3.854,4.756,7.866,4.336   c0.783-0.08,1.349,0.017,1.559,0.268c0.14,0.167,0.151,0.379-0.014,0.521c-0.88,0.76-1.193,1.983-0.921,3.092   c0.296,1.206,1.235,2.027,1.921,2.628c0.287,0.251,0.817,0.524,0.632,0.954c-0.273,0.634-0.827,1.219-1.281,1.727   C6.928,30.389,1,24.13,1,16.5z M23.51,28.576c0.073-0.211,0.16-0.469,0.207-0.619c0.114-0.364,0.223-0.708,0.379-1.029   c0.339-0.697,0.499-1.515,0.425-2.287c-0.087-0.909-0.508-1.457-1.215-1.985c-0.475-0.354-0.831-0.842-1.253-1.254   c-0.436-0.427-0.914-0.818-1.461-1.094c-0.483-0.244-1.01-0.393-1.552-0.42c-0.628-0.031-1.27,0.135-1.907,0.159   c-0.688,0.026-1.325-0.203-1.978-0.386c-0.627-0.175-1.265-0.389-1.787-0.791c-0.483-0.372-0.68-1.03-0.578-1.624   c0.021-0.119,0.08-0.437,0.778-0.392c1.582,0.101,2.646-1.657,2.993-2.234c0.322-0.539,0.881-1.895,0.881-1.895   c0.103-0.279,0.208-0.567,0.24-0.907c0.014-0.151,0.021-0.894,0.076-1.07c0.1-0.32,0.398-0.615,0.941-0.93   c0.135-0.076,0.338-0.192,0.469-0.413c0.178-0.298,0.168-0.644-0.026-0.949c-0.512-0.804-2.406-1.308-2.898-1.265   c-0.405,0.04-0.812,0.19-1.279,0.475C14.268,8.09,13.423,8.938,13.11,9.38c-0.082,0.025-1.798-0.526-2.142-1.087   c0.074-0.261,0.904-0.899,1.218-1.14c0.189-0.146,0.685-0.572,0.685-0.572c0.408-0.359,0.872-0.767,1.094-1.291   c0.069-0.164,0.065-0.352-0.01-0.525c-0.239-0.551-1.871-1.359-3.244-1.935C12.213,2.302,13.82,2,15.5,2   c2.177,0,4.235,0.496,6.089,1.359c-0.086,0.854-0.131,2.787,1.141,4.036c0.574,0.563,1.53,0.726,2.438,0.726   c0.63,0,1.404-0.168,1.918-0.302c0.641,0.853,1.193,1.774,1.635,2.758c-1.017,0.534-3.082,1.868-2.929,3.659   c0.079,0.939,0.701,1.602,1.402,2.164c0.573,0.459,1.062,1.014,1.474,1.62c0.194,0.284,0.38,0.578,0.523,0.891   c0.094,0.205,0.437,0.792,0.383,1.015C28.7,23.514,26.5,26.586,23.51,28.576z" style="fill: #265AA5;" /></g ></svg > ';
    const htmlTemplate_world = '<i class="fa fa-globe fa-lg" aria-hidden="true"></i>'
    // create custom button
    const worldControl = L.Control.extend({
        // button position
        options: {
            position: "topleft",
        },

        // method
        onAdd: function (map) {
            // console.log(map.getCenter());
            // create button
            const worldBtn = L.DomUtil.create("button");
            worldBtn.title = "show the whole world";
            worldBtn.innerHTML = htmlTemplate_world;
            //        worldBtn.innerHTML = '<i class="fa fa-globe" aria-hidden="true"></i>';
            //            worldBtn.className += "leaflet-bar button-world";
            worldBtn.className += "leaflet-bar button-world";

            return worldBtn;
        },
    });

    // adding new button to map control
    map.addControl(new worldControl());
    const buttonWorld = document.querySelector(".button-world");
    buttonWorld.addEventListener("click", () => {
        map.flyToBounds([[0, 0], mapBoundsMax]);
    });

    // add Home button
    const htmlTemplate = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><path d="M32 18.451L16 6.031 0 18.451v-5.064L16 .967l16 12.42zM28 18v12h-8v-8h-8v8H4V18l12-9z" /></svg>';

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
        if (isEnabledHome) {
            buttonBackToHome.classList.remove("hidden");

            buttonBackToHome.addEventListener("click", () => {
                // to change zoom or not to change, that is the question
                map.flyTo([homeLat, homeLng], mapZoom[2]);
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
    }

    // add handler for zoom change (set map overlays opacities as needed)
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
    following fields are recognized:
        comment - if starts with / or #, the whole row is ignored
        pageTitle - replaces the html \<title\> section. In case of multiple entries, next one overwrites previous.
        csvMapOverlaysUrl - URL to map overlays csv table (map overlays are image overlays that can be displayed over certain areas in map, eg a detailed map of a city that appears at certain zoom levels).
        mapAttribution - copyright notice for the map. Multiple entries are appended.
        csvMapMarkersUrl - URL to the map overlays csv table.
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
    following fields are recognized:
        comment - if starts with / or #, the whole row is ignored
        mapOverlayUrl - URL to image file (see baseMapUrl in html parameters section above for notes)
        mapOverlaySource - information field (credits) about the image source. Currently not used in program.
        boundsMin - bottom-left coordinates "lat, lng" ( = Y, X) on base map for the image overlay
        boundsMax - top-right coordinates (same format as boundsMin)
        zoomOpacitys - image opacity depending on zoom level. Format is "maxzoom:opacity,maxzoom2:opacity2,etc".
        hasZoomLens - display a zoom lens (magnifying glass) icon in centre of the overlay, to zoom into the area
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
            boundsMin[0] = parseFloat(boundsMin[0])
            boundsMin[1] = parseFloat(boundsMin[1])
            boundsMax[0] = parseFloat(boundsMax[0])
            boundsMax[1] = parseFloat(boundsMax[1])
            let image = L.imageOverlay(mapOverlayUrl, [boundsMin, boundsMax]).addTo(map);
            // hide by default
            image.setOpacity(0);
            let overlayObject = { imageOverlay: image, zoomOpacitys: [] }
            let zoomOpacitys = String(data[row].zoomOpacitys).split(',');
            let currentZoom = map.getZoom();
            console.log("zoomOpacitys", zoomOpacitys)
            for (let i = 0; i < zoomOpacitys.length; i++) {
                let zoomOpacity = String(zoomOpacitys[i]).split(':')
                overlayObject.zoomOpacitys.push({ minZoom: zoomOpacity[0], opacity: zoomOpacity[1] });
            }
            mapImageOverlays.push(overlayObject);

            // add a zoom lens icon to zoom into the layer, if so requested
            hasZoomLens = String(data[row].hasZoomLens).trim().toUpperCase();
            if (hasZoomLens === "YES" || hasZoomLens === "TRUE") {

                let lat = boundsMin[0] + (boundsMax[0] - boundsMin[0]) / 2;
                let lng = boundsMin[1] + (boundsMax[1] - boundsMin[1]) / 2;
                console.log("zoom marker at:", lat, lng)
                let marker = L.marker(L.latLng([lat, lng]));
                let markerIcon = L.icon({
                    iconUrl: "img/icon_zoom_lens.png",
                    iconSize: [30, 30]
                });
                marker.setIcon(markerIcon);
                marker.options.title = mapOverlayUrl;
                marker.options.myBounds = [boundsMin, boundsMax];
                marker.addTo(map).on('click', function (e) {
                    console.log(e.latlng, this.options.myBounds);
                    map.flyToBounds(this.options.myBounds);
                });
            }

        }
    }
}

/*
    parseCsvMapMarkers() is the callback function to parse map markers csv table data
    following fields are recognized:
        comment - if starts with / or #, the whole row is ignored
        layer (not yet implemented) - layer name, where marker appears. Markers are grouped in different layers that can be shown or hidden from map with a single click. 
        latlng - map coordinates (lat, lng = Y, X) separated by comma, eg "1043.12, 1210.65"
        mapText - Text displayed on map (leaflet tooltip), can be left empty for only an icon+popup text. 
        icon - Icon for popup. Can be one of:
            empty for default marker icon (only if popupText is not empty),
            Font Awesome 4.7 icon (eg "fa-coffee") or 
            specify image on webserver eg img/myicon.png
        popupText - Popup text is displayed when icon is clicked
        home - set to non-blank (eg yes/true) to have a marker associated with home button for centering map on the home marker (only one marker can be "home", last one takes precedence in case of multiple entries). Note that if multiple home markers are defined in separate map marker csv tables, which are loaded from the master csv, the home location can be random-ish, due to asynchronous parsing of the csv tables.
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
            isHome = String(data[row].home).trim().toUpperCase()
            if (isHome === "YES" || isHome === "TRUE") {
                homeLng = lng;
                homeLat = lat;
                newHome = true;
                isEnabledHome = true;
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

