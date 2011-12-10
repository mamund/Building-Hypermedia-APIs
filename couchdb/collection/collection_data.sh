#! /bin/bash

#/* Designing Hypermedia APIs by Mike Amundsen (2011) */
# 2011-05.20 (mca) collection-data-tasks for couchdb

clear
echo '2011-05-20 (mca) collection-data-tasks for couchdb'

echo 'creating db...'
curl -vX DELETE http://localhost:5984/collection-data-tasks
curl -vX PUT http://localhost:5984/collection-data-tasks

echo 'adding design document...'
curl -vX PUT http://localhost:5984/collection-data-tasks/_design/example -d @design-doc.json

echo 'adding collection data...'
curl -vX PUT http://localhost:5984/collection-data-tasks/task1 -d @task1.json
curl -vX PUT http://localhost:5984/collection-data-tasks/task2 -d @task2.json
curl -vX PUT http://localhost:5984/collection-data-tasks/task3 -d @task3.json

echo 'testing views...'
curl -v http://localhost:5984/collection-data-tasks/_design/example/_view/all
curl -v http://localhost:5984/collection-data-tasks/_design/example/_view/open
curl -v http://localhost:5984/collection-data-tasks/_design/example/_view/closed
curl -v http://localhost:5984/collection-data-tasks/_design/example/_view/due_date?startkey=\"2011-12-30\"
curl -v http://localhost:5984/collection-data-tasks/_design/example/_view/due_date?endkey=\"2011-12-30\"
curl -v http://localhost:5984/collection-data-tasks/_design/example/_view/due_date?startkey=\"2011-12-30\"&endkey=\"2011-12-31\"
curl -v http://localhost:5984/collection-data-tasks/_design/example/_view/due_date

# echo 'testing shows...'
# curl -v -H accept:application/json http://localhost:5984/collection-data-tasks/_design/example/_show/tasks
# echo '.'

# echo 'testing validator...'
# curl -vX PUT http://localhost:5984/collection-data-tasks/task2 -d @task1.json

# echo '*** all passed ***'
