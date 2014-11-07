d3.sankey = function() {
  var sankey = {},
      nodeWidth = 24,
      nodePadding = 8,
      size = [1, 1],
      nodes = [],
      links = [],
      displayHeight = 1,
      useValues = true,
      customLayout = false,
      customSort = undefined;

  sankey.nodeWidth = function(_) {
    if (!arguments.length) return nodeWidth;
    nodeWidth = +_;
    return sankey;
  };

  sankey.nodePadding = function(_) {
    if (!arguments.length) return nodePadding;
    nodePadding = +_;
    return sankey;
  };

  sankey.nodes = function(_) {
    if (!arguments.length) return nodes;
    nodes = _;
    return sankey;
  };

  sankey.links = function(_) {
    if (!arguments.length) return links;
    links = _;
    return sankey;
  };

  sankey.size = function(_) {
    if (!arguments.length) return size;
    size = _;
    return sankey;
  };

  sankey.displayHeight = function(_) {
      if (!arguments.length) return displayHeight;
      displayHeight = _;
      return sankey;
  };

 sankey.useValues = function(_) {
    if (!arguments.length) return useValues;
    useValues = _;
    return sankey;
  };

 sankey.customLayout = function(_) {
     if(!arguments.length) return customLayout;
     customLayout = _;
     return sankey;
 };

  sankey.customSort = function(_) {
     if(!arguments.length) return customSort;
     customSort = _;
     return sankey;
 };



  sankey.layout = function(iterations) {
    computeNodeLinks();
    computeNodeValues();
    computeNodeBreadths();
    computeNodeDepths(iterations);
    computeLinkDepths();
    computeRealHeights();
    return sankey;
  };

  sankey.relayout = function() {
    computeLinkDepths();
    return sankey;
  };

  sankey.link = function() {
    var curvature = .5;

    function link(d) {
      var x0 = d.source.x + d.source.dx,
          x1 = d.target.x,
          xi = d3.interpolateNumber(x0, x1),
          x2 = xi(curvature),
          x3 = xi(1 - curvature),
          y0 = d.source.ht + d.sy + d.dy / 2,
          y1 = d.target.ht + d.ty + d.dy / 2;
      return "M" + x0 + "," + y0
           + "C" + x2 + "," + y0
           + " " + x3 + "," + y1
           + " " + x1 + "," + y1;
    }

    link.curvature = function(_) {
      if (!arguments.length) return curvature;
      curvature = +_;
      return link;
    };

    return link;
  };

  // Populate the sourceLinks and targetLinks for each node.
  // Also, if the source and target are not objects, assume they are indices.
  function computeNodeLinks() {
    nodes.forEach(function(node) {
      node.sourceLinks = [];
      node.targetLinks = [];
    });
    links.forEach(function(link) {
      var source = link.source,
          target = link.target;
      if (typeof source === "number") source = link.source = nodes[link.source];
      if (typeof target === "number") target = link.target = nodes[link.target];
      source.sourceLinks.push(link);
      target.targetLinks.push(link);
    });
  }

  // Compute the value (size) of each node by summing the associated links.
  function computeNodeValues() {
      if (useValues)
            nodes.forEach(function(node) {
                node.value = Math.max(
                d3.sum(node.sourceLinks, value),
                d3.sum(node.targetLinks, value)
            );
            });
      else
          nodes.forEach(function(node) {
              node.value = 1;
          });
  }

  // Iteratively assign the breadth (x-position) for each node.
  // Nodes are assigned the maximum breadth of incoming neighbors plus one;
  // nodes with no incoming links are assigned breadth zero, while
  // nodes with no outgoing links are assigned the maximum breadth.

  
    function computeNodeBreadths() {
        customLayout ? computeNodeBreadths_custom() : computeNodeBreadths_old() ;
    }

  function computeNodeBreadths_custom() {
   var width = sankey.size()[0]; 
   nodes.forEach(function(d) {
        d.x = (d.pos + 2) * (width - nodeWidth) / 4;
        d.dx = nodeWidth;
    })
  }
 
  function computeNodeBreadths_old() {
    var remainingNodes = nodes,
        nextNodes,
        x = 0;

    while (remainingNodes.length) {
      nextNodes = [];
      remainingNodes.forEach(function(node) {
        node.x = x;
        node.dx = nodeWidth;
        node.sourceLinks.forEach(function(link) {
          nextNodes.push(link.target);
        });
      });
      remainingNodes = nextNodes;
      ++x;
    }

    //
    moveSinksRight(x);
    scaleNodeBreadths((size[0] - nodeWidth) / (x - 1));
  }

  function moveSourcesRight() {
    nodes.forEach(function(node) {
      if (!node.targetLinks.length) {
        node.x = d3.min(node.sourceLinks, function(d) { return d.target.x; }) - 1;
      }
    });
  }

  function moveSinksRight(x) {
    nodes.forEach(function(node) {
      if (!node.sourceLinks.length) {
        node.x = x - 1;
      }
    });
  }

  function scaleNodeBreadths(kx) {
    nodes.forEach(function(node) {
      node.x *= kx;
    });
  }


  function computeNodeDepths(iterations) {
    var nodesByBreadth = d3.nest()
        .key(function(d) { return d.x; })
        .sortKeys(d3.ascending)
        .entries(nodes)
        .map(function(d) { return d.values; });

    initializeNodeDepth();
    if (customLayout) {
        var byvalue = customSort || function(d, e) { return d.value < e.value ? 1 : -1; };
        nodesByBreadth.forEach(function(nodes, p) {
            var y0 = p ? 0 : 50 + nodes[0].dy; // HACK! there's a menu in the way of the first thing.
            nodes.sort(byvalue).forEach(function(node, i) {
                node.y = i;
                var dy = y0 - node.y;
                if (dy > 0) node.y += dy;
                y0 = node.y + node.dy + nodePadding;
                

            });
        });
        return;
    }
    resolveCollisions();
    for (var alpha = 1; iterations > 0; --iterations) {
      relaxRightToLeft(alpha *= .99);
      resolveCollisions();
      relaxLeftToRight(alpha);
      resolveCollisions();
    }

    function initializeNodeDepth() {
      var ky = d3.min(nodesByBreadth, function(nodes) {
        return (size[1] - (nodes.length - 1) * nodePadding) / d3.sum(nodes, value);
      });
      ky = d3.max([ky, 1])

      nodesByBreadth.forEach(function(nodes) {
        nodes.forEach(function(node, i) {
          node.y = i;
          node.dy = node.value * ky;
        });
      });

      links.forEach(function(link) {
        if (!useValues)
          link.value = 1;
        link.dy = link.value * ky;
      });
    }

    function relaxLeftToRight(alpha) {
      nodesByBreadth.forEach(function(nodes, breadth) {
        nodes.forEach(function(node) {
          if (node.targetLinks.length) {
            var y = d3.sum(node.targetLinks, weightedSource) / d3.sum(node.targetLinks, value);
            node.y += (y - center(node)) * alpha;
          }
        });
      });

      function weightedSource(link) {
        return center(link.source) * link.value;
      }
    }

    function relaxRightToLeft(alpha) {
      nodesByBreadth.slice().reverse().forEach(function(nodes) {
        nodes.forEach(function(node) {
          if (node.sourceLinks.length) {
            var y = d3.sum(node.sourceLinks, weightedTarget) / d3.sum(node.sourceLinks, value);
            node.y += (y - center(node)) * alpha;
          }
        });
      });

      function weightedTarget(link) {
        return center(link.target) * link.value;
      }
    }

    function resolveCollisions() {
      nodesByBreadth.forEach(function(nodes) {
        var node,
            dy,
            y0 = 0,
            n = nodes.length,
            i;

        // Push any overlapping nodes down.
        nodes.sort(ascendingDepth);
        for (i = 0; i < n; ++i) {
          node = nodes[i];
          dy = y0 - node.y;
          if (dy > 0) node.y += dy;
          y0 = node.y + node.dy + nodePadding;
        }

        // If the bottommost node goes outside the bounds, push it back up.
        dy = y0 - nodePadding - size[1];
        if (dy > 0) {
          y0 = node.y -= dy;

          // Push any overlapping nodes back up.
          for (i = n - 2; i >= 0; --i) {
            node = nodes[i];
            dy = node.y + node.dy + nodePadding - y0;
            if (dy > 0) node.y -= dy;
            y0 = node.y;
          }
        }
      });
    }

    function ascendingDepth(a, b) {
      return a.y - b.y;
    }
  }

  function computeLinkDepths_() {
    nodes.forEach(function(node) {
        node.sourceLinks.forEach(function(link) {
            link.sy = 0;
            link.ty = 0;
        });
    });
  }
  function computeLinkDepths() {
    if (useValues) {

        nodes.forEach(function(node) {
          node.sourceLinks.sort(ascendingTargetDepth);
          node.targetLinks.sort(ascendingSourceDepth);
        });
        nodes.forEach(function(node) {
          var sy = 0, ty = 0;
          node.sourceLinks.forEach(function(link) {
            link.sy = sy;
            sy += link.dy;
          });
          node.targetLinks.forEach(function(link) {
            link.ty = ty;
            ty += link.dy;
          });
        });
    }
    else {
        nodes.forEach(function(node) {
            node.sourceLinks.forEach(function(link) {
                link.sy = 0;
                link.ty = 0;
            });
        });
    }


    function ascendingSourceDepth(a, b) {
      return a.source.y - b.source.y;
    }

    function ascendingTargetDepth(a, b) {
      return a.target.y - b.target.y;
    }
  }

  function center(node) {
    return node.y + node.dy / 2;
  }

  function value(link) {
    return link.value;
  }

  function computeRealHeights() {
    var dh = sankey.displayHeight();
    var scale = (dh == 1) ? 1 : dh / sankey.size()[1];
    nodes.forEach(function(node) {
      node.ht = node.y * scale;
      node.dy = node.dy * scale;
    });
    links.forEach(function(link) {
        link.dy *= scale;
        link.sy *= scale;
        link.ty *= scale;
    });
  }

  return sankey;
};


