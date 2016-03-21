var test = require('tap').test;
var lf = require('../');
var through = require('through');
var fs = require('fs');
var wordFile = __dirname + '/data/words';

test('short reverse tail', function (t) {
    t.plan(11);
    
    var xs = lf(wordFile);
    var res = [];
    
    xs.sliceReverse(-10).pipe(through(write, end));
    
    function write (line) {
        t.ok(Buffer.isBuffer(line));
        res.push(String(line));
    }
    
    function end () {
        t.deepEqual(res, [
            "études\n",
            "étude's\n",
            "étude\n",
            "épées\n",
            "épée's\n",
            "épée\n",
            "émigrés\n",
            "émigré's\n",
            "émigré\n",
            "élan's\n",
        ]);
    }
});

test('long reverse tail', function (t) {
    var lines = fs.readFileSync(wordFile, 'utf8').split('\n');
    lines.pop();
    
    var xs = lf(wordFile);
    
    var amounts = [ 10, 100, 500, 1000, 5000, 10000 ];
    t.plan(amounts.length);
    
    (function shift () {
        if (amounts.length === 0) return;
        var n = amounts.shift();
        console.log('n=' + n);
        var res = [];
        
        xs.sliceReverse(-n).pipe(through(write, end));
        
        function write (line) {
            res.push(String(line).trim());
        }
        
        function end () {
            t.deepEqual(res, lines.slice(-n).reverse());
            shift();
        }
    })();
});
