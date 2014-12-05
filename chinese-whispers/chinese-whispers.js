/* 
 * This is an implementation of the Chinese Whispers algorithm adapted for use with D3.
 * The algorithm's specification is here:
 * http://wortschatz.uni-leipzig.de/~cbiemann/pub/2006/BiemannTextGraph06.pdf
 * We change terminology and use "group" instead of "class", to avoid confusion with CSS classes or Javascript classes.
 */

var makeWhispers = function () {
    var whispers = {}, nodes, edges, animateTicks, dispatch = d3.dispatch("start", "tick", "step", "end");
    /* pop a random node from queue */
    function popRand(queue) {
        var i = Math.floor(Math.random() * queue.length);
        var obj = queue[i];
        queue.splice(i, 1);
        return obj;
    }
    /* replacement for d3.timer - not limited to speed of animation updates, amd stoppable */
    function timer(f, delay) {
        var stop = false;
        dispatch.on("end.code", function () {
            stop = true;
        });
        dispatch.on("start.code", function () {
            stop = false;
            g();
        });
        function g() {
            if (!(f() || stop))
                setTimeout(g, delay);
            else {
                dispatch.end({ "type": "end", "nodes": nodes });
                dispatch.on("start.code", whispers.run);
            }
        }
        g();
    }
    whispers.run = function () {
        var groups = [];
        nodes.forEach(function (d, i) {
            d.group = i;
            d.inEdges = [];
            groups[i] = 1;
        });
        edges.forEach(function (d) {
            d.target.inEdges.push(d);
        });
        var nSame = 0, queue = [];
        function tickEachTick() {
            var node = popRand(queue);
            if (!node) {
                queue = nodes.slice(0);
                var nochange = (nSame == queue.length);
                nSame = 0;
                dispatch.step({ "type": "step", "groups": groups });
                if (nochange)
                    dispatch.end({ "type": "end", "nodes": nodes });
                return (nochange == true) ? true : undefined;
            }
            var group = newNodeGroup(node);
            if (group == node.group)
                nSame += 1;
            groups[node.group] -= 1;
            groups[group] = (groups[group] || 0) + 1;
            node.group = group;
            dispatch.tick({ "type": "tick", "groups": groups });
            return false;
        }
        function tickEachStep() {
            var nSame = 0;
            while (queue.length != 0) {
                var node = popRand(queue);
                var group = newNodeGroup(node);
                if (group == node.group)
                    nSame += 1;
                groups[node.group] -= 1;
                groups[group] = (groups[group] || 0) + 1;
                node.group = group;
            }
            dispatch.step({ "type": "step", "groups": groups });
            queue = nodes.slice(0);
            return (nSame == queue.length);
        }
        var tick = animateTicks ? tickEachTick : tickEachStep;
        timer(tick, 0);
    };
    function newNodeGroup(node) {
        var groups = {};
        node.inEdges.forEach(function (d) {
            groups[d.source.group] = d.value;
        });
        var max = 0, group = node.group;
        for (var k in groups) {
            if (groups[k] >= max) {
                group = k;
                max = groups[k];
            }
        }
        return group;
    }
    whispers.nodes = function (_) {
        if (!arguments.length)
            return nodes;
        else {
            nodes = _;
            return whispers;
        }
    };
    whispers.edges = function (_) {
        if (!arguments.length)
            return edges;
        else {
            edges = _;
            return whispers;
        }
    };
    whispers.animateTicks = function (_) {
        if (!arguments.length)
            return animateTicks;
        else {
            animateTicks = _;
            return whispers;
        }
    };
    dispatch.on("start.code", whispers.run);
    return d3.rebind(whispers, dispatch, "on", "end", "start");
};
