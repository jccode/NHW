
angular.module("nhw.controllers", ['nhw.services'])

    .controller('LoginCtrl', ['$scope', '$rootScope', '$state', 'User', function($scope, $rootScope, $state, User) {
        $scope.login = function (user) {
            // console.log(user);
            // console.log( User.all() );
            
            var available = User.isAuthenticated(user);
            if( available ){
                $scope.error = "";
                $rootScope.user = available;
                User.storeUserToLocalStorage(available);
                $state.go('app.checkin');

            } else {
                $scope.error = "Sorry, you're not authorized to use this app.";
            }
        };

    }])

    .controller('NavCtrl', ['$scope', function($scope) {
        
    }])

    .controller('CheckInCtrl', ['$scope', '$state', 'User', function($scope, $state, User) {

        $scope.scanBarcode = function () {
            // console.log(User.currUser());
            $state.go('app.index');
        };

    }])

    .controller('AppIndexCtrl', ['$scope', function($scope) {

        // $scope.user = ;
        
    }])

    .controller('FloorsCtrl', ['$scope', '$state', 'Floors', function($scope, $state, Floors) {
        $scope.floors = Floors.all();
        $scope.select_floor = function (floorId) {
            // console.log(floor);
            $state.go('app.floor_select', { 'floorId': floorId });
        };

    }])

    .controller('FloorSelectCtrl', ['$scope', '$stateParams', 'Floors', '$window', function($scope, $stateParams, Floors, $window) {
        var floorId = $stateParams.floorId;
        Floors.findById(floorId).then(function(floor) {
            floor.free = floor.workspace - floor.present_people;
            $scope.floor = floor;
        });

        var svg_wrapper_size = function() {
            var el_wrapper = document.getElementById("svg-wrapper"), 
                style = el_wrapper.currentStyle || $window.getComputedStyle(el_wrapper);
            return {
                "w": el_wrapper.offsetWidth,
                "h": el_wrapper.offsetHeight - (parseInt(style.paddingBottom, 10) + parseInt(style.paddingTop, 10))
            };
        }


        $scope.msgs = [];
        // svg
        var margin = {top: -5, right: -5, bottom: -5, left: -5},
            ws = svg_wrapper_size(), 
            width = ws["w"], 
            height = ws["h"];

        var zoom = d3.behavior.zoom()
                .scaleExtent([1, 10])
                .on('zoomstart', zoomstarted)
                .on('zoom', zoomed)
                .on('zoomend', zoomended);

        var svg = d3.select("#svg-wrapper").append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
                .append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.right + ")" )
                .call(zoom);

        var rect = svg.append("rect")
                .attr('width', width)
                .attr('height', height)
                .style('fill', 'none')
                .style('pointer-events', 'all');

        var container = svg.append('g');

        var innersvg; 
        d3.xml('img/map.svg', 'image/svg+xml', function(xml) {
            innersvg = container.append('g')
                .append(function() {
                    return xml.documentElement;
                });

            innersvgLoaded();
        });


        function zoomstarted() {
            // d3.event.sourceEvent.stopPropagation();
            // console.log(d3.event.sourceEvent);
            // $ionicSideMenuDelegate.canDragContent(false);
        }

        function zoomended() {
            // $ionicSideMenuDelegate.canDragContent(true);
        }

        function zoomed() {
            container.attr("transform", "translate("+ d3.event.translate +") scale("+ d3.event.scale +")");
        }


        // init when inner svg loaded
        function innersvgLoaded() {

            // init seat state, add click event
            // innersvg.selectAll(".seat")
            //     .classed('green', true)
            //     .on('touch', function() {

            //         $scope.$apply(function() {
            //             var p = '[' + $filter('date')(new Date, 'HH:mm:ss.sss') + '] ';
            //             $scope.msgs.push(p + 'rect is clicked.');
            //             $timeout(function() {
            //                 $scope.msgs.splice(0, 1);
            //             }, 3000);
            //         });

            //     });


            function init_state() {
                var unavailable_seats = Floors.getUnAvailableSeatsByFloor(floorId);
                innersvg.selectAll("[id^='circle']").classed('seat-available', true);
                _.each(unavailable_seats, function(item) {
                    innersvg.select("#circle" + item.seat)
                        .classed({"seat-available": false, "seat-unavailable": true})
                        .attr("data-user", item.userId);
                });
            }

            function add_event_handler() {
                innersvg.selectAll("[id^='circle']").on("click", function() {
                    var el = d3.select(this);

                    // toggle state
                    el.classed("seat-available") ? el.classed({
                        "seat-available": false,
                        "seat-unavailable": true
                    }) : el.classed({
                        "seat-available": true,
                        "seat-unavailable": false
                    });

                });
            }

            init_state();
            add_event_handler();
        }


        // register a resize handler
        $window.onresize = function() {
            $scope.$apply(function() {
                ws = svg_wrapper_size();
                // width = $window.innerWidth - margin.left - margin.right;
                // height = $window.innerHeight / 2 - margin.top - margin.bottom;
                width = ws["w"];
                height = ws["h"];
                d3.select("#svg-wrapper").select("svg")
                    .attr({
                        'width': width + margin.left + margin.right,
                        'height': height + margin.top + margin.bottom
                    })
                    .select('rect')
                    .attr({
                        'width': width,
                        'height': height
                    });
            });
        }
                
    }])
;
