
class StreamStats{

    constructor(widthElement, parentElement, svgElement, baseData, metricName){
        this.parentElement = parentElement;
        this.widthElement = widthElement;
        this.svgElement = svgElement;
        this.baseData = baseData;
        this.metricName = metricName;

        this.initVis();

    }

    initVis(){
        let vis = this;

        vis.width = document.getElementById(vis.widthElement).getBoundingClientRect().width;
        vis.height = vis.width;

        vis.svg = d3.select(`#${vis.svgElement}`)
            .append('svg')
            .attr('width', vis.width)
            .attr('height', vis.height);

        vis.number = vis.baseData[0][vis.metricName]

        vis.icon = vis.svg.selectAll('.record')
            .data(vis.baseData)
            .enter()
            .append('path')
            .attr('class', 'record')
            .attr('d', "M 243.75 487.5 c 134.621 0 243.75 -109.132 243.75 -243.75 S 378.371 0 243.75 0 S 0 109.132 0 243.75 S 109.129 487.5 243.75 487.5 Z M 315.176 41.217 c 35.884 12.653 67.396 34.574 91.661 62.89 l -89.763 91.688 c -8.848 -13.498 -21.32 -24.405 -36.034 -31.336 L 315.176 41.217 Z M 280.023 31.279 l -10.271 127.9 c -4.744 -1.446 -9.598 -2.487 -14.497 -3.114 L 238.581 28.324 C 252.46 27.973 266.344 28.964 280.023 31.279 Z M 243.75 203.579 c 22.186 0 40.171 17.985 40.171 40.171 c 0 22.186 -17.985 40.171 -40.171 40.171 c -22.186 0 -40.171 -17.985 -40.171 -40.171 C 203.579 221.564 221.564 203.579 243.75 203.579 Z M 188.425 311.702 c 12.621 10.263 27.854 16.778 43.851 18.909 l -43.769 120.613 c -36.029 -9.609 -69.435 -28.52 -96.381 -55.384 L 188.425 311.702 Z")
            .attr('transform', `translate(${vis.width / 8}, ${vis.height /3}) scale(0.3, 0.3)`)
    
        vis.amount = d3.select(`#${vis.parentElement}`)
            .append('h2')
            .attr('class', 'numeric title')
            .text(vis.number);

    }

}