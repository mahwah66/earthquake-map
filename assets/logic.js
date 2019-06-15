const API_KEY = "pk.eyJ1IjoibWFod2FoNjYiLCJhIjoiY2p3Yjh1cXhsMDAxOTQ5cXhzemQxbmhlcCJ9.qkhNT0T4Tz7vvqhV5kWH7A";

// Store our API endpoint as queryUrl
var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";
var tectfile = "assets/PB2002_boundaries.json";

  var emarkers=[];
// Perform a GET request to the query URL
d3.json(queryUrl, function(data) {
  var quakes=[], mags=[];

  function getColor(mag){
    //var myColor = d3.scaleLinear().domain([1,6]).range(["Lime" , "DarkRed"]);
    var myColor = d3.scaleSequential().domain([1,6]).interpolator(d3.interpolateMagma);
    if (mag>5) return myColor(1);
    else if (mag>4) return myColor(2);
    else if (mag>3) return myColor(3);
    else if (mag>2) return myColor(4);
    else if (mag>1) return myColor(5);
    else return myColor(6);
  }

  data.features.forEach(function(el,i){
  //for(var i=0; i<data.features.length; i++){
    var pt=el["geometry"]["coordinates"];
    var loc = [pt[1],pt[0]];
    var mag=+el["properties"]["mag"];
    mags.push(mag);
    var mymark = L.circle(loc,{
      fillOpacity: 0.75,
      color: getColor(mag),
      fillColor: getColor(mag),
      // Setting our circle's radius equal to the output of our markerSize function
      // This will make our marker's size proportionate to its population
      radius: (mag* mag * 8000)
    }).bindPopup(el["properties"]["title"]);
    quakes.push(mymark)
  });

  // var lims=d3.extent(mags); //checking magnitude range

  var qLayer = L.layerGroup(quakes);
  
  d3.json(tectfile, function(data) {
    
    var myStyle = {
      "color": "#ffffff",
      "weight": 3,
      "opacity": 1
    };
    var faults = L.geoJson(data, {
        style: myStyle
    });
  
    var overlayMaps = {
      "Earthquakes": qLayer,
      "Fault Lines": faults
    };
  
    // Define streetmap and darkmap layers
    var streetmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/outdoors-v10/tiles/256/{z}/{x}/{y}?" +
      "access_token={accessToken}",{
        accessToken: API_KEY
      });
  
    var Esri_NatGeoWorldMap = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/NatGeo_World_Map/MapServer/tile/{z}/{y}/{x}', {
      attribution: 'Tiles &copy; Esri &mdash; National Geographic, Esri, DeLorme, NAVTEQ, UNEP-WCMC, USGS, NASA, ESA, METI, NRCAN, GEBCO, NOAA, iPC',
      maxZoom: 16
              });
        
    var Esri_WorldImagery = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
          attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
            });
  
    // Define a baseMaps object to hold our base layers
    var baseMaps = {
      "Street Map": streetmap,
      "Satellite": Esri_WorldImagery,
      "Terrain": Esri_NatGeoWorldMap
    };
  
    // Create a new map
    var myMap = L.map("map", {
      center: [
        37.09, -95.71
      ],
      zoom: 5,
      layers: [streetmap, qLayer]
    });
  
    
    // Create a layer control containing our baseMaps
    L.control.layers(baseMaps, overlayMaps, {
      collapsed: false
    }).addTo(myMap);
  
    var legend = L.control({position: 'bottomright'});
  
    legend.onAdd = function (map) {
      var div = L.DomUtil.create('div', 'info legend'),
          grades = [0, 1, 2, 3, 4, 5],
          labels = [];
  
      // loop through our magnitude levels and generate a label with a colored square for each interval
      for (var i = 0; i < grades.length; i++) {
          div.innerHTML +=
              '<i style="background:' + getColor(grades[i] + 1) + '"></i> ' +
              grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
      }
      return div;
    };
  
    legend.addTo(myMap);
  });

  
  
  
});

