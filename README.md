# leaflet-custom-map
Simple web application to display a custom interactive map with markers from a table in Google Sheets.
Use case - custom fantasy game (e.g D&D) world map with points of interest specific to a player or group of players.
Google sheets based data table is used to enable relatively easy adding of markers without need to change code or using complex backend / SQL database interaction (thus also simplifying hosting).

## Credits:
- Leaflet JS (https://leafletjs.com/) - used to display map and markers
- PapaParse (https://github.com/mholt/PapaParse) - used to parse Google sheets data (that has been published to web in csv format)
- Font Awesome 4.7
- https://github.com/lennardv2/Leaflet.awesome-markers - to use font awesome icons on markers
- https://github.com/carderne/leaflet-gsheets for the idea to get data from google sheets shared cvs (thus avoiding need for database)
- https://github.com/tomik23/leaflet-examples for useful leaflet examples (eg home button, showing map coordinates on click)
- Lohe Isok for the map and D&D campaign, which motivated to make this little toy

## Map:
- The map is represented by a single jpg file, which is displayed using LeafletJS, with markers/labels from a separate (shared) google sheet
- Coordinates are simple 0:0 to x:y (should scale relative to map image resolution) with 0:0 in bottomleft corner.
- Clicking on the map shows current coordinates and copies them to the clipboard (for easy adding to the marker table)
- Current map (Imogen world map) is created and copyrighted by Lohe Isok, who has granted permission to use this map for this instance. Please do not copy the map without his permission.

## Google sheets table structure (determines the features that are supported):
- layer - layer name, where marker appears. Markers are grouped in different layers that can be shown or hidden from map with a single click. If it starts with # or / the row is considered to be a comment, which is ignored
	- idea for a special layer - linked entries that can be viewed in a sidebar? (e.g game episodes tied to specific locations)
		- https://tomik23.github.io/leaflet-examples/#29.linked-view
		- https://tomik23.github.io/leaflet-examples/#36.story-maps-IntersectionObserver
- latlng - coordinates separated by comma (Y, X)
- mapText - Text displayed on map, can be left empty for only an icon+popup text. If icon is present, map_text is displayed besides icon, otherwise text is displayed at latLng coordinates.
- icon - Marker icon (either relative to webserver or an http: url); if empty, no popup icon is displayed (can be used for showing only text directly on map). Can also use Font Awesome 4.7 icon (eg "fa-coffee")
- popupText - Popup text is displayed when icon is clicked
- home - set to non-blank (eg yes/true) to have a marker associated with home button for centering map on the home marker (only one marker can be "home")
