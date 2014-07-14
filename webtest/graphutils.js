/* Note:
   D3 edges (as read from JSON) go from index to index -- i.e. {source:0,target:1} goes from the
   first node in the node list to the second node. GEXF files go by ID. How we transform:
   * Naive way: when adding an edge, search through node list.
*/


function flattenNode(tag)
{
  return {"label": tag.getAttribute("label"), "id": parseInt(tag.getAttribute("id"))}; 
}


/* Note: 'Array.findIndex' may not be in all JS implementations. See:
https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/findIndex */
function flattenEdge(tag, nodes)
{
 function attrToPos(attr) {
     var id = parseInt(tag.getAttribute(attr));
     var pos = nodes.findIndex(function(n) { return n.id == id });
     if (pos == -1)
	 throw "Invalid edge: no node " + pos
     return pos;
 } 
    return {"source": attrToPos("source"), "target": attrToPos("target")};

}


function flattenNodeList(nl, f)
{
    var x = [];
    for (i in nl) {
	if (nl[i] instanceof Node) {
	    x.push(f(nl[i]));
	}
    }
    return x;
}


/* This might not still work: */
function plotXML(xfile)
{
    d3.xml(xfile, function(err, xml) {
	var nodes = flattenNodeList(xml.getElementsByTagName("node"), flattenNode);
	function fl(e) { return flattenEdge(e, nodes) }
	var edges = flattenEdgeList(xml.getElementsByTagName("edge"), fl);
        plotGraph(nodes, edges);
    });
}

function plotXMLstr(txt)
{
    /* See: http://www.w3schools.com/xml/xml_parser.asp */
    if (window.DOMParser)
    {
	parser=new DOMParser();
	xmlDoc=parser.parseFromString(txt,"text/xml");
    }
    else // Internet Explorer
    {
	xmlDoc=new ActiveXObject("Microsoft.XMLDOM");
	xmlDoc.async=false;
	xmlDoc.loadXML(txt);
    }

    var nodes = flattenNodeList(xmlDoc.getElementsByTagName("node"), flattenNode);
    var edges = flattenNodeList(xmlDoc.getElementsByTagName("edge"), function(e) { return flattenEdge(e, nodes) });
    //console.log(nodes, edges);

    var n = nodes.length;
    
    /* Get rid of bad edges. Could perhaps add an error message.
    edges = edges.filter(function(e) {
	var s = e.source;
	var t = e.target;
	return (s >= 0 && s < n && t >= 0 && t < n);
    }); */

    
    plotGraph(nodes, edges);
}


function plotGraph(nodes, edges)
{
    var width = 800,
    height = 500;

    var svg = d3.select("#content").append("svg")
	.attr("width", width)
	.attr("height", height);

    var table = d3.select("#selected");
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
	    plotXMLstr(e.target.result);
	});
	reader.readAsText(f);
    }
}
