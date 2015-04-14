#! /bin/bash

# /* Designing Hypermedia APIs by Mike Amundsen (2011) */
# 2011-04-08 (mca) maze-data for couchdb

clear
echo '2011-04-08 (mca) maze-data for couchdb'

echo 'creating db...'
curl -vX DELETE http://localhost:5984/maze-data
curl -vX PUT http://localhost:5984/maze-data

echo 'adding maze data...'
curl -vX PUT http://localhost:5984/maze-data/five-by-five -d @five-by-five.json

echo 'adding design document...'
curl -vX PUT http://localhost:5984/maze-data/_design/example -d @design-doc.json

echo 'testing views...'
curl -v http://localhost:5984/maze-data/_design/example/_view/foo

echo 'testing shows...'
curl -v -H accept:application/json http://localhost:5984/maze-data/_design/example/_show/cells/five-by-five
echo '.'

echo 'testing validator...'
curl -vX PUT http://localhost:5984/maze-data/test-by-test -d @five-by-five.json

echo '*** all passed ***'
