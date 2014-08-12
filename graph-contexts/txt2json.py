#!/usr/bin/env python
 
import sys
import json

def trim(data, n):


    nd = data["nodes"]
    ed = data["edges"]
    ctx = data["contexts"]

    def goodedge(e):
        e["source"]

    data2 = dict()
    nd2 = nd[:n]
    
    ed2 = list()
    for e in ed:
        src = nd[e["source"]]
        tar = nd[e["target"]]
        if src in nd2 and tar in nd2:
            ed2.append({"source": nd2.index(src), "target": nd2.index(tar)})
    
    ctx2 = dict()
    for no in nd2:
        n = no["label"]
        if n in ctx:
            ctx2[n] = ctx[n]
    ctx2 = { c: ctx[c] for c in sorted(ctx2) }
   

    data2["nodes"] = nd
    data2["edges"] = ed2
    data2["contexts"] = ctx2
    return data2

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

