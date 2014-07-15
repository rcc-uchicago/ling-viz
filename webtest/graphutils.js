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

    var nodes = flattenTags("node",
			    function(tag) {
				return {"label": tag.getAttribute("label"), "id": parseInt(tag.getAttribute("id"))};
			    });

    function flattenEdge(tag)
    {
	function attrToPos(attr) {
	    var id = parseInt(tag.getAttribute(attr));
	    var pos = nodes.findIndex(function(n) { return n.id == id });
	    if (pos == -1)
		return undefined; //throw "Invalid edge: no node " + pos
	    return pos;
	} 
	return {"source": attrToPos("source"), "target": attrToPos("target")};

    }

    var edges = flattenTags("edge", flattenEdge);
    
    
    return {nodes: nodes, edges: edges};
}


function plotGraph(nodes, edges)
{

   

    var svg = d3.select("#vis");
    var width = svg.attr("width"), height = svg.attr("height");

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
	.attr("id", function(d) { return d.label });
    
    node.append("text")
	.attr("dx", 12)
	.attr("dy", ".35em")
	.text(function(d) { return d.label});

    force.on("tick", function() {
	link.attr("x1", function(d) { return d.source.x; })
	    .attr("y1", function(d) { return d.source.y; })
	    .attr("x2", function(d) { return d.target.x; })
	    .attr("y2", function(d) { return d.target.y; });

	node.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });
    });
    
}


function findNode() {

  var name = document.getElementById("nodename").value;
  var node = document.getElementById(name);
  if (node != null) node.setAttribute("fill", "red");
  var row = d3.select("#selected").append("tr");
  
  row.html(name + " ");
  row.attr("id", "row_" + name)
  row.append("a").html("x").attr("href", "#")
                           .on("click", function() { removeNode(name) });
  
}

function removeNode(name) {
  var o = document.getElementById("row_" + name);
  if (o != null)
   o.parentNode.removeChild(o);

  var node = document.getElementById(name);
  if (node != null) node.setAttribute("fill", "black");
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
	    plotGraph(graph.nodes, graph.edges);
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
