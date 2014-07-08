var express = require('express');
var app = express();
app.listen(9876, function(){
    console.log('Express listening port 9876...');
});

var count = 0;

app.get('/', function(req, res){
    var a = req.query.a;
    var b = req.query.b;
    var c = req.query.c;
    count++;
    console.log('%d : %s  -- %s -- %s --', count, a, b, c);
    res.send(a + ' * ' + b + ' * ' + c + ' >> ' + count);
});

