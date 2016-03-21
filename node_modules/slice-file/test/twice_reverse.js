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
    
    xs.sliceReverse(-5).pipe(through(
        function (line) {
            first.push(line.toString('utf8'));
        },
        function () {
            t.deepEqual(first, [
                "études\n",
                "étude's\n",
                "étude\n",
                "épées\n",
                "épée's\n"
            ]);
            
            xs.sliceReverse(-10, -5).pipe(through(
                function (line) {
                    second.push(line.toString('utf8'));
                },
                function () {
                    t.deepEqual(second, [
                        "épée\n",
                        "émigrés\n",
                        "émigré's\n",
                        "émigré\n",
                        "élan's\n"
                    ]);
                }
            ));
        }
    ));
});
