# Dolly Parton ─ America's Darling

### An exploration of Dolly Parton's rise to success from humble upbringings and her commitment to philanthropy.

Completed as a final project for Harvard University's Visualization course. Focus on HTML/CSS, JavaScript + D3, and Bootstrap plugins.

---
*Team*: Isidora Diaz, Hope Neveux, Loralee Ryan

+ [Project Website](https://code.harvard.edu/pages/hon821/CS171FP/)
+ [Process Book](https://docs.google.com/document/d/1U5zToUgqU9AknzWW-_Guzpe9N0TiHKTKJtSsBoTUR3s/edit?usp=sharing)
+ Video Presentation

## Description
The project is centered around Dolly Parton: her origins, her contributions and connections in the music industry,
her songs and their success, as well as her philanthropy in the Tennessee state and beyond.

We hope to celebrate the impact that Dolly ─ the artist and the person ─ has had in American society.


## How to Run
- Go to the objective directory where you want to save the project
- Clone the repository. Using the command line you can type ```git clone https://code.harvard.edu/hon821/CS171FP.git```
- Then position yourself into the project's root using ```cd CS171FP ```
- Open current directory ```open .```
- Using your Javascript IDE of preference (WebStorm recommended) open index.html
- Render Webpage using Chrome (optimized)
- Ready to go!

## Required Libraries
The project was built using D3 and Bootstrap. We also used different external and custom Javascript libraries and classes:
### External
```jquery, underscore, topojson, d3-simple-slider, d3-annotations, nouislider```
### Custom
```Awards, BarGraph, BubbleVis, Charity, MiniDendro, StreamStats, TimeSeries```

## Project Structure

```
.
├── LICENSE
├── README.md
├── css
│   ├── colorscheme.txt
│   ├── index.css
│   ├── nouislider.css
│   └── style.css
├── data
│   ├── DollyPartonSongs_cleaned.csv
│   ├── TN_poverty_rates_by_county_1960-2020.csv
│   ├── billboard-top100-filtered.csv
│   ├── charts_wrangled.csv
│   ├── dolly-charity.csv
│   ├── dolly-parton-released-songs.csv
│   ├── dolly-wiki-awards.csv
│   ├── fields_description.xlsx
│   ├── imagination-library.csv
│   ├── spotify_artist_data.csv
│   └── tennessee-county-1960.topojson
├── fonts
│   ├── JuliusSansOne-Regular.ttf
│   ├── Lato-Light.ttf
│   ├── Satisfy-Regular.ttf
│   └── Tangerine-Bold.ttf
├── img
│   ├── Jolene.png
│   ├── bw_cropped_news.jpg
│   ├── bw_cropped_news_s1.jpg
│   ├── bw_cropped_news_s11.jpg
│   ├── bw_cropped_news_s2.jpg
│   ├── bw_cropped_news_s3.jpg
│   ├── couch_dolly.jpeg
│   ├── cropped_news_collage.jpg
│   ├── dolly-parton-tmh.jpg
│   ├── dolly_bw_closing.jpg
│   ├── dollyreading.jpeg
│   ├── dollyvax.png
│   ├── dollyvaxwide.webp
│   ├── dollywood.jpeg
│   ├── hope.jpeg
│   ├── isidora.jpeg
│   ├── loralee.jpeg
│   └── partonfamily.jpeg
├── index.html
└── js
    ├── Awards.js
    ├── BarGraph.js
    ├── BubbleVis.js
    ├── Charity.js
    ├── MiniDendro.js
    ├── StreamStats.js
    ├── TimeSeries.js
    ├── archived
    │   ├── Dendrogram.js
    │   └── Dendrogram2.js
    ├── d3-annotation.js 
    ├── d3-annotation.js.map
    ├── main.js
    └── nouislider.js
```

### Details
```├── css```: contains library and custom styling files

```├── data```: contains data sources

```│   ├── fields_description.xlsx ```: contains description for each dataset and respective fields

```├── fonts```: contains fonts used in the project

```├── img```: contains images used in the project

```├── index.html```: main html file of our project

```└── js```: contains library and custom javascript files

```│   ├── Awards.js```: class for awards visualization

```│   ├── BarGraph.js```: class for imagination library visualization

```│   ├── BubbleVis.js```: class for connection bubbles visualization

```│   ├── Charity.js```: class for charity map visualization

```│   ├── MiniDendro.js```: class for connections visualization

```│   ├── StreamStats.js```: class for spotify streaming statistics

```│   ├── TimeSeries.js```: class for billboard hot 100 timeline visualization

```│   ├── d3-annotation.js```: external library used to annotate TimeSeries.js viz

```│   ├── d3-annotation.js.map```: external library used to annotate TimeSeries.js viz

```│   ├── main.js```: main javascript file of our project

```│   └── nouislider.js```: external library used for time slider TimeSeries.js viz
