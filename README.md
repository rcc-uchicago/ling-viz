This is where we will work on visualization and user interface for [John Goldsmith](https://github.com/JohnAGoldsmith)'s [Linguistica](http://linguistica.uchicago.edu/publications.html) project.


## Demo Visualization

See the `webui` directory for an initial visualization displaying word relations:
- [`index.html`](webui/index.html) is a webapp with a prototype of the graph visualization software 
- [`graphutils.js`](webui/graphutils.js) contains JS logic for the webapp
- `d3.js` is a copy of the [D3](http://d3js.org/) source. Included in full for inspection or changes.
- [`package.json`](webui/package.json) is a manifest for node-webkit packaging.
- the [`Makefile`](webui/Makefile) contains some helpful shortcuts for publishing as a webpage or a node-webkit program. Must be edited for your local environment.


