# leaflet-custom-map
Custom interactive map application with markers from Google Sheets (created to show a D&D world map with campaign / player specific POI-s).
This enables relatively easy adding of markers without need to change code or using complex backend / SQL database interaction (thus also simplifying hosting).

- Initial idea from: https://rdrn.me/leaflet-maps-google-sheets/
- Modified & expanded to use custom map (for game map purposes) & more options for map markers
- Uses also examples from: https://github.com/tomik23/leaflet-examples

## Quick spec / initial todo (//TODO clean up & move to /docs later?)

### Map:
- The map is represented by a single jpg file, which is displayed using LeafletJS, with markers/labels from a separate (shared) google sheet
- Coordinates are simple 0:0 to 1000:1000 with 0:0 in bottomleft corner.
- Clicking on the map shows coordinates: https://tomik23.github.io/leaflet-examples/#05.coordinates-after-clicking-on-the-map

### Google sheets table structure (determines the features that are supported):
- First column is the entry type.
- Only certain entry types are recognized, all others are ignored (can be used as comments, recommended to insert # as comment marker in first column, but not required, first column can be left blank)
- Entry types (in order of importance to be implemented): MAP, MARKER, CONF
  - MAP - map info
    - FILENAME - local filename or URL for map image (tiles not supported atm)
    - BOUNDS_LOW - 0:0 or whatever
    - BOUNDS_HIGH - 1000:1000 or whatever (bounds should be scaled to image map dimensions or map will be skewed)
    - ZOOM_MIN - minimum zoom
    - ZOOM_MAX - maximum zoom
    - ZOOM_INIT - initial zoom
  - MARKER - map marker with following fields:
    - LAYER - layer name, where marker appears
  	- POPUP_TEXT - popup text when icon is clicked upon
	  - MAP_TEXT - label text on map below icon
    - ICON - marker icon (either in current directory or an http: url); if empty, no popup icon is displayed (can be used for showing only map_text directly on map)
  	  - https://tomik23.github.io/leaflet-examples/#32.image-icons-prev-next
	  - HOME - only one marker can be "home" (last one is used in case of multiple)
	  - https://tomik23.github.io/leaflet-examples/#41.back-to-home-button
  - CONF - configuration entry, with following fields:
  	- ITEM - what is being configured
	  	- FONT - map_text font parameters?
			- ICON - ?
	- Special layer / markers for linked entries that can be viewed in a sidebar? (e.g game episodes tied to specific locations)
			- https://tomik23.github.io/leaflet-examples/#29.linked-view
			- https://tomik23.github.io/leaflet-examples/#36.story-maps-IntersectionObserver
			
