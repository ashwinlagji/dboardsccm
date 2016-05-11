angular
    .module('RDash')
    .directive('chartWordcloud', ['$parse', '$http', '$compile', '$templateCache', '$window', function ($parse, $http, $compile, $templateCache, $window) {
        var directive = {};
        directive.scope = {
            data: '='
            , options: '='
        };
        directive.restrict = 'EA';
        directive.link = function (scope, elem, attr) {
            var frequency_list = scope.data; ///place ur data here
            var options = scope.options;
            options.width = options.width - 160;


            var w = (options.width > 880) ? 440 : options.width;
            console.log("w=" + w);
            
            scope.$watchCollection('data', function (newVal, oldVal) {
                
                frequency_list = newVal;
                console.log("redraw chart with"+frequency_list);
                redrawChart();
                console.log(newVal.length);
            });

            function drawWordCloud() {
                    
                var color = d3.scale.category20();
                var angle = 0;
                var i = 0;

                d3.layout.cloud().size([w, options.height]).font("Chiller")
                    .words(frequency_list)
                    .rotate(function () {
                    i = i % 2 == 0 ? 1 : 0;
                    return ~~(i * 2) * 45;
                })
                    .spiral('rectangular')
                    .fontSize(function (d) {
                    return d.size / 50 * 2 + 10;
                })
                    .padding(5)
                    .on("end", draw)
                    .start();

                function draw(words) {

                    d3.select("chart-Wordcloud").select('svg').remove();
                    var svg = d3.select("chart-Wordcloud").append("svg");

                    svg.attr("width", w)
                        .attr("height", 450)
                        .attr("class", "wordcloud")
                        .append("g")
                    // without the transform, words words would get cutoff to the left and top, they would
                    // appear outside of the SVG area
                        .attr("transform", "translate( " + ~~(w / 2) + "," + ~~(options.height / 2) + ")")
                        .selectAll("text")
                        .data(words)
                        .enter().append("text")
                        .style("font-size", function (d) {
                        return d.size + "px";
                    })
                        .style("fill", function (d, i) {
                        return color(i) || "#77f";
                    })
                        .attr("text-anchor", "middle")
                        .attr("transform", function (d) {
                        return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
                    })
                        .text(function (d) {
                        return d.text;
                    });
                    console.log(words.length);
                }
            }

            function redrawChart() {

                drawWordCloud();
            }

        };
        return directive;
    }]);