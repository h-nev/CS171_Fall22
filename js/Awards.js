// Contains js to create the awards matrix

// Custom paths: award outline
// Linked to: TimeLine initialization via EventHandler
// Behavior: 
//      Matrix contains a square (ish) matrix of all of Dolly's awards filled in with grey
//      Outline will fill in with gold to represent the number of awards Dolly earned for the selected (on hover) song
//      IF NOT ANNOYING TO THE EYE: fill can correspond to the type of award

class Awards{

    constructor(parentElement, legendElement, baseData){
        this.parentElement = parentElement;
        this.legendElement = legendElement;

        this.baseData = baseData;
        this.displayData = [];

        this.initVis();

    }

    initVis(){
        // Initialize all static elements : scales, svg dimensions, margin conventions, ect.
        let vis = this

        // Outsource all the math for svg stuff
        vis.calculate();

        // Outsource the displayData initialization (changing types and names)
        vis.preProcess();

        // Create the svg
        vis.svg = d3.select('#' + vis.parentElement)
            .append('svg')
            .attr('width', vis.width)
            .attr('height', vis.height)
            .attr('transform', `translate (${vis.margin.left}, ${vis.margin.top})`);

        vis.isotype = vis.svg.selectAll('.isotype')
            .data(vis.baseData)
            .enter()
            .append('path')
            .attr('class', 'isotype')
            .attr('d', "M 148.706 206.124 H 57.418 c -1.104 0 -2 -0.896 -2 -2 v -30.207 c 0 -1.104 0.896 -2 2 -2 h 14.966 l 1.929 -16.329 c 0.119 -1.007 0.973 -1.766 1.986 -1.766 H 88.04 l 4.775 -42.833 l -18.695 9.83 c -3.247 1.706 -7.108 1.43 -10.078 -0.729 c -2.969 -2.156 -4.428 -5.743 -3.808 -9.359 l 5.033 -29.341 c 0.311 -1.807 -0.289 -3.65 -1.603 -4.931 l -7.005 -6.828 c -0.023 -0.021 -0.046 -0.043 -0.067 -0.065 L 42.348 55.681 c -2.627 -2.562 -3.555 -6.321 -2.421 -9.812 c 1.135 -3.489 4.095 -5.984 7.726 -6.512 l 29.459 -4.281 c 1.815 -0.264 3.383 -1.402 4.193 -3.046 L 94.481 5.335 C 96.104 2.044 99.393 0 103.063 0 c 3.669 0 6.957 2.044 8.581 5.335 l 12.425 25.176 c 0.009 0.015 0.016 0.03 0.023 0.046 l 0.727 1.474 c 0.812 1.644 2.379 2.782 4.194 3.046 l 4.753 0.691 c 0.04 0.004 0.08 0.01 0.12 0.017 l 24.587 3.573 c 3.63 0.527 6.59 3.022 7.725 6.512 c 1.134 3.49 0.206 7.25 -2.421 9.812 L 142.459 76.46 c -1.313 1.279 -1.913 3.123 -1.603 4.93 l 5.033 29.341 c 0.62 3.616 -0.839 7.203 -3.808 9.359 c -2.97 2.157 -6.829 2.436 -10.078 0.729 l -18.695 -9.83 l 4.775 42.833 h 11.741 c 1.014 0 1.867 0.759 1.986 1.766 l 1.929 16.329 h 14.966 c 1.104 0 2 0.896 2 2 v 30.207 C 150.706 205.229 149.811 206.124 148.706 206.124 Z M 59.418 202.124 h 87.288 v -26.207 H 59.418 V 202.124 Z M 76.411 171.917 h 53.302 l -1.665 -14.095 H 78.076 L 76.411 171.917 Z M 92.064 153.822 h 21.995 l -5.026 -45.08 l -3.379 -1.776 c -0.353 -0.186 -0.72 -0.33 -1.096 -0.436 c -0.076 -0.015 -0.152 -0.034 -0.229 -0.059 c -1.291 -0.3 -2.662 -0.136 -3.86 0.494 l -3.379 1.776 L 92.064 153.822 Z M 107.586 103.462 l 26.279 13.816 c 1.92 1.011 4.113 0.85 5.865 -0.424 c 1.754 -1.274 2.583 -3.312 2.216 -5.448 l -5.033 -29.341 c -0.532 -3.104 0.497 -6.271 2.753 -8.47 l 21.317 -20.78 c 1.553 -1.513 2.08 -3.647 1.409 -5.71 c -0.67 -2.062 -2.351 -3.478 -4.495 -3.789 l -23.125 -3.36 L 107.586 103.462 Z M 61.317 68.584 l 5.141 5.011 c 2.256 2.2 3.285 5.366 2.753 8.471 l -5.033 29.341 c -0.367 2.137 0.462 4.174 2.216 5.448 c 1.753 1.272 3.945 1.434 5.865 0.424 l 26.35 -13.854 c 1.591 -0.836 3.349 -1.193 5.104 -1.077 l 26.964 -62.987 l -2.239 -0.325 c -2.967 -0.432 -5.55 -2.225 -6.994 -4.832 L 61.317 68.584 Z M 103.063 4 c -2.168 0 -4.035 1.161 -4.994 3.104 L 84.892 33.8 c -1.394 2.825 -4.087 4.782 -7.204 5.235 l -29.46 4.281 c -2.146 0.312 -3.826 1.728 -4.496 3.789 c -0.671 2.063 -0.144 4.197 1.409 5.71 l 13.197 12.865 l 61.322 -35.065 L 108.057 7.104 c -0.001 0 -0.001 0 -0.001 0 C 107.097 5.161 105.229 4 103.063 4 Z M 119.713 195.741 H 86.411 c -1.104 0 -2 -0.896 -2 -2 s 0.896 -2 2 -2 h 33.302 c 1.104 0 2 0.896 2 2 S 120.817 195.741 119.713 195.741 Z M 126.752 186.301 h -47.38 c -1.104 0 -2 -0.896 -2 -2 s 0.896 -2 2 -2 h 47.38 c 1.104 0 2 0.896 2 2 S 127.856 186.301 126.752 186.301 Z");
            
        vis.isotype.attr('transform', (data, i) =>  `translate(${(i % vis.perRow) * (vis.margin.spacing + vis.margin.padding)}, ${Math.floor(i / vis.perRow) * (vis.margin.spacing + vis.margin.padding*3)}) scale(${vis.scaling}, ${vis.scaling})`);

        // Binning like types together for scale domain assignment and filtering later
        vis.all = ['Won', 'Nominated'];
        vis.won = ['Won'];
        vis.nominated = ['Nominated'];
        vis.musicPerformance = ['Solo Performance', 'Collaborative Performance'];
        vis.music = ['Song', 'Album', 'Composition'];
        vis.service = ['Philanthropy', 'Achievement'];
        vis.mediaPerformance = ['Acting', 'Directing', 'Videography'];

        // Matches values from the select box
        vis.typeContainer = {
            'All' : vis.all,
            'Won' : vis.won,
            'Nominated' : vis.nominated,
            'Music Performance' : vis.musicPerformance,
            'Music' : vis.music,
            'Philanthropy' : vis.service,
            'Media Performance' : vis.mediaPerformance
        };

        // Color Scales for the "binned" award types which updates with user selection
        // "All" is purposefully redundant with "Won" and "Nominated" selection color scales
        vis.allScale = d3.scaleOrdinal()
        .domain(vis.all)
        .range(['gold', '#ffffff']);

        vis.wonScale = d3.scaleOrdinal()
            .domain(vis.won)
            .range(['gold'])
            .unknown(['black']);

        vis.nominatedScale = d3.scaleOrdinal()
            .domain(vis.nominated)
            .range(['#ffffff'])
            .unknown(['black']);

        // Current scheme: silvery grey, pale mint green
        vis.musicPerformanceScale = d3.scaleOrdinal()
            .domain(vis.musicPerformance)
            .range(['#bebebe', '#a34453'])
            .unknown('black');

        // Current scheme: blonde yellow, silvery grey, cornflower blue
        vis.musicScale = d3.scaleOrdinal()
                .domain(vis.music)
                .range(['#f4cf66', '#bebebe', '#6495ed'])
                .unknown('black');

        // Current scheme: silvery grey, pale mint green
        vis.serviceScale = d3.scaleOrdinal()
                .domain(vis.service)
                .range(['#bebebe', '#a34453'])
                .unknown('black');
        
        // Current scheme: blonde yellow, silvery grey, cornflower blue
        vis.mediaPerformanceScale = d3.scaleOrdinal()
                .domain(vis.mediaPerformance)
                .range(['#f4cf66', '#bebebe', '#6495ed'])
                .unknown('black');

        // NO AXES REQUIRED FOR THIS ONE

        // Create empty legend svg we overwrite depending on the selection
        vis.legendHeight = 50;

        vis.legend = d3.select('#' + vis.legendElement)
            .append('svg')
            .attr('width', document.getElementById('vis-3-legend').getBoundingClientRect().width)
            .attr('height', vis.legendHeight);

        // Tooltip for hover effects
        vis.tooltip = d3.select("body")
            .append('div')
            .attr('class', "tooltip")
            .attr('id', 'awardsTooltip');

        vis.categoryPlacement = d3.scaleBand()
            .range([0, document.getElementById('vis-3-legend').getBoundingClientRect().width])

        vis.wrangleData();

    }

