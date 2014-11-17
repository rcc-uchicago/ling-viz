var graph = undefined,
    mysankey = undefined,
    contexts = undefined,
    makeGraph = graphSVG // default graph type


function main(error, json) {
    if (error) {
        console.log(error);
        alert("Error!");
        return;
    }

    graph =  makeGraph()
        .nodes(json.nodes)
        .edges(json.edges);
    
    d3.select('.view1').call(graph);

    contexts = json.contexts;
}


function updateList() {
    var items = d3.select("#selectedNodes")
        .selectAll("li")
        .data(graph.selectedNodes(), function(d) { return d });
    items
        .enter()
        .append("li")
        .append("a")
        .attr("href", '#')
        .on("click", function(d) {
            graph.unSelectNode(d)
            updateList()
        })
        .text(function(d) { return d; });
    items
        .exit()
        .remove();
}



function drawContextTable() {
    
    var view = d3.select(".view2")
    view.selectAll('*').remove()
    var table = view.append("table")
    
    var contexts = contexts; // no point since this is global now, but could change.
    var selected_nodes = graph.selectedNodes();

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
        if (graph.selectedNodes().indexOf(node) > 0)
            graph.unSelectNode(node)
        else
            graph.selectNode(node)
        updateList()
    });


d3.select("#drawTable")
    .on("click", drawContextTable)

d3.select("#drawSankey")
    .on("click", function() {
        mysankey = makeSankey()
            .words(graph.selectedNodes())
            .contexts(contexts);
        d3.select('.view3').call(mysankey)
    }) 

d3.select("#graphType")
    .on("change", function() {

        makeGraph =  (d3.event.target.value == "svg") ? graphSVG : graphCanvas
        if (!graph)
            return;
        
        var new_graph = makeGraph()
        
        new_graph
            .nodes(graph.nodes())
            .edges(graph.edges());
   
        var v = d3.select('.view1')
        v.selectAll('*').remove()
        v.call(new_graph);

        graph = new_graph
    });

d3.select("#centerGraph")
    .on("click", function() {
        graph.center() // if we didn't have an extra function here, we would center the wrong graph (I think)
    });

d3.select("#stopGraph")
    .on("click", function() {
        graph.stop()
    });



/* Sankey controls */

/* "Templating" for the similar sankey controls */
var sankeyUpdates = [
    {"id": "s_usevalues", "change": function() { mysankey.useValues(d3.event.target.checked); } },
    {"id": "s_nodewidth", "change": function() { mysankey.nodeWidth(+d3.event.target.value); } },
    {"id": "s_nodepadding", "change": function() { mysankey.nodePadding(+d3.event.target.value) } },
    {"id": "s_customlayout", "change": function() { mysankey.customLayout(d3.event.target.checked) } },
    {"id": "s_customsort", "change": function() { mysankey.customSort(d3.event.target.checked) } }
]

sankeyUpdates.forEach(function(d) {
    d3.select("#" + d.id).on("change", function() { 
        d.change()
        mysankey.update();
    });
})


d3.select("#s_usecolors").on("change", function() {
    mysankey.useColors(d3.event.target.checked);
    mysankey.updateColors();
});

d3.select("#s_uselabels").on("change", function() { 
    mysankey.useLabels(d3.event.target.checked);
    mysankey.toggleLabels()
});

d3.select("#s_skinnyedges").on("change", function() {
    mysankey.skinnyEdges(d3.event.target.checked);
    mysankey.redrawEdges();
});

d3.select("#s_colorgo").on("click", function() {
    var pos = d3.select("#s_colorpos").node().value;
    var col = d3.select("#s_colorcol").node().value;
    mysankey.updateColorScheme(pos, col)
        .updateColors();
});

d3.select("#s_searchbox").on("change", function() {
    var s = d3.event.target.value;
    mysankey.selectNodeByName(s);
});

d3.select("#s_fullheight").on("change", function() {
    mysankey.fullHeight(d3.event.target.checked);    
    var view = d3.select('.view3')
    view.selectAll('*').remove()
    view.call(mysankey)
}) 

