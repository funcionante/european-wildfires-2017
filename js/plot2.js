// https://bl.ocks.org/MariellaCC/0055298b94fcf2c16940

//Width and height
var w = 800;
var h = 600;

var format = d3.format(",");

// Set tooltips
var tip = d3.tip()
    .attr('class', 'd3-tip')
    .offset([-10, 0])
    .html(function(d) {
        return "<strong>Country: </strong><span class='details'>" + d.properties.name + "<br></span>" + "<strong>Fire occurrences: </strong><span class='details'>" + format(d.population) +"</span>";
    })

var margin = {top: 0, right: 0, bottom: 0, left: 0},
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

var color = d3.scaleThreshold()
    .domain([10000,100000,500000,1000000,5000000,10000000,50000000,100000000,500000000,1500000000])
    .range(["rgb(247,251,255)", "rgb(222,235,247)", "rgb(198,219,239)", "rgb(158,202,225)", "rgb(107,174,214)", "rgb(66,146,198)","rgb(33,113,181)","rgb(8,81,156)","rgb(8,48,107)","rgb(3,19,43)"]);

// http://www.perbang.dk/rgbgradient/
function customColor(value) {
    var colors = ['#CAE500','#C8CF00','#C7B900','#C6A300','#C58E00','#C47800','#C36200','#C24D00','#C13700','#C02100','#BF0C00'];

    if(isNaN(value)){
        return '#000000';
    }
    else if(value < 1000){
        return colors[0];
    }
    else if(value < 2000){
        return colors[1];
    }
    else if(value < 3000){
        return colors[2];
    }
    else if(value < 4000){
        return colors[3];
    }
    else if(value < 5000){
        return colors[4];
    }
    else if(value < 6000){
        return colors[5];
    }
    else if(value < 7000){
        return colors[6];
    }
    else if(value < 8000){
        return colors[7];
    }
    else if(value < 9000){
        return colors[8];
    }
    else if(value < 10000){
        return colors[9];
    }
    else{
        return colors[10];
    }
}

var path = d3.geoPath();

    var svg = d3.select("#plot2-holder")
    .append("svg")
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

function ready(error, data, population) {
    var populationById = {};

    population.forEach(function(d) { populationById[d.id] = +d.occurrences; });
    data.features.forEach(function(d) { d.population = populationById[d.id] });

    svg.append("g")
        .attr("class", "countries")
        .selectAll("path")
        .data(data.features)
        .enter().append("path")
        .attr("d", path)
        .style("fill", function(d) { return customColor(populationById[d.id]); })
        //.style("fill", customColor(populationById[d.id]))
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

    svg.append("path")
        .datum(topojson.mesh(data.features, function(a, b) { return a.id !== b.id; }))
        // .datum(topojson.mesh(data.features, function(a, b) { return a !== b; }))
        .attr("class", "names")
        .attr("d", path);
}