function graphCanvas() {
    

    var nodes = undefined,
        edges = undefined,
        context = undefined,
        canvas = undefined,
        selectedNodes = [],
        force = undefined,
        labels = false;
   
    var width = 0, height = 0; // these change in draw()

    var zoom = d3.behavior.zoom();
    var colors = d3.scale.category20();

    var graph = function(view) {
        width = parseInt(view.style("width")), height = parseInt(view.style("height"));
        
        canvas = view
            .append("canvas")
            .attr("width", width)
            .attr("height", height)
            .attr("pointer-events", "all")
            .call(zoom)
            .node()

        context =  canvas.getContext("2d")

        if (!force)
            force = d3.layout.force()
                .gravity(.05)
                .distance(100)
                .charge(-100)
                .size([width, height]);

        return graph;
    }

    graph.start = function() {
        force
            .nodes(nodes)
            .links(edges)
            .on("end", function() { zoom.on("zoom", redraw) })
            .on("start", function() { zoom.on("zoom", undefined) })
            .start()
        window.requestAnimationFrame(redraw)
        return graph;
    }

    graph.stop = function() {
        force.alpha(0);
        return graph;
    };

    function redraw() {
        redraw.started = true; /* other things can redraw now */

        context.clearRect(0,0,canvas.width,canvas.height)
        
        var s = zoom.scale(),
            t = zoom.translate()

        /* Batch path drawing */
        context.beginPath();
        context.strokeStyle = 'lightgrey';
        edges.forEach(function(d) {
            context.moveTo(s * d.source.x + t[0], s * d.source.y + t[1])
            context.lineTo(s * d.target.x + t[0], s * d.target.y + t[1])
        });
        context.stroke()

        nodes.forEach(function(d) {
            context.beginPath();
            context.arc(s * d.x + t[0], s * d.y + t[1], s * (d.size || 8), 0, 2 * Math.PI);
            context.fillStyle = d.color ||  "black";
            context.fill();
        });

        if (labels) {
            context.font = (s * 10).toString() + "pt Arial"
            context.fillStyle = "black";
            nodes.forEach(function(d) {
                context.fillText(d.label, s * (d.x + 8) + t[0], s * d.y + t[1])
            });
        } 
        
        if (force.alpha())
            window.requestAnimationFrame(redraw)
    }

    graph.center = function() {
        zoom.scale(0.25);
        zoom.translate([width/4,height/4])
        redraw()
    }

    graph.selectNode = function(x) {
        var node = nodes.find(function(d) { return d.label == x });
        if (!node)
            return;
        
        selectedNodes.push(node)
        node.oldcolor = node.color;
        node.color = colors(x);  
      
        zoom.scale(1)
        zoom.translate([width/2 - node.x, height/2 - node.y])
        
        if (! force.alpha())
            redraw();
    }

    graph.unSelectNode = function(x) {
        var node = nodes.find(function(d) { return d.label == x });
        if (!node)
            return;
        node.color = node.oldcolor;
        selectedNodes.remove(node);
        if (!force.alpha())
            redraw();
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
        if (redraw.started)
            redraw()
        return graph;
    }

    graph.redraw = function() {
        if (!force)
            return
        if (force.alpha())
            return
        redraw()
    }

    graph.force = function(_) {
        if (!arguments.length)
            return force;
        else
            force = _;
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
