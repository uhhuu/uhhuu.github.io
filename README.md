# leaflet-custom-map
Simple web application to display a custom interactive map with markers from a csv format table. The table can be either local (eg csv/table.csv) or a Google Sheet that has been published to web in csv format (e.g https://docs.google.com/spreadsheets/d/e/.../pub?output=csv). In the latter case the data file can be easily edited by multiple people.
Use case - custom fantasy game (e.g D&D) world map with points of interest specific to a player or group of players.
CSV based data table is used to enable relatively easy adding of markers without need to change code or using complex backend / SQL database interaction (thus also simplifying hosting).

## Credits:
- Leaflet JS (https://leafletjs.com/) - used to display map and markers
- PapaParse (https://github.com/mholt/PapaParse) - used to parse Google sheets data (that has been published to web in csv format)
- Font Awesome 4.7
- https://github.com/lennardv2/Leaflet.awesome-markers - to use font awesome icons on markers
- https://github.com/carderne/leaflet-gsheets for the idea to get data from google sheets shared cvs (thus avoiding need for database)
- https://github.com/tomik23/leaflet-examples for useful leaflet examples (eg home button, showing map coordinates on click)
- Lohe Isok for the map and D&D campaign, which motivated to make this little toy

## Usage:
Main application is imagemap.html, which can be passed following parameters in the url (?param=value&param2=value2)
- baseMapUrl - URL to the main map (can be local or remote image url in format of img/filename.jpg)
- mapBoundsMax - max bounds of the map (lat:lng, ie y:x), determines coordinate system for markers, should scale to image resolution (min bounds is 0:0, in lower-left corner)
- mapZoom - map zoom range and default zoom level, separated by commas (e.g -2,4,0 for zoom range of -2 to 4 and default zoom level 0)
- csvMasterUrl - URL to the master CSV table. See below for more info.

## Map:
- The map is represented by a single jpg file, which is displayed using LeafletJS, with markers/labels from a separate (shared) google sheet
- Coordinates are simple 0:0 to x:y (should scale relative to map image resolution) with 0:0 in bottomleft corner.
- Clicking on the map shows current coordinates and copies them to the clipboard (for easy adding to the marker table)
- One of the sample maps in img/ folder is Imogen world map, which is created and copyrighted by Lohe Isok. He has granted permission to use the map for his players. Please do not copy the map without his permission.

## CSV tables
All csv tables have following things in common:
- the table URL can be local, eg csvUrl=csv/table_master.csv or remote, e.g google sheets table that has been published to web in csv format)
- all fields should be specified as text (eg if using google sheets)
- decimals separator is '.', subfields separator is ',' (e.g coordinates can be specified as "653.128, 1003.84")
- all coordinates are specified in "lat, lng" format, i.e y before x (as is default for leaflet)
- first field is "comment". If it starts with / or #, the whole table row is regarded as comment and ignored. This can also be used to (temporarily comment out otherwise valid table rows.'

### Master csv table (csvMasterUrl in html parameter)
This table contains references to other csv tables and generic info.
Multiple rows can theoretically be specified in this table (if for example there is need to group different map markers or map overlays in separate csv tables), but it has not been tested. 
The table has following fields:
- comment - see above.
- pageTitle - replaces the html \<title\> section. In case of multiple entries, next one overwrites previous.
- csvMapOverlaysUrl - URL to map overlays csv table (map overlays are image overlays that can be displayed over certain areas in map, eg a detailed map of a city that appears at certain zoom levels).
- mapAttribution - copyright notice for the map. Multiple entries are appended.
- csvMapMarkersUrl - URL to the map overlays csv table.

### Map Overlays csv table (csvMapOverlaysUrl in master csv table)
This table contains map image overlays that are displayed at specific map coordinates with opacity relative to zoom level. The overlay may be for example a detailed city map that is only displayed if the map is zoomed in to certain level.
The table has following fields:
- comment - see above.
- mapOverlayUrl - URL to image file (see baseMapUrl in html parameters section above for notes)
- mapOverlaySource - information field (credits) about the image source. Currently not used in program.
- boundsMin - bottom-left coordinates "lat, lng" ( = Y, X) on base map for the image overlay
- boundsMax - top-right coordinates (same format as boundsMin)
- zoomOpacitys - image opacity depending on zoom level. Format is "maxzoom:opacity,maxzoom2:opacity2,etc".
Must be ordered from smaller zoom level to larger and the maxzoom value that is greater than or equal to current zoom level determines the image opacity for this zoom level. For always visible image use "999:1"; for image that is visible only starting at zoom level 2, use "1:0,999:1"; for image to become gradually more visible, use something like "-1:0,0:0.2,1:0.4,2:0.6,999:1"
- hasZoomLens - display a zoom lens (magnifying glass) icon in centre of the overlay, to zoom into the area

### Map Marker csv table (csvMapMarkersUrl in master csv table)
This table contains markers that are displayed at specific map coordinates. A marker can be a text label on map (leaflet tooltip), an icon with popup text on click, or both.
The table has following fields:
- comment - see above.
- layer (not yet implemented) - layer name, where marker appears. Markers are grouped in different layers that can be shown or hidden from map with a single click. 
- latlng - map coordinates (lat, lng = Y, X) separated by comma, eg "1043.12, 1210.65"
- mapText - Text displayed on map (leaflet tooltip), can be left empty for only an icon+popup text. 
- icon - Icon for popup. Can be one of:
	- empty for default marker icon (only if popupText is not empty),
	- Font Awesome 4.7 icon (eg "fa-coffee") or 
	- specify image on webserver eg img/myicon.png
- popupText - Popup text is displayed when icon is clicked
- home - set to non-blank (eg yes/true) to have a marker associated with home button for centering map on the home marker (only one marker can be "home", last one takes precedence in case of multiple entries). Note that if multiple home markers are defined in separate map marker csv tables, which are loaded from the master csv, the home location can be random-ish, due to asynchronous parsing of the csv tables.

## Known issues
Reading multiple csv tables can make page loading a little sluggish, but thats the cost to pay for otherwise lightweight no-sql-no-backend-simple-hosting solution. Alternatively the different tables could be merged into one master table (with something like data type field distinguishing between table row contents), but that would make the solution less elegant imo. Win-some-lose-some.
