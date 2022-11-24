// Creates a special radial dendrogram (tree-style network graph)
// Inspo from The History of Space Flight by The Space Monkeys 
// Credits to Mike Bostock's Tidy Tree vs. Dendrogam example: https://bl.ocks.org/mbostock/e9ba78a2c1070980d1b530800ce7fa2b

class Dendrogram2{

    constructor(parentElement, parent2, baseData){
        this.parentElement = parentElement;
        this.parent2 = parent2;
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
        vis.radius = vis.width / 1.88; 

        // Keep transition duration the same for all elements
        vis.duration = 800;

    }

    initVis(){
        let vis = this;

        // Outsource all the math for proper sizing
        vis.calculate();

        // Create the svg
        vis.svg = d3.select('#' + vis.parentElement)
            .append('svg')
            .attr('width', vis.width)
            .attr('height', vis.height)
            .append('g')
            .attr('transform', `translate (${vis.radius}, ${vis.radius})`);

        // Viridis color scale for number of times worked with dolly parton


        // Append a tooltip to the div so we can use hover effects
        // vis.tooltip = d3.select(`#${vis.parent2}`)
        //     .append('div')
        //     .attr('class', "tooltip")
        //     .attr('id', 'singleRadialDendro');


        vis.wrangleData();

    }

    wrangleData(){
        let vis = this;

        // Get the unique collaborators and how many times they collaborated with her
        let children = Array.from(d3.rollup(vis.baseData, d => d.length, d => d.Connection), ([name, value]) => ({name, value}))

        // Get the names of only the multi-timers
        vis.multi = []
        children.forEach(entry => {
            if(entry.value > 1){
                vis.multi.push(entry.name)
            }

        })

        // Figure out how many unique years we have (don't really need value)
        let years = Array.from(d3.rollup(vis.baseData, d => d.length, d => d.Year), ([name, value]) => ({name, value}))
            .sort(function(a, b){
                return a.name - b.name;
            });

        // For each of the years we found, use the base data to find all the artists that are associated there
        years.forEach(year => {
            let yearChild = vis.baseData.filter(d => {
                return d.Year == year.name
            })

            // We have them connected to year, now re-rollup 
            let temp =  Array.from(d3.rollup(yearChild, d => d.length, d => d.Connection), ([name]) => ({name}))
            let filtered = temp.filter(d => {
                return vis.multi.includes(d.name);

            });

           // Put that in the children of this year
            year['children'] = filtered;
        })

        // Get rid of all the years where there was not an artist that collabed only once
        vis.years = years.filter(d => {
            return d.children.length > 0;
        });

        // Rollup to count number of times collaborated by person and cast to dictionary, set that as the children for hierarchy purposes
        vis.displayData = {
            name: 'Dolly Parton',
            children: vis.years};
    
        vis.updateVis();
    }

    updateVis(){
        let vis = this;

        vis.cluster = d3.cluster()
            .size([360, vis.radius/1.15])

          // Give the data to this cluster layout:
        vis.root = d3.hierarchy(vis.displayData, d => d.children);
        
        vis.cluster(vis.root);

        // Features of the links between nodes
        vis.linksGenerator = d3.linkRadial()
            .angle(d => d.x / 180 * Math.PI)
            .radius(d => d.y - 3);

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
            .attr("r", d => {
                if (d.height == 2){
                    return 15
                }
                else{
                    return 5
                }

            })
            .attr("fill", d => {
                if (d.height == 2){
                    return '#FFFD73'
                }
                else if (d.height == 1){
                    return '#ffffff'
                }
                else if (d.height == 0){
                    return '#6495ed'
                }
            })
            .attr("stroke", "black")
            .attr("stroke-width", 1)
            .attr('opacity', d => {
                if (d.height == 0){
                    return 0.75
                }
                else{
                    return 1
                }
            })
            .on('mouseover', (event, d) => {
                console.log(d.parent.data.name)
                

                // vis.tooltip.attr("opacity", 1)
                //     .html(`
                //         <div style="border: thin solid grey; border-radius: 5px; background: grey; padding: 10px">
                //         <h4> ${d.data.name}</h4>
                //         <h4> ${d.parent.data.name}</h4>              
                //         </div>`
                //     );

        });
        
    }

}
