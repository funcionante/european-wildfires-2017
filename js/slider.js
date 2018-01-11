(function($, d3, moment) {
    // *** THE DATA *** //
    var dataset = function() {
        var count = 365;

        var randInt = function(max, min) {
            max = max || 20;
            min = min || 0;
            return Math.floor(Math.random() * max) + min;
        };

        var arr = [],
            startDate = moment("2017-01-01");

        for (var i = 0; i < count; i++) {
            arr.push({
                date: startDate.format("YYYY-MM-DD"),
                values: [randInt(), randInt(), randInt()],
                float: Math.random() * 1000
            });
            startDate = startDate.add(1, "days");
        }

        return arr;
    }();

    // *** THE COLORS / KEY *** //
    var colors = [
        ["Pending", "#1f77b4"],
        ["InProgress", "#2ca02c"],
        ["Completed", "#ff7f0e"]
    ];

    // *** SETTINGS *** //
    var settings = function() {
        var margins = {
            top: 10,
            bottom: 40,
            left: 40,
            right: 100
        };
        var dim = {
            width: 1000,
            height: 400
        };

        return {
            margins: margins,
            dim: dim
        };
    }();


    var renderSlider = function(dataset, settings, callback) {

        var RangeSlider = function(svg, width, radius, color, translater, callback) {
            var self = this,
                elements = {
                    min: { value: 0 },
                    max: { value: width }
                },
                settings = {
                    min: 0,
                    max: width,
                    radius: radius,
                    offset: Math.floor(radius/2),
                    color: color,
                    opacity: {
                        full: 1.0,
                        medium: 0.8,
                        half: 0.5,
                        light: 0.3
                    },
                    translater: translater,
                    callback: callback
                };

            //build the bar
            elements.$bar = svg.append('rect')
                .attr({
                    x: settings.offset, width: settings.max - (settings.offset*2),
                    y: settings.offset, height: settings.radius,
                    fill: settings.color,
                    'fill-opacity': settings.opacity.half
                });

            //build the handles
            elements.$min = svg.append('ellipse')
                .style('cursor', 'pointer')
                .attr({
                    cx: settings.min, cy: settings.radius,
                    rx: settings.radius, ry: settings.radius,
                    fill: settings.color,
                    'fill-opacity': settings.opacity.medium
                });
            elements.$minText = svg.append('text')
                .attr({
                    x: settings.min, y: settings.radius*3 + settings.offset,
                    fill: 'black', 'fill-opacity': settings.opacity.medium,
                    'text-anchor': 'middle'
                }).text(settings.translater.apply(self,[settings.min]).text);

            elements.$max = svg.append('ellipse')
                .style('cursor', 'pointer')
                .attr({
                    cx: settings.max, cy: settings.radius,
                    rx: settings.radius, ry: settings.radius,
                    fill: settings.color,
                    'fill-opacity': settings.opacity.medium
                });
            elements.$maxText = svg.append('text')
                .attr({
                    x: settings.max, y: settings.radius*3 + settings.offset,
                    fill: 'black', 'fill-opacity': settings.opacity.medium,
                    'text-anchor': 'middle'
                }).text(settings.translater.apply(self,[settings.max]).text);


            //expose as public properties
            self.elements = elements;
            self.settings = settings;

            //setup additional methods
            self.init();
        };

        RangeSlider.prototype.init = function() {
            var self = this,
                api = {};

            var runCallback = function(process) {
                if (self.settings.callback) {
                    self.settings.callback.apply(self, [
                        process,
                        self.settings.translater.apply(self, [self.elements.min.value]),
                        self.settings.translater.apply(self, [self.elements.max.value])
                    ]);
                }
            };

            self.move = function(self) {
                var api = {};

                var resetBar = function(x, width) {
                    //no error checking
                    self.elements.$bar.attr({
                        x: Math.max(x - self.settings.offset, 0), width: Math.max(width, 0)
                    });
                };


                api.$min = function(x) {
                    if (x >= self.settings.min && x <= self.elements.max.value) {
                        self.elements.min.value = x;
                        self.elements.$min.attr('cx', x);
                        self.elements.$minText.attr('x', x).text(self.settings.translater.apply(self, [x]).text);
                        resetBar(x, self.elements.max.value - x);
                        runCallback('move');
                    }
                    return self;  //chain-able
                };
                api.$max = function(x) {
                    if (x >= self.elements.min.value && x <= self.settings.max) {
                        self.elements.max.value = x;
                        self.elements.$max.attr('cx', x);
                        self.elements.$maxText.attr('x', x).text(self.settings.translater.apply(self, [x]).text);
                        resetBar(self.elements.min.value, x - self.elements.min.value);
                        runCallback('move');
                    }
                    return self;  //chain-able
                };

                return api;
            }(self);

            self.dragstart = function(self) {
                var api = {};

                var render = function($element, $text) {
                    $element.attr('fill-opacity', self.settings.opacity.full);
                    $text.attr('fill-opacity', self.settings.full);
                    self.elements.$bar.attr('fill-opacity', self.settings.opacity.light);
                    runCallback('dragstart');
                };
                api.$min = function() {
                    render(self.elements.$min, self.elements.$minText);
                    return self;
                };
                api.$max = function() {
                    render(self.elements.$max, self.elements.$maxText);
                    return self;
                };

                return api;
            }(self);

            self.dragend = function(self) {
                var api = {};

                var render = function($element, $text) {
                    $element.attr('fill-opacity', self.settings.opacity.medium);
                    $text.attr('fill-opacity', self.settings.medium);
                    self.elements.$bar.attr('fill-opacity', self.settings.opacity.half);
                    runCallback('dragend');
                }
                api.$min = function() {
                    render(self.elements.$min, self.elements.$minText);
                    return self;
                };
                api.$max = function() {
                    render(self.elements.$max, self.elements.$maxText);
                    return self;
                };

                return api;
            }(self);

            return self;
        };


        var svg = d3.select('#controllers')
            .append('svg')
            .attr({
                width: settings.dim.width + settings.margins.left + settings.margins.right,
                height: 50
            });

        var min = moment(dataset[0].date),
            max = moment(dataset[dataset.length-1].date),
            handles = {
                size: 8
            };
        var timeScale = d3.time.scale()
            .domain([min.toDate(), max.toDate()])
            .range([0, settings.dim.width]);

        //setup the svg container
        /*var svg = d3.select('#controllers')
            .append('svg')
            .attr({
                width: settings.dim.width + settings.margins.left + settings.margins.right,
                height: 50
            });*/
        var g = svg.append("g")
            .attr('class', 'x-axis')
            .attr('transform', 'translate(' + settings.margins.left + ',0)');

        //draw the axis
        g.append('line')
            .attr({
                x1: 0, y1: handles.size,
                x2: settings.dim.width, y2: handles.size,
                stroke: '#ccc',
                "stroke-width": 1
            });

        var translater = function(timeScale) {
            return function(x) {
                var m = moment(timeScale.invert(x)),
                    ret = {
                        x: x,
                        text: null,
                        value: m
                    };

                if (m.isValid()) {
                    ret.text = m.format("MMM. DD, YYYY");
                }
                return ret;
            };
        }(timeScale);

        var slider = new RangeSlider(g, settings.dim.width, handles.size, 'red', translater, callback);

        console.log("slider", slider);

        //setup handle dragging
        slider.elements.$min.call(d3.behavior.drag()
            .on('dragstart', slider.dragstart.$min)
            .on('drag', function() {
                slider.move.$min(d3.event.x);
            })
            .on('dragend', slider.dragend.$min));
        slider.elements.$max.call(d3.behavior.drag()
            .on('dragstart', slider.dragstart.$max)
            .on('drag', function() {
                slider.move.$max(d3.event.x);
            })
            .on('dragend', slider.dragend.$max));

    };



    var updateChart = function(dataset, colors, settings) {

        //draw for the first time
        //var svg = renderChart(dataset, colors, settings);

        var filterData = function(dstart, dend) {
            //because .isBetween is exclusive, adjust these boundaries
            dstart = dstart.subtract(1,'minute'); dend = dend.add(1,'minute');

            return dataset.filter(function(d) {
                return moment(d.date).isBetween(dstart,dend);
            });
        };

        var callback = function(process, dstart, dend) {
            if (process === 'dragend') {
                var slider_start_date = '2017' + "-" + parseInt(dstart.value._d.getMonth()+1) + "-" + dstart.value._d.getDate();
                var slider_end_date = '2017' + "-" + parseInt(dend.value._d.getMonth()+1) + "-" + dend.value._d.getDate();
                console.log(slider_start_date);
                console.log(slider_end_date);

                update_plot1_dataset(slider_start_date, slider_end_date);
                //svg.attr('opacity', 1);
                //console.log(data);
                //svg = renderChart(data, colors, settings);
            } else if (process === 'dragstart') {
                //svg.attr('opacity', 0.5);
            }
        };

        return callback;
    }(dataset, colors, settings);

    renderSlider(dataset, settings, updateChart);


}(jQuery, window.d3, window.moment));