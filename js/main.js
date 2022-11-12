// Read in the data
// let mainData = d3.csv()
let placeHolder = [1,2,3];

// Instantiate the visualizations
let countryBubbles = new BeeSwarm('vis-1', placeHolder);
let fancyTimeSeries = new TimeSeries('vis-2', placeHolder);
let charityBubbles = new Charity('vis-3', placeHolder);

// Helper functions (parsers, agnostic data cleaning tools)