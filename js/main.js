// Read in the data
// let mainData = d3.csv()
let placeHolder = [1,2,3];
let dateFormatter = d3.timeFormat("%Y-%m-%d");
let dateParser = d3.timeParse("%Y-%m-%d");

//Initialize current select box values
let awardSelection = document.getElementById('vis-3-select').value;
document.getElementById("vis-3-select").style.display = "none";

let promises = [
    d3.csv("data/billboard-top100-filtered.csv"),
    d3.csv("data/dolly-parton-released-songs.csv"),
    d3.csv("data/charts_wrangled.csv"),
    d3.csv("data/dolly-wiki-awards.csv"),
    d3.csv("data/DollyPartonSongs_cleaned.csv"),
    d3.json("data/tennessee-county-1960.topojson"),
    d3.csv("data/TN_poverty_rates_by_county_1960-2020.csv"),
    d3.csv("data/dolly-charity.csv")
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
    countryBubbles_a = new BubbleVis('vis-1a', dataArray[0], dataArray[1]);
    // radialDendrogram = new Dendrogram('vis-1ac', 'vis-1bc', 'vis-1c-legend', dataArray[4]);
    // radialDendrogram2 = new Dendrogram2('vis-radial2', 'vis-radial2-sup', dataArray[4]);

    experiment1 = new MiniDendro('vis-radial-1960s', [1960, 1970], dataArray[4]);
    experiment2 = new MiniDendro('vis-radial-1970s', [1970, 1980], dataArray[4]);
    experiment3 = new MiniDendro('vis-radial-1980s', [1980, 1990], dataArray[4]);
    experiment4 = new MiniDendro('vis-radial-1990s', [1990, 2000], dataArray[4]);
    experiment5 = new MiniDendro('vis-radial-2000s', [2000, 2010], dataArray[4]);
    experiment6 = new MiniDendro('vis-radial-2010s', [2010, 2030], dataArray[4]);


    fancyTimeSeries = new TimeSeries('vis-2', chartsData);
    awardsWon = new Awards('vis-3', 'vis-3-legend', dataArray[3]);

    charityBubbles = new CharityVis('vis-4', dataArray[5], dataArray[6], dataArray[7]);

    let bubbleTextObserver = new IntersectionObserver(function(entries) {
        countryBubbles_a.showLinked = entries[0].intersectionRatio >= 0.10;
        countryBubbles_a.updateVis();
    }, {threshold: [0.10]});
    bubbleTextObserver.observe(document.getElementById("bubble-second-text"));

    new MostVisibleTracker(
        [
            document.getElementById("selectorAll"),
            document.getElementById("selectorWon"),
            document.getElementById("selectorNominated"),
            document.getElementById("selectorMusicPerformance"),
            document.getElementById("selectorMusic"),
            document.getElementById("selectorPhilanthropy"),
            document.getElementById("selectorMediaPerformance")
        ],
        function(elementId) {
            let selectorMap = {
                selectorAll: "All",
                selectorWon: "Won",
                selectorNominated: "Nominated",
                selectorMusicPerformance: "Music Performance",
                selectorMusic: "Music",
                selectorPhilanthropy: "Philanthropy",
                selectorMediaPerformance: "Media Performance"};

            awardSelection = selectorMap[elementId];
            awardsWon.wrangleData();
        });
}

class MostVisibleTracker {
    constructor(elements, callback) {
        let tracker = this;

        tracker.callback = callback;

        tracker.elementAreas = new Map();
        elements.forEach(function(element) { tracker.elementAreas.set(element.id, 0); });
        tracker.mostVisibleElementId = elements[0].id;

        tracker.observer = new IntersectionObserver(function(entries) {
            tracker.visibilityChanged(entries);
        }, { threshold: tracker.buildThresholdList() });
        elements.forEach(function(element) { tracker.observer.observe(element); });
    }

    buildThresholdList() {
        let thresholds = [];
        let numSteps = 20;

        for (let i = 1.0; i <= numSteps; i++) {
          let ratio = i/numSteps;
          thresholds.push(ratio);
        }

        thresholds.push(0);
        return thresholds;
      }

    visibilityChanged(entries) {
        let tracker = this;

        entries.forEach(function(entry) {
            let visibleArea = entry.intersectionRect.height * entry.intersectionRect.width;
            tracker.elementAreas.set(entry.target.id, visibleArea);
        });

        let newMostVisibleElementId = tracker.mostVisibleElementId;
        let mostVisibleArea = tracker.elementAreas.get(newMostVisibleElementId);
        tracker.elementAreas.forEach(function(elementVisibleArea, elementId) {
            if (elementVisibleArea > mostVisibleArea) {
                newMostVisibleElementId = elementId;
            }
        });
        if (newMostVisibleElementId != tracker.mostVisibleElementId) {
            tracker.mostVisibleElementId = newMostVisibleElementId;
            tracker.callback(tracker.mostVisibleElementId);
        }
    }
}

let selectedCategory =  document.getElementById('vis-2-selector').value;

function categoryChange() {
    selectedCategory =  document.getElementById('vis-2-selector').value;
    fancyTimeSeries.selectorChange();

}

// function awardsFilter(){
//     awardSelection = document.getElementById('vis-3-select').value;
//     awardsWon.wrangleData();

// }
