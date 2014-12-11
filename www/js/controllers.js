
angular.module("nhw.controllers", ['nhw.services'])

    .controller('LoginCtrl', ['$scope', '$rootScope', '$state', 'User', 'LicenseServer', 'Util', 'Bootstrap', function($scope, $rootScope, $state, User, LicenseServer, Util, Bootstrap) {

        var errorHandler = function() {
            // you are not authorized to use this app.
            $scope.error = "U bent niet geautoriseerd om gebruik te maken van deze applicatie.";
            $scope.loading = false;
        }
        
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

            $scope.loading = true;
            LicenseServer.getCustomerServerURL(user.authKey).then(function(ret) {
                if(ret) {       // authenticated by license server
                    Util.setCustomerServerURL(ret, user.email);
                    User.isAuthenticated(user).then(function(ret) {
                        if( ret ){
                            $scope.error = "";
                            $rootScope.cuser = ret;
                            ret.email = ret.email.toLowerCase();
                            Util.currUser(ret);
                            $rootScope.picurl = Util.getPictureRootUrl();
                            
                            // $state.go('app.checkin');
                            // $state.go('home');

                            console.log('when login, start check and enable bluetooth');
                            Bootstrap.initBeaconModel();
                            Bootstrap.checkAndEnableBluetooth();
                            
                            Bootstrap.preloadSvgFiles().then(function() {
                                    
                                $scope.loading = false;
                                User.hasCheckIn().then(function(info) {
                                    if(info) {
                                        var floorId = info["FloorId"],
                                            seat = parseInt(info["SeatCode"]);
                                        $state.go('app.index', {f:floorId, s:seat}, {location: false});
                                        $rootScope.$broadcast(EVENTS.CHECKIN_STATE_CHANGE);
                                        // angular.element(document.getElementById('navbar')).scope().$emit(EVENTS.CHECKIN_STATE_CHANGE);
                                    } else {
                                        $state.go('app.checkin');
                                    }
                                }, errorHandler);

                                Bootstrap.preloadUserPics();

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

    .controller('SidebarCtrl', ['$scope', 'CtrlService', 'User', function($scope, CtrlService, User) {
        
        var checkinState = function() {
            var promise = User.hasCheckIn();
            if(promise) {
                promise.then(function(ret) {
                    $scope.hascheckin = !!ret;
                });
            }
        };

        // User.isAuthenticated().then(function(ret) {
        //     $scope.authenticated = ret;
        // });

        checkinState();
        $scope.$on(EVENTS.CHECKIN_STATE_CHANGE, checkinState);
        
        $scope.checkout_confirm = CtrlService.checkout_confirm;
    }])

    .controller('NavCtrl', ['$scope', '$state', '$modal', '$log', 'User', 'Util', 'CtrlService', function($scope, $state, $modal, $log, User, Util, CtrlService) {
        // $scope.cuser = Util.currUser();
        
        var checkinState = function() {
            var promise = User.hasCheckIn();
            if(promise) {
                promise.then(function(ret) {
                    $scope.hascheckin = !!ret;
                });
            }
        };

        checkinState();
        $scope.$on(EVENTS.CHECKIN_STATE_CHANGE, checkinState);

        $scope.checkout_confirm = CtrlService.checkout_confirm;

        /*
        $scope.checkout = function () {
            User.checkout().then(function(ret) {
                if(ret) {
                    $state.go("app.checkin");
                    $scope.$emit(EVENTS.CHECKIN_STATE_CHANGE);
                } else {
                    // notify user that checkout failed
                    console.log("user checkout failed");
                }
            });
        };

        $scope.checkout_confirm = function () {
            var modalInstance = $modal.open({
                templateUrl: 'confirm_checkout_modal.html',
                controller:  'CheckInModalCtrl',
                windowClass: 'mymodal',
                size: 'sm',
                resolve: {
                    data: function() {
                        return {};
                    }
                }
            });
            
            modalInstance.result.then(function(ret) {
                // click on buttons. 'true' if click yes, 'false' if click no.
                if(ret) {
                    $scope.checkout();
                }
                
            }, function() {
                // dismissed
                $log.info('Modal dismissed at: ' + new Date());
            });            
        };
         */

    }])

    .controller('CheckInCtrl', ['$scope', '$state', '$sce', '$modal', '$log', '$window', 'Util', 'Floors', function($scope, $state, $sce, $modal, $log, $window, Util, Floors) {

        $scope.scanBarcode = function () {

            // console.log( Util.isCordovaNotSupport() );
            if(Util.isCordovaNotSupport()) {      // For desktop, skip scanning barcode
                // auto checkin.
                Floors.all().$promise.then(function(data) {
                    var floorId = data[0]['FloorId'];
                    Floors.reserveseat(floorId).then(function(data) {
                        var seat = parseInt(data);
                        var param = {f: floorId, s:seat};
                        $state.go('app.floor_select', param, {location: false});
                    });
                });
                return ;
            }

            cordova.plugins.barcodeScanner.scan(function(result) {

                // console.log(JSON.stringify(result));

                var text = result.text;
                var ret = Util.parseBarcode(text);
                if(!ret) {
                    var msg = 'De QR code is niet geldig.<br>';
                            // + 'Barcode content is: <br>'
                            // + text;

                    $scope.$apply(function() {
                        $scope.error = $sce.trustAsHtml(msg);
                    });
                    
                } else {
                    Floors.findByBuildingNoAndFloorNo(ret['building'], ret['floor']).$promise.then(function(floor) {
                        $state.go('app.floor_select', {f: floor['FloorId'], s: ret['seat']}, {location: false});
                    });
                }
                
            }, function(error) {
                $scope.$apply(function() {
                    $scope.error = $sce.trustAsHtml(error);
                });
            });

        };

        // firstuse_modal.html

        $scope.showRuleScreen = function() {
            
            var modalInstance = $modal.open({
                templateUrl: 'firstuse_modal.html',
                controller:  'CheckInModalCtrl',
                windowClass: 'mymodal',
                size: 'sm',
                resolve: {
                    data: function() {
                        return {};
                    }
                }
            });
            
            modalInstance.result.then(function(ret) {
                // success
                
            }, function() {
                // dismissed
                $log.info('Modal dismissed at: ' + new Date());
            });
        }

    }])

    .controller('AppIndexCtrl', ['$scope', '$rootScope', '$state', '$stateParams', 'Util', 'Floors', 'User', function($scope, $rootScope, $state, $stateParams, Util, Floors, User) {
        var floorId = $stateParams.f,
            seat = $stateParams.s;
        // $scope.user = Util.currUser();
        $scope.floor = Floors.findById(floorId);
        $scope.seat = seat;
        // $scope.baseurl = Util.getPictureRootUrl();

        $scope.checkout = function () {
            User.checkout().then(function(ret) {
                if(ret) {
                    $state.go("app.checkin");
                    $rootScope.$broadcast(EVENTS.CHECKIN_STATE_CHANGE);
                } else {
                    // notify user that checkout failed
                    console.log("user checkout failed");
                }
            });
        };

        $scope.reflush = function () {
            $rootScope.$broadcast(EVENTS.UPDATE_SVG_STATUS);
        };

    }])

    .controller('BuildingsCtrl', ['$scope', '$state', '$stateParams', 'Building', function($scope, $state, $stateParams, Building) {
        $scope.buildings = Building.all();
        
    }])

    .controller('FloorsCtrl', ['$scope', '$state', '$stateParams', 'Floors', 'Building', function($scope, $state, $stateParams, Floors, Building) {
        var buildingId = $stateParams.buildingId;
        $scope.floors = Floors.floorsByBuildingId(buildingId);
        // $scope.floors = [
        //     {FloorNum: 1, NonEmptySeat: 70, SeatCount: 100, FloorId: 1}, 
        //     {FloorNum: 2, NonEmptySeat: 70, SeatCount: 100, FloorId: 2}, 
        //     {FloorNum: 3, NonEmptySeat: 70, SeatCount: 100, FloorId: 3}
        // ];
        
        Building.seatCount(buildingId).then(function(ret) {
            $scope.countInfo = ret;
        });
        $scope.auto_reserve = function (floorId, seatRemain) {
            // console.log(floorId + '; ' + seatRemain);
            if(seatRemain <= 0) {
                // popup a notification to user that not any seat available
                return ;
            }
            Floors.reserveseat(floorId).then(function(data) {
                var seat = parseInt(data);
                $state.go('app.floor_select', {'f': floorId, 's': seat}, {location: false});
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
                    $state.go('app.floor_select', {'f': floorId, 's': seat}, {location: false, reload: true});
                }
            });
        };

    }])

    .controller('SvgCtrl', ['$scope', '$rootScope', '$stateParams', 'Floors', '$window', 'User', '$modal', '$log', '$state', 'Util', 'SVG', 'CtrlService', function($scope, $rootScope, $stateParams, Floors, $window, User, $modal, $log, $state, Util, SVG, CtrlService) {
        var floorId = $stateParams.f,
            seat = $stateParams.s, 
            confirm_checkin = $scope.$parent.confirm_checkin;
        var cuser = $rootScope.cuser;
        var hascheckin = false;

        // auto-checkin
        Floors.findById(floorId).$promise.then(function(floor) {
            $scope.floor = floor;
            if(confirm_checkin) {
                $scope.seat = seat;
                $scope.confirm_checkin();
            }
        });

        // svg
        var svg = new SVG(floorId, seat);
        svg.load().then(function() {

            /*
            svg.init_seat_state();

            User.hasCheckIn().then(function(ret) {
                if(ret) {
                    hascheckin = true;
                    var el = svg.innersvg.select("#circle" + parseInt(ret.SeatCode));
                    var classes = {
                        "seat-available": false,
                        "seat-unavailable": false,
                        "seat-cuser": true
                    };
                    el.classed(classes).attr("data-user", cuser.id);

                    svg.center_map();
                }
            });
             */
            
            load_svg_status(function(ret) {
                if(ret) {
                    hascheckin = true;
                    svg.center_map();
                }
            });

            svg.bind_event(function(d) {
                var el = d3.select(d);
                var seat = el.attr("id").substring(6);
                var coord = d3.mouse(d); //coord: [width, height]
                
                $scope.seat = seat;

                var userId = el.attr("data-user");
                if (userId) {
                    User.findById(userId).$promise.then(function(user) {
                        $scope.user = user;
                    });
                    User.isFavourite(userId).then(function(ret) {
                        $scope.isFavourited = ret;
                    });
                }

                var t = (el.classed('seat-cuser') || el.classed('seat-unavailable'))
                        ? "user"
                        : (hascheckin && $rootScope.isInBuilding ? "seat_change" : "workspace");

                // disallow user to change seat, if user not in building
                // if(!$rootScope.isInBuilding && t == "seat_change")  {
                //     return;
                // }
                
                $scope.$apply(function() {
                    $scope.popup = t;
                });
                
                var popup = d3.select("#" + t + "_popup");
                var pos = calc_popup_pos(popup.node(), coord);
                popup.style({
                    left: pos[0]+'px',
                    top: pos[1]+'px'
                });
                
                // set color on the current select node
                restore_last_selected_seat();
                if(el.classed('seat-available')) {
                    $scope.last_selected_seat = el;
                    el.classed({
                        'seat-available': false,
                        'seat-seleted': true
                    });
                }                
            });
            
        });
        

        function restore_last_selected_seat() {
            if($scope.last_selected_seat) {
                $scope.last_selected_seat.classed({
                    'seat-available': true,
                    'seat-seleted': false
                });
            }
        }

        $scope.close_popup = function () {
            restore_last_selected_seat();
            $scope.popup = false;
        };


        /**
         * Calcuate the popup window position
         *
         * coords: Array. [left, top] of the mouse pointer
         */
        function calc_popup_pos(el, coords) {
            var ws = svg.wrapper_size(), 
                cw = ws["w"],
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
                    // $log.info("try to check-in " + seat + " , ret:" + ret['data']);
                    if(ret && ret['data']) {
                        // $state.go("app.index", param);
                        // $rootScope.$broadcast(EVENTS.CHECKIN_STATE_CHANGE);
                        
                        $state.go("home");
                    } else {
                        // popup an error message
                        // This seat is reserve by other person. Pls try the other seat
                        Util.toast('Deze werkplek is al in gebruik. Graag een andere werkplek selecteren.');
                    }
                });

                
            }, function() {
                // dismissed
                $log.info('Modal dismissed at: ' + new Date());
            });
        };

        $scope.toggle_favourite = CtrlService.toggle_favourite;
        

        function load_svg_status(callback) {
            svg.init_seat_state();

            User.hasCheckIn().then(function(ret) {
                if(ret) {
                    var el = svg.innersvg.select("#circle" + parseInt(ret.SeatCode));
                    var classes = {
                        "seat-available": false,
                        "seat-unavailable": false,
                        "seat-cuser": true
                    };
                    el.classed(classes).attr("data-user", cuser.id);

                }
                callback && callback(ret);
            });
        }

        // update svg status
        $scope.$on(EVENTS.UPDATE_SVG_STATUS, function(e) {
            svg.reset_seat_state();
            load_svg_status(function(ret) {
                if(!ret) {
                    $state.go("home");
                }
            });
        });
    }])

    .controller('CheckInModalCtrl', ['$scope', '$modalInstance', 'Util', 'data', function($scope, $modalInstance, Util, data) {
        $scope.data = data;
        // $scope.curr_user = Util.currUser();
        // $scope.baseurl = Util.getPictureRootUrl();

        $scope.ok = function (n) {
            $modalInstance.close(n);
        };

        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };
    }])

    .controller('ProfileCtrl', ['$scope', '$stateParams', '$rootScope', '$window', 'User', 'Util', 'SVG', 'CtrlService', function($scope, $stateParams, $rootScope, $window, User, Util, SVG, CtrlService) {
        var uid = $stateParams.uid;
        $scope.user = User.findById(uid);
        $scope.iscuser = uid == $rootScope.cuser.id; 
        // $scope.baseurl = Util.getPictureRootUrl();
        User.favoriteCount(uid).then(function(ret) {
            $scope.favourite_count = ret || 0;
        });
        User.isFavourite(uid).then(function(ret) {
            $scope.isFavourited = ret;
        });
        User.hasCheckIn(uid).then(function(ret) {
            $scope.checkinInfo = ret;

            if(ret) {
                var svg = new SVG(ret.FloorId, parseInt(ret.SeatCode));
                svg.load().then(function(svg) {
                    svg.init_seat_state();

                    var classes = {
                        "seat-available": false,
                        "seat-unavailable": false
                    };
                    if($scope.iscuser) {
                        classes["seat-cuser"] = true;
                    } else {
                        classes["seat-me"] = true;
                    }
                    
                    var el = svg.innersvg.select("#circle"+svg.seat);
                    el.classed(classes).attr("data-user", uid);

                    angular.element($window).triggerHandler('resize');
                    // setTimeout(function() {
                        svg.center_map();
                    // }, 500);
                
                });
            }
        });

        $scope.toggle_favourite = CtrlService.toggle_favourite;

        $scope.back = function() {
            $window.history.back();
        }
        $scope.updateUserState = function(available) {
            User.setUserState(available);
        };
    }])

    .controller('ColleagueProfileCtrl', ['$scope', '$stateParams', '$rootScope', '$window', 'User', 'Util', 'SVG', 'CtrlService', function($scope, $stateParams, $rootScope, $window, User, Util, SVG, CtrlService) {
        var uid = $stateParams.uid;
        $scope.user = User.findById(uid);
        $scope.iscuser = uid == $rootScope.cuser.id; 
        // $scope.baseurl = Util.getPictureRootUrl();
        User.favoriteCount(uid).then(function(ret) {
            $scope.favourite_count = ret || 0;
        });
        User.isFavourite(uid).then(function(ret) {
            $scope.isFavourited = ret;
        });
        User.hasCheckIn(uid).then(function(ret) {
            $scope.checkinInfo = ret;

            if(ret) {
                var svg = new SVG(ret.FloorId, parseInt(ret.SeatCode));
                svg.load().then(function(svg) {
                    svg.init_seat_state();

                    var classes = {
                        "seat-available": false,
                        "seat-unavailable": false
                    };
                    if($scope.iscuser) {
                        classes["seat-cuser"] = true;
                    } else {
                        classes["seat-me"] = true;
                    }
                    
                    var el = svg.innersvg.select("#circle"+svg.seat);
                    el.classed(classes).attr("data-user", uid);

                    angular.element($window).triggerHandler('resize');
                    // setTimeout(function() {
                        svg.center_map();
                    // }, 500);
                
                });
            }
        });

        $scope.toggle_favourite = CtrlService.toggle_favourite;

        $scope.back = function() {
            $window.history.back();
        }
        $scope.updateUserState = function(available) {
            User.setUserState(available);
        };
    }])


    .controller('EmployeesCtrl', ['$scope', '$state', '$stateParams', 'Util', 'User', 'CtrlService', function($scope, $state, $stateParams, Util, User, CtrlService) {

        $scope.type = $stateParams.t || 'all';
        $scope.toggle_favourite = CtrlService.toggle_favourite;

        var fn = {
            'all': User.allWithFavourites, 
            'favourite': User.favourites,
            'checkin': User.checkins,
            'notcheckin': User.notCheckins
        };

        /*
        $scope.$watch('type', function() {
            $scope.employees = fn[$scope.type].call(User);
        });
         */


        var pageNo = 1,
            maxNo = 1;
        $scope.canLoad = false;
        $scope.loading = true;


        function calcMaxNo(count) {
            return Math.floor(count / Util.DEFAULT_PAGE_SIZE) + (count % Util.DEFAULT_PAGE_SIZE == 0 ? 0 : 1);
        }


        $scope.$watchGroup(['type', 'q'], function() {
            pageNo = 1;
            fn[$scope.type].call(User, pageNo, $scope.q).then(function(ret) {
                $scope.employees = ret['UserList'];
                maxNo = calcMaxNo(ret['Count']);
                $scope.canLoad = pageNo < maxNo;
                $scope.loading = false;
                // console.log( 'loading list. '+ maxNo );
            });
        });

        $scope.loadMore = function () {
            // console.log( 'load more' );
            if(!$scope.loading) {
                $scope.loading = true;
                pageNo++;
                $scope.canLoad = pageNo < maxNo;
                fn[$scope.type].call(User, pageNo, $scope.q).then(function(ret) {
                    $scope.employees = $scope.employees.concat(ret['UserList']);
                    $scope.loading = false;
                });
            }
        };

    }])

;
