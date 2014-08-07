# Resources


## D3 Examples

* Galleries
  * [official](https://github.com/mbostock/d3/wiki/Gallery)
  * [searchable](http://christopheviau.com/d3list/gallery.html)

* Mike Bostock
  * [blocks](http://bl.ocks.org/mbostock)
  * [features](http://bost.ocks.org/mike/)


## Large-scale Graph Viz

Alternative representations for large-scale graph data:

* [hive plots](http://bost.ocks.org/mike/hive/)
* [hierarchical edge bundling](http://mbostock.github.io/d3/talk/20111116/bundle.html)
* [matrix diagrams](http://bost.ocks.org/mike/miserables/)
* [chord diagrams](http://bost.ocks.org/mike/uberdata/)

Why? As Mike Bostock notes:

> Many methods of graph drawing, such as force layouts, do not assign
> intrinsically-meaningful positions to nodes: the position is only
> approximate, in the hope that related nodes appear nearby. While intuitive,
> these methods arguably make poor use of the most effective visual channel
> (that is, position), and in the worst case produce an indecipherable
> hairball.

---

* [Graph Rendering Performance](http://nad.webfactional.com/ntap/graphscale/) - web app to test rendering performance for different size random graphs with X nodes and 2X edges

* [Mapping a million connections](http://www.iwillreply.com/prototypes/unileverforcedirectedgraph/) - WebGL experiment demonstrating how large-scale graph data can be rendered in 3-dimensions and how a subset of nodes can be highlighted based on some nodal attribute.


## IPython Notebook

See the [nbviewer](http://nbviewer.ipython.org/) to peruse examples of [IPython Notebooks](http://ipython.org/ipython-doc/stable/notebook/notebook.html).

[This article](http://radar.oreilly.com/2014/01/ipython-a-unified-environment-for-interactive-data-analysis.html) provides a quick intro to IPython and describes how it's become a unified environment for interactive data analysis.

Note that the new widget architecture allows users and developers to build rich user interfaces using JavaScript/HTML/CSS that communicate with the IPython kernel using JSON data. IPython 2.0 will ship a number of basic widgets (slider,
checkbox, dropdown, etc.).  The widget architecture will enable developers to create new libraries that combine frontend technologies (d3, backbone.js, etc.) with the power of Python and other backend languages (Julia, Scala, Haskell, etc.).
