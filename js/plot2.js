// https://bl.ocks.org/MariellaCC/0055298b94fcf2c16940
// http://bl.ocks.org/micahstubbs/c7f17dcbdc728e0d579d84e47c33dfa6

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

tip.direction(function(d) {
    if (d.properties.name === 'Antarctica') return 'n';
    // Americas
    if (d.properties.name === 'Greenland') return 's';
    if (d.properties.name === 'Canada') return 'e';
    if (d.properties.name === 'USA') return 'e';
    if (d.properties.name === 'Mexico') return 'e';
    // Europe
    if (d.properties.name === 'Iceland') return 's';
    if (d.properties.name === 'Norway') return 's';
    if (d.properties.name === 'Sweden') return 's';
    if (d.properties.name === 'Finland') return 's';
    if (d.properties.name === 'Russia') return 'n';
    // Asia
    if (d.properties.name === 'China') return 'w';
    if (d.properties.name === 'Japan') return 's';
    // Oceania
    if (d.properties.name === 'Indonesia') return 'w';
    if (d.properties.name === 'Papua New Guinea') return 'w';
    if (d.properties.name === 'Australia') return 'w';
    if (d.properties.name === 'New Zealand') return 'w';
    // otherwise if not specified
    return 'n';
});

tip.offset(function(d) { // [top, left]
    if (d.properties.name === 'Antarctica') return [0, 0];
    // Americas
    if (d.properties.name === 'Greenland') return [10, -10];
    if (d.properties.name === 'Canada') return [24, -28];
    if (d.properties.name === 'USA') return [-5, 8];
    if (d.properties.name === 'Mexico') return [12, 10];
    if (d.properties.name === 'Chile') return [0, -15];
    // Europe
    if (d.properties.name === 'Iceland') return [15, 0];
    if (d.properties.name === 'Norway') return [10, -38];
    if (d.properties.name === 'Sweden') return [10, -8];
    if (d.properties.name === 'Finland') return [10, 0];
    if (d.properties.name === 'France') return [-9, 66];
    if (d.properties.name === 'Italy') return [-8, -6];
    if (d.properties.name === 'Russia') return [190, -200];
    // Africa
    if (d.properties.name === 'Madagascar') return [-10, 10];
    // Asia
    if (d.properties.name === 'China') return [-16, -8];
    if (d.properties.name === 'Mongolia') return [-5, 0];
    if (d.properties.name === 'Pakistan') return [-10, 13];
    if (d.properties.name === 'India') return [-11, -18];
    if (d.properties.name === 'Nepal') return [-8, 1];
    if (d.properties.name === 'Myanmar') return [-12, 0];
    if (d.properties.name === 'Laos') return [-12, -8];
    if (d.properties.name === 'Vietnam') return [-12, -4];
    if (d.properties.name === 'Japan') return [5, 5];
    // Oceania
    if (d.properties.name === 'Indonesia') return [0, -5];
    if (d.properties.name === 'Papua New Guinea') return [-5, -10];
    if (d.properties.name === 'Australia') return [-15, 0];
    if (d.properties.name === 'New Zealand') return [-15, 0];
    // otherwise if not specified
    return [-10, 0];
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

var projection = d3.geo.mercator()
    .center([ 13, 62 ]) //comment centrer la carte, longitude, latitude
    .translate([ w/2, h/2 ]) // centrer l'image obtenue dans le svg
    .scale([ w/3.5 ]); // zoom, plus la valeur est petit plus le zoom est gros

var path = d3.geo.path().projection(projection);

var data_set;

var svg = d3.select("#plot2-holder")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .call(d3.behavior.zoom().on("zoom", function () {
        svg.attr("transform", "translate(" + d3.event.translate + ")" + " scale(" + d3.event.scale + ")")
    }))
    .append("g");

svg.call(tip);

queue()
    .defer(d3.json, "data/world_countries.json")
    .defer(d3.tsv, "data/MODIS/statistics.tsv")
    .await(ready);

// update currently created plot with new data
function replacePlot2Content(type){
    plot2_type = type;

    data_set.remove();

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

    data_set = svg.append("g")
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
            if(format(d.value) !== "NaN"){
                tip.show(d);

                d3.select(this)
                    .style("opacity", 1)
                    .style("stroke","white")
                    .style("stroke-width",3);
            }
        })
        .on('mouseout', function(d){
            tip.hide(d);

            d3.select(this)
                .style("opacity", 0.8)
                .style("stroke","white")
                .style("stroke-width",0.3);
        });

    svg.append("path")
        .datum(topojson.mesh(data.features, function(a, b) { return a.id !== b.id; }))
        .attr("class", "names")
        .attr("d", path);
}