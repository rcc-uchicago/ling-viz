NW=/home/simon/rcc/goldsmith/node-webkit-v0.9.2-linux-x64/nw
publish_dest=midway.rcc.uchicago.edu:~/public_html/dataviz

app.nw: index.html package.json d3.js graphutils.js
	zip app.nw index.html package.json d3.js graphutils.js

run: app.nw
	$(NW) app.nw

publish:
	rsync -av index.html graphutils.js d3.js $(publish_dest)
