#!/usr/bin/env python
 
import sys

def makegraph(lines):
    nodes = []
    edges = [] 
    for l in lines:
        if (not l.startswith('#')):
            words = l.split(' ')
            word = words[0].strip()
            if word not in nodes:
                nodes.append(word)
            for w in words[1:]:
                w = w.strip()
                if w not in nodes:
                    nodes.append(w) 
                edges.append((nodes.index(word), nodes.index(w)))


    nodes_str = "["
    for w in nodes:
        nodes_str += '{"label": "%s", "id": "%d", "color": "blue"},' % (w, nodes.index(w))
    nodes_str = nodes_str[:-1] + "]"
    
    edges_str = "["
    for e in edges:
        edges_str += '{"source": %d, "target": %d},' % e
    edges_str = edges_str[:-1] + "]"

    return nodes_str, edges_str


def makecontexts(lines):
    contexts = dict()
    for l in lines:
        if (not l.startswith('#')):
            split = l.split("\t")
            w = split[0]
            cs = [c.strip() for c in split[1:]]
            contexts[w] = cs
    ctx_str = "{\n"
    for ctx in contexts:
        cs = "[\n"
        for c in contexts[ctx]:
            cs += '"{}", '.format(c)
        cs = cs[:-2] + "]"
        ctx_str += '"{}" : {},\n'.format(ctx, cs)
    ctx_str = ctx_str[:-2] + "\n]"

    return ctx_str

def printjson(nodes, edges, contexts):
    print '{'
    print '"nodes" : ' + nodes + ","
    print '"edges" : ' + edges + ","
    print '"contexts" : ' + contexts
    print '}'

def main():
   
    if len(sys.argv) < 2:
        print "Usage: tst2json.py <nearest-neighbors-file> <contexts-file>"
        exit(1)

    gf = open(sys.argv[1])
    cf = open(sys.argv[2])

    nodes, edges = makegraph(gf)
    ctx = makecontexts(cf)

    printjson(nodes, edges, ctx)

    return 0


if __name__ == "__main__":
    main()


