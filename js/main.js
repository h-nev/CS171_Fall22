// Read in the data
// let mainData = d3.csv()
let placeHolder = [1,2,3];
let dateFormatter = d3.timeFormat("%Y-%m-%d");
let dateParser = d3.timeParse("%Y-%m-%d");

//Initialize current select box values
let awardSelection = "All";

let promises = [
    d3.csv("data/billboard-top100-filtered.csv"),
    d3.csv("data/dolly-parton-released-songs.csv"),
    d3.csv("data/charts_wrangled.csv"),
    d3.csv("data/dolly-wiki-awards.csv"),
    d3.csv("data/DollyPartonSongs_cleaned.csv"),
    d3.json("data/tennessee-county-1960.topojson"),
    d3.csv("data/TN_poverty_rates_by_county_1960-2020.csv"),
    d3.csv("data/dolly-charity.csv"),
    d3.csv("data/spotify_artist_data.csv"),
    d3.csv("data/imagination-library.csv")
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

    // Spotify Stats with fun path icons
    spotifyStats = new StreamStats('metric1', 'leadstreams', 'leadrecord', dataArray[8], 'Lead Streams')
    spotifyStats = new StreamStats('metric2', 'feats', 'featsrecord', dataArray[8], 'Feats')
    spotifyStats = new StreamStats('metric3', 'tracks', 'tracksrecord', dataArray[8], 'Tracks')
    spotifyStats = new StreamStats('metric4', 'onemill', 'onemillrecord', dataArray[8], '100 Million')
    // Instantiate the visualizations
    countryBubbles_a = new BubbleVis('vis-1a', dataArray[0], dataArray[1]);
    
    experiment1 = new MiniDendro('vis-radial-1960s', [1960, 1970], dataArray[4]);
    experiment2 = new MiniDendro('vis-radial-1970s', [1970, 1980], dataArray[4]);
    experiment3 = new MiniDendro('vis-radial-1980s', [1980, 1990], dataArray[4]);
    experiment4 = new MiniDendro('vis-radial-1990s', [1990, 2000], dataArray[4]);
    experiment5 = new MiniDendro('vis-radial-2000s', [2000, 2010], dataArray[4]);
    experiment6 = new MiniDendro('vis-radial-2010s', [2010, 2030], dataArray[4]);


    fancyTimeSeries = new TimeSeries('vis-2', chartsData);
    awardsWon = new Awards('vis-3', 'vis-3-legend', dataArray[3]);

    charityBubbles = new CharityVis('vis-4', dataArray[5], dataArray[6], dataArray[7]);

    new MostVisibleTracker(
        [
            document.getElementById("bubble-first-text"),
            document.getElementById("bubble-second-text")
        ],
        function(elementId) {
            countryBubbles_a.showLinked = (elementId == "bubble-second-text");
            countryBubbles_a.updateVis();
        });

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

    new LeftBarHider(
        [
            document.getElementById("module-1a"),
            document.getElementById("module-2"),
            document.getElementById("vis-3")
        ],
        function(opacity) {
            if (opacity <= 0) {
                document.getElementById("left-menu").style.display = "none";
            } else {
                document.getElementById("left-menu").style.display = "flex";
                document.getElementById("left-menu").style.opacity = opacity;
            }
        });

    libraryGraph = new BarGraph('vis-5', dataArray[9]);
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

class LeftBarHider {
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
        console.log(thresholds);
        return thresholds;
      }

    visibilityChanged(entries) {
        let tracker = this;

        entries.forEach(function(entry) {
            let visibleArea = entry.intersectionRect.height * entry.intersectionRect.width;
            let rootArea = entry.rootBounds.height * entry.rootBounds.width;
            let elementArea = entry.boundingClientRect.height * entry.boundingClientRect.width;
            tracker.elementAreas.set(entry.target.id, visibleArea / Math.min(rootArea, elementArea));
        });

        let maxVisibleRatio = d3.max(tracker.elementAreas.values());
        let opacity = Math.min(1, Math.max(0, 3 - 4 * maxVisibleRatio));
        tracker.callback(opacity);
    }
}

let selectedCategory =  document.getElementById('vis-2-selector').value;

function categoryChange() {
    selectedCategory =  document.getElementById('vis-2-selector').value;
    fancyTimeSeries.selectorChange();

}

/* for fade-in on scroll animation */
/* from https://codepen.io/bstonedev/pen/MWWZgKz */
let elementsArray = document.querySelectorAll(".fader2, .fader3, .fader4, .fader6, .fader8");
console.log(Array.isArray(elementsArray));

console.log(elementsArray);
window.addEventListener('scroll', fadeIn ); 
function fadeIn() {
    for (var i = 0; i < elementsArray.length; i++) {
        var elem = elementsArray[i]
        var distInView = elem.getBoundingClientRect().top - window.innerHeight + 20;
        if (distInView < 0) {
            elem.classList.add("inView");
        } else {
            elem.classList.remove("inView");
        }
    }

}
fadeIn();
