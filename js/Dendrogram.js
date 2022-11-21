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

        // Rollup to count number of times collaborated by person and cast to dictionary, set that as the children for hierarchy purposes
        vis.displayData = {
            name: 'Dolly Parton',
            children: Array.from(d3.rollup(vis.baseData, d => d.length, d => d.Connection), ([name, value]) => ({name, value}))};

        console.log(vis.displayData)

    
        vis.updateVis();
    }

    updateVis(){
        let vis = this;

        vis.dendro = d3.tree()
            .size([vis.height, vis.width]);
            
        let nodes = d3.hierarchy(vis.displayData, d => d.children);
        nodes = vis.dendro(nodes);

        console.log(nodes)

        vis.node = vis.svg.selectAll('.node')
            .data(nodes.descendants())
            .enter()
            .append('g')
            .attr('class', d => 'node' + (d.children ? ' node--internal' : ' node--leaf'))
            .attr('transform', d => `translate(${d.y}, ${d.x})`);

        vis.edge = vis.svg.selectAll('.edge')
            .data(nodes.descendants().slice(1))
            .enter()
            .append('g')
            .attr('stroke', '#ffffff')
            .attr('stroke-width', d => d.value)
            .attr('d', d => {
                return "M" + d.y + "," + d.x
                + "C" + (d.y + d.parent.y) / 2 + "," + d.x
                + " " + (d.y + d.parent.y) / 2 + "," + d.parent.x
                + " " + d.parent.y + "," + d.parent.x;
            });

        vis.node.append('circle')
           .attr('r', 20)
           .attr('stroke', 'black')
           .attr('fill', '#ffffff');
           
        vis.node.append('text')
            .attr('dy', '.35em')
            .attr("x", d => d.children ? (d.data.value + 5) * -1 :
               d.data.value + 5)
            .attr("y", d => d.children && d.depth !== 0 ?
               -(d.data.value + 5) : d)
            .style("text-anchor", d => d.children ? "end" : "start")
            .text(d => d.data.name);


    }

}
