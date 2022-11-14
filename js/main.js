// Read in the data
// let mainData = d3.csv()
let placeHolder = [1,2,3];

let promises = [
    d3.csv("data/billboard-top100-filtered.csv"),
    d3.csv("data/dolly-parton-released-songs.csv"),
];

Promise.all(promises)
    .then(function (data) {
        initMainPage(data)
    })
    .catch(function (err) {
        console.log(err)
    });

function initMainPage(dataArray) {
    // Instantiate the visualizations
    countryBubbles_a = new BubbleVis('vis-1a', dataArray[0], []);
    countryBubbles_b = new BubbleVis('vis-1b', dataArray[0], dataArray[1]);
    fancyTimeSeries = new TimeSeries('vis-2', placeHolder);
    charityBubbles = new Charity('vis-3', placeHolder);
}




// Helper functions (parsers, agnostic data cleaning tools)