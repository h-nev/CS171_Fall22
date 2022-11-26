class BubbleVis {
    constructor(parentElement, billboardData, dollyPartonSongs) {
        this.parentElement = parentElement;
        this.billboardData = billboardData;
        this.dollyPartonSongs = dollyPartonSongs;

        this.initVis()
    }

    initVis() {
        let vis = this;

        vis.margin = {top: 20, right: 20, bottom: 20, left: 20};
        vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width - vis.margin.left - vis.margin.right;
        vis.height = document.getElementById(vis.parentElement).getBoundingClientRect().height - vis.margin.top - vis.margin.bottom;

        // Drawing area
        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append('g')
            .attr('transform', `translate (${vis.margin.left}, ${vis.margin.top})`);

        vis.showLinked = false;

        vis.wrangleData();
    }

    wrangleData() {
        let vis = this;

        // Determine the list of artists who have worked with Dolly Parton.
        vis.collabArtists = new Set();
        vis.dollyPartonSongs.forEach(function(song) {
            song.Artists.split(";").forEach(function(artist) {
                vis.collabArtists.add(artist);
            });
            song.Writers.split(";").forEach(function(artist) {
                vis.collabArtists.add(artist);
            });
        });


        // Build up an aggregate score for each artist involved with each billboard song.
        let artists = new Map();
        vis.billboardData.forEach(function(song) {
            song.ArtistList.split(";").forEach(function(artist) {
                if (!artists.has(artist)) {
                    artists.set(artist, {"artist": artist, "totalWeeks": 0, "totalSongs": 0, "totalRankScore": 0});
                }
                // The billboard is top-100, so rank score is 101 - billboard_rank.
                let artistData = artists.get(artist);
                artistData.totalWeeks += parseInt(song.WeeksOnBoard);
                artistData.totalSongs += 1;
                artistData.totalRankScore += 101 - parseInt(song.PeakRank) + parseInt(song.WeeksOnBoard);
            });
        });

        // Only take the top 50 artists.
        let sortedArtists = Array.from(artists.values());
        sortedArtists.sort(function(a, b) {
            if (a.totalRankScore == b.totalRankScore) {
                if (a.artist < b.artist) {
                    return -1;
                }
                if (a.artist > b.artist) {
                    return 1;
                }
            }
            return b.totalRankScore - a.totalRankScore;
        });
        sortedArtists.length = Math.min(sortedArtists.length, 50);

        // Build a D3 hierarchy. Scale the total rank score to reduce the variation in size of the
        // bubbles a bit.
        let hierarchy = d3.hierarchy({"children": sortedArtists.map(d => ({"name": d.artist, "value": Math.pow(d.totalRankScore, 0.7)}))})
            .sum(d => d.value);

        // Circle-pack the data.
        vis.pack = d3.pack()
            .size([vis.width, vis.height])
            (hierarchy);

        // One circle per artist.
        vis.circles = vis.svg.selectAll("circle")
            .data(vis.pack.leaves())
            .enter();
        
        vis.circles.append("circle")
            .classed("artist-circle", true)
            .classed("artist-dolly", d => (d.data.name == "Dolly Parton"))
            .classed("artist-dolly-linked", d => (vis.showLinked && vis.collabArtists.has(d.data.name)))
            .attr("cx", d => d.x)
            .attr("cy", d => d.y)
            .attr("r", d => d.r);

        vis.circles.append("text")
            .attr("class", "artist-circle-text")
            .attr("x", d => d.x)
            .attr("y", d => d.y)
            .text(d => d.data.name)
            .style("font-size", "1px")
            .each(function(d) {
                // Use the bounding box as calculated with 1px font size, and the target size as
                // given by 2 * radius, to determine a font size that'll have the string nicely fit
                // in the circle.
                var bbox = this.getBBox();
                d.scale = Math.min(16, 2 * d.r / bbox.width);
            })
            .style("font-size", d => d.scale + "px");

        vis.updateVis();
    }

    updateVis() {
        let vis = this;

        vis.svg.selectAll("circle")
            .data(vis.pack.leaves())
            .merge(vis.circles)
            .classed("artist-dolly-linked", d => (vis.showLinked && vis.collabArtists.has(d.data.name)));
    }
}
