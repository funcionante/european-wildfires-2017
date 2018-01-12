// based on:
// https://github.com/evanplaice/jquery-csv

var top10dataset;

function toPortuguese(name) {
    switch (name) {
        case 'Albania': return 'Albânia';
        case 'Armenia': return 'Arménia';
        case 'Austria': return 'Áustria';
        case 'Azerbaijan': return 'Azerbeijão';
        case 'Belarus': return 'Bielorrússia';
        case 'Bosnia and Herzegovina': return 'Bósnia e Herzegovina';
        case 'Bulgaria': return 'Bulgária';
        case 'Croatia': return 'Croácia';
        case 'Cyprus': return 'Chipre';
        case 'Czech Republic': return 'República Checa';
        case 'Denmark': return 'Dinamarca';
        case 'Estonia': return 'Estónia';
        case 'Finland': return 'Finlândia';
        case 'France': return 'França';
        case 'Georgia': return 'Geórgia';
        case 'Germany': return 'Alemanha';
        case 'Greece': return 'Grécia';
        case 'Hungary': return 'Hungria';
        case 'Iceland': return 'Islândia';
        case 'Ireland': return 'Irlanda';
        case 'Italy': return 'Itália';
        case 'Kazakhstan': return 'Cazaquistão';
        case 'Latvia': return 'Letónia';
        case 'Lithuania': return 'Lituânia';
        case 'Luxembourg': return 'Luxemburgo';
        case 'Macedonia': return 'Macedónia';
        case 'Moldova': return 'Moldávia';
        case 'Netherlands': return 'Holanda';
        case 'Norway': return 'Noruega';
        case 'Poland': return 'Polónia';
        case 'Romania': return 'Roménia';
        case 'Russia': return 'Rússia';
        case 'Serbia': return 'Sérvia';
        case 'Slovakia': return 'Eslováquia';
        case 'Slovenia': return 'Eslovénia';
        case 'Spain': return 'Espanha';
        case 'Sweden': return 'Suécia';
        case 'Switzerland': return 'Suíça';
        case 'Turkey': return 'Turquia';
        case 'Ukraine': return 'Ucrânia';
        case 'United Kingdom': return 'Reino Unido';
        case 'England': return 'Reino Unido';
        default: return name;
    }
}

var country_occurrences = {};

$.ajax({
    url: "data/MODIS/dates.tsv",
    async: false,
    success: function (csvd) {
        data = $.csv.toArrays(csvd);
    },
    dataType: "text",
    complete: function () {

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

        update_line(getOccurrences("2017-01-01","2017-12-31"));
    }
});

function getOccurrences(start_date, end_date){
    var daily_occurences = {};

    var start_month = parseInt(start_date.split("-")[1]);
    var start_day = parseInt(start_date.split("-")[2]);

    var end_month = parseInt(end_date.split("-")[1]);
    var end_day = parseInt(end_date.split("-")[2]);

    for(var country in country_occurrences){

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
                    var key_val = '2017-' + month + '-' + day;

                    if(!(key_val in daily_occurences)){
                        daily_occurences[key_val] = 0;
                    }

                    daily_occurences[key_val] += parseInt(country_occurrences[country][month][day]);
                }
            }
        }
    }

    var parsed_occurrences = [];
    var pars = 0;

    var orderedDates = {};
    Object.keys(daily_occurences).sort(function(b, a) {
        return moment(b, 'YYYY/MM/DD').toDate() - moment(a, 'YYYY/MM/DD').toDate();
    }).forEach(function(key) {
        //orderedDates[key] = daily_occurences[key];
        parsed_occurrences[pars++] = {date: key, close: daily_occurences[key]};
    });

    /*for(var date_occ in orderedDates){
        parsed_occurrences[pars] = {date: date_occ, close: orderedDates[date_occ]};
        pars++;
    }*/

    return parsed_occurrences;
}

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

    return top10_formated.reverse();
}

// end

/*d3.selectAll("input").on("change", selectDataset);*/

function update_plot1_dataset(start_date, end_date){
    change(getTop10(start_date,end_date));
}

var x_plot1, y_plot1, svg_plot1, margin_plot1, height_plot1, width_plot1, xAxis_plot1, yAxis_plot1, div_plot1, formatPercent_plot1;

function plot1_init() {


    margin_plot1 = {top: 30, right: 10, bottom: -20, left: 100};
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
        .orient("top");

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
        .call(xAxis_plot1);

    d3.select("input[value=\"total\"]").property("checked", true);
}

function change(dataset) {
    y_plot1.domain(dataset.map(function(d) { return toPortuguese(d.label); }));
    x_plot1.domain([0, d3.max(dataset, function(d) { return d.value; })]);

    svg_plot1.append("g")
        .attr("class", "x axis")
        .call(xAxis_plot1);

    svg_plot1.select(".y.axis").remove();
    svg_plot1.select(".x.axis").remove();

    svg_plot1.append("g")
        .attr("class", "y axis")
        .call(yAxis_plot1)
        .append("text")
        .attr("transform", "translate(-5, -20)")
        .attr("dx", ".1em")
        .text("% de ocurrências");


    var bar_plot1 = svg_plot1.selectAll(".bar")
        .data(dataset, function(d) { return toPortuguese(d.label); });
    // new data:
    bar_plot1.enter().append("rect")
        .attr("class", "bar")
        .attr("x", function(d) { return x_plot1(d.value); })
        .attr("y", function(d) { return toPortuguese(y_plot1(d.label)); })
        .attr("width", function(d) { return width_plot1-x_plot1(d.value); })
        .attr("height", y_plot1.rangeBand());

    bar_plot1
        .on("mousemove", function(d){
            div_plot1.style("left", d3.event.pageX+10+"px");
            div_plot1.style("top", d3.event.pageY-25+"px");
            div_plot1.style("display", "inline-block");
            div_plot1.html((toPortuguese(d.label))+"<br>"+(d.value)+"%");
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
        .attr("y", function(d) { return y_plot1(toPortuguese(d.label)); })
        .attr("width", function(d) { return x_plot1(d.value); })
        .attr("height", y_plot1.rangeBand());
}