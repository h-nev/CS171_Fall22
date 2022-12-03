class BarGraph {
    constructor(parentElement, data) {
        this.parentElement = parentElement;
        this.data = data;

        this.initVis();
    }

    initVis() {
        let vis = this;

        vis.margin = {top: 20, right: 20, bottom: 60, left: 60};
        vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width - vis.margin.left - vis.margin.right;
        vis.height = document.getElementById(vis.parentElement).getBoundingClientRect().height - vis.margin.top - vis.margin.bottom;

        // Drawing area
        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append('g')
            .attr('transform', `translate (${vis.margin.left}, ${vis.margin.top})`);

        // Scales
        vis.x = d3.scaleBand()
            .rangeRound([vis.width, 0])
            .paddingInner(0.2);
        vis.y = d3.scaleLinear()
            .rangeRound([vis.height, 0]);
        vis.xAxis = d3.axisBottom()
            .scale(vis.x);
        vis.yAxis = d3.axisLeft()
            .scale(vis.y);
        vis.xAxisGroup = vis.svg.append("g")
            .attr("class", "x-axis axis")
            .attr("transform", `translate(0, ${vis.height})`);
        vis.yAxisGroup = vis.svg.append("g")
            .attr("class", "y-axis axis");

        // X-axis label
        vis.svg.append("text")
            .attr("class", "x-axis-label")
            .attr("x", vis.width / 2)
            .attr("y", vis.height + 30)
            .text("Year");

        // Y-axis label
        vis.svg.append("g")
            .attr("transform", `translate(-40, ${vis.height / 2})`)
            .append("text")
            .attr("class", "y-axis-label")
            .text("Annual total expense ($ millions)");
        vis.wrangleData();
    }

    wrangleData() {
        let vis = this;

        vis.displayData = vis.data.map(d => ({year: d.Year, value: +d.TotalSpent/1000000}));
        vis.displayData.sort((a, b) => (b.year - a.year));

        vis.updateVis()
    }

    updateVis() {
        let vis = this;

        vis.x.domain(vis.displayData.map(d => d.year));
        vis.y.domain([0, d3.max(vis.displayData, d => d.value)]);

        let bars = vis.svg.selectAll(".bar")
            .data(vis.displayData);
        bars.enter()
            .append("rect")
            .attr("class", "bar")
            .attr("x", d => vis.x(d.year))
            .attr("y", d => vis.y(d.value))
            .attr("width", vis.x.bandwidth())
            .attr("height", d => (vis.y(0) - vis.y(d.value)));
        bars.exit().remove();

        vis.xAxisGroup.call(vis.xAxis);
        vis.yAxisGroup.call(vis.yAxis);
    }
}