    calculate(){
        let vis = this;

        // Expecting to outsource the legend, only need space for axes
        vis.margin = {top: 10, bottom: 25, left: 10, right: 25, padding: 4, spacing: 27.5};

        // Path scaling factor (scaling as a square so same for both)
        vis.scaling = 0.175;

        // Keep the transition duration the same for all elements in this vis
        vis.duration = 700

        // Height depends on this variable, must be first
        vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width - vis.margin.left - vis.margin.right;

        vis.perRow = Math.floor(vis.width / (vis.margin.spacing + vis.margin.padding));

        // Depending on the screen, we'll be able to fit more awards in a single row, which reduces how many rows we need
        // See how many can fit in a single row reasonably, then figure out the maximum number of rows we need to fit them all, then the spacing required for each row
        vis.height = Math.ceil(vis.baseData.length / vis.perRow) * (vis.margin.spacing + vis.margin.padding*3)

    }

    preProcess(){
        let vis = this;

        // Change the baseData to have all the right data types, adding xpos and ypos for the hoverRects
        vis.baseData = vis.baseData.map(function (element, i) {
            return {
                award: element['Award'],
                year: +element['Year'],
                category: element['Category'],
                original: element['Original'],
                status: element['Status'],
                title: element['Song / Album / Movie Title'],
                type: element['Type'],
                xpos: (i % vis.perRow) * (vis.margin.spacing + vis.margin.padding) + 5,
                ypos: (Math.floor(i / vis.perRow) * (vis.margin.spacing + vis.margin.padding*3))
            };
        })

        // Ensures that we can revert to base if needed after filtering display a ton
        vis.displayData = vis.baseData

    }

