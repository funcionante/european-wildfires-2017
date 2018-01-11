var top10dataset;

// https://github.com/evanplaice/jquery-csv

var country_occurrences = {};

$.ajax({
    url: "data/MODIS/dates.tsv",
    async: false,
    success: function (csvd) {
        data = $.csv.toArrays(csvd);
    },
    dataType: "text",
    complete: function () {
        console.log("start");

        // build data-structure
        // date,country,occurrences
        for(var i = 1; i < data.length; i++){
            var date = data[i][0].split('-');
            var month = parseInt(date[1]);
            var day = parseInt(date[2]);

            var country = data[i][1];
            var occurrences = parseInt(data[i][2]);

            // if country is not present country_occurrences
            if(!(country in country_occurrences)) {
                country_occurrences[country] = [];
            }

            // if month is not present in country_occurrences[country]
            if(!(month in country_occurrences[country])){
                country_occurrences[country][month] = [];
            }

            // if day is not present in country_occurrences[country][month]
            if(!(day in country_occurrences[country][month])){
                country_occurrences[country][month][day] = occurrences;
            }
            else{
                country_occurrences[country][month][day] += occurrences;
            }
        }

        // get top 10
        top10dataset = getTop10("2017-01-01","2017-12-31");

        plot1_init();

        change(top10dataset);
    }
});

function getTop10(start_date, end_date){
    var start_month = parseInt(start_date.split("-")[1]);
    var start_day = parseInt(start_date.split("-")[2]);

    var end_month = parseInt(end_date.split("-")[1]);
    var end_day = parseInt(end_date.split("-")[2]);

    var date_occurences = {};

    for(var country in country_occurrences){
        date_occurences[country] = 0;

        // walkthrough months
        for(var month = start_month; month <= end_month; month++){
            // check don't if month exists
            if(!(month in country_occurrences[country])){
                continue;
            }

            var start_day_for = 1;
            var end_day_for = 31;

            // start_day could be 1 or 14, depends of input
            if(month === start_month){
                start_day_for = start_day;
            }

            if(month === end_month){
                end_day_for = end_day;
            }

            // walkthrough days
            for(var day = start_day_for; day <= end_day_for; day++){
                if((day in country_occurrences[country][month])){
                    date_occurences[country] += parseInt(country_occurrences[country][month][day]);
                }
            }
        }
    }

    // find top 10 by sorting elements
    var items = Object.keys(date_occurences).map(function(key) {
        return [key, date_occurences[key]];
    });

    // Sort the array based on the second element
    items.sort(function(first, second) {
        return second[1] - first[1];
    });

    // Create a new array with only the first 10 items
    var top10 = items.slice(0, 10);

    var total_count = 0;

    // counting total incidents
    for(var count in top10){
        total_count += top10[count][1];
    }

    var top10_formated = [];

    for(var i = 0; i < top10.length; i++){
        top10_formated[i] = {label:top10[i][0], value:Math.ceil(top10[i][1]*100/total_count)};
    }

    return top10_formated;
}

// end

/*d3.selectAll("input").on("change", selectDataset);*/

function update_plot1_dataset(start_date, end_date){
    change(getTop10(start_date,end_date));
}

var x_plot1, y_plot1, svg_plot1, margin_plot1, height_plot1, width_plot1, xAxis_plot1, yAxis_plot1, div_plot1, formatPercent_plot1;

function plot1_init() {


    margin_plot1 = {top: 10, right: 10, bottom: 30, left: 100};
    width_plot1 = 900;
    height_plot1 = 400;

    div_plot1 = d3.select("body").append("div").attr("class", "toolTip");

    formatPercent_plot1 = d3.format("");

    y_plot1 = d3.scale.ordinal()
        .rangeRoundBands([height_plot1, 0], .2, 0.5);

    x_plot1 = d3.scale.linear()
        .range([0, width_plot1]);

    xAxis_plot1 = d3.svg.axis()
        .scale(x_plot1)
        .tickSize(-height_plot1)
        .orient("bottom");

    yAxis_plot1 = d3.svg.axis()
        .scale(y_plot1)
        .orient("left");
    //.tickFormat(formatPercent);

    svg_plot1 = d3.select("#plot1-graph").append("svg")
        .attr("width", width_plot1 + margin_plot1.left + margin_plot1.right)
        .attr("height", height_plot1 + margin_plot1.top + margin_plot1.bottom)
        .append("g")
        .attr("transform", "translate(" + margin_plot1.left + "," + margin_plot1.top + ")");

    svg_plot1.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height_plot1 + ")")
        .call(xAxis_plot1);

    d3.select("input[value=\"total\"]").property("checked", true);
}

function change(dataset) {
    console.log(dataset);
    y_plot1.domain(dataset.map(function(d) { return d.label; }));
    x_plot1.domain([0, d3.max(dataset, function(d) { return d.value; })]);

    svg_plot1.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height_plot1 + ")")
        .call(xAxis_plot1);

    svg_plot1.select(".y.axis").remove();
    svg_plot1.select(".x.axis").remove();

    svg_plot1.append("g")
        .attr("class", "y axis")
        .call(yAxis_plot1)
        .append("text")
        .attr("transform", "rotate(0)")
        .attr("x", 50)
        .attr("dx", ".1em")
        .style("text-anchor", "end")
        .text("Option %");


    var bar_plot1 = svg_plot1.selectAll(".bar")
        .data(dataset, function(d) { return d.label; });
    // new data:
    bar_plot1.enter().append("rect")
        .attr("class", "bar")
        .attr("x", function(d) { return x_plot1(d.value); })
        .attr("y", function(d) { return y_plot1(d.label); })
        .attr("width", function(d) { return width_plot1-x_plot1(d.value); })
        .attr("height", y_plot1.rangeBand());

    bar_plot1
        .on("mousemove", function(d){
            div_plot1.style("left", d3.event.pageX+10+"px");
            div_plot1.style("top", d3.event.pageY-25+"px");
            div_plot1.style("display", "inline-block");
            div_plot1.html((d.label)+"<br>"+(d.value)+"%");
        });
    bar_plot1
        .on("mouseout", function(d){
            div_plot1.style("display", "none");
        });


    // removed data:
    bar_plot1.exit().remove();

    // updated data:
    bar_plot1.transition()
        .duration(750)
        .attr("x", function(d) { return 0; })
        .attr("y", function(d) { return y_plot1(d.label); })
        .attr("width", function(d) { return x_plot1(d.value); })
        .attr("height", y_plot1.rangeBand());
}