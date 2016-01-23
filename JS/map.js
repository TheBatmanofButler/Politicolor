
var width = Math.floor($(window).width() - 30),
    height = Math.floor($(window).height());

var rateById = d3.map();

var quantize = d3.scale.quantize()
    .domain([0, .15])
    .range(d3.range(9).map(function(i) { return "q" + i + "-9"; }));

var projection = d3.geo.albersUsa()
    .scale(1650)
    .translate([width / 2, height / 2]);

var path = d3.geo.path()
    .projection(projection);

var svg = d3.select("body").append("svg")
    .attr("width", width)
    .attr("height", height);

function ready(error, us, congress) {

  var zoom = d3.behavior.zoom()
    .translate([0, 0])
    .scale(1)
    .scaleExtent([1, 8])
    .on("zoom", zoomed);

  var features = svg.append("g")      
    features.call(zoom)
    .on("mousedown.zoom", null)
    .on("touchstart.zoom", null)
    .on("touchmove.zoom", null)
    .on("touchend.zoom", null);

  features.append("defs").append("path")
      .attr("id", "land")
      .datum(topojson.feature(us, us.objects.land))
      .attr("d", path)

  features.append("clipPath")
      .attr("id", "clip-land")
    .append("use")
      .attr("xlink:href", "#land");

  var counter = 0; 
  
  features.append("g")
      .attr("class", "states")
    .selectAll("path")
      .data(topojson.feature(us, us.objects.states).features)
    .enter().append("path")
      .attr("class", function(d) { return 'w' + counter++; })
      .attr("d", path);

  features.append("path")
      .attr("class", "state-boundaries")
      .datum(topojson.mesh(us, us.objects.states, function(a, b) { return a !== b; }))
      .attr("d", path);

  function zoomed() {
    features.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
    features.select(".state-boundaries").style("stroke-width", 1.5 / d3.event.scale + "px");
  }
}

ready(null, us, congress);

d3.select(self.frameElement).style("height", height + "px");

//-----------------------------------------------------------------------------------------------------------------

var socket = io('http://52.90.127.98:8010');


var colorMap = {
  "trump":"rgba(233,29,14,",
  "cruz":"rgba(233,29,14,",
  "sanders":"rgba(35,32,102,",
  "clinton":"rgba(35,32,102,",
  "democrat":"rgba(35,32,102,",
  "republican":"rgba(233,29,14,"
}


function getIDFromTweet(tweetObj) {
  return "w"+tweetObj.loc.state;
}

function getColorFromTweet(tweetObj) {
  return colorMap[tweetObj.subj] + tweetObj.sent + ")";
}

function colorCounty(tweetObj) {
  id = getIDFromTweet(tweetObj);
  color = getColorFromTweet(tweetObj);  
  console.log(id)
  console.log(color)
  d3.select('#' + id).attr({"fill":color});
}

socket.on('serverToClient', function(data){
  console.log(data)
  colorCounty(data);
});

