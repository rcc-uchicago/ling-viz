
/* Color changes should be transparent to drawing 'technology' - SVG, canvas, x3dom... */
(function() {
    d3.selection.prototype.color = function(c) {
        return this.select("material").attr("diffuseColor", c);

    };
})();

d3.ns.prefix.x3da="http://www.web3d.org/specifications/x3d-namespace";


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
            var pos = nodes.findIndex(function(n) { return n.id == id }); // -1 if no node
            return pos;
        }
        var src = +tag.getAttribute("source"), tar = +tag.getAttribute("target");
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
function plotGraph(scene, nodes, edges)
{

    var width = parseInt(scene.attr("width")), height = parseInt(scene.attr("height"));
  

    var force = d3.layout.force3d()
    	.gravity(.05)
	    .distance(100)
	    .charge(-100)
	    .size([50, 50]);

    force
	    .nodes(nodes)
	    .links(edges)
	    .start();


    var link = scene.selectAll(".link")
	    .data(edges)
	    .enter().append("x3d:Shape")
	    .attr("class", "link")
        .html("<IndexedLineSet coordIndex='0 1'><Coordinate point='0 0 0 0 0 0' class='line' /></IndexedLineSet>").select(".line"); 
  
    var line = scene.selectAll(".line") 
        


    var node = scene.selectAll(".node")
	    .data(nodes)
	    .enter()
        .append("transform")
	    .attr("class", "node");
       // .html("<shape><appearance><material diffuseColor='black'></material></appearance><sphere radius='1.0' /></shape>");
  
    var sh = node.append("shape").attr("id", function(d) { return d.label + "_sh"; }) ;
    sh.append("appearance").append("material").attr("diffuseColor",'steelblue');
    sh.append("sphere").attr("radius='1.0'");

    //.call(force.drag);

        /*
    node.append("circle")
	.attr("class", "node")
	.attr("x", -8)
	.attr("y", -8)
	.attr("r", 8)
    .attr("fill", function(d) { return d.color; })
	.attr("id", function(d) { return d.label });
    */

    //node.append("text")
	//.attr("dx", 12)
	//.attr("dy", ".35em")
	//.text(function(d) { return d.label });


    var tick = tickLimit;
    force.on("tick", function() {
	    if (tick == tickLimit) {
	        line.attr("point",
                function(d) {
                return x(d.target.x)+" "+y(d.target.y)+" "+z(d.target.z)+" "
                 +x(d.source.x)+" "+y(d.source.y)+" "+z(d.source.z)});

	        node.attr("translation", function(d) { return x(d.x)+" "+y(d.y)+" "+z(d.z) });
	        tick = 0;
	    }
    	else
	        tick++;
    });
   
}

// set up the axes
var x = d3.scale.linear().domain([0, 100]).range([0, 10]),
y = d3.scale.linear().domain([0, 100]).range([0, 10]),
z = d3.scale.linear().domain([0, 100]).range([0, 10]);


function findNode(name) {
    var node = d3.select('#' + name + "_sh");
   
    if (node != null) {
	
        node.color(nextColor());

	    var row = d3.select("#selected").append("tr");	
    
        var node_obj = updateTable.nodes.find(function (n) { return n.label == name });
        var nb_l = updateTable.edges.filter(function(e) { return e.source == node_obj; })
            .map(function (n) { return n.target; });
        var nb_r = updateTable.edges.filter(function(e) { return e.target == node_obj; })
            .map(function (n) { return n.source; });
        var neighbors = nb_l.concat(nb_r);

        if (neighbors.length > 0) {
            d3.select("#dtable").select("thead").select("tr")
                .append("th")
                .classed(name + "_col", true)
                .html(name);
            
            d3.select("#dtable").select("tbody").selectAll("tr")
                .append("td")
                .classed(name + "_col", true)
                .data(neighbors)
                .on("click", updateTable)
                .html(function(d) { return d.label; });

            var col = nextColor();
            for (var i in neighbors) {
                var n = neighbors[i];
                d3.select('#' + n.label + "_sh")
                    .color(col);
            }
        }   
   }   

}

function removeNode(name) {

  var node = d3.select('#' + name + "_sh");
  if (node != null) node.color("steelblue");
  
  d3.select("#dtable").selectAll("." + name + "_col").remove();

}


function nextColor() {
    if (! this.colors) {
        this.colors = ["red", "orange", "yellow", "green", "turquoise", "blue", "purple"];
        this.idx = 0;
    }
    return this.colors[this.idx++];
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
	    
	    //d3.select("#vis").selectAll("*").remove(); // remove existing vis, if necessary
	    
        d3.select("#dtable").selectAll("*").remove();

	    if (graph.nodes != "") {
		    cls();
		    plotGraph(d3.select("#vis"), graph.nodes, graph.edges);
	        createTable(graph.nodes, graph.edges);
        }
	    else {
		    msg("Unable to load XML file.");
	    }
	});

	reader.readAsText(f);
    }
}


function updateTable() {
    var cell = d3.select(d3.event.target);
    if (cell.classed("sel")) {
        cell.classed({"sel":false, "unsel": true});
        removeNode(cell.html());
    }
    else {
        cell.classed({"sel":true, "unsel":false});
        findNode(cell.html());
    }
}

function createTable(nodes, edges) {
    updateTable.nodes = nodes;
    updateTable.edges = edges;

    d3.select("#dtable")
        .append("thead")
        .append("tr")
        .append("th")
        .html("nodes");
   
    var rows = d3.select("#dtable")
       .append("tbody")
       .selectAll("tr")
       .data(nodes)
        .enter() 
       .append("tr");

    rows
        .append("td")
        .html(function(d) { return d.label; })
        .classed("unsel", true)
        .on("click", updateTable);
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
