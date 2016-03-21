var test = require('tap').test;
var sf = require('../');
var fs = require('fs');
var through = require('through');

var file = __dirname + '/data/write.txt';
var ws = fs.createWriteStream(file, { flags: 'w' });

test(function (t) {
    t.plan(1);
    
    var lines = [];
    var xs = sf(file);
    
    xs.follow(-3).pipe(through(write, end));
    ws.write('beep boop\n');
    
    setTimeout(function () {
        xs.close();
    }, 500);
    
    function write (line) {
        lines.push(line);
    }
    
    function end () {
        t.deepEqual(lines, [ 'beep boop\n' ]);
    }
});
