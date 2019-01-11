const express = require('express');
const bodyParser = require('body-parser');
const blockRoute = require('./routes/block');
const app = express();

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended:true}))

// parse application/json
app.use(bodyParser.json())

app.use('/block', blockRoute);

app.listen(8000, () => console.log("App running on port 8000"));
