class TimeSeries {

    constructor(parentElement, data) {
        this.parentElement = parentElement;
        this.data = data;
        this.displayData = []

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
        vis.margin = {top: 40, right: 60, bottom: 40, left: 60};

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
            .domain([dateParser("1958-01-01"), dateParser("2022-01-01")]);

        vis.yScale = d3.scaleLinear()
            .range([0, vis.height])
            .domain([1,100]);

        vis.bubbleScale = d3.scaleLinear()
            .range([10,1000])
            .domain(d3.extent(vis.data.map(d=>d["n_weeks"])));

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
            // {date: '1958'},
            {date: '1960'},
            {date: '1970'},
            {date: '1980'},
            {date: '1990'},
            {date: '2000'},
            {date: '2010'},
            {date: '2020'}];

        vis.svg.selectAll('.date-label-top')
            .data(vis.dateLabels)
            .enter().append('text')
            .attr('class', 'date-label-top')
            .attr('x', function(d) {return vis.xScale(dateParser(d["date"] + '-01-01'))})
            .attr('y', function(d) {return vis.yScale(0)-vis.margin.top/2})
            .text(function(d) {return d["date"]})

        vis.svg.selectAll('.date-label-bottom')
            .data(vis.dateLabels)
            .enter().append('text')
            .attr('class', 'date-label-bottom')
            .attr('x', function(d) {return vis.xScale(dateParser(d["date"] + '-01-01'))})
            .attr('y', function(d) {return vis.yScale(100)+vis.margin.bottom/2})
            .text(function(d) {return d["date"]})

        // line markers for each decade
        vis.svg.selectAll('.date-marker')
            .data(vis.dateLabels)
            .enter().append('line')
            .attr('class', 'date-marker')
            .attr('y1', vis.yScale(0))
            .attr('x1', function(d) {return vis.xScale(dateParser(d['date'] + '-01-01'));})
            .attr('x2', function(d) {return vis.xScale(dateParser(d['date'] + '-01-01'));})
            .attr('y2', vis.yScale(100))
            .style('stroke', '#E3E9ED')
            .style("stroke-width", 2)

        // Song's lines
        vis.line = d3.line()
            .x(function(d) { return vis.xScale(d["date_short"]);})
            .y(function(d) { return vis.yScale(d['rank']); })
            .curve(d3.curveMonotoneX);

        // lines selected labels
        vis.show_labels = [{song: '9 To 5', date: '1980-01-01', rank: 21.40},
            {song: 'Jolene', date: '1974-01-01', rank: 60},
            {song: "When I Get Where I'm Going", date: "2006-04-01", rank:39}
        ];

        // append tooltip
        vis.tooltip = d3.select("body").append('div')
            .attr('class', "tooltip")
            .attr('id', 'customTooltip')

        vis.artist_filter = "Dolly Parton";
        vis.song_filter = "";
        vis.min_year = 1975;
        vis.max_year = 1990;

        vis.bubbles = vis.svg.selectAll('.bubble')
            .data(vis.data)
            .enter().append('circle')
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
            .style('fill','#B3CDE0')
            .style('stroke-opacity', 0)
            .style('stroke', 'gray')
            .style('opacity',  0.08)


        // (Filter, aggregate, modify data)
        vis.wrangleData();
    }

    /*
     * Data wrangling
     */

    wrangleData() {
        let vis = this;
        vis.displayData = vis.data
            .filter(d=>d["artist"].includes(vis.artist_filter))

        vis.updateVis();
    }
    /*
     * The drawing function - should use the D3 update sequence (enter, update, exit)
     */

    updateVis() {
        let vis = this;

        // TODO
        let artists = Array.from(new Set(vis.displayData.map(function(d) { return d['artist'];})));
        let i; // Loop aggregating for each artist
        for (i = 0; i < artists.length; i++) {
            let artist_filt = artists[i];
            let data_filt_artist = _.filter(vis.displayData.filter(d=>d["artist"]===artist_filt),function(element){
                    return element.artist && [element.artist].indexOf(artist_filt) != -1;
                })
            let songs = Array.from(new Set(data_filt_artist.map(function(d) { return d['song'];})));
            let j;// Loop drawing path for each artist's song
            for (j = 0; j < songs.length ; j++) {
                let song_filt = songs[j];
                let data_filt = _.filter(data_filt_artist.filter(d=>d["song"]===song_filt),function(element) {
                        return element.song && [element.song].indexOf(song_filt) != -1;
                })
                console.log(data_filt)
                vis.svg.append('path')
                    .datum(data_filt)
                    .attr('class', function(d) {return 'curve line_highlight_' + i;})
                    .attr('d', vis.line)
                    .style('fill', 'none')
                    .style('stroke','#005B96')
                    .style('stroke-width', 1)
                    .style('opacity', function(d) {return 1})

                vis.svg.selectAll('.bubble_highlight_' + i)
                    .data(data_filt)
                    .enter().append('circle')
                    .attr('class', function(d) {return 'dot bubble_highlight' + i;})
                    .attr('cx', function (d) {
                        return vis.xScale(d['date_short']);
                    })
                    .attr('cy', function (d) {
                        return vis.yScale(d['rank']);
                    })
                    .attr('r', function (d) {
                        return Math.sqrt((vis.bubbleScale(d['n_weeks'])) / Math.PI);
                    })
                    .style('fill','#005B96')
                    .style('stroke-opacity', 0)
                    .style('stroke', 'gray')
                    .style('opacity',  0.7)

            }
        };


        vis.bubbles
            .on('mouseover', function (event, d) {
                    d3.selectAll('.dot')
                        .style('fill', '#B3CDE0')
                        .style("opacity", 0.08)

                    d3.selectAll('.curve').remove()

                    vis.artist_filter = d.artist
                    vis.wrangleData()
                    vis.tooltip
                        .style("opacity", 0.7)
                        .style("left", event.pageX + 20 + "px")
                        .style("top", event.pageY + "px")
                        .html(`
                         <div style="border: thin solid grey; border-radius: 5px; color: whitesmoke ; background: black; padding: 20px";>
                             <h3>${d.song}<h3>
                             <h4> Artist: ${d.artist}</h4>
                             <h4> Average Rank: ${d.rank}</h4>
                             <h4> Number of Weeks: ${d.n_weeks}</h4>
                             <h4> Year: ${d.year}</h4>
                         </div>`)
            })
            .on('mouseout', function (event, d) {
                // d3.selectAll('.dot')
                //     .style('fill', '#B3CDE0')
                //     .style("opacity", 0.1)
                // d3.selectAll('.curve').remove()
                //
                // // Go back to original Dolly Parton view
                // vis.artist_filter = "Dolly Parton"
                // vis.wrangleData()
                vis.tooltip
                    .style("opacity", 0)
                    .style("left", 0)
                    .style("top", 0)
                    .html(``);
            });

    }

    /*
     * Filter data when the user changes the selection
     * Example for brushRegion: 07/16/2016 to 07/28/2016
     */

    selectionChanged(brushRegion) {
        let vis = this;

        // Filter data accordingly without changing the original data
        // * TO-DO *
        // vis.displayData = vis.data.filter(d => d.survey >= selectionDomain[0] && d.survey <= selectionDomain[1]);

        // Update the visualization
        vis.wrangleData();
    }

}