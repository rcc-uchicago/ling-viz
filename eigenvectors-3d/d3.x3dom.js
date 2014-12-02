d3.x3dom = {};

d3.x3dom.shape = function() {

    var color = function(x) { return (x && x.color) ? x.color : 'black' }
    
    var translation = function(d) {
        function toString(x) {
            return x ? x.toString() : "0";
        }
        return [d.x, d.y, d.z].map(toString).join(" ");
    }

    var type = "sphere"
    var attributes = {}

    function shape(node) {
      var sh = node
            .attr("translation", translation)
            .append("shape")

      sh.append("appearance")
        .append("material")
        .attr("diffuseColor", color)

      sh.append(type)
        .attr(attributes);
    }

    shape.type = function (_) {
        if (!_)
            return type;
        type = _;
        return shape;
    }

    shape.color = function (_) {
        if (!_)
            return color;
        color = (_ instanceof Function) ? (_) : (function() { return _ });
        return shape
    }

    shape.translation = function (_) {
        if (!_)
            return translation;
        translation = (_ instanceof Function) ? (_) : (function() { return _ });
        return shape
    }

    shape.attr = function(k, v) {
        if (!v) {
            return attributes[k];
        }
        else {
            attributes[k] = v
            return shape;
        }
    }

    return shape;   
}

function _line_(p) {
    var tos = function(x) { return x ? x.toString() : "0" };
    var args = Array.prototype.slice.call(arguments, 1);
    var point = args.map(tos).join(" ");
    p.html("<IndexedLineSet coordIndex='0 1'><Coordinate point='" + point + "' /></IndexedLineSet>")
}

/* This is harder to use then the line function, above */
d3.x3dom.line = function() {
    var coordinates = undefined;
  
    function line(s) {
        var args = Array.prototype.slice.call(arguments, 1);
        var coords = args.length ? args : coordinates
        
        s.append("indexedlineset").attr("coordIndex", "0 1")
            .append("coordinate").attr("point", coords);
            
        return s;
    }
    
    line.coordinates = function (_) {
        if (!arguments.length)
            return coordinates;
        coordinates = (_ instanceof Function) ? (_) : (function() { return _ });
        return line
    }
  
    return line;
    
}


