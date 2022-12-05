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

        // Tooltip div.
        vis.tooltip = d3.select("body")
            .append('div')
            .attr('class', "tooltip");

        vis.wrangleData();
    }

    wrangleData() {
        let vis = this;

        // Determine the list of artists who have worked with Dolly Parton.
        vis.collabArtists = new Map();
        vis.dollyPartonSongs.forEach(function(song) {
            song.Artists.split(";").forEach(function(artist) {
                if (!vis.collabArtists.has(artist)) {
                    vis.collabArtists.set(artist, {asArtist: [], asWriter: []});
                }
                vis.collabArtists.get(artist).asArtist.push({title: song.Title, year: song.Year});
            });
            song.Writers.split(";").forEach(function(artist) {
                if (!vis.collabArtists.has(artist)) {
                    vis.collabArtists.set(artist, {asArtist: [], asWriter: []});
                }
                vis.collabArtists.get(artist).asWriter.push({title: song.Title, year: song.Year});
            });
        });

        // Sort collab by year and then title.
        let collabOrder = function(l, r) {
            if (l.year == r.year) {
                if (l.title < r.title) {
                    return -1;
                }
                if (l.title > r.title) {
                    return 1;
                }
            }
            return l.year - r.year;
        };

        vis.collabArtists.forEach(function(d) {
            d.asArtist.sort(collabOrder);
            d.asWriter.sort(collabOrder);
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
        vis.artistCircles = vis.svg.selectAll(".artist-circle")
            .data(vis.pack.leaves())
            .enter()
            .append("circle")
            .classed("artist-circle", true)
            .classed("artist-dolly", d => (d.data.name == "Dolly Parton"))
            .classed("artist-elvis", d => (vis.showLinked && (d.data.name == "Elvis Presley")))
            .classed("artist-dolly-linked", d => (vis.showLinked && vis.collabArtists.has(d.data.name)))
            .attr("cx", d => d.x)
            .attr("cy", d => d.y)
            .attr("r", d => d.r);

        vis.svg.selectAll(".artist-circle-text")
            .data(vis.pack.leaves())
            .enter()
            .append("text")
            .attr("class", "artist-circle-text")
            .attr("x", d => d.x)
            .attr("y", d => d.y)
            .text(d => d.data.name)
            .style("font-size", "1px")
            .each(function(d) {
                // Use the bounding box as calculated with 1px font size, and the target size as
                // given by 1.8 * radius, to determine a font size that'll have the string nicely fit
                // in the circle.
                var bbox = this.getBBox();
                d.scale = Math.min(16, 1.8 * d.r / bbox.width);
            })
            .style("font-size", d => d.scale + "px");

        vis.artistCircleTooltips = vis.svg.selectAll(".artist-circle-tooltip")
            .data(vis.pack.leaves())
            .enter()
            .append("circle")
            .classed("artist-circle-tooltip", true)
            .classed("artist-circle-tooltip-hover", d => (vis.showLinked &&
                ((d.data.name == "Elvis Presley") || (vis.collabArtists.get(d.data.name) != undefined))))
            .attr("cx", d => d.x)
            .attr("cy", d => d.y)
            .attr("r", d => d.r)
            .on('mouseover', (event, d) => {
                if (!vis.showLinked) {
                    return;
                }
                let collab = vis.collabArtists.get(d.data.name);
                let tooltipHTML = '';
                if (d.data.name == "Elvis Presley") {
                    // Special case for Elvis.
                    tooltipHTML =
                        'While Dolly Parton and Elvis never recorded together, Elvis and his team wanted ' +
                        'to record "I Will Always Love You" in 1974. She was initially thrilled with the ' +
                        'proposal, until Elvis\'s manager insisted that she also sign over half her ' +
                        'publishing rights. She says she cried all night but refused to give up her ' +
                        'rights to her song.  Whitney Houston ultimately popularized the song, again in ' +
                        'the 90s - and went on to break billboard records and win Grammy\'s - and make ' +
                        'Dolly Parton millions.';
                } else if (collab != undefined) {
                    // General case for everyone else.
                    let getLines = function(collabs) {
                        let lines = collabs.map(d => `<h6 style="display:inline">${d.title}</h6> <i>(${d.year})</i><br>`);
                        let lineCount = lines.length;
                        if (lineCount <= 5) {
                            return lines;
                        }
                        // Limit to a list of at most 5 items.
                        return [
                            lines[0],
                            lines[1],
                            `<span style="font-weight:bold;font-style:italic;">(... ${lineCount - 4} more ...)</span><br>`,
                            lines[lineCount - 2],
                            lines[lineCount - 1]];
                    };

                    if (collab.asArtist.length > 0) {
                        tooltipHTML = getLines(collab.asArtist).reduce(
                            function(a, x) { return a + x; },
                            tooltipHTML + "<h5>As artist:</h5>");
                    }
                    if (collab.asWriter.length > 0) {
                        if (collab.asArtist.length > 0) {
                            tooltipHTML += '<br>';
                        }
                        tooltipHTML = getLines(collab.asWriter).reduce(
                            function(a, x) { return a + x; },
                            tooltipHTML + "<h5>As writer:</h5>");
                    }

                    tooltipHTML.replace(/<br>$/, "");
                }
                if (tooltipHTML.length > 0) {
                    vis.tooltip
                        .style("opacity", 1)
                        .html('<div style="border: thin solid grey; border-radius: 25px; font-family: verdana; background: #E2D0BC; padding: 10px">' + tooltipHTML + '</div>')
                        .style("left", (event.pageX + 10) + "px")
                        .style("top", (event.pageY + 10) + "px");
                }
            })
            .on('mouseout', (event, d) => {
                vis.tooltip
                    .style("opacity", 0)
                    .style("left", 0)
                    .style("top", 0)
                    .html('');
            });
        vis.updateVis();
    }

    updateVis() {
        let vis = this;

        vis.artistCircles
            .classed("artist-elvis", d => (vis.showLinked && (d.data.name == "Elvis Presley")))
            .classed("artist-dolly-linked", d => (vis.showLinked && vis.collabArtists.has(d.data.name)));
        vis.artistCircleTooltips
            .classed("artist-circle-tooltip-hover", d=> (vis.showLinked &&
                ((d.data.name == "Elvis Presley") || (vis.collabArtists.get(d.data.name) != undefined))));
}
}
