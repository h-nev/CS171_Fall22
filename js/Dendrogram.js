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
        vis.margin = {top: 10, left: 10, bottom: 10, right: 10};

        // Most computers have a "dock" which is not accounted for in innerHeight
        vis.height = window.innerHeight - vis.margin.bottom - vis.margin.top;
        vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width - vis.margin.left - vis.margin.right;
        vis.radius = vis.height / 2; 

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
            .append('g')
            .attr('transform', `translate (${vis.radius}, ${vis.radius})`);

            vis.wrangleData();

    }

    wrangleData(){
        let vis = this;

        let children = Array.from(d3.rollup(vis.baseData, d => d.length, d => d.Connection), ([name, value]) => ({name, value}))

        let occasional = children.filter(d => {
            return d.value <= 1

        })

        // console.log(occasional)

        // Rollup to count number of times collaborated by person and cast to dictionary, set that as the children for hierarchy purposes
        vis.displayData = {
            name: 'Dolly Parton',
            children: occasional};

        console.log(vis.displayData)

    
        vis.updateVis();
    }

    updateVis(){
        let vis = this;

        vis.cluster = d3.cluster()
            .size([345, vis.radius/1.15])

          // Give the data to this cluster layout:
        vis.root = d3.hierarchy(vis.displayData, d => d.children);

        console.log(vis.root)
        
        vis.cluster(vis.root);

        // Features of the links between nodes
        vis.linksGenerator = d3.linkRadial()
            .angle(d => d.x / 180 * Math.PI)
            .radius(d => d.y);

        // Add the links between nodes:
        vis.svg.selectAll('path')
            .data(vis.root.links())
            .join('path')
            .attr("d", vis.linksGenerator)
            .attr("fill", 'none')
            .attr("stroke", '#ffffff')

         // Add a circle for each node.
        vis.svg.selectAll("g")
            .data(vis.root.descendants())
            .join("g")
            .attr("transform", d => `rotate(${d.x-90}) translate(${d.y})`)
            .append("circle")
                .attr("r", 5)
                .attr("fill", "#ffffff")
                .attr("stroke", "black")
                .style("stroke-width", 1);
        

    }

}
