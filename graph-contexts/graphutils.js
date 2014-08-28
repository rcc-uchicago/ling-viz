/* Color changes should be transparent to drawing 'technology' - SVG, canvas, x3dom... */
(function() {
    d3.selection.prototype.color = function(c) {
        return this.attr("fill", c);
    };
})();

function xmlToGraph(xmlText)
{   
    var xmlDoc = new DOMParser().parseFromString(xmlText, "text/xml");

    function flattenTags(name, f)
    {
	    var nl = xmlDoc.getElementsByTagName(name)
	    var arr = Array.prototype.slice.call(nl)
	    return arr.map(f);
    }
    
    function getColor(tag)
    {
        var c = tag.getElementsByTagName("color")[0]; // use first color element (only one anyway)
        if (c == undefined)
            return 'black';
        else {
            return 'rgb(' + c.getAttribute('r') + "," + c.getAttribute('g') + "," + c.getAttribute('b') + ')';
        }
    } 
      
    

    var nodes = [];
    var nl = xmlDoc.getElementsByTagName("node");
    var nodearr = Array.prototype.slice.call(nl);
    nodearr.forEach(function(tag, id) {
        var label = tag.getAttribute("label");
        var att = tag.getElementsByTagName("attvalue")[0];
        var color = getColor(tag);
        if(!att) {
            nodes.push({"label": label, "id": id, "pos": 2, "color": color});
            return;
        }
        var ds = att.getAttribute("value").replace(/'/g, '"');
        var dsa = JSON.parse(ds);
        for (i in dsa) {
            if (dsa[i] > 0) {
                var pos = (+i + 2);
                nodes.push({"label": label,
                    "id": id,
                    "pos": pos,
                    "color": color});
            }
        }
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
            return {"source": s, "target": t, "value": 1};
        else {
            console.log("Ignoring invalid edge (" + src + "," + tar + ")");
            return null;
        }
   }

    var edges = flattenTags("edge", flattenEdge).filter(function(e) { return e; });
    
    
    return {"nodes": nodes, "links": edges};
}


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


function handleFileSelect(evt, parse, func) {
    var files = evt.target.files; // FileList object

    for (var i = 0, f; f = files[i]; i++) {
	var reader = new FileReader();
	reader.onload = (function(e) {
	    var data = parse(e.target.result);
        func(data);
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

function getSankeyData(words, contexts) {
    
    var nodes = [];
    var edges = [];

    var getidx = function(node) {
       for (var i in nodes) {
            var n = nodes[i]; 
            if (node.name == n.name && node.pos == n.pos)
                return +i;
        }
       return -1;
    }


    var nodeadd = function (s, i) { 
        var node = {"name":s, "pos":i};
        if (getidx(node) == -1)
            nodes.push(node);
        return node;
    }
    
    var edgeadd = function (n, m) {
        var src = getidx(n);
        var tar = getidx(m);

        for (var i = 0; i < edges.length; i++) {
            if (edges[i].source == src && edges[i].target == tar) {
                edges[i].value++;
                return edges[i];
            }
        }
        var edge = {"source":src, "target":tar, "value":1, "prev":[], "next":[]};
        edges.push(edge);
        return edge;
    }


   for (var i in words) {
     var w = words[i];
     for (var j in contexts[w]) {
        var ctx = contexts[w][j];
        var cs = ctx.split(' ');
        

        /* We either have a start-context, a middle context, or an end context. */
        if (cs[0] == "__") {
            var fst = nodeadd(w, 2);
            var snd = nodeadd(cs[1], 3);
            var thd = nodeadd(cs[2], 4);
        }
        else if (cs[1] == "__") {
            var fst = nodeadd(cs[0], 1);
            var snd = nodeadd(w, 2);
            var thd = nodeadd(cs[2], 3);
        }
        else if (cs[2] == "__") {
            var fst = nodeadd(cs[0], 0);
            var snd = nodeadd(cs[1], 1);
            var thd = nodeadd(w, 2);
        }
        else
            console.log("mayday! bad data.");

        var e = edgeadd(fst, snd);
        var f = edgeadd(snd, thd);
        e.next.push(f); /* This is for path highlighting. */
        f.prev.push(e);
     }
  }


   return {"nodes":nodes, "links":edges};
}

function createSankey(data, svg) {
    var width = svg.attr("width"), height = svg.attr("height");
    
    var sankey = d3.sankey()
        .nodeWidth(15)
        .nodePadding(10)
        .size([width, height]);

    var path = sankey.link();
    sankey
      .nodes(data.nodes)
      .links(data.links)
      .layout(32);

  var link = svg.append("g").selectAll(".link")
      .data(energy.links)
    .enter().append("path")
      .attr("class", "link")
      .attr("d", path)
      .style("stroke-width", function(d) { return Math.max(1, d.dy); })
      .sort(function(a, b) { return b.dy - a.dy; });

  link.append("title")
      .text(function(d) { return d.source.name + " → " + d.target.name + "\n" + format(d.value); });

  var node = svg.append("g").selectAll(".node")
      .data(energy.nodes)
    .enter().append("g")
      .attr("class", "node")
      .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; })
    .call(d3.behavior.drag()
      .origin(function(d) { return d; })
      .on("dragstart", function() { this.parentNode.appendChild(this); })
      .on("drag", dragmove));

  node.append("rect")
      .attr("height", function(d) { return d.dy; })
      .attr("width", sankey.nodeWidth())
      .style("fill", function(d) { return d.color = color(d.name.replace(/ .*/, "")); })
      .style("stroke", function(d) { return d3.rgb(d.color).darker(2); })
    .append("title")
      .text(function(d) { return d.name + "\n" + format(d.value); });

  node.append("text")
      .attr("x", -6)
      .attr("y", function(d) { return d.dy / 2; })
      .attr("dy", ".35em")
      .attr("text-anchor", "end")
      .attr("transform", null)
      .text(function(d) { return d.name; })
    .filter(function(d) { return d.x < width / 2; })
      .attr("x", 6 + sankey.nodeWidth())
      .attr("text-anchor", "start");

  function dragmove(d) {
    d3.select(this).attr("transform", "translate(" + d.x + "," + (d.y = Math.max(0, Math.min(height - d.dy, d3.event.y))) + ")");
    sankey.relayout();
    link.attr("d", path);
  }
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
      
      var j = 0;
      for (var i = 0; i < length; i++) {
        if (i in list) {
          if (list[i] === val) {
            j++;
                 list.splice(i,1)
          }
        }
      }
      return j;
    }
  });
}


/* From SO */
function getParameterByName(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search);
    return results == null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

