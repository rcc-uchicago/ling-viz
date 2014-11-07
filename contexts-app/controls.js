var graph = undefined,
    mysankey = undefined

function main(error, json) {
    if (error) {
        console.log(error);
        alert("Error!");
        return;
    }

    graph = graph()
        .nodes(json.nodes)
        .edges(json.edges)
        .draw()
    graph.contexts = json.contexts;
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
    
    var contexts = graph.contexts;
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
        mysankey = mysankey()
            .words(graph.selectedNodes())
            .contexts(graph.contexts)
            .draw();
    }) 
