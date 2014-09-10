import BaseHTTPServer
import CGIHTTPServer
import cgitb; cgitb.enable()  ## This line enables CGI error reporting

server = BaseHTTPServer.HTTPServer
handler = CGIHTTPServer.CGIHTTPRequestHandler
server_address = ("", 7567)
handler.cgi_directories = ["/cgibin"]

httpd = server(server_address, handler)
httpd.serve_forever()
