/* Color changes should be transparent to drawing 'technology' - SVG, canvas, x3dom... */
(function() {
    d3.selection.prototype.color = function(c) {
        return this.attr("fill", c);
    };
})();

/* XML Parsing notes --
   D3 edges (as read from JSON) go from index to index -- i.e. {source:0,target:1} goes from the
   first node in the node list to the second node. GEXF files go by ID. How we transform:
   - When adding an edge, search through node list.
   This is naive, and may not work for very large graph sizes. Solution might be to sort nodelist. */
function xmlToGraph(xmlDoc)
{   
    function flattenTags(name, f)
    {
	    var nl = xmlDoc.getElementsByTagName(name)
	    var arr = Array.prototype.slice.call(nl)
	    return arr.map(f);
    }
    
    function getColor(tag)
    {
        var c = tag.getElementsByTagName("ns0:color")[0]; // use first color element (only one anyway)
        if (c == undefined)
            return 'black';
        else {
            return 'rgb(' + c.getAttribute('r') + "," + c.getAttribute('g') + "," + c.getAttribute('b') + ')';
        }
    } 
     

    var nodes = flattenTags("node",
			    function(tag) {
				return {"label": tag.getAttribute("label"), 
					"id": parseInt(tag.getAttribute("id")),
					"color": getColor(tag)};
			    });

    function flattenEdge(tag)
    {
        function idToPos(id) {
            var pos = nodes.findIndex(function(n) { return (n.id == +id) || (n.label == id); }); // -1 if no node 
            return pos;
        }
        var src = tag.getAttribute("source"), tar = tag.getAttribute("target");
        var s = idToPos(src), t = idToPos(tar);
        if (t >= 0 && s >= 0)
            return {"source": s, "target": t};
        else {
            console.log("Ignoring invalid edge (" + src + "," + tar + ")");
            return null;
        }
   }

    var edges = flattenTags("edge", flattenEdge).filter(function(e) { return e; });
    
    
    return {nodes: nodes, edges: edges};
}


var tickLimit = 1; // perhaps change this to a function.
function plotGraph(svg, nodes, edges)
{
    var width = parseInt(svg.attr("width")), height = parseInt(svg.attr("height"));
  

    var force = d3.layout.force()
	.gravity(.05)
	.distance(100)
	.charge(-100)
	.size([width, height]);

    force
	.nodes(nodes)
	.links(edges)
	.start();

    var link = svg.selectAll(".link")
	.data(edges)
	.enter().append("line")
	.attr("class", "link");

    var node = svg.selectAll(".node")
	.data(nodes)
	.enter().append("g")
	.attr("class", "node")
	.call(force.drag);

    node.append("circle")
	.attr("class", "node")
	.attr("x", -8)
	.attr("y", -8)
	.attr("r", 8)
    .attr("fill", function(d) { return d.color; })
	.attr("id", function(d) { return d.label });
    
    node.append("text")
	.attr("dx", 12)
	.attr("dy", ".35em")
	.text(function(d) { return d.label});

    var tick = tickLimit;
    force.on("tick", function() {
	if (tick == tickLimit) {
	    link.attr("x1", function(d) { return d.source.x; })
		.attr("y1", function(d) { return d.source.y; })
		.attr("x2", function(d) { return d.target.x; })
		.attr("y2", function(d) { return d.target.y; });

	    node.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });
	    tick = 0;
	}
	else
	    tick++;
    });
    
}


function findNode(e) {
    var name = e.target.value;
    var node = d3.select('#' + name);
    if (node != null && document.getElementById("row_" + name) == null) {
	node.color("red");
	var row = d3.select("#selected").append("tr");
    
	row.html(name + " ");
	row.attr("id", "row_" + name)
	row.append("a").html("x").attr("href", "#")
            .on("click", function() { removeNode(name) });
    }
    
}

function removeNode(name) {
  var o = document.getElementById("row_" + name);
  if (o != null)
   o.parentNode.removeChild(o);

  var node = d3.select('#' + name); 
  if (node != null) node.color('black');
}



function handleFileSelect(evt) {
    
   
    var files = evt.target.files; // FileList object

    // Loop through the FileList and render image files as thumbnails.
    // This loop is only getting executed once, so could be changed.
    for (var i = 0, f; f = files[i]; i++) {
	var reader = new FileReader();
	reader.onload = (function(e) {
	    var	parser = new DOMParser();

	    var	xmlDoc = parser.parseFromString(e.target.result,"text/xml");
	    
	    var graph = xmlToGraph(xmlDoc);
	    
	    d3.select("#vis").selectAll("*").remove(); // remove existing vis, if necessary
	
	    if (graph.nodes != "") {
		cls();
		plotGraph(d3.select("#vis"), graph.nodes, graph.edges);
	    }
	    else {
		msg("Unable to load XML file.");
	    }
	});
	reader.readAsText(f);
    }
}



/*
   'Array.findIndex' may not be in all JS implementations. See:
   https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/findIndex
*/
if (!Array.prototype.findIndex) {
  Object.defineProperty(Array.prototype, 'findIndex', {
    enumerable: false,
    configurable: true,
    writable: true,
    value: function(predicate) {
      if (this == null) {
        throw new TypeError('Array.prototype.find called on null or undefined');
      }
      if (typeof predicate !== 'function') {
        throw new TypeError('predicate must be a function');
      }
      var list = Object(this);
      var length = list.length >>> 0;
      var thisArg = arguments[1];
      var value;

      for (var i = 0; i < length; i++) {
        if (i in list) {
          value = list[i];
          if (predicate.call(thisArg, value, i, list)) {
            return i;
          }
        }
      }
      return -1;
    }
  });
}