var mysankey = function() {
    var mysankey = {};

    var contexts = undefined,
        words = undefined,
        data = undefined,
        view = d3.select(".view3"),
        sankey = undefined,
        node = undefined,
        link = undefined;

    /* configurable by menu item */
    var nodeWidth = 15,
        useValues = true,
        nodePadding = 10,
        useColors = 1,
        skinnyEdges = 0,
        customLayout = 1,
        customSort = 1,
        fullHeight = 0,
        useLabels = false;

    mysankey.contexts = function(_) {
        if (!arguments.length) 
             return contexts;
        contexts = _;
        return mysankey;
    }

    mysankey.words = function(_) {
        if (!arguments.length)
            return words;
        words = _;
        return mysankey;
    }

    mysankey.view = function(_) {
        if (!arguments.length)
            return view;
        view = _;
        return mysankey;
    }

    mysankey.nodeWidth = function(_) {
        if (!arguments.length)
            return nodeWidth;
        nodeWidth = _;
        return mysankey;
    }

    mysankey.useValues = function(_) {
        if (!arguments.length)
            return useValues;
        useValues = _;
        return mysankey;
    }
    
    mysankey.useLabels = function(_) {
        if (!arguments.length)
            return useLabels;
        useLabels = _;
        return mysankey;
    }

    mysankey.nodePadding = function(_) {
        if (!arguments.length)
            return nodePadding;
        nodePadding = _;
        return mysankey;
    }

    mysankey.useColors = function(_) {
        if (!arguments.length)
            return useColors;
        useColors = _;
        return mysankey;
    }

    mysankey.skinnyEdges = function(_) {
        if (!arguments.length)
            return skinnyEdges;
        skinnyEdges = _;
        return mysankey;
    }

    mysankey.customLayout = function(_) {
        if (!arguments.length)
            return customLayout;
        customLayout = _;
        return mysankey;
    }

    mysankey.customSort = function(_) {
        if (!arguments.length)
            return customSort;
        customSort = _;
        return mysankey;
    }
    
    mysankey.fullHeight = function(_) {
        if (!arguments.length)
            return fullHeight;
        fullHeight = _;
        return mysankey;
    }



    mysankey.draw = function() {
        
        data = getSankeyData(words, contexts); 
   
        var fake_height = calcHeight(data.nodes, 10);

        var margin = {top: 1, right: 1, bottom: 6, left: 1};
        var width = parseInt(view.style('width')) - margin.left - margin.right;
        var height = fullHeight ? fake_height : parseInt(view.style('height')) - margin.top - margin.bottom;  

        var formatNumber = d3.format(",.0f"),
            format = function(d) { return formatNumber(d); },
            color = d3.scale.category20();

        if (useColors)
            applyColorScheme(data.nodes);
        else {
            data.nodes.forEach(function(d) {
                    d.color = color(d.name.replace(/ .*/, ""))
            });
        }
     
        view.select("svg").remove(); 
        var svg = view.append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height",height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        sankey = d3.sankey()
            .nodeWidth(nodeWidth)
            .nodePadding(nodePadding)
            .size([width, fake_height])
            .displayHeight(height)
            .useValues(useValues)
            .customLayout(customLayout)
            .customSort(customSort ? orderByPosition : undefined);

        var path = sankey.link();

        sankey
          .nodes(data.nodes)
          .links(data.links)
          .layout(32);
       
        link = svg.append("g").selectAll(".link")
          .data(data.links)
            .enter().append("path")
          .attr("class", "link")
          .attr("d", path)
          .style("stroke-width", function(d) { return Math.max(1, d.dy); })
          .sort(function(a, b) { return b.dy - a.dy; });

        link.append("title")
          .text(function(d) {
                var contexts = d.contexts.join('\n');
                return d.source.name + " → " + d.target.name + " (" + format(d.value) + ")\n" + contexts;
          });

        node = svg.append("g").selectAll(".node")
            .data(data.nodes)
            .enter().append("g")
            .attr("class", "node")
            .attr("transform", function(d) { return "translate(" + d.x + "," + d.ht + ")"; }) 
            .call(d3.behavior.drag()
                .origin(function(d) { return d; })
                .on("dragstart", function() { this.parentNode.appendChild(this); })
                .on("drag", dragmove));
            
        node.append("rect")
            .attr("height", function(d) { return d.dy; })
            .attr("width", sankey.nodeWidth())
            .style("fill", function(d) { return d.color; })
            .style("stroke", function(d) { return d3.rgb(d.color).darker(2); })
            .append("title")
                .text(function(d) {
                        var contexts = d.sourceLinks.concat(d.targetLinks)
                            .reduce(function(acc, l) { return acc.concat(l.contexts) }, []);
                        contexts = arrayUnique(contexts);
                        return d.name + " (" + format(d.value) + ")\n" + contexts.join('\n'); 
                  });

    
        
        if (useLabels)
            addLabels();

        function dragmove(d) {
            d.ht += d3.event.dy;
            d.y = d.ht * (fake_height / height);
            d3.select(this).attr("transform", "translate(" + d.x + "," + d.ht + ")");
            sankey.relayout();
            link.attr("d", path);
        }

  
        /* Path highlighting */
    
        /* Given a link, highlight the entire path. */
        function highlightPath(lk) {
            lk.classed("sel", true);
            var edge = lk.datum();

            function getallnodes(e) {
                var edges = [e].concat(e.next, e.prev);
                return edges
                    .reduce(function(nl, edge) { return nl.concat(edge.target, edge.source); }, []);
            }

            link.each(function (d) {
                if (edge.prev.indexOf(d) >= 0 || edge.next.indexOf(d) >= 0) {
                    d3.select(this).classed("sel", true);
                }
            });
            var nd = getallnodes(edge);
            node.each(function(d) {
                if (nd.indexOf(d) >= 0) { 
                    d3.select(this).classed("unsel", false);
                    d.selected = true;
                }
                else if (! d.selected) {
                    d3.select(this).classed("unsel", true);
                }
            });

        }

        function unHighlight() {
            var x = {"sel": false, "unsel":false};
            link.classed(x);
            node.classed(x);
            node.each(function(d) { d.selected = false; });
        }
        
        function highlightNode(nd) {
            //var nd = n.datum();
            link.each(function (d) {
                if (d.source == nd || d.target == nd) {
                        highlightPath(d3.select(this));
                    }
                }); 
        }

        var linkon = function() {
             var lk = d3.select(d3.event.target);
                highlightPath(lk);
        }
        var nodeon = function() {
             var nd = d3.select(d3.event.target).datum();
             highlightNode(nd);  
        }
       
        var highlightOn = function() {
            link.on("mouseover", linkon);
            link.on("mouseout", unHighlight);
            node.on("mouseover", nodeon);
            node.on("mouseout", unHighlight);
        }
        highlightOn();

        var highlightOff = function() {
           link
                .on("mouseover", undefined)
                .on("mouseout", undefined);
           node 
                .on("mouseover", undefined)
                .on("mouseout", undefined);
        }
        return mysankey;
    }

   /* Menu items */

    /*
    function cbfunc(f1, f2) {
        return function () { this.checked ? f1() : f2() }
    }

    d3.selectAll(".attr")
        .on("change", update);
    d3.select("#uselabels")
        .on("change", cbfunc(addLabels, function() { svg.selectAll("text").remove() }));
    function lsfunc(n) {
        return function() {
            link.transition().style("stroke-width", n);
        }
    }
    d3.select("#skinnyedges")
        .on("change", cbfunc(lsfunc(1), lsfunc(function(d) { return Math.max(1, d.dy); })));

    d3.select("#viewwidth")
        .on("change", redraw);

    d3.select("#usecolors")
        .on("change", function() {
            if (this.checked) {
                applyColorScheme(data.nodes);
            }
            else {
                data.nodes.forEach(function(d) {
                    d.color = color(d.name.replace(/ ./, "")); // put a * after period
                });
            }
            node.selectAll("rect")
                .transition()
                .style("fill", function(d) { return d.color; })
                .style("stroke", function(d) { return d3.rgb(d.color).darker(2); })
        });
   
    d3.select("#colorgo")
        .on("click", function() {
            var pos = getvalue("colorpos");
            var col = getvalue("colorcol");
            applyColorScheme.colors[pos] = col;
            applyColorScheme(data.nodes);
            node.selectAll("rect")
                .transition()
                .style("fill", function(d) { return d.color; })
                .style("stroke", function(d) { return d3.rgb(d.color).darker(2); })
         
                });


    d3.select("#searchbox")
    .on("change", function() {
        var s = d3.event.target.value;
        node.each(function(d) {
            if (d.name == s) {
             selectNode(this, d);            
          }
       });
        setHighlightOn();
     });
    */

    /*
    function selectNode(that, d) {
        highlightNode(d);  
        var text = d3.select(that).select("title").html();
        var g = d3.select("#chart svg")
            .append("g")
            .attr("transform", that.getAttribute("transform"))
            .attr("class", "tooltip")

        var lines = text.split('\n')
        g.append("foreignObject")
            .attr("x", 6 + sankey.nodeWidth())
            .attr("width", 100)
            .attr("height", lines.length * 14)
            .attr("y", d.dy/2)
            .attr("requiredExtensions","http://www.w3.org/1999/xhtml")
            .html("<div class='tooltip'>" + lines.join('<br>') + "</div>")
       highlightOff();
    }

    function setHighlightOn() {
         d3.select("body").on("click", function() {
            unHighlight();
            this.onclick = null; 
            d3.selectAll(".tooltip").remove();
            highlightOn();
        });
    }
    */

    mysankey.update = function() {

        var nodeWidth = getvalue("nodewidth");
        var useValues = ischecked("usevalues");
        var nodePadding = getvalue("nodepadding");
        var useColors = ischecked("usecolors");
        var skinnyEdges = ischecked("skinnyedges");
        var customLayout = ischecked("customlayout");
        var customSort = ischecked("customsort");

        sankey 
            .nodeWidth(nodeWidth)
            .nodePadding(nodePadding)
            .useValues(useValues)
            .customLayout(customLayout)
            .customSort(customSort ? orderByPosition : undefined);
        sankey
            .layout(32);
 
        link
            .transition()
            .attr("d", path)
            .style("stroke-width", skinnyEdges ? 1 : function(d) { return Math.max(1, d.dy); })

        node
            .transition()
            .attr("transform", function(d) { return "translate(" + d.x + "," + d.ht + ")"; }) 

        node.selectAll("rect")
            .transition()
            .attr("height", function(d) { return d.dy; })
            .attr("width", sankey.nodeWidth())
            .style("fill", function(d) { return d.color; })
            .style("stroke", function(d) { return d3.rgb(d.color).darker(2); })

        node.selectAll("text")
            .transition()
            .attr("y", function(d) { return d.dy / 2; })
            .attr("dy", ".35em")
            .attr("x", 6 + sankey.nodeWidth())
    }

    return mysankey
}

