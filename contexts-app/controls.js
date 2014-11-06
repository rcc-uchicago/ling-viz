
d3.select("#loadData")
    .on("change", function() {
        var file = d3.event.target.value;
        d3.json("data/" + file, drawGraph)
    });


function drawGraph(error, json) {
    
    if (error) {
        console.log(error);
        alert("Error!");
        return;
    }

    var nodes = json.nodes;
    var edges = json.edges;
    var contexts = json.contexts;
    var nodelabels = nodes.map(function(d) { return d.label; })
    var zoom = d3.behavior.zoom();
    var view = d3.select(".view1")

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
}


/* smaller utils */

function cleanName(name) {
    if (+name > 0)
        return "_" + name;
    else
        return name.replace("'", "_apos_");
}
