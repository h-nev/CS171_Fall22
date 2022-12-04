class TimeSeries {

    constructor(parentElement, data) {
        this.parentElement = parentElement;
        this.data = data;
        this.displayData = [];
        this.colors = [
            "#F4C963"
            , "#5B85AD"
            , "#8A3240"
            , "#D5C081"
            , "#CA9293"
            ,"#d53e4f"
            , "#ffffbf"
            , "#F2927C"
            , "#e6f598"
            , "#312956"
            , "#abdda4"
            , "#5e4fa2"
            ]



;

        this.initVis();
    }
    /*
     * Initialize visualization (static content; e.g. SVG area, axes)
     */

    initVis() {
        let vis = this;

        // parameters to customize the chart
        vis.params = {songs_axis: 'All',
            min_date: 1970,
            max_date: 1985};

        // Margins & Dimensions
        vis.margin = {top: 50, right: 60, bottom: 50, left: 60};

        vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width - vis.margin.left - vis.margin.right;
        vis.height = document.getElementById(vis.parentElement).getBoundingClientRect().height - vis.margin.top - vis.margin.bottom;

        // SVG drawing area
        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append("g")
            .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

        // Scales
        vis.xScale = d3.scaleLinear()
            .range([0, vis.width])


        vis.yScale = d3.scaleLinear()
            .range([0, vis.height])
            .domain([1,100]);

        vis.bubbleScale = d3.scalePow()
            .range([100,800])
            .domain(d3.extent(vis.data.map(d=>d["n_weeks"])));

        vis.artistScale =
            // d3.scaleOrdinal().domain(d3.map(vis.data, d=>d.artist).keys()).range(vis.colors)
            d3.scaleOrdinal()
            .range(vis.colors)
            .domain(["Dolly Parton", "Taylor Swift", "Elvis Presley", "Whitney Houston",  "Madonna"]);


        // Axis
        // y
        vis.yAxis = d3.axisRight()
            .scale(vis.yScale)
            .tickSize(0)
            .tickValues(vis.yScale.ticks().concat(vis.yScale.domain())); // necessary to include number 1 on top

        vis.svg.append('g')
            .attr('class', 'axis y-axis')
            .attr('transform', `translate (${vis.width},0)`)
            .call(vis.yAxis);

        // y title
        vis.svg.append("text")
            .attr("class", "axis-title")
            .attr("text-anchor", "middle")
            .attr("transform",`translate (${vis.width + vis.margin.right/2},${vis.height/2})rotate(-90)`)
            .text("Billboard Ranking");

        // x
        vis.dateLabels = [
            {date: '1960'},
            {date: '1970'},
            {date: '1980'},
            {date: '1990'},
            {date: '2000'},
            {date: '2010'},
            {date: '2020'}];

        // Song's lines
        vis.line = d3.line()
            .x(function(d) { return vis.xScale(d["date_short"]);})
            .y(function(d) { return vis.yScale(d['rank']); })
            .curve(d3.curveMonotoneX);


        // legend
        vis.buildLegend()

        // append tooltip
        vis.tooltip = d3.select("body")
            .append('div')
            .attr('class', "tooltip")
            .attr('id', 'customTooltip')

        vis.artist_filter = selectedCategory;
        vis.min_year = 1977;
        vis.max_year = 1984;

        // Time series slider
        vis.slider = document.getElementById(vis.parentElement +'-slider');
        document.getElementById(vis.parentElement +"-slider").style.margin = `0px ${vis.margin.right}px 10px ${vis.margin.left-15}px`;

        noUiSlider.create(vis.slider, {
            start: [1974, 1985],
            step: 1,
            connect: true,
            range: {
                'min': 1958,
                'max': 2022
            },
            pips: {
                mode: 'steps',
                filter: filterPips ,
                density: 10
            }
        });

        function filterPips(value, type) {
            if (value % 5 === 0) {
                return  2;
            }
            if(value === 1958 || value === 2022 ){return 2}
        }

        vis.annotations = vis.svg.append("g")
            .attr('class', 'annotations')

        // (Filter, aggregate, modify data)
        vis.wrangleData();
    }

    /*
     * Data wrangling
     */

    wrangleData() {
        let vis = this;

        vis.data_ = vis.data
            .filter(d=> d["year"] >= vis.min_year && d["year"] <= vis.max_year)

        vis.displayData = vis.data_
            .filter(d=>d["artist"].includes(vis.artist_filter))

        vis.dateLabels_ = vis.dateLabels
            .filter(d=> d["date"] >= vis.min_year && d["date"] <= vis.max_year)

        vis.updateVis();
    }
    /*
     * The drawing function - should use the D3 update sequence (enter, update, exit)
     */

    updateVis() {
        let vis = this;

        // TODO
        vis.slider.noUiSlider.on('change', function () {
            vis.min_year = vis.slider.noUiSlider.get(true)[0]
            vis.max_year = vis.slider.noUiSlider.get(true)[1]
            d3.selectAll('.curve').remove()
            vis.wrangleData()
        });

        vis.xScale
            .domain([dateParser(vis.min_year+"-01-01"), dateParser((vis.max_year+2)+"-01-01")]);

        d3.selectAll('.date-label-top').remove()
        vis.labelTop = vis.svg.selectAll('.date-label-top')
            .data(vis.dateLabels_)
            .enter().append('text')
            .attr('class', 'date-label-top')
            .attr('x', function(d) {return vis.xScale(dateParser(d["date"] + '-01-01'))})
            .attr('y', function(d) {return vis.yScale(0)-vis.margin.top/2})
            .text(function(d) {return d["date"]})

        d3.selectAll('.date-label-bottom').remove()
        vis.svg.selectAll('.date-label-bottom')
            .data(vis.dateLabels_)
            .enter().append('text')
            .attr('class', 'date-label-bottom')
            .attr('x', function(d) {return vis.xScale(dateParser(d["date"] + '-01-01'))})
            .attr('y', function(d) {return vis.yScale(100)+vis.margin.bottom/2})
            .text(function(d) {return d["date"]})

        // line markers for each decade
        d3.selectAll('.date-marker').remove()
        vis.svg.selectAll('.date-marker')
            .data(vis.dateLabels_)
            .enter().append('line')
            .attr('class', 'date-marker')
            .attr('y1', vis.yScale(0))
            .attr('x1', function(d) {return vis.xScale(dateParser(d['date'] + '-01-01'));})
            .attr('x2', function(d) {return vis.xScale(dateParser(d['date'] + '-01-01'));})
            .attr('y2', vis.yScale(100))
            .style('stroke', '#E3E9ED')
            .style("stroke-width", 2)

        let artists = Array.from(new Set(vis.displayData.map(function(d) { return d['artist'];})));

        let i; // Loop aggregating for each artist
        for (i = 0; i < artists.length; i++) {
            let artist_filt = artists[i];
            let data_filt_artist = _.filter(vis.displayData.filter(d=>d["artist"]===artist_filt),function(element){
                    return element.artist && [element.artist].indexOf(artist_filt) !== -1;
                })
            let songs = Array.from(new Set(data_filt_artist.map(function(d) { return d['song'];})));
            let j;// Loop drawing path for each artist's song
            for (j = 0; j < songs.length ; j++) {
                let song_filt = songs[j];
                let data_filt = _.filter(data_filt_artist.filter(d=>d["song"]===song_filt),function(element) {
                        return element.song && [element.song].indexOf(song_filt) !== -1;
                })

                vis.linePaths = vis.svg.append('path')

                vis.linePaths.datum(data_filt)
                    .merge(vis.linePaths)
                    .attr('class', function(d) {return 'curve';})
                    .attr('d', vis.line)
                    .style('fill', 'none')
                    .style('stroke',
                        function(d) {
                        console.log(vis.artistScale([0]["artist"]))
                        return '#B3CDE0'
                            // vis.artistScale([0]["artist"])
                            ;
                    }
                        // '#005B96'
                    )
                    .style('stroke-width', 2)
                    .style('opacity', function(d) {return 0.6})

                vis.linePaths.exit().remove()

            }
        };

        vis.bubbles = vis.svg.selectAll('.bubble')
            .data(vis.data_)

        vis.bubbles.enter().append('circle')
            .merge(vis.bubbles)
            .attr('class', "bubble")
            .attr('cx', function (d) {
                return vis.xScale(d['date_short']);
            })
            .attr('cy', function (d) {
                return vis.yScale(d['rank']);
            })
            .attr('r', function (d) {
                return Math.sqrt((vis.bubbleScale(d['n_weeks'])) / Math.PI);
            })
            .style('fill', function(d){
                if (d.artist.includes(vis.artist_filter)) {
                    return vis.artistScale(vis.artist_filter)
                }else{
                    return '#B3CDE0'
                }
            })
            .style('stroke-opacity', 0)
            .style('stroke-width', 0)
            .style('stroke', 'gray')
            .style('opacity', function(d){
                if (d.artist.includes(vis.artist_filter)){
                    return 0.9
                }else{
                    return 0.15
                }

            })
        .on('mouseover', function (event, d) {
                d3.selectAll('.curve').remove()
                vis.annotations.style("opacity", 0)

                // console.log(event.currentTarget)

                vis.artist_filter = d.artist
                vis.wrangleData()
                d3.select(event.currentTarget)
                    .style('stroke-opacity',1)
                    .style('stroke-width', 2)
                    .style('stroke', 'white')
                    .style('opacity', 1)
                    .raise()
                vis.tooltip
                    .style("opacity", 0.8)
                    .style("left", event.pageX + 10 + "px")
                    .style("top", event.pageY + "px")
                    .style('font-size', '8px')
                    .html(`
                     <div style="font-size:12px ; border: thin solid grey; border-radius: 5px; color: white ; background: black; padding: 3px";>
                        <p>
                        <b style="font-size:17px;">${d.artist} <br> </b>
                        Song: ${d.song} <br>
                        Average Rank: ${d.rank} <br>
                        Number of Weeks: ${d.n_weeks} <br>
                        Year: ${d.year} <br>
                        Month: ${d.month}
                        </p>
                     </div>`)
        })
        .on('mouseout', function (event, d) {
            d3.selectAll('.dot')
                .style('fill', '#B3CDE0')
                .style("opacity", 0.1)

            vis.annotations.style("opacity", 1)

            d3.selectAll('.curve').remove()

            // Go back to original Dolly Parton view
            vis.artist_filter = selectedCategory
            vis.wrangleData()
            vis.tooltip
                .style("opacity", 0)
                .style("left", 0)
                .style("top", 0)
                .html(``);
            ;
        });

        vis.bubbles.exit().remove()


        // ------------- Annotations ---------------------
        vis.show_annotations = [
            {
                note: {
                    label: "",
                    title: "9 To 5"
                },
                x: vis.xScale(dateParser('1981-02-01')),
                y: vis.yScale(2.25),
                dy: 0,
                dx: 50
            },
            {
                note: {
                    label: "",
                    title: "Jolene"
                },
                x: vis.xScale(dateParser('1974-02-01')),
                y: vis.yScale(61),
                dy: 0,
                dx: 50
            },
            {
                note: {
                    label: "",
                    title: "Here you come again"
                },
                x: vis.xScale(dateParser('1978-01-01')),
                y: vis.yScale(6),
                dy: 0,
                dx: 50
            },
            {
                note: {
                    label: "",
                    title: "I will always love you"
                },
                x: vis.xScale(dateParser('1982-08-01')),
                y: vis.yScale(66),
                dy: 0,
                dx: 50
            }
            ,
            {
                note: {
                    label: "",
                    title: "Islands in the stream"
                },
                x: vis.xScale(dateParser('1983-12-01')),
                y: vis.yScale(10.8),
                dy: 0,
                dx: 50
            }
        ]
        vis.makeAnnotations = d3.annotation()
            .annotations(vis.show_annotations)

        vis.annotations
            .call(vis.makeAnnotations)
            .raise()

    }

    selectorChange(){
        let vis = this;
        vis.artist_filter = selectedCategory;
        d3.selectAll('.curve').remove()
        d3.selectAll('.annotations').remove()
        vis.wrangleData()

    }

    buildLegend(){
        let vis = this
        vis.widthLegend = document.getElementById(vis.parentElement + "-legend").getBoundingClientRect().width;
        vis.heightLegend = document.getElementById(vis.parentElement + "-legend").getBoundingClientRect().height;
        vis.legendWeeks = [1,3,5]

        vis.legend  = d3.select('#' + vis.parentElement + "-legend")
            .append('svg')
            .attr("width", vis.widthLegend)
            .attr("height", vis.heightLegend);

        let circleData = [
            {week:1, cx:vis.widthLegend/2, cy:vis.heightLegend-26, radius:5},
            {week:3, cx:vis.widthLegend/2, cy:vis.heightLegend-21, radius:10},
            {week:5, cx:vis.widthLegend/2, cy:vis.heightLegend-16, radius:15}
        ]

        vis.legend.append("text")
            .attr("class", "legend-title")
            .attr("x", vis.widthLegend/4)
            .attr("y", 10)
            // .attr("dx", ".5em")
            .style("fill", "white")
            .style("font-size", "10px")
            .text("Number of weeks");

        vis.legend.selectAll("legend-text")
            .data(vis.legendWeeks)
            .enter()
            .append("text")
            .attr("class", "legend-text")
            .attr("x", vis.widthLegend*0.35)
            .attr("y", (d,i)=>i*12+28)
            .style("fill", "#B3CDE0")
            .style("font-size", "10px")
            .text(d=>d);

        vis.circles = vis.legend.selectAll("g")
            .data(circleData)
            .enter()
            .append("g");
// Add outer circle.
        vis.circles.append("circle")
            .attr("cx", function (d) { return d.cx; })
            .attr("cy", function (d) { return d.cy; })
            .attr("r", function (d) { return d.radius; })
            .style("fill", "none")
            .style("stroke", "#B3CDE0")
            .style("stroke-width", 2);


    }

}