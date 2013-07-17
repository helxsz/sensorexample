var ch = 65;
var cw = tributary.sw;
/*
Throwing phone on the bed
Sensor_record_20121208_075001_AndroSensor
*/
/*
accx = ACCELEROMETER X (m/s2)
accy = ACCELEROMETER Y (m/s2)
accz = ACCELEROMETER Z (m/s2)
gyrox = GYROSCOPE X (rad/s)
gyroy = GYROSCOPE Y (rad/s)
gyroz = GYROSCOPE Z (rad/s)
light = LIGHT ( lux)
magx = MAGNETIC FIELD X (¦ÌT)
magy = MAGNETIC FIELD Y (¦ÌT)
magz = MAGNETIC FIELD Z (¦ÌT)
orientx = ORIENTATION X (¡ã)
orienty = ORIENTATION Y (¡ã)
orientz = ORIENTATION Z (¡ã)
proximity = PROXIMITY ( cm)
atmosphere = ATMOSPHERIC PRESSURE (mb)
sound = SOUND LEVEL (dB)
loclat = LOCATION Latitude
loclon = LOCATION Longitude 
localt = LOCATION Altitude ( m)
locspeed = LOCATION Speed ( Kmh)
locacc = LOCATION Accuracy ( m)
temp = Temperature ( ¡ãF)
level = Level (%)
voltage = Voltage (Volt)
time = Time since start in ms
*/
function cleanData(d) {
  var field;
  for(field in d) {
    if(d.hasOwnProperty(field)) {
       d[field] = parseFloat(d[field]);
    }
  }
}
var phone = tributary.phone;
phone.forEach(cleanData);


//make the time scale
var tscale = d3.scale.linear()
    .domain(d3.extent(phone, function(d) { return d.time}))
    .range([0, cw]);
    //.range(["#00ff00", "#ff0000"])
    //.interpolate(d3.interpolateHsl);
    
function makeScale(field) {
  var extent = d3.extent(phone, function(d) { return d[field] });
  if(extent[0] > 0) extent[0] = 0;
  var yscale = d3.scale.linear()
      .domain(extent)
      .range([ch, 0]);
  return yscale;
}

function makeLine(field) {
  var yscale = makeScale(field);
  
  var line = d3.svg.line()
    .x(function(d) {
      return tscale(d.time);
    })
    .y(function(d) {
      return yscale(d[field]);
    })
  return line;
}

var fields = ["accx", "accy", "accz", "gyrox", "gyroy", "gyroz"];

var colors = d3.scale.category20();
var transform = function(d,i) {
  var x = 0;
  var y = 50 + (ch + 31) * i;
  return "translate(" + [x,y] + ")";
}

var svg = d3.select("svg");
svg.append("rect")
  .attr({
    width: "100%",
    height: "100%"
  })

var accels = svg.append("g")
  .selectAll("path.line")
  .data(fields)
  .enter();
accels.append("rect")
  .attr({
    width: cw,
    height: ch,
    fill: "none",
    stroke: "#686868",
    transform: transform
  })
accels.append("line")
  .attr({
    x1: 0,
    x2: cw,
    y1: function(d) { return makeScale(d)(0) },
    y2: function(d) { return makeScale(d)(0) },
    //stroke: "#ffffff",
    stroke: colors,
    "stroke-width": 1,
    transform: transform
    
  })
accels
  .append("path")
  .classed("line", true)
  .attr({
    d: function(d) { 
      var line = makeLine(d)(phone);
      return line;
    },
    transform: transform
  })
  .style({
    fill: "none",
    stroke: colors,
    "stroke-width": 3
  })
accels.append("text")
  .text(function(d) { return d })
  .attr({
    transform: transform
  })
  .style({
    fill: colors
  })