function addLabels() {
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
        }


function calcHeight(nodes, nodepadding) {
   
    // height = max (over columns) of (nodePadding * (sum(i, v_i))) ) */
    //var ht = d3.max(nodesByBreadth, function(nodes) { return nodepadding * d3.sum(nodes, function(d) { return d.value } ); }); 
  
    var ht = nodepadding * nodes.length;

    return ht;
}


function applyColorScheme(nodes) {
    var nodesByPos = {}
    for(var i = -2; i <= 2; i++)
        nodesByPos[i] = nodes.filter(function(n) { return n.pos == i; });

    function getmask(n) {
        var mask = []
        for (var i = -2; i <= 2; i++) {
            nodesByPos[i].forEach(function (m) {
                if(m.name == n.name)
                    mask.push(i);
            });
        }
        return mask;
    }
    if (! applyColorScheme.colors)
        applyColorScheme.colors =
            { "-2": "pink",
            "-1": "red",
            "0": "black",
            "1": "blue",
            "2": "lightblue",
            "-2,-1": "orange",
            "1,2": "green" };
  
    nodes.forEach(function(n) {
        var mask = getmask(n);
        n.mask = mask;
        n.color = applyColorScheme.colors[mask] || "grey";
    });
    
}

function orderByPosition(n, m)
{
    var nm = Math.abs(d3.sum(n.mask));
    var mm = Math.abs(d3.sum(m.mask));
    return nm == mm ? n.value < m.value : nm < mm;
}

