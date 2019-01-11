# Node.js Framework used

For my RESTful API I used [expressjs](https://expressjs.com/) framework.

# Endpoints
## Get a block

To get a block from the blockchain make a GET request on `http://localhost:8000/block/:index`

## To create a new block

To create a new block with some data inside make a POST request at `http://localhost:8000/block`
The POST must be JSON encoded and contains a `body` field.
For example:
```
    {
        "body": "This is a new block"
    }
```
