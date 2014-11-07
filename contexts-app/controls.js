/* Hacky namespace management */

var globals =
    {
        "selectedNodes": [],
    }


function main(error, json) {
    if (error) {
        console.log(error);
        alert("Error!");
        return;
    }

    globals.nodes = json.nodes;
    globals.edges = json.edges;
    globals.contexts = json.contexts;
    drawGraph()
}


function drawGraph() {
    
    
    var nodes = globals.nodes;
    var edges = globals.edges;
    var contexts = globals.contexts;
    var nodelabels = nodes.map(function(d) { return d.label; })
    var zoom = d3.behavior.zoom();
    var view = d3.select(".view1")
    var colors = d3.scale.category20()

    /* Graph svg */
    var width = parseInt(view.style("width")), height = parseInt(view.style("height"));
    
    var outer = view
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("pointer-events", "all")
        .call(zoom.on("zoom", redraw));
    var svg = outer
        .append('svg:g') 
        .attr("width", outer.attr("width"))
        .attr("height", outer.attr("height"));
    function redraw() {
        svg.attr("transform",
            "translate(" + d3.event.translate + ")"
            + " scale(" + d3.event.scale + ")");
    }
 
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

    var tickLimit = 10; // TODO: make configurable
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

    globals.selectNode = function(x) {
        var node = selectNode(x);
        if (node.empty())
            return;

        node.style("fill", colors(x))

        /* Zooming adapted from http://stackoverflow.com/questions/13861657/automatic-zoom-on-object-in-d3-force-layout */
        var zoomFactor = 3;
       
        var vec = node.node().parentNode.getAttribute("transform");
        var trans = vec.match(/-?[0-9\.]+/g)

        var transx = (-parseInt(trans[0]) * zoomFactor + width/2),
            transy = (-parseInt(trans[1]) * zoomFactor + height/2);
        svg.transition().attr("transform", "translate(" + transx + "," + transy + ")scale(" + zoomFactor + ")");
        zoom.scale(zoomFactor);
        zoom.translate([transx, transy]);

        globals.selectedNodes.push(x)

        updateList()
    }

    globals.unSelectNode = function(x) {
        selectNode(x).style("fill", "blue");
        globals.selectedNodes.remove(x)
        updateList()
    }

}

function updateList() {
    var items = d3.select("#selectedNodes")
        .selectAll("li")
        .data(globals.selectedNodes, function(d) { return d });
    items
        .enter()
        .append("li")
        .append("a")
        .attr("href", '#')
        .on("click", globals.unSelectNode)
        .text(function(d) { return d; });
    items
        .exit()
        .remove();
}



function drawContextTable() {
    
    var view = d3.select(".view2")
    view.selectAll('*').remove()
    var table = view.append("table")
    
    var contexts = globals.contexts;
    var selected_nodes = globals.selectedNodes;

    if (selected_nodes.length == 0)
        return;

    var selected_contexts = selected_nodes
        .map(function(n) { return contexts[n] });

    /* header */
    table
        .append("thead")
        .selectAll("th")
        .data(selected_nodes)
        .enter()
        .append("th")
        .text(function(d) { return d + " " })

        
    /* add shared column */
    if (selected_nodes.length > 1) {
        table.select("thead")
            .append("th")
            .html("<i>shared</i>")

        var shared = intersectAll(selected_contexts)
        selected_contexts.push(shared)
    }

    /* rows */
    var lengths = selected_contexts.map(function(d) { return d.length });
    var m = Math.max.apply(null, lengths);
    var tbody = table.append("tbody")
    for (var i = 0; i < m; i++) {
        var innerhtml = "<td>" + selected_contexts.map(function(d) { return d[i] }).join("</td><td>") + "</td>"
        tbody
            .append("tr")
            .html(innerhtml)
    }
}


/* smaller utils */

function cleanName(name) {
    if (+name > 0)
        return "_" + name;
    else
        return name.replace("'", "_apos_");
}

function selectNode(name) {
    return d3.select("#" + cleanName(name));
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

/* Add connections */

d3.select("#loadData")
    .on("change", function() {
        var file = d3.event.target.value;
        d3.json("data/" + file, main)
    });

    
d3.select("#searchBox")
    .on("change", function() {
        var node = d3.event.target.value;
        if (globals.selectedNodes.indexOf(node) > 0)
            globals.unSelectNode(node)
        else
            globals.selectNode(node)
    });


d3.select("#drawTable")
    .on("click", drawContextTable)

d3.select("#drawSankey")
    .on("click", function() {
        globals.mysankey = mysankey()
            .words(["oh", "really"])
            .contexts(globals.contexts)
            .draw();
    }) 
