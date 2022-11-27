class CharityVis {
    constructor(parentElement, geoData, povertyRates, donations) {
        this.parentElement = parentElement;
        this.geoData = geoData;
        this.povertyRates = povertyRates;
        this.donationData = donations;

        this.tnPovertyRates = {
            "Poverty Rate 1960": 39.3,
            "Poverty Rate 1970": 21.8,
            "Poverty Rate 1980": 16.5,
            "Poverty Rate 1990": 15.7,
            "Poverty Rate 2000": 13.5,
            "Poverty Rate 2010": 17.3,
            "Poverty Rate 2020": 14.6};
        this.usaPovertyRates = {
            "Poverty Rate 1960": 22.1,
            "Poverty Rate 1970": 13.7,
            "Poverty Rate 1980": 12.4,
            "Poverty Rate 1990": 13.1,
            "Poverty Rate 2000": 12.4,
            "Poverty Rate 2010": 14.9,
            "Poverty Rate 2020": 12.8};

        this.initVis();
    }

    expectedMapSize(width, height) {
        // The resulting fitted map size for a given height and width.
        let widthForYFit = height * 4 - 762;
        let heightForXFit = width * 0.25 + 167;
        let widthLimit = width - 40;
        let heightLimit = height - 12.5;
        console.log(
            "width",width,
            "height",height,
            "widthForYFit",widthForYFit,
            "heightForXFit",heightForXFit,
            "widthLimit",widthLimit,
            "heightLimit",heightLimit);

        if (widthForYFit > widthLimit) {
            // Constrained by width.
            return [widthLimit, heightForXFit];
        } else {
            // Constrained by height.
            return [widthForYFit, heightLimit];
        }
    }

    initVis() {
        let vis = this;

        let parentElement = document.getElementById(vis.parentElement);
        let parentElementBounds = parentElement.getBoundingClientRect()

        // Pick either side-by-side or above/below, depending on which makes the map larger.
        vis.margin = {top: 70, right: 20, bottom: 120, left: 20};

        let useSideBySide = this.expectedMapSize(parentElementBounds.width / 2, parentElementBounds.height)[1] >
            this.expectedMapSize(parentElementBounds.width, parentElementBounds.height * 0.6)[1];
        if (useSideBySide) {
            // Side-by-side will give the larger map.
            parentElement.style.display = "flex";
            parentElement.style.flexDirection = "row";
            vis.mapElement =  d3.select(parentElement).append("div").attr("style", "height: 100%; width: 50%");
            vis.textElement =  d3.select(parentElement).append("div").attr("style", "height: 100%; width: 50%; overflow-y: auto");
        } else {
            // Above/below will give the larger map.
            parentElement.style.display = "flex";
            parentElement.style.flexDirection = "column";
            vis.mapElement =  d3.select(parentElement).append("div").attr("style", "height: 60%; width: 100%");
            vis.textElement =  d3.select(parentElement).append("div").attr("style", "height: 40%; width: 100%; flex-grow: 1; overflow-y: auto");
         }

        vis.width = vis.mapElement.node().getBoundingClientRect().width - vis.margin.left - vis.margin.right;
        vis.height = vis.mapElement.node().getBoundingClientRect().height - vis.margin.top - vis.margin.bottom;

        // Clean up some of the passed data.
        vis.donationData.forEach(function(d, i) {
            d.Decade = parseInt(d.Decade);
            d.LatLong = d.LatLong.split(",").map(x => parseFloat(x));
            d.RawAmountEstimate = parseInt(d.RawAmountEstimate);
            d.FlyoutLatLong = d.FlyoutLatLong.split(",").map(x => parseFloat(x));
            d.FlyoutLatSize = parseFloat(d.FlyoutLatSize);
            d.index = i;
        });

        // Init the drawing area.
        vis.svgElement =
            vis.mapElement.append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom);
        vis.svg = vis.svgElement
            .append('g')
            .attr('transform', `translate (${vis.margin.left}, ${vis.margin.top})`);

        vis.svg.append("pattern")
            .attr("id", "diagonalHatch")
            .attr("width", "10")
            .attr("height", "10")
            .attr("patternTransform", "rotate(45 0 0)")
            .attr("patternUnits", "userSpaceOnUse")
            .append("line")
            .attr("x1", "0")
            .attr("y1", "0")
            .attr("x2", "0")
            .attr("y2", "10")
            .attr("style", "stroke:black; stroke-width:1");

        // Ensure that Sevier is drawn last so that the border is visible.
        let geodata = topojson.feature(vis.geoData, vis.geoData.objects["tennessee-county-1960-simplified"]);
        geodata.features.sort(function(a, b) {
            let aIsSevier = (a.properties.NHGISNAM == "Sevier") ? 1 : 0;
            let bIsSevier = (b.properties.NHGISNAM == "Sevier") ? 1 : 0;
            if (aIsSevier == bIsSevier)
            {
                if (a.properties.NHGISNAM > b.properties.NHGISNAM) {
                    return 1;
                }
                if (a.properties.NHGISNAM < b.properties.NHGISNAM) {
                    return 1;
                }
            }
            return aIsSevier - bIsSevier;
        });

        // Draw the counties twice - once for the color, once for the hatching.
        // The geographic center of Tennessee is 35.8597 N, 86.3620 W.
        // So base the rotation around that.
        vis.projection = d3.geoAlbers()
            .rotate([86.3620, 0, 0])
            .fitSize([vis.width, vis.height], geodata);

        vis.path = d3.geoPath()
            .projection(vis.projection);

        vis.counties = vis.svg.selectAll(".county")
            .data(geodata.features, d => d.properties.NHGISNAM)
            .enter()
            .append("path")
            .classed("county", true)
            .classed("county-sevier", d => (d.properties.NHGISNAM == "Sevier"))
            .attr("d", vis.path)
            .attr("fill", "none");

        vis.countiesPattern = vis.svg.selectAll(".countyPattern")
            .data(geodata.features, d => d.properties.NHGISNAM)
            .enter()
            .append("path")
            .attr("class", "countyPattern")
            .attr("d", vis.path)
            .attr("fill", "none");

        // Determine the bounding box of all the counties.
        // This is used later to position the slider and legend.
        let countiesBBox;
        vis.counties.each(function() {
            let countyBBox = this.getBBox();
            if (countiesBBox === undefined) {
                countiesBBox = {
                    x0: countyBBox.x,
                    x1: countyBBox.x + countyBBox.width,
                    y0: countyBBox.y,
                    y1: countyBBox.y + countyBBox.height};
            } else {
                countiesBBox = {
                    x0: Math.min(countiesBBox.x0, countyBBox.x),
                    x1: Math.max(countiesBBox.x1, countyBBox.x + countyBBox.width),
                    y0: Math.min(countiesBBox.y0, countyBBox.y),
                    y1: Math.max(countiesBBox.y1, countyBBox.y + countyBBox.height)};
            }
        });
        vis.countiesBBox = countiesBBox;

        // The geo-transform is now known, so transform the lat-long of the donations.
        vis.donationData.forEach(function(d) {
            d.position = vis.projection([d.LatLong[1], d.LatLong[0]]);
            d.enabledFlyoutPos = vis.projection([d.FlyoutLatLong[1], d.FlyoutLatLong[0]]);
        });

        // Legend
        vis.colorScale = d3.scaleSequentialLog()
            .interpolator(x => d3.interpolateRdYlGn(1 - x))
            .domain([50, 200]);
        vis.legendScale = d3.scaleLog()
            .range([0, vis.width / 2])
            .domain([50, 200]);

        vis.legend = vis.svg.append("g")
            .attr('class', 'legend')
            .attr('transform', `translate(${vis.width * 0.25 - 50}, ${vis.countiesBBox.y1 + 30})`);

        vis.legend.append("text")
            .attr("text-anchor", "middle")
            .attr("x", vis.width * 0.25)
            .attr("y", 78)
            .text("Poverty rate");

        vis.legend.selectAll(".scale-bar-rect")
            .data(d3.range(50, 200, 1))
            .enter()
            .append("rect")
            .attr("class", "scale-bar-rect")
            .attr("x", d => vis.legendScale(d))
            .attr("y", 35)
            .attr("width", d => (vis.legendScale(d + 1) - vis.legendScale(d)) * 1.1)
            .attr("height", 10)
            .style("fill", d => vis.colorScale(d));
        vis.legendAxis = d3.axisBottom()
            .scale(vis.legendScale)
            .tickFormat(d => d.toString());
        vis.legendAxisGroup = vis.legend.append("g").attr('transform', `translate(0, 45)`)

        vis.legend.append("path")
            .attr("id", "scale-pattern-rect");
        vis.legend.append("text")
            .attr("x", vis.width * 0.5 + 10)
            .attr("y", 15)
            .text("Hatched region is above");
        vis.legend.append("text")
            .attr("id", "scale-pattern-caption")
            .attr("x", vis.width * 0.5 + 10)
            .attr("y", 33);

        vis.legend.append("path")
            .attr("d", `M ${vis.width * 0.25} 35 l -7 -7 l 14 0 z`);

        vis.legend.append("text")
            .attr("id", "state-average-text")
            .attr("x", vis.width * 0.25)
            .attr("y", 15);

        // Year slider.
        vis.selectedYear = 1960;
        vis.yearSlider = d3.sliderBottom()
            .min(1960)
            .max(2020)
            .width(vis.width / 4)
            .tickFormat(d => d.toString())
            .ticks(6)
            .step(10)
            .default(1960)
            .on('onchange', val => {
                vis.selectedYear = val;
                vis.wrangleData();
              });
        vis.svg
            .append("g")
            .attr('transform', `translate(${vis.width * 3/8 - 50}, ${vis.countiesBBox.y0 - 60})`)
            .call(vis.yearSlider);

        // Donations. 
        let buildDonationBox = function(boxDiv, d) {
            let mainBox = boxDiv.append("div").attr("class", "donation-entry")
            let amountDesc = (d.Amount != '') ? ("(" + d.Amount + ")") : "";
            mainBox.html(`
                <div style="display:flex;flex-direction:row">
                    <div class="donation-colorbar"></div>
                    <div style="flex-grow:1">
                        <div style="display:flex;flex-direction:row">
                            <div>
                                <h5 class="donation-what">${d.What}</h5><br>
                                <span class="donation-amount">${amountDesc}</span>
                            </div>
                            <div style="margin: 0 0 0 auto">
                                <span class="donation-where">${d.Where}</span><br>
                                <span class="donation-when">${d.When}</span>
                            </div>
                        </div>
                        <span class="donation-desc">${d.Description}</span>
                    </div>
                </div>`);
            // Vertical space.
            boxDiv.append("div").style("height", "5px");
        };
        vis.donations = vis.textElement.selectAll(".donation-entry-wrap")
            .data(vis.donationData)
            .enter()
            .append("div")
            .attr("class", "donation-entry-wrap")
            .each(function(d) { buildDonationBox(d3.select(this), d); })
            .each(function(d) { d.origHeight = this.getBoundingClientRect().height; })
            .style("height", "0")
            .style("opacity", 0);

        // Donation flyout circles.
        vis.donationCircles = vis.svg.selectAll(".donation-circle")
            .data(vis.donationData)
            .enter()
            .append("circle")
            .attr("cx", d => d.position[0])
            .attr("cy", d => d.position[1])
            .attr("r", 0);
        vis.donationFlyoutLines = vis.svg.selectAll(".donation-flyout-line")
            .data(vis.donationData)
            .enter()
            .append("line")
            .attr("class", "donation-flyout-line")
            .attr("x1", d => d.position[0])
            .attr("y1", d => d.position[1])
            .attr("x2", d => d.position[0])
            .attr("y2", d => d.position[1]);
        vis.donationFlyoutCircles = vis.svg.selectAll(".donation-flyout-circle")
            .data(vis.donationData)
            .enter()
            .append("circle")
            .attr("class", "donation-flyout-circle")
            .attr("fill", "cyan")
            .attr("cx", d => d.position[0])
            .attr("cy", d => d.position[1])
            .attr("r", 0);

        // Donation flyout scaling.
        vis.donationFlyouts = {
            sizeScale: function(x) { return Math.pow(x, 0.125); },
            fixedScale: true,
            maxFlyoutRadius: (vis.countiesBBox.y1 - vis.countiesBBox.y0) / 5,
            maxDonationSize: function() {
                return d3.max(vis.donationData
                    .filter(d => (d.visible || this.fixedScale))
                    .map(d => this.sizeScale(d.RawAmountEstimate)));
            },
            donationRadius: function(x) {
                return this.sizeScale(x) / this.maxDonationSize() * this.maxFlyoutRadius;
            }
        };

        // Donation flyout legend
        {
            let scaleEntries = [
                {name: "1B", value: 1000000000},
                {name: "10M", value: 10000000},
                {name: "100K", value: 100000}];

            let ytop = vis.countiesBBox.y0 + (vis.countiesBBox.y1 - vis.countiesBBox.y0) * 0.32;
            let cx = vis.countiesBBox.x1 - vis.donationFlyouts.maxFlyoutRadius;

            scaleEntries.forEach(function(entry) {
                let r = vis.donationFlyouts.donationRadius(entry.value);
                let cy = ytop + r;

                vis.svg.append("circle")
                    .attr("cx", cx)
                    .attr("cy", cy)
                    .attr("r", r)
                    .attr("style", "stroke: white; fill: white; fill-opacity: 0.1");
                vis.svg.append("text")
                    .attr("x", cx)
                    .attr("y", cy + r + 2)
                    .text(entry.name)
                    .attr("style", "alignment-baseline: hanging; text-anchor: middle; font-size: 8px");
            });
        }

        vis.wrangleData();

        // Helps for generating values for the equations in expectedMapSize.
        // console.log(
        //     vis.mapElement.node().getBoundingClientRect().width,
        //     vis.mapElement.node().getBoundingClientRect().height,
        //     vis.svg.node().getBBox().width,
        //     vis.svg.node().getBBox().height);

        // Tighten the bounding box around the map.
        let viewportBox = vis.svgElement.node().getBBox({stroke: true});
        viewportBox.x = 0;
        viewportBox.width = vis.width + vis.margin.left + vis.margin.right;
        viewportBox.y -= 40;
        viewportBox.height += 80;
        vis.svgElement.attr("viewBox", `${viewportBox.x} ${viewportBox.y} ${viewportBox.width} ${viewportBox.height}`);
        vis.svgElement.attr("height", `${viewportBox.height}px`);
        vis.mapElement.style("height", `${viewportBox.height}px`);
    }

    wrangleData() {
        let vis = this;

        // Poverty rates.
        let sourceField = "Poverty Rate " + vis.selectedYear.toString();
        vis.displayData = new Map();
        vis.povertyRates.forEach(county => {
            vis.displayData.set(county.County, parseFloat(county[sourceField]));
        });
        vis.tnPovertyRate = vis.tnPovertyRates[sourceField];
        vis.usaPovertyRate = vis.usaPovertyRates[sourceField];

        // Determine the visible donations.
        let visIdx = 0;
        vis.donationData.forEach(donation => {
            donation.visible = (donation.Decade == vis.selectedYear);
            donation.flyoutR = donation.visible ? vis.donationFlyouts.donationRadius(donation.RawAmountEstimate) : 0;
            donation.flyoutPos = donation.visible ? donation.enabledFlyoutPos : donation.position;
            if (donation.visible) {
                // donation.flyoutColor = d3.schemeCategory10[visIdx];
                donation.flyoutColor = d3.schemeCategory10[donation.index % 10];
                visIdx++;
            }
        });

        vis.updateVis()
    }

    updateVis() {
        let vis = this;

        // Use a scale from half the TN povery rate, to double the TN poverty rate.
        // This seems reasonable from testing.
        let scaleMin = vis.tnPovertyRate / 2;
        let scaleMax = vis.tnPovertyRate * 2;
        vis.colorScale.domain([scaleMin, scaleMax]);
        vis.legendScale.domain([scaleMin, scaleMax]);
        vis.legendAxis.tickValues([10, 20, 30, 40, 50, 60, 70, 80].filter(d => ((d >= scaleMin) && (d <= scaleMax))));
        vis.legendAxisGroup.transition().call(vis.legendAxis);

        // Update the county colors, and the hatching.
        vis.counties
            .merge(vis.counties)
            .transition()
            .attr("fill", d => vis.colorScale(vis.displayData.get(d.properties.NHGISNAM)));
        vis.countiesPattern
            .merge(vis.countiesPattern)
            .transition()
            .attr("opacity", d => ((vis.displayData.get(d.properties.NHGISNAM) >= vis.usaPovertyRate) ? 1 : 0));

        // Legend.
        vis.legend.select("#scale-pattern-rect")
            .transition()
            .attr("d",
                `M ${vis.legendScale(vis.usaPovertyRate)} 35`
                + ` L ${vis.legendScale(scaleMax) - 50} 35`
                + ` L ${vis.legendScale(scaleMax) - 45} 25`
                + ` L ${vis.legendScale(scaleMax)} 25`
                + ` L ${vis.legendScale(scaleMax)} 45`
                + ` L ${vis.legendScale(vis.usaPovertyRate)} 45`
                + ` z`);
        vis.legend.select("#state-average-text")
            .text(`State average: ${vis.tnPovertyRate}`);
        vis.legend.select("#scale-pattern-caption")
            .text(`USA average of ${vis.usaPovertyRate}`);

        // Donations.
        vis.donations.merge(vis.donations)
            .transition()
            .style("opacity", d => (d.visible ? 1 : 0))
            .style("height", d => ((d.visible ? d.origHeight : 0) + "px"))
            .each(function(d) {
                d3.select(this).select(".donation-colorbar").attr("style", "background-color:" + d.flyoutColor);
            });

        // Donation flyout circles.
        vis.donationCircles.merge(vis.donationCircles)
            .transition()
            .attr("r", d => (d.visible ? 0.5 : 0));
        vis.donationFlyoutLines.merge(vis.donationFlyoutLines)
            .transition()
            .attr("x2", d => d.flyoutPos[0])
            .attr("y2", d => d.flyoutPos[1]);
        vis.donationFlyoutCircles.merge(vis.donationFlyoutCircles)
            .attr("fill", d => d.flyoutColor)
            .transition()
            .attr("cx", d => d.flyoutPos[0])
            .attr("cy", d => d.flyoutPos[1])
            .attr("r", d => d.flyoutR);
    }
}
