// https://bl.ocks.org/MariellaCC/0055298b94fcf2c16940

//Width and height
var w = 800;
var h = 600;
var plot2_type = "total_occurrences";

var format = d3.format(",");

// Set tooltips
var tip = d3.tip()
    .attr('class', 'd3-tip')
    .offset([-10, 0])
    .html(function(d) {
        return "<strong>Country: </strong><span class='details'>" + d.properties.name + "<br></span>" + "<strong>Fire occurrences: </strong><span class='details'>" + format(d.value) +"</span>";
    });

var margin = {top: 0, right: 0, bottom: 0, left: 0},
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

// http://www.perbang.dk/rgbgradient/
function customColor(value) {
    var maxVal = {'total_occurrences': 10000, 'area_occurrences': 0.04, 'bright_ti4_high': 500, 'bright_ti4_avg': 350};
    var colors = ['#CAE500','#C8CF00','#C7B900','#C6A300','#C58E00','#C47800','#C36200','#C24D00','#C13700','#C02100','#BF0C00'];

    if(isNaN(value)){
        return '#000000';
    }
    else if(value > maxVal[plot2_type]){
        return colors[10];
    }
    else{
        var index = Math.floor(value * 10 / maxVal[plot2_type]);
        return colors[index];
    }
}

var path = d3.geoPath();

    var svg = d3.select("#plot2-holder")
    .append("svg")
    .call(d3.zoom().on("zoom", function () {
        svg.attr("transform", d3.event.transform)
    }))
    .attr("width", width)
    .attr("height", height)
    .append('g')
    .attr('class', 'map');

var projection = d3.geoMercator()
    .center([ 13, 62 ]) //comment centrer la carte, longitude, latitude
    .translate([ w/2, h/2 ]) // centrer l'image obtenue dans le svg
    .scale([ w/3.5 ]); // zoom, plus la valeur est petit plus le zoom est gros

var path = d3.geoPath().projection(projection);

svg.call(tip);

queue()
    .defer(d3.json, "data/world_countries.json")
    .defer(d3.tsv, "data/MODIS/statistics.tsv")
    .await(ready);

// update currently created plot with new data
function replacePlot2Content(type){
    plot2_type = type;

    d3.select("svg").remove();

    svg = d3.select("#plot2-holder")
        .append("svg")
        .call(d3.zoom().on("zoom", function () {
            svg.attr("transform", d3.event.transform)
        }))
        .attr("width", width)
        .attr("height", height)
        .append('g')
        .attr('class', 'map');

    queue()
        .defer(d3.json, "data/world_countries.json")
        .defer(d3.tsv, "data/MODIS/statistics.tsv")
        .await(ready);
}

function ready(error, data, statistics) {
    var populationById = {};

    statistics.forEach(function(d) {
        if(plot2_type === "area_occurrences"){
            populationById[d.id] = d.area_occurrences;
        }
        else if(plot2_type === "bright_ti4_high"){
            populationById[d.id] = d.bright_ti4_high;
        }
        else if(plot2_type === "bright_ti4_avg"){
            populationById[d.id] = d.bright_ti4_avg;
        }
        else{
            populationById[d.id] = d.total_occurrences;
        }

    });
    data.features.forEach(function(d) { d.value = populationById[d.id] });

    svg.append("g")
        .attr("class", "countries")
        .selectAll("path")
        .data(data.features)
        .enter().append("path")
        .attr("d", path)
        .style("fill", function(d) { return customColor(populationById[d.id]); })
        .style('stroke', 'white')
        .style('stroke-width', 1.5)
        .style("opacity",0.8)
        // tooltips
        .style("stroke","white")
        .style('stroke-width', 0.3)
        .on('mouseover',function(d){
            tip.show(d);

            d3.select(this)
                .style("opacity", 1)
                .style("stroke","white")
                .style("stroke-width",3);
        })
        .on('mouseout', function(d){
            tip.hide(d);

            d3.select(this)
                .style("opacity", 0.8)
                .style("stroke","white")
                .style("stroke-width",0.3);
        });

    /*svg.append("path")
        .datum(topojson.mesh(data.features, function(a, b) { return a.id !== b.id; }))
        .attr("class", "names")
        .attr("d", path);*/
}