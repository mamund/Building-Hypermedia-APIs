# Building Hypermedia APIs

2011-12-09 (mca)

Source code for the O'Reilly book of the same name.

## Getting the book

O'Reilly Page
<https://www.oreilly.com/library/view/building-hypermedia-apis/9781449309497/>

Amazon Buy Page
<http://www.amazon.com/gp/product/1449306578/>

## Installation guide

To run the example applications in the book, you need:

- [Node](https://nodejs.org/en/download/)
- [Docker](https://docs.docker.com/get-docker/)
- CouchDB (see below)
- Unix shell

### CouchDB

The example applications in chapters 2, 3 and 4 in the book use CouchDB. To start a CouchDB instance in a Docker container, run the following command:

```sh
docker run -p 5984:5984 -d --name my-couchdb couchdb:2.3.1
```

Verify CouchDB installation by going to <http://127.0.0.1:5984/_utils/#/verifyinstall>

To populate the DB for each example run the shell scripts in the corresponding folders in `couchdb/`.

### Node dependencies

Install Node dependencies by running the following command:

```bash
npm install
```
