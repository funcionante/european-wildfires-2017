// Set the dimensions of the canvas / graph
var margin_simple = {top: 30, right: 20, bottom: 30, left: 100},
    width_simple = 1050 - margin_simple.left - margin_simple.right,
    height_simple = 170 - margin_simple.top - margin_simple.bottom;

// Parse the date / time
var parseDate_simple = d3.time.format("%d-%b-%y").parse;

// Set the ranges
var x_simple = d3.time.scale().range([0, width_simple]);
var y_simple = d3.scale.linear().range([height_simple, 0]);

// Define the axes
var xAxis_simple = d3.svg.axis().scale(x_simple)
    .orient("bottom").ticks(5);

var yAxis_simple = d3.svg.axis().scale(y_simple)
    .orient("left").ticks(2);

// Define the line
var valueline_simple = d3.svg.line()
    .x(function(d) { return x_simple(d.date); })
    .y(function(d) { return y_simple(d.close); });

// Adds the svg canvas
var svg_simple = d3.select("#simple-plot")
    .append("svg")
    .attr("width", width_simple + margin_simple.left + margin_simple.right)
    .attr("height", height_simple + margin_simple.top + margin_simple.bottom)
    .append("g")
    .attr("transform",
        "translate(" + margin_simple.left + "," + margin_simple.top + ")");

// Get the data
d3.csv("data.csv", function(error, data) {
    data.forEach(function(d) {
        d.date = parseDate_simple(d.date);
        console.log(d.date);
        d.close = +d.close;
    });

    // Scale the range of the data
    x_simple.domain(d3.extent(data, function(d) { return d.date; }));
    y_simple.domain([0, d3.max(data, function(d) { return d.close; })]);

    // Add the valueline path.
    svg_simple.append("path")
        .attr("class", "line")
        .attr("d", valueline_simple(data));

    // Add the X Axis
    svg_simple.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height_simple + ")")
        .call(xAxis_simple);

    // Add the Y Axis
    svg_simple.append("g")
        .attr("class", "y axis")
        .call(yAxis_simple);

});