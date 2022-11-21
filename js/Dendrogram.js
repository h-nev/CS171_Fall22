// Creates a special radial dendrogram (tree-style network graph)
// Inspo from The History of Space Flight by The Space Monkeys 
// Credits to Mike Bostock's Tidy Tree vs. Dendrogam example: https://bl.ocks.org/mbostock/e9ba78a2c1070980d1b530800ce7fa2b

class Dendrogram{

    constructor(parentElement, legendElement, baseData){
        this.parentElement = parentElement;
        this.legendElement = legendElement;
        this.baseData = baseData;
        this.displayData = [];

        this.initVis();
    }
    
    calculate(){
        let vis = this;
        
        // Expect external legend and title, but possible bottom axis
        vis.margin = {top: 10, left: 10, bottom: 20, right: 10, scale: 0.5};

        // Most computers have a "dock" which is not accounted for in innerHeight
        vis.height = window.innerHeight - 100;
        vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width - vis.margin.left - vis.margin.right;

        // Keep transition duration the same for all elements
        vis.duration = 800;

    }

    initVis(){
        let vis = this;

        console.log(vis.baseData)

        // Outsource all the math for proper sizing
        vis.calculate();

        // Create the svg
        vis.svg = d3.select('#' + vis.parentElement)
            .append('svg')
            .attr('width', vis.width)
            .attr('height', vis.height)
            .attr('transform', `translate (${vis.margin.left}, ${vis.margin.top})`);

            vis.wrangleData();

    }

    wrangleData(){
        let vis = this;

        vis.updateVis();
    }

    updateVis(){
        let vis = this;

    }

}
