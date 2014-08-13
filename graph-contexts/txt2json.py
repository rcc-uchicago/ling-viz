#!/usr/bin/env python
 
import sys
import json

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
                edge = dict()
                edges.append({"source":nodes.index(word), "target":nodes.index(w)})
    nodes_d = []
    i = 0
    for w in nodes:
        nodes_d.append({"label": w, "id": i, "color": "blue"})

    return nodes_d, edges


def makecontexts(lines):
    contexts = dict()
    for l in lines:
        if (not l.startswith('#')):
            split = l.split("\t")
            w = split[0]
            cs = [c.strip() for c in split[1:]]
            cs.sort()
            contexts[w] = cs
    return contexts

def printjson(nodes, edges, contexts):
    j = dict()
    j["nodes"] = nodes
    j["edges"] = edges
    j["contexts"] = contexts
    json.dump(j, sys.stdout)
    
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


