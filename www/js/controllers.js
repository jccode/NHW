
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

    .controller('CheckInCtrl', ['$scope', '$state', 'Util', 'Floors', function($scope, $state, Util, Floors) {

        $scope.scanBarcode = function () {

            if(Util.isCordovaNotSupport()) {      // For desktop, skip scanning barcode
                // auto checkin.
                Floors.all().$promise.then(function(data) {
                    var floorId = data[0]['FloorId'];
                    Floors.reserveseat(floorId).then(function(data) {
                        var seat = parseInt(data);
                        var param = {f: floorId, s:seat};
                        $state.go('app.floor_select', param);
                    });
                });
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
                    $state.go('app.floor_select', {f: ret['floor'], s: ret['seat']});
                }
                
            }, function(error) {
                 $scope.$apply(function() {
                    $scope.error = error;
                });
            });

        };

    }])

    .controller('AppIndexCtrl', ['$scope', '$stateParams', 'Util', 'Floors', function($scope, $stateParams, Util, Floors) {
        var floorId = $stateParams.f,
            seat = $stateParams.s;
        $scope.user = Util.currUser();
        $scope.floor = Floors.findById(floorId);
        $scope.seat = seat;
        
    }])

    .controller('FloorsCtrl', ['$scope', '$state', 'Floors', function($scope, $state, Floors) {
        $scope.floors = Floors.all();
        $scope.select_floor = function (floorId) {
            // console.log(floor);
            $state.go('app.floor_select', { 'f': floorId });
        };
        $scope.auto_reserve = function (floorId, seatRemain) {
            // console.log(floorId + '; ' + seatRemain);
            if(seatRemain <= 0) {
                // popup a notification to user that not any seat available
                return ;
            }
            Floors.reserveseat(floorId).then(function(data) {
                var seat = parseInt(data);
                $state.go('app.floor_select', {'f': floorId, 's': seat});
            });
        };

    }])

    .controller('FloorSelectCtrl', ['$scope', '$state', '$stateParams', 'Floors', '$window', 'User', function($scope, $state, $stateParams, Floors, $window, User) {
        var floorId = $stateParams.f,
            seat = $stateParams.s;
        if(seat) {
            $scope.confirm_checkin = true;
        }

        Floors.findById(floorId).$promise.then(function(floor) {
            floor.free = floor.SeatCount - floor.NonEmptySeat;
            $scope.floor = floor;
        });

        $scope.auto_reserve = function (floorId) {
            Floors.reserveseat(floorId).then(function(data) {
                if(data) {
                    var seat = parseInt(data);
                    $state.go('app.floor_select', {'f': floorId, 's': seat});
                }
            });
        };

    }])

    .controller('SvgCtrl', ['$scope', '$stateParams', 'Floors', '$window', 'User', '$modal', '$log', '$state', 'SessionStorage', function($scope, $stateParams, Floors, $window, User, $modal, $log, $state, SessionStorage) {
        var floorId = $stateParams.f,
            seat = $stateParams.s, 
            confirm_checkin = $scope.$parent.confirm_checkin;
        $scope.floor = Floors.findById(floorId);


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
                            floor: $scope.floor,
                            seat: $scope.seat
                        };
                    }

                }
            });

            modalInstance.result.then(function(ret) {
                // success
                // $log.info('button "' + ret + '" clicked at: ' + new Date());
                var seat = $scope.seat;
                var param = {
                    'f': floorId,
                    's': seat
                };
                
                Floors.checkin(floorId, seat).then(function(ret) {
                    if(ret) {
                        
                        $state.go("app.index", param);
                    } else {
                        // popup an error message
                    }
                });

                
            }, function() {
                // dismissed
                $log.info('Modal dismissed at: ' + new Date());
            });
        };

        
        // barcode scan, auto checkin
        if(confirm_checkin) {
            $scope.seat = seat;
            $scope.confirm_checkin();
        }
        
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

    .controller('EmployeesCtrl', ['$scope', 'Util', 'User', function($scope, Util, User) {
        var customer_url = Util.getCustomerServerURL();
        $scope.baseurl = customer_url.substring(0, customer_url.length - 3);
        $scope.employees = User.all();
    }])

;