    wrangleData(){
        // Process the data by dynamic attributes only
        let vis = this;
        vis.filterCounts = [0, 0];

        if (awardSelection == 'Music Performance' || awardSelection == 'Music' || awardSelection == 'Philanthropy' || awardSelection == 'Media Performance'){
            // Get the specific types we want to aggregate the won and nominated for
            let curList = vis.typeContainer[awardSelection];
            
            // Aggregate the number of won and nominated for the filtered selection so we can update the text container above the select box
            vis.baseData.forEach(award => {
                if(curList.includes(award.type) && award.status == "Won"){
                    // Increment the won count
                    vis.filterCounts[0] = vis.filterCounts[0] + 1
                }
                else if(curList.includes(award.type) && award.status == "Nominated"){
                    // Increase the nominated count
                    vis.filterCounts[1] = vis.filterCounts[1] + 1 
                }

            });

        }

        else if (awardSelection == 'Won' || awardSelection == 'Nominated' || awardSelection == 'All'){
            // We could hardcode this, but it's better to make it more precise 
            vis.baseData.forEach(award => {
                if (award.status == 'Won'){
                    vis.filterCounts[0] = vis.filterCounts[0] + 1
                }
                else{
                    vis.filterCounts[1] = vis.filterCounts[1] + 1
                }
            })

        }

        // Physically filter the data for the hoverRects
        vis.hoverData = vis.baseData.filter(data => {
            if (awardSelection == 'Music Performance' || awardSelection == 'Music' || awardSelection == 'Philanthropy' || awardSelection == 'Media Performance'){
                return vis.typeContainer[awardSelection].includes(data.type)

            }
            else if (awardSelection != 'All'){
                return data.status == awardSelection

            }
            else{
                return data
            }

        })

        vis.updateVis();

    }

