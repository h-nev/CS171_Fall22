// Create a mini-svg somewhere else with rectangles / circles / shape
// CAN EASILY BE TRANSLATED INTO A FUNCTION WITHIN SPECIFIC VIS CLASS TO DO THE SAME BEHAVIOR

// Labels: (list) labels associated with the colors, initialized in actual vis class, call a main function which calls the creation of a new legend object
// Colors: (list) parallel list of colors, initialized in actual vis class, class a main function which calls the creation of a new legend

class Legend{

    constructor(parentElement, labels, colors){
        this.parentElement = parentElement
        this.labels = labels
        this.colors = colors

        this.build();

    }

    build(){
        let legend = this
        
        legend.svg = d3.select('#' + legend.parentElement)
            .append('svg')
            .attr('width', document.getElementById(legend.parentElement).getBoundingClientRect().width)
            .attr('height', 50)

        // legend.margin = {padding: 200, top: 20};

        // let rects = legend.svg.selectAll('.rect')
        //     .data(legend.colors)
        //     .enter()
        //     .append('rect')
        //     .attr('x', (d, i) => legend.margin.padding * i)
        //     .attr('y', legend.margin.top /4)
        //     .attr('height', 20)
        //     .attr('width', 20)
        //     .attr('fill', d => d);

        // let labels = legend.svg.selectAll('.classes')
        //     .data(legend.labels)
        //     .enter()
        //     .append('text')
        //     .attr('class', 'classes')
        //     .text(d => d);
        
        // labels.attr('transform', (d, i) => `translate(${(i * legend.margin.padding) + 30}, ${legend.margin.top})`);

    }

}