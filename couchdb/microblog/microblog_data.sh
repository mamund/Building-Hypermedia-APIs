#! /bin/bash

# /* Designing Hypermedia APIs by Mike Amundsen (2011) */
# 2011-06.21 (mca) html5-microblog data for couchdb

SVR=http://localhost:5984
CT='content-type:application/json'

clear
echo '2011-06-21 (mca) html5-microblog for couchdb'

echo 'creating db...'
curl -vX DELETE $SVR/html5-microblog
curl -vX PUT $SVR/html5-microblog

echo 'adding design document...'
curl -vX PUT $SVR/html5-microblog/_design/microblog -H $CT -d @design-doc.json

echo 'adding users...'
curl -vX PUT $SVR/html5-microblog/mamund -H $CT -d @user-mamund.json
curl -vX PUT $SVR/html5-microblog/lee -H $CT -d @user-lee.json
curl -vX PUT $SVR/html5-microblog/benjamin -H $CT -d @user-benjamin.json
curl -vX PUT $SVR/html5-microblog/mary -H $CT -d @user-mary.json

echo 'testing user views...'
curl -v $SVR/html5-microblog/_design/microblog/_view/users_all
curl -v $SVR/html5-microblog/_design/microblog/_view/users_by_id?startkey=\"m\"\&endkey=\"m\\u9999\"

echo 'adding posts...'
curl -vX POST $SVR/html5-microblog/ -H $CT -d @post-mamund1.json
curl -vX POST $SVR/html5-microblog/ -H $CT -d @post-mamund2.json
curl -vX POST $SVR/html5-microblog/ -H $CT -d @post-lee1.json
curl -vX POST $SVR/html5-microblog/ -H $CT -d @post-benjamin1.json
curl -vX POST $SVR/html5-microblog/ -H $CT -d @post-mary1.json

echo 'testing post views...'
curl -v $SVR/html5-microblog/_design/microblog/_view/posts_all?descending=true
curl -v $SVR/html5-microblog/_design/microblog/_view/posts_by_user?descending=true\&key=\"mamund\"
curl -v $SVR/html5-microblog/_design/microblog/_view/posts_search?startkey=\"ma\"\&endkey=\"ma\\u9999\"

echo 'adding follows...'
curl -vX POST $SVR/html5-microblog/ -H $CT -d @follows-mamund.json
curl -vX POST $SVR/html5-microblog/ -H $CT -d @follows-lee.json
curl -vX POST $SVR/html5-microblog/ -H $CT -d @follows-benjamin.json
curl -vX POST $SVR/html5-microblog/ -H $CT -d @follows-mamund2.json

echo 'testing follow views...'
curl -v $SVR/html5-microblog/_design/microblog/_view/follows_user_is_following?include_docs=true\&key=\"mamund\"
curl -v $SVR/html5-microblog/_design/microblog/_view/follows_is_following_user?include_docs=true\&key=\"mamund\"

echo 'testing posts from followers view...'
curl -vX POST $SVR/html5-microblog/_design/microblog/_view/posts_by_user -H $CT -d @posts_by_user.json

