function graphCanvas() {
    

    var nodes = undefined,
        edges = undefined,
        selectedNodes = [];
   
    var width = 0, height = 0; // these change in draw()

    var zoom = d3.behavior.zoom();
    var colors = d3.scale.category20();

    /* Graph svg */

    var graph = function(view) {
        width = parseInt(view.style("width")), height = parseInt(view.style("height"));
        
        var canvas = view
            .append("canvas")
            .attr("width", width)
            .attr("height", height)
            .attr("pointer-events", "all")
            .call(zoom)
            .node()

        var context =  canvas.getContext("2d")
        context.strokeStyle = "black"

        var force = d3.layout.force()
            .gravity(.05)
            .distance(100)
            .charge(-100)
            .size([width, height]);

        force
            .nodes(nodes)
            .links(edges)
            .start()
            .on("end", function() { zoom.on("zoom", redraw) })

         

        function redraw() {

            context.clearRect(0,0,canvas.width,canvas.height)
            
            var s = zoom.scale(),
                t = zoom.translate()

            nodes.forEach(function(d) {
                context.beginPath();
                context.arc(s * d.x + t[0], s * d.y + t[1], s * 8, 0, 2 * Math.PI);
                context.fill();
            });

            /* Batch path drawing */
            context.beginPath();
            edges.forEach(function(d) {
                context.moveTo(s * d.source.x + t[0], s * d.source.y + t[1])
                context.lineTo(s * d.target.x + t[0], s * d.target.y + t[1])
            });
            context.stroke()
            
            if (force.alpha())
                window.requestAnimationFrame(redraw)
        }

        window.requestAnimationFrame(redraw)
        
        return graph;
    }

    graph.center = function() {
        zoom.scale(0.25);
        zoom.translate([width/4,height/4])
    }

    graph.selectNode = function(x) {
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

        selectedNodes.push(x)

    }

    graph.unSelectNode = function(x) {
        selectNode(x).style("fill", "blue");
        selectedNodes.remove(x)
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
