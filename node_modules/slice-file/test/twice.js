var test = require('tap').test;
var sliceFile = require('../');
var through = require('through');
var fs = require('fs');
var wordFile = __dirname + '/data/words';

test('slice twice on the same instance', function (t) {
    t.plan(2);
    
    var xs = sliceFile(wordFile);
    var first = [];
    var second = [];
    
    xs.slice(-5).pipe(through(
        function (line) {
            first.push(line.toString('utf8'));
        },
        function () {
            t.deepEqual(first, [
                "épée's\n",
                "épées\n",
                "étude\n",
                "étude's\n",
                "études\n",
            ]);
            
            xs.slice(-10, -5).pipe(through(
                function (line) {
                    second.push(line.toString('utf8'));
                },
                function () {
                    t.deepEqual(second, [
                        "élan's\n",
                        "émigré\n",
                        "émigré's\n",
                        "émigrés\n",
                        "épée\n"
                    ]);
                }
            ));
        }
    ));
});
