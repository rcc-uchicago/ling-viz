# IPython Notebooks

The [IPython Notebook](http://ipython.org/notebook.html) is a web-based interactive computational environment where you can combine code execution, text, mathematics, plots and rich media into a single document.

---

The IPython Notebook is an open-source, web-based interactive computing environment for Python, R, shell scripts, Julia and other languages. At its core, **the Notebook is an environment for writing and running code in an interactive and exploratory manner. On top of this foundation, it adds a document based workflow: Notebook documents contain live code, descriptive text, mathematical equations, images, videos and arbitrary HTML. These documents provide a complete and reproducible record of a computation and can be shared with others, version controlled and converted to a wide range of of static formats (HTML, PDF, slides, etc.).**

We would like to use the IPython Notebook as an interactive computing environment in which our Python-based analytical tools can be tightly integrated with D3-based interactive data visualizations. IPython Notebook solves this problem by reducing the distance between a user and their code/data. This is accomplished by a new widget architecture that makes it easy to leverage the power of both JavaScript/HTML and Python in exploratory data science.

The IPython architecture consists of separate server-side processes, called Kernels, that run user’s code (in Python, R, Julia, etc.) and returns output to the browser over a JSON based message protocol (over WebSockets and ZeroMQ). **This message protocol now includes the ability to synchronize the state of JavaScript objects living in the browser to computations and data living in the Kernel. The result is that data scientists doing exploratory work can easily leverage both modern web technologies, such as d3.js, and the computational capabilities of languages such as Python, R and Julia in a single integrated environment.** 

These means that ...

* Parameters in kernel-side computations can be coupled to UI controls (sliders, drop down menus) in the browser.  

* Browser side visualizations can be backed by Kernel side data structures (Data Frames, networks/graphs, time series) and their states can be synchronized based on user interactions.

* Kernel side data structures can be edited and created using browser side UIs.


## Interactive Widgets

For the past year the IPython team has been focused on enabling interactive and dynamic content in the notebook via Javascript plugins/widgets. With the recent release of [IPython 2.0](http://ipython.org/ipython-doc/2/whatsnew/version2.0.html), the team has reached their milestone of "enabling interactive widgets for the notebook."

The [new widget architecture](http://nbviewer.ipython.org/github/ipython/ipython/blob/2.x/examples/Interactive%20Widgets/Index.ipynb) enables developers to create new libraries that combine frontend technologies (d3, backbone.js, etc.) with the power of Python and other backend languages (Julia, Scala, Haskell, etc.). IPython 2.0 ships with a number of basic widgets (slider, checkbox, dropdown, etc.).

The interactive widget architecture is described in [this video](http://www.safaribooksonline.com/library/view/strata-conference-santa/9781491900321/part149.html).


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
