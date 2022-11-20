// Read in the data
// let mainData = d3.csv()
let placeHolder = [1,2,3];
let dateFormatter = d3.timeFormat("%Y-%m-%d");
let dateParser = d3.timeParse("%Y-%m-%d");

//Initialize current select box values
let awardSelection = document.getElementById('vis-3-select').value;

let promises = [
    d3.csv("data/billboard-top100-filtered.csv"),
    d3.csv("data/dolly-parton-released-songs.csv"),
    d3.csv("data/charts_wrangled.csv"),
    d3.csv("data/dolly-wiki-awards.csv")
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
            month: +d.month,
            n_weeks: +d.n_weeks,
            dolly_parton: +d.dolly_parton,
            date_short: dateParser(d.date_short)
        };
    });

    // Instantiate the visualizations
    countryBubbles_a = new BubbleVis('vis-1a', dataArray[0], []);
    countryBubbles_b = new BubbleVis('vis-1b', dataArray[0], dataArray[1]);
    fancyTimeSeries = new TimeSeries('vis-2', chartsData);
    awardsWon = new Awards('vis-3', dataArray[3]);
    charityBubbles = new Charity('vis-4', placeHolder);
}

let selectedCategory =  document.getElementById('vis-2-selector').value;

function categoryChange() {
    selectedCategory =  document.getElementById('vis-2-selector').value;
    fancyTimeSeries.selectorChange();

}

function awardsFilter(){
    awardSelection = document.getElementById('vis-3-select').value;
    awardsWon.wrangleData();

}

const delay = async (ms = 1000) => new Promise(resolve => setTimeout(resolve, ms));