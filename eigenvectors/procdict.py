import json, sys

f = open('2of12id.txt')

d = {}

for line in f:
    arr = line.strip().split(' ')
    if len(arr) >= 2:
        d[arr[0].strip("~")] = arr[1].strip(":")
    if len(arr) >= 3:
        d[arr[2].strip("~")] = arr[1].strip(":")
 
json.dump(d, sys.stdout)
