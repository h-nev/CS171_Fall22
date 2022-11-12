// Plans to hold the innovative time series designed by Isidora
// Please feel free to change anything here, just wanted to make the svg so the basic placeholders are there

class TimeSeries{

    constructor(parentElement, baseData){
        this.parentElement = parentElement
        this.baseData = baseData

        // Copy of the original set we use to overwrite what's being shown
        this.displayData = baseData

        this.initVis();


    }

    initVis(){
        let vis = this;

        // Top large if we want to put a title or legend in the same area
        vis.margin = {top: 50, bottom: 20, left: 20, right: 10};
        // (height) - 75 helps avoid the task bar on a computer; (width) - 100 keeps things a bit more square
        vis.height = window.innerHeight - vis.margin.top - vis.margin.bottom - 75;
        vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width - vis.margin.left - vis.margin.right - 100;

        vis.svg = d3.select('#' + vis.parentElement)
            .append('svg')
            .attr('width', vis.width)
            .attr('height', vis.height)
            .attr('transform', `translate (${vis.margin.left}, ${vis.margin.top})`);

    }

}