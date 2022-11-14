// Read in the data
// let mainData = d3.csv()
let placeHolder = [1,2,3];
let dateFormatter = d3.timeFormat("%Y-%m-%d");
let dateParser = d3.timeParse("%Y-%m-%d");

let promises = [
    d3.csv("data/billboard-top100-filtered.csv"),
    d3.csv("data/dolly-parton-released-songs.csv"),
    d3.csv("data/charts_wrangled.csv"),
];

Promise.all(promises)
    .then(function (data) {
        initMainPage(data)
    })
    .catch(function (err) {
        console.log(err)
    });

function initMainPage(dataArray) {
    let chartsData = dataArray[2];
    chartsData = chartsData.map(function (d) {
        return {
            song: d.song,
            artist: d.artist,
            rank: +d.rank_w_mean,
            year: +d.year,
            n_weeks: +d.n_weeks,
            date_short: dateParser(d.date_short)
        };
    });
    // Instantiate the visualizations
    countryBubbles_a = new BubbleVis('vis-1a', dataArray[0], []);
    countryBubbles_b = new BubbleVis('vis-1b', dataArray[0], dataArray[1]);
    fancyTimeSeries = new TimeSeries('vis-2', chartsData);
    charityBubbles = new Charity('vis-3', placeHolder);
}




// Helper functions (parsers, agnostic data cleaning tools)