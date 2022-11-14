// Contains js to create the awards matrix

// Custom paths: award outline
// Linked to: TimeLine initialization via EventHandler
// Behavior: 
//      Matrix contains a square (ish) matrix of all of Dolly's awards filled in with grey
//      Outline will fill in with gold to represent the number of awards Dolly earned for the selected (on hover) song
//      IF NOT ANNOYING TO THE EYE: fill can correspond to the type of award

class Awards{

    constructor(parentElement, baseData){
        this.parentElement = parentElement;
        this.baseData = baseData;
        this.displayData = baseData;

        this.initVis();

    }

    initVis(){
        // Initialize all static elements : scales, svg dimensions, margin conventions, ect.
        let vis = this

        // Expecting to outsource the legend, only need space for axes
        vis.margin = {top: 10, bottom: 20, left: 20, right: 10};
        // (height) - 75 helps avoid the task bar on a computer; (width) - 100 keeps things a bit more square
        vis.height = window.innerHeight - vis.margin.top - vis.margin.bottom - 75;
        vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width - vis.margin.left - vis.margin.right - 100;

        vis.svg = d3.select('#' + vis.parentElement)
            .append('svg')
            .attr('width', vis.width)
            .attr('height', vis.height)
            .attr('transform', `translate (${vis.margin.left}, ${vis.margin.top})`);

    }

    wrangleData(){
        // Process the data by dynamic attributes only

    }

    updateVis(){
        // Change visuals based on dynamic attributes handled in wrangleData

    }

}