var arrayUnique = function(a) {
    return a.reduce(function(p, c) {
        if (p.indexOf(c) < 0) p.push(c);
        return p;
    }, []);
};

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
    
    var edgeadd = function (n, m, ctx) {
        var src = getidx(n);
        var tar = getidx(m);

        for (var i = 0; i < edges.length; i++) {
            if (edges[i].source == src && edges[i].target == tar) {
                edges[i].value++;
                edges[i].contexts.push(ctx);
                return edges[i];
            }
        }
        var edge = {"source":src, "target":tar, "value":1, "prev":[], "next":[], "contexts": [ctx]};
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
            var fst = nodeadd(w, 0);
            var snd = nodeadd(cs[1], 1);
            var thd = nodeadd(cs[2], 2);
        }
        else if (cs[1] == "__") {
            var fst = nodeadd(cs[0], -1);
            var snd = nodeadd(w, 0);
            var thd = nodeadd(cs[2], 1);
        }
        else if (cs[2] == "__") {
            var fst = nodeadd(cs[0], -2);
            var snd = nodeadd(cs[1], -1);
            var thd = nodeadd(w, 0);
        }
        else
            console.log("mayday! bad data.");

        ctx = ctx.replace('__', w);
        var e = edgeadd(fst, snd, ctx);
        var f = edgeadd(snd, thd, ctx);
        e.next.push(f); /* This is for path highlighting. */
        f.prev.push(e);
     }
  }


   return {"nodes":nodes, "links":edges};
}

