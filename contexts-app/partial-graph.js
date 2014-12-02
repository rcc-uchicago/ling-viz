function partialGraph() {
    
    /* Graph svg */

    var nodes, links;

   	function node_radius(d) {
        var x = Math.pow(40.0 * d.size, 1/3);
        if (isNaN(x)) {
            console.log(d)
            console.log(x)
            thunk()
        }
        return x
    }
 
    var graph = function(view) {

       var width = parseInt(view.style("width")), height = parseInt(view.style("height"));

        force = d3.layout.force()
                      .nodes(nodes)
                      .links(links)
                      .charge(-3000)
                      .friction(0.6)
                      .gravity(0.6)
                      .size([width,height])
                      .start();

        linkedByIndex = {};
        links.forEach(function(d, i) {
          d.linknum = i + 1
          linkedByIndex[d.source.index + "," + d.target.index] = true;
        });

        svg = view.append("svg")
                    .attr("width", width)
                    .attr("height", height)
                    .call(d3.behavior.zoom().on("zoom", redraw)).on("dblclick.zoom", null).append("g");

        link = svg.selectAll("path")
                      .data(links)
                    .enter().append("path")
                    .attr("class", "p_path")

        node = svg.selectAll(".node")
                      .data(nodes)
                    .enter().append("g")
                      .attr("class", "p_node")
                      .call(force.drag);

        node
          .append("circle")
          .attr("r", node_radius)
          .on("mouseover", mouseOverFunction)
          .on("mouseout", mouseOutFunction);

        //white shadow around text for better visibility
        node.append("text")
            .attr("x", 12)
            .attr("dy", ".35em")
            .classed({"partial": true, "shadow":true})
            .text(function(d) { return d.label; });

        node.append("text")
            .classed("partial", true)
            .attr("x", 12)
            .attr("dy", ".35em")
            .text(function(d) { return d.label; });

        node.on("dblclick", releaseNode);

        force
          .on("tick", tick);

        function redraw() {
          svg.attr("transform",
              "translate(" + d3.event.translate + ")"
              + " scale(" + d3.event.scale + ")");
        }

        //prevent pan functionality from interferring with node drag functionality
        drag = force.drag().on("dragstart", function(d) {
            d3.event.sourceEvent.stopPropagation();
            if (fixedMode) {
                d3.select(this).classed("fixed", d.fixed = true);
            }
        });

        function releaseNode(d) {
          d3.select(this).classed("fixed", d.fixed = false);
        }

        fixedMode = false;

                  
    }

   
    graph.nodes = function(_) {
        if (!arguments.length)
            return nodes;
        else
            nodes = _;
        return graph;
    }

    graph.links = function(_) {
        if (!arguments.length)
            return links;
        else
            links = _;
        return graph;
    }





    mouseOverFunction = function(d) {
     var circle = d3.select(this);

      node
        .transition(500)
          .style("opacity", function(o) {
            return isConnected(o, d) ? 1.0 : 0.2 ;
          })
          .style("fill", function(o) {
            if (isConnectedAsTarget(o, d) && isConnectedAsSource(o, d) ) {
              fillcolor = 'green';
            } else if (isConnectedAsSource(o, d)) {
              fillcolor = 'green';
            } else if (isConnectedAsTarget(o, d)) {
              fillcolor = 'green';
            } else if (isEqual(o, d)) {
              fillcolor = "hotpink";
            } else {
              fillcolor = '#000';
            }
            return fillcolor;
          });

      link
        .transition(500)
          .style("stroke-opacity", function(o) {
            return o.source === d || o.target === d ? 1 : 0.2;
          })

      circle
        .transition(500)
          .attr("r", function(){ return 1.4 * node_radius(d)});
    }

    mouseOutFunction = function() {
      var circle = d3.select(this);

      node
        .transition(500)
        .style("fill", 'black')
        .style("opacity", 1.0);

      link
        .transition(500)
        .style("stroke-opacity", 1.0);

      circle
        .transition(500)
          .attr("r", node_radius);
    }

    function isConnected(a, b) {
    return isConnectedAsTarget(a, b) || isConnectedAsSource(a, b) || a.index == b.index;
    }

    function isConnectedAsSource(a, b) {
        return linkedByIndex[a.index + "," + b.index];
    }

    function isConnectedAsTarget(a, b) {
        return linkedByIndex[b.index + "," + a.index];
    }

    function isEqual(a, b) {
        return a.index == b.index;
    }

    function tick() {
        link
        .attr("x1", function(d) { return d.source.x; })
        .attr("y1", function(d) { return d.source.y; })
        .attr("x2", function(d) { return d.target.x; })
        .attr("y2", function(d) { return d.target.y; })
        .attr("d", function(d) {
            var dx = d.target.x - d.source.x,
                dy = d.target.y - d.source.y,
                dr = 75/d.linknum;
            return "M" + d.source.x + "," + d.source.y + "A" + dr + "," + dr + " 0 0,1 " + d.target.x + "," + d.target.y;
           // return "M" + d.source.x + "," + d.source.y + "S" + d.target.x + "," + d.target.y + " " + 2 + "," + 3;
        });

        node
            .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });
    }

    return graph;

}
