function graphSVG() {
    

    var nodes = undefined,
        edges = undefined,
        selectedNodes = [],
        labels = false;
   
    var width = 0, height = 0, svg = undefined; // these change in draw()
    var force = undefined;

    var zoom = d3.behavior.zoom();
    var colors = d3.scale.category20();

    /* Graph svg */

    var graph = function(view) {
        var width = parseInt(view.style("width")), height = parseInt(view.style("height"));
        
        var outer = view
            .append("svg")
            .attr("width", width)
            .attr("height", height)
            .attr("pointer-events", "all")
            .call(zoom.on("zoom", redraw));
        svg = outer
            .append('svg:g') 
            .attr("width", outer.attr("width"))
            .attr("height", outer.attr("height"));
        function redraw() {
            svg.attr("transform",
                "translate(" + d3.event.translate + ")"
                + " scale(" + d3.event.scale + ")");
        }
     
        
        if (!force)
            force = d3.layout.force()
                .gravity(.05)
                .distance(100)
                .charge(-100)
                .size([width, height]);
            
    }

    graph.start = function() {
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
            .attr("x", function(d) { return d.x }) // -8)
            .attr("y", function(d) { return d.y }) //-8)
            .attr("r", 8)
            .attr("fill", function(d) { return d.color; })
            .attr("id", function(d) { return cleanName(d.label); })
            .on("mouseover", function(d, i) { 
                d3.selectAll(".node")
                    .selectAll("circle")
                    .attr("fill-opacity", "0.3");
                selectNode(d.label).attr("fill-opacity", "1.0");
                if (!d.neighbors)
                    d.neighbors = findNeighbors(nodes, edges, d); 
                d.neighbors.forEach(function (n) {
                    selectNode(n.label).attr("fill-opacity", "1.0")
                });
            })
            .on("mouseout", function() { d3.selectAll(".node")
                                        .selectAll("circle")
                                        .attr("fill-opacity", "1.0") })
            .append("title").text(function(d) { return d.label; });

        if (labels) {
            node.append("text")
                .attr("dx", 12)
                .attr("dy", ".35em")
                .text(function(d) { return d.label});
        }

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

                if (graph.registerstop)
                    force.alpha(0)
            }
            else
                tick++;
        });

        return graph;
    }

    graph.center = function() {
        zoom.scale(0.25);
        zoom.translate([width/4,height/4])
    }

    graph.selectNode = function(d) {

        var node = selectNode(d.label);

        node.style("fill", colors(d.label))

        /* Zooming adapted from http://stackoverflow.com/questions/13861657/automatic-zoom-on-object-in-d3-force-layout */
        var zoomFactor = 3;
       
        var vec = node.node().parentNode.getAttribute("transform");
        var trans = vec.match(/-?[0-9\.]+/g)

        var transx = (-parseInt(trans[0]) * zoomFactor + width/2),
            transy = (-parseInt(trans[1]) * zoomFactor + height/2);
        svg.transition().attr("transform", "translate(" + transx + "," + transy + ")scale(" + zoomFactor + ")");
        zoom.scale(zoomFactor);
        zoom.translate([transx, transy]);

        selectedNodes.push(d)

    }

    graph.unSelectNode = function(node) {
        node.style("fill", "blue");
        selectedNodes.remove(node)
    }

    graph.stop = function() {
        force.alpha(0);
    }

    graph.nodes = function(_) {
        if (!arguments.length)
            return nodes;
        else
            nodes = _;
        return graph;
    }

    graph.edges = function(_) {
        if (!arguments.length)
            return edges;
        else
            edges = _;
        return graph;
    }


    graph.selectedNodes = function(_) {
        if (!arguments.length)
            return selectedNodes;
        else
            selectedNodes = _;
        return graph;
    }

    graph.labels = function(_) {
        if (!arguments.length)
            return labels;
        else
            labels = _;
        return graph;
    }

    graph.force = function(_) {
        if (!arguments.length)
            return force;
        else
            force = _;
        return graph;
    }



    graph.redraw = function() {
        graph.start()
        //graph.registerstop = true
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



    return graph;

}
