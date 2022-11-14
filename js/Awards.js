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

        vis.initVis();

    }

    initVis(){
        // Initialize all static elements : scales, svg dimensions, margin conventions, ect.
        let vis = this

        vis.margin = {top: 40, right: 60, bottom: 40, left: 60};

        vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width - vis.margin.left - vis.margin.right;
        vis.height = document.getElementById(vis.parentElement).getBoundingClientRect().height - vis.margin.top - vis.margin.bottom;

        // SVG drawing area
        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append("g")
            .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

    }

    wrangleData(){
        // Process the data by dynamic attributes only

    }

    updateVis(){
        // Change visuals based on dynamic attributes handled in wrangleData

    }

}