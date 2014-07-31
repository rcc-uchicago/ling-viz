# IPython Notebooks

The [IPython Notebook](http://ipython.org/notebook.html) is a web-based interactive computational environment where you can combine code execution, text, mathematics, plots and rich media into a single document.

For the past year the IPython team has been focused on enabling interactive and dynamic content in the notebook via Javascript plugins/widgets.

With the recent release of [IPython 2.0](http://ipython.org/ipython-doc/2/whatsnew/version2.0.html), the team has reached their milestone of "enabling interactive widgets for the notebook."

See the [docs for interactive widgets](http://nbviewer.ipython.org/github/ipython/ipython/blob/2.x/examples/Interactive%20Widgets/Index.ipynb).


## D3 Integration

IPython notebooks demo-ing D3 integration:

* [D3.js in IPython 2.0](http://nbviewer.ipython.org/gist/anonymous/9975962)
* [How-to leverage D3.js in the notebook](http://nbviewer.ipython.org/github/fperez/talk-strata-sc2014/blob/master/d3%20in%20the%20notebook.ipynb)
* [Integrating D3 into a notebook](http://nbviewer.ipython.org/github/ResearchComputing/Meetup-Fall-2013/blob/master/python/lecture_20_d3.ipynb)
* [Dataviz with D3](http://nbviewer.ipython.org/github/amplab/datascience-sp14/blob/master/lab9/lab9.ipynb)


## Notes

As noted [here](https://groups.google.com/forum/#!topic/d3-js/DwUURUS-Qdc): 

> Every IPython notebook is now a [Backbone](http://backbonejs.org/) application, configured with [`require.js`](http://requirejs.org/). A notebook can be trivially configured to visualize any JSON-serializable object in a running IPython kernel.
>
> With certain rules, whenever you change the object in the IPython side, the
visualization will update automatically, and `this.model.set("someattribute",
123)` can trigger effects on the Python side.
>
> Among the "rules" is that list and dictionary members are not instrumented, so
if you want to update a view, you have to change the whole data structure: however, this will probably change.
>
> Of particular interest: one datatype that a widget can contain is other widgets. This makes small multiples extremely easy, plus custom things can exploit other objects models, listen to their events, etc. depending on how much Backbone you want to use.
>
> [Here](http://nbviewer.ipython.org/gist/anonymous/9975962) is quick overview of getting data back from d3 into IPython.  Note that the interactive widgets don't get saved into the static documents, so you won't actually see anything there.


