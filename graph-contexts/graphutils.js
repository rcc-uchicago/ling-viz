/* Color changes should be transparent to drawing 'technology' - SVG, canvas, x3dom... */
(function() {
    d3.selection.prototype.color = function(c) {
        return this.attr("fill", c);
    };
})();


var tickLimit = 1; // perhaps change this to a function.
function setTickLimit(i) {
    tickLimit = i;
}

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
	.attr("x", -8)
	.attr("y", -8)
	.attr("r", 8)
    .attr("fill", function(d) { return d.color; })
	.attr("id", function(d) { return cleanName(d.label); });
    
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

function cleanName(name) {
    if (+name > 0)
        return "_" + name;
    else
        return name.replace("'", "_apos_");
}

function selectNode(name) {
    return d3.select("#" + cleanName(name));
}

function getNeighbors(name, nodes, edges) {
    var node_obj = nodes.find(function (n) { return n.label == name });
    var nb_l = edges.filter(function(e) { return e.source == node_obj; })
            .map(function (n) { return n.target; });
    var nb_r = edges.filter(function(e) { return e.target == node_obj; })
            .map(function (n) { return n.source; });
    var neighbors = nb_l;
    for (i in nb_r) {
        if (! nb_r[i] in neighbors)
           neighbors.push(nb_r[i]) 
    }
    return neighbors;

}


function nextColor() {
    if (! nextColor.colors) {
        nextColor.colors = ["red", "orange", "yellow", "green", "turquoise", "blue", "purple"];
        nextColor.idx = 0;
    }
    return nextColor.colors[nextColor.idx++];
}


function handleFileSelect(evt, func) {
    var files = evt.target.files; // FileList object

    for (var i = 0, f; f = files[i]; i++) {
	var reader = new FileReader();
	reader.onload = (function(e) {
	    var json = JSON.parse(e.target.result);
        func(json);
	});
	reader.readAsText(f);
    }
}

function findCell (table, name) {
    return table
        .selectAll("td")
        .filter(function(d) { return d.label == name })
}
function selectCell(cell) {
    cell.classed({"sel":true, "unsel":false});
}
function unselectCell(cell) {
    cell.classed({"sel":false, "unsel": true});
}

function createTable(table, header, nodes, func) {
    table.selectAll("*").remove()

    table
        .append("thead")
        .append("tr")
        .append("th")
        .html(header);
   
    var rows = table
       .append("tbody")
       .selectAll("tr")
       .data(nodes)
        .enter() 
       .append("tr");

    rows
        .append("td")
        .html(function(d) { return d.label; })
        .classed("unsel", true)
        .on("click", function(d) { func(d.label) } );
}


/* Download SVG feature */

function svgToText(svg) {
    var text = '<svg width="' + svg.attr("width") + '" height="' + svg.attr("height") + '">'
        + '<style type="text/css" >'
        + '<![CDATA['
        + d3.select("#svgstyle").html()
        + ']]>'
        + '</style>'
        + svg.html()
        + '</svg>'
    return encodeURIComponent(text);
}

function downloadSVG(svg) {
    var href = 'data:text/please-download-me;charset=utf-8,' + svgToText(svg);
    var pom = d3.select("body").append("a");
    pom.attr('download', 'graph-image.svg');
    pom.attr('href', 'data:text/plain;charset=utf-8,' + svgToText(svg));
    pom.node().click();
    pom.remove();
}


/* Intersect lists - must be sorted */
function intersect(x, y) {
    var i = 0
    var j = 0
    var z = []
    while(i < x.length && j < y.length) {
        if (x[i] == y[j])
            z.push(x[i]);
        if (x[i] < y[j])
            i++;
        else
            j++;
    }
    return z;
}

function intersectAll(L) {
    var x = L[0]
    for (i = 1; i < L.length; i++) {
        x = intersect(x, L[i])
    }
    return x;
}

/*
   Some array functions are in Firefox but not Chrome. We add them below. See more at (for example):   
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

if (!Array.prototype.find) {
  Object.defineProperty(Array.prototype, 'find', {
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
            return value;
          }
        }
      }
      return undefined;
    }
  });
}


/* Add an Array remove function*/
if (!Array.prototype.remove) {
  Object.defineProperty(Array.prototype, 'remove', {
    enumerable: false,
    configurable: true,
    writable: true,
    value: function(val) {
      if (this == null) {
        throw new TypeError('Array.prototype.remove called on null or undefined');
      }
      var list = Object(this);
      var length = list.length >>> 0;
      
      for (var i = 0; i < length; i++) {
        if (i in list) {
          if (list[i] === val)
                list.splice(i,1)
        }
      }
      return -1;
    }
  });
}


