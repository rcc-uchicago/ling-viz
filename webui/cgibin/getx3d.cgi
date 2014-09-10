#!/bin/bash


# This is a hack to enable autogenerated X3D files to be transported from the browser to a FreeWRL instance.
# This only works because the browser is running on the same computer as FreeWRL.
# This is a bad idea.

# Change this variable to the location of your firefox profile:
PROFILE_DIR="/Users/sdjacobs/Library/Application Support/Firefox/Profiles/ma81ou27.default"

# The name of the server (or directory)
SERVER=localhost
PORT=7567

db="$PROFILE_DIR/webappsstore.sqlite"
scope="$(echo $SERVER | rev).:http:$PORT"
key="data.x3d"
query="select value from webappsstore2 where scope=\"$scope\" and key=\"$key\";"

echo "model/x3d+xml"
echo

echo $query | sqlite3 "$db"