    updateVis(){
        // Change visuals based on dynamic attributes handled in wrangleData
        let vis = this;

        // Since the paths are too complicated for good hovering, append a transparent rectangle on top so we can hover on that
        vis.hoverRects = vis.svg.selectAll('.hoverRects')
            .data(vis.hoverData);

        vis.hoverRects.enter()
            .append('rect')
            .attr('class', 'hoverRects')
            .merge(vis.hoverRects)
            .attr('x', d => d.xpos)
            .attr('y', d => d.ypos)
            .attr('height', 40)
            .attr('width', 25)
            .attr('opacity', 0)
            .on('mouseover', (event, d) => {
                let locY = event.pageY
                let locX = event.pageX
                // Make sure the info doesn't get cut off on the bottom
                if (d.ypos > 355){
                    locY = event.pageY - 220
                }

                vis.tooltip
                    .style("opacity", 0.9)
                    .style("left", locX + 10 + "px")
                    .style("top", locY + "px")
                    .style('font-size', '8px');

                if(d.title != 'General'){
                    vis.tooltip.html(`
                        <div class = "ttip" style="border: thin solid grey; border-radius: 25px; background: #9BB7A1; padding: 10px;  width: 300px">
                        <p> ${d.award}</p>     
                        <p> ${d.year}</p> 
                        <p> ${d.category}</p>  
                        <p> ${d.status}</p>      
                        <p> For: ${d.title}</p>
                        </div>`
                    );

                }
                else{
                    vis.tooltip.html(`
                        <div class = "ttip" style="border: thin solid grey; border-radius: 25px; background: #9BB7A1; padding: 10px;  width: 300px">
                        <p> ${d.award}</p>     
                        <p> ${d.year}</p> 
                        <p> ${d.category}</p>  
                        <p> ${d.status}</p>      
                        </div>`
                    );

                }
    
            })
            .on('mouseout', (event, d) => {
            vis.tooltip
                .style("opacity", 0)
                .style("left", 0)
                .style("top", 0)
                .html(``);
    
            });;

        vis.hoverRects.exit().remove();
        
        // Update the domain with the number of categories we have for all
        vis.categoryPlacement.domain(vis.typeContainer[awardSelection]);
        
        // I know this is sort of unorthodox, but this is the behavior I was imagining
        // Cannot be achieved with the same effect as Enter/Update/Exit, which was attempted
        if (awardSelection == 'All'){
            vis.isotype.transition()
            .duration(vis.duration)
            .attr('fill', d => vis.allScale(d.status));
        }
        else if(awardSelection == 'Won'){
            vis.isotype.transition()
            .duration(vis.duration)
            .attr('fill', d => vis.wonScale(d.status));
        }
        else if(awardSelection == 'Nominated'){
            vis.isotype.transition()
            .duration(vis.duration)
            .attr('fill', d => vis.nominatedScale(d.status));
        }
        else if(awardSelection == 'Music Performance'){
            vis.isotype.transition()
            .duration(vis.duration)
            .attr('fill', d => vis.musicPerformanceScale(d.type))
        }
        else if(awardSelection == 'Music'){
            vis.isotype.transition()
            .duration(vis.duration)
            .attr('fill', d => vis.musicScale(d.type))
        }
        else if(awardSelection == 'Philanthropy'){
            vis.isotype.transition()
            .duration(vis.duration)
            .attr('fill', d => vis.serviceScale(d.type))
        }
        else if(awardSelection == 'Media Performance'){
            vis.isotype.transition()
            .duration(vis.duration)
            .attr('fill', d => vis.mediaPerformanceScale(d.type))
        }

        //Write into the h3s that hold the counts
        d3.select('#won-numeric')
            .text(vis.filterCounts[0]);

        d3.select("#nominated-numeric")
            .text(vis.filterCounts[1]);

        // Call the new legend
        vis.buildLegend();

    }

    buildLegend(){        
        let vis = this

        vis.bars = vis.legend.selectAll(".swatches")
            .data(vis.typeContainer[awardSelection]);

        vis.bars.enter()
            .append('rect')
            .attr('class', 'swatches')
            .merge(vis.bars)
            .attr('x', (d, i) => i * vis.categoryPlacement.bandwidth())
            .attr('y', (vis.legendHeight / 2) - 10)
            .attr('width', 15)
            .attr('height', 15)
            .attr('fill', d =>{
                if (awardSelection == 'All'){
                    return vis.allScale(d);
                }
                else if (awardSelection == 'Won'){
                    return vis.wonScale(d);
                }
                else if (awardSelection == 'Nominated'){
                    return vis.nominatedScale(d);
                }
                else if(awardSelection == 'Music Performance'){
                   return vis.musicPerformanceScale(d);
                }
                else if(awardSelection == 'Music'){
                    return vis.musicScale(d);
                }
                else if(awardSelection == 'Philanthropy'){
                    return vis.serviceScale(d);
                }
                else if(awardSelection == 'Media Performance'){
                    return vis.mediaPerformanceScale(d);
                }
            }).attr('transform', `translate (${vis.margin.left + 10}, 0)`);

        vis.bars.exit().remove();

        vis.labels = vis.legend.selectAll('.labels')
            .data(vis.typeContainer[awardSelection]);

        vis.labels.enter()
            .append('text')
            .attr('class', 'labels title')
            .merge(vis.labels)
            .text(d => d)
            .attr('x', (d, i) => i * vis.categoryPlacement.bandwidth() + 30)
            .attr('y', (vis.legendHeight / 2) + 5)
            .attr('fill', 'white')
            .attr('transform', `translate (${vis.margin.left + 10}, 0)`);

        vis.labels.exit().remove();

    }


}