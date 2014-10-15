
angular.module("nhw.controllers", ['nhw.services'])

    .controller('LoginCtrl', ['$scope', '$rootScope', '$state', 'User', 'LicenseServer', 'Util', 'Bootstrap', function($scope, $rootScope, $state, User, LicenseServer, Util, Bootstrap) {
        $scope.login = function (user) {
            /*
            User.isAuthenticated(user).then(function(ret) {
                if( ret ){
                    $scope.error = "";
                    $rootScope.curr_user = ret;
                    User.storeUserToLocalStorage(ret);
                    $state.go('app.checkin');

                } else {
                    $scope.error = "Sorry, you're not authorized to use this app.";
                }
            }, function() {
                $scope.error = "Sorry, you're not authorized to use this app.";
            });
             */


            var errorHandler = function() {
                $scope.error = "Sorry, you're not authorized to use this app.";
            }

            LicenseServer.getCustomerServerURL(user.authKey).then(function(ret) {
                if(ret) {       // authenticated by license server
                    Util.setCustomerServerURL(ret, user.email);
                    User.isAuthenticated(user).then(function(ret) {
                        if( ret ){
                            $scope.error = "";
                            $rootScope.curr_user = ret;
                            Util.currUser(ret);
                            
                            // $state.go('app.checkin');
                            // $state.go('home');

                            $scope.loading = true;
                            Bootstrap.syncData(function(ret) {
                                $scope.loading = false;
                                if(ret) {
                                    $state.go('app.checkin');
                                } else {
                                    $scope.error = "Sorry, some error occured when loading data from server";
                                }
                            });

                        } else {
                            errorHandler();
                        }
                    }, errorHandler);
                    
                }
                else {          // reject by license server
                    errorHandler();
                }
            }, errorHandler);
            
        };

    }])

    .controller('LoadingCtrl', ['$scope', function($scope) {
        
    }])

    .controller('NavCtrl', ['$scope', function($scope) {
        
    }])

    .controller('CheckInCtrl', ['$scope', '$state', 'Util', 'SessionStorage', function($scope, $state, Util, SessionStorage) {

        $scope.scanBarcode = function () {
            
            if(!cordova) {      // For desktop browser
                $state.go('app.index');
                return ;
            }

            cordova.plugins.barcodeScanner.scan(function(result) {

                // console.log(JSON.stringify(result));
                
                var text = result.text;
                var ret = Util.parseBarcode(text);
                if(!ret) {
                    var msg = 'Sorry, the barcode is not for HNW application!<br>'
                            + 'Barcode content is: <br>'
                            + text;

                    $scope.$apply(function() {
                        $scope.error = msg;
                    });
                    
                } else {
                    SessionStorage.set(STORAGE_KEYS.SEAT_WILLING_CHECKIN, ret);
                    $state.go('app.index');
                }
                
            }, function(error) {
                 $scope.$apply(function() {
                    $scope.error = error;
                });
            });

        };

    }])

    .controller('AppIndexCtrl', ['$scope', '$stateParams', 'Util', function($scope, $stateParams, Util) {
        $scope.user = Util.currUser();

        // data cannot be passed. if we want to achieve this purpose. we need to redefine the url to
        // include the parameters.
        $scope.floor = $stateParams.floorId;
        $scope.seat = $stateParams.seat;
        
    }])

    .controller('FloorsCtrl', ['$scope', '$state', 'Floors', function($scope, $state, Floors) {
        $scope.floors = Floors.all();
        $scope.select_floor = function (floorId) {
            // console.log(floor);
            $state.go('app.floor_select', { 'floorId': floorId });
        };

    }])

    .controller('FloorSelectCtrl', ['$scope', '$stateParams', 'Floors', '$window', 'User', function($scope, $stateParams, Floors, $window, User) {
        var floorId = $stateParams.floorId;
        $scope.floorId = floorId;
        Floors.findById(floorId).then(function(floor) {
            floor.free = floor.workspace - floor.present_people;
            $scope.floor = floor;
        });

    }])

    .controller('SvgCtrl', ['$scope', '$stateParams', 'Floors', '$window', 'User', '$modal', '$log', '$state', function($scope, $stateParams, Floors, $window, User, $modal, $log, $state) {
        // var floorId = $stateParams.floorId;
        var floorId = $scope.$parent.floorId;

        var svg_wrapper_size = function() {
            var el_wrapper = document.getElementById("svg-wrapper"), 
                style = el_wrapper.currentStyle || $window.getComputedStyle(el_wrapper);
            return {
                "w": el_wrapper.offsetWidth,
                "h": el_wrapper.offsetHeight - (parseInt(style.paddingBottom, 10) + parseInt(style.paddingTop, 10))
            };
        }

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
                innersvg.selectAll("[id^='circle']").on("click", function(d, i) {
                    var el = d3.select(this);
                    var seat = el.attr("id").substring(6);

                    var coord = d3.mouse(this); //coord: [width, height]
                    // console.log(coord[0] + ',' + coord[1]);
                    

                    // toggle state
                    /*
                    el.classed("seat-available") ? el.classed({
                        "seat-available": false,
                        "seat-unavailable": true
                    }) : el.classed({
                        "seat-available": true,
                        "seat-unavailable": false
                    });
                     */

                    $scope.seat = seat;

                    var userId = el.attr("data-user");
                    if (userId) {
                        User.findById(userId).then(function(user) {
                            $scope.user = user;
                        });
                    }

                    var t = userId? "user": "workspace";
                    $scope.$apply(function() {
                        $scope.popup = t;
                    });
                    
                    var popup = d3.select("#" + t + "_popup");
                    var pos = calc_popup_pos(popup.node(), coord)
                    popup.style({
                        left: pos[0]+'px',
                        top: pos[1]+'px'
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

        /**
         * Calcuate the popup window position
         *
         * coords: Array. [left, top] of the mouse pointer
         */
        function calc_popup_pos(el, coords) {
            var cw = ws["w"],
                ch = ws["h"],
                ew = el.offsetWidth,
                eh = el.offsetHeight,
                l = coords[0],
                t = coords[1];

            // console.log("cw:"+cw+" ch:"+ch+" ew:"+ew+" eh:"+eh+" l:"+l+" t:"+t);

            if (t + eh > ch) {
                t = (ch - eh)/2;
            }
            if (l + ew > cw) {
                l = (cw - ew)/2;
            }
            
            return [l, t];
        }


        $scope.confirm_checkin = function () {
            $scope.popup = false;
            var modalInstance = $modal.open({
                templateUrl: 'checkin_modal.html',
                controller: 'CheckInModalCtrl',
                windowClass: 'mymodal',
                size: 'sm', 
                resolve: {
                    data: function() {
                        return {
                            floor: floorId,
                            seat: $scope.seat
                        };
                    }

                }
            });

            modalInstance.result.then(function(ret) {
                // success
                // $log.info('button "' + ret + '" clicked at: ' + new Date());
                var data = {
                    'floorId': floorId,
                    'seat': $scope.seat
                };
                $state.go("app.index", data);
                
            }, function() {
                // dismissed
                $log.info('Modal dismissed at: ' + new Date());
            });
        };


    }])

    .controller('CheckInModalCtrl', ['$scope', '$modalInstance', 'Util', 'data', function($scope, $modalInstance, Util, data) {
        $scope.data = data;
        $scope.curr_user = Util.currUser();

        $scope.ok = function (n) {
            $modalInstance.close(n);
        };

        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };
    }])

    .controller('ProfileCtrl', ['$scope', 'Util', function($scope, Util) {
        $scope.curr_user = Util.currUser();
    }])

    .controller('EmployeesCtrl', ['$scope', 'User', function($scope, User) {
        $scope.employees = User.all();
    }])

;
