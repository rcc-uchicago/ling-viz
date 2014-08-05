#!/usr/bin/env python
 
import sys
from PyQt4.QtCore import *
from PyQt4.QtGui import *
from PyQt4.QtWebKit import *

def addngen(lines, word, nodes, edges, gen):    
    for l in lines:
        if l.startswith(word + " "): # add space so "people" doesn't select against "people's ..."
            for w in l.split(' ')[1:]:
                w = w.strip()
                if w not in nodes:
                    nodes.append(w)
                    if gen > 1:
                        addngen(lines, w, nodes, edges, gen - 1)
                edges.append((nodes.index(word), nodes.index(w)))

def makegraph(lines, word, ngen):
    nodes = [word]
    edges = list()
    addngen(lines, word, nodes, edges, ngen)

    nodes_str = "["
    for w in nodes:
        nodes_str += '{"label": "%s", "id": "%d", "color": "blue"},' % (w, nodes.index(w))
    nodes_str = nodes_str[:-1] + "]"
    
    edges_str = "["
    for e in edges:
        edges_str += '{"source": %d, "target": %d},' % e
    edges_str = edges_str[:-1] + "]"

    return nodes_str, edges_str




class VizWindow(QMainWindow):

    width = 800
    height = 500

  
    @pyqtSlot(result=str)
    def getNodes(self):
        return self.nodes
    
    @pyqtSlot(result=str)
    def getEdges(self):
        return self.edges


    def __init__(self, lines, word, gen):

        super(VizWindow, self).__init__()
    
        self.lines = lines
        self.word = word
        self.ngen = ngen

        self.setWindowTitle("Graph viz")
        web = QWebView(self)
        self.resize(self.width, self.height)
        
        web.load(QUrl("index-sm.html"))
        self.setCentralWidget(web)

        main_frame = web.page().mainFrame()
        doc_element = main_frame.documentElement()
        main_frame.titleChanged.connect(lambda: self.plotGraph(main_frame))
    
    def plotGraph(self, main_frame):
        
        self.nodes, self.edges = make_graph(self.lines, self.words, self.ngen)

        doc_element = main_frame.documentElement()
        main_frame.addToJavaScriptWindowObject("MainWindow", self)
        
        self.resize(width, height)
        
        svg = doc_element.findFirst("svg")
        svg.removeAllChildren() # maybe this is a replot
        svg.setAttribute(QString("width"), QString(str(self.width)))
        svg.setAttribute(QString("height"), QString(str(self.height)))

        svg.evaluateJavaScript("""
        
            var nodes = JSON.parse(MainWindow.getNodes())
            var edges = JSON.parse(MainWindow.getEdges())
            plotGraph(d3.select('svg'), nodes, edges)
            
            d3.selectAll("circle").on("click", function() { MainWindow.handleClick(d3.event.target.id, document) });
       

       """)

    @pyqtSlot(QString, QWebElement)
    def handleClick(self, label, doc_elem):
        print label
        self.name = label
        self.plotGraph(doc_elem.webFrame())


def graph2d(nodes, edges): 
    app = QApplication(list())
    web = VizWindow(nodes, edges)
    web.show()
 
    return app.exec_()


def main():
   
    if len(sys.argv) < 3:
        print "Usage: browser.py <nearest-neighbors-file> <word> <nGen>"
        exit(1)

    with open(sys.argv[1]) as xs:
        word = sys.argv[2]
        ngen = int(sys.argv[3])
        #nodes, edges = makegraph(xs.readlines(), word, ngen)
        #graph2d(nodes, edges)
        app = QApplication(list())
        web = VizWindow(xs.readlines(), word, ngen)
        web.show()

    return app.exec_()


if __name__ == "__main__":
    main()

