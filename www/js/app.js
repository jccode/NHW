
angular.module('nhw', ['ui.router', 'ngSanitize', 'mobile-angular-ui', 'ui.bootstrap', 'nhw.directives', 'nhw.utils', 'nhw.services', 'nhw.storage', 'nhw.controllers', 'nhw.test']) 

    .constant("_", window._)    // allow DI for underscore

    // bootstrap etc
    .factory("Bootstrap", ['$log', 'Util', 'Beacons', 'SingleBeacon', 'Storage', function($log, Util, Beacons, SingleBeacon, Storage) {
        // legacy. for upgrade check
        // That's because the localStorage value: current_user.
        // The current user stored in localStorage, should be {id:xx, email:xx},
        // but not {UserId:xx, Email:xxx} 
        (function() {
            var cuser = Util.currUser();
            if(cuser) { // upgrade issues.
                if(cuser['Email'] || (cuser['email'] !== cuser['email'].toLowerCase())) {
                    Util.clearCurrUser();
                    Util.localStorage.remove(STORAGE_KEYS.USER_DATA);
                }
            }
        })();
        

        function startIbeacon() {
            if(!Util.getCustomerServerURL()) { // if url not exist, skip
                return;
            }
            Beacons.all().$promise.then(function(beacons) {
                console.log(angular.toJson(beacons));
                _.each(beacons, function(beacon) {
                    $log.log(beacon);
                    if(beacon.Active) {
                        var singleBeacon = new SingleBeacon(beacon.UUID, beacon.Name, beacon.Major, beacon.Minor);
                        singleBeacon.addEventListener('enter', function(result) {
                            Util.createLocalNotification(beacon.Message);
                        });
                        console.log('start monitoring');
                        singleBeacon.startMonitoring();
                    }
                });
            });
        }

        function checkAndEnableBluetooth() {
            // console.log('check and enable bluetooth');
            try {
                if(!bluetoothle) {  // bluetoothle is not support
                    Log.log('Bluetooth LE is not supported.');
                    return; 
                }
            } catch(e) {
                // bluetooth is not supported
                return;
            }
            bluetoothle.isEnabled(function(ret) {
                // console.log(' bluetooth: ' + ret['isEnabled']);
                if(!ret['isEnabled']) {
                    bluetoothle.initialize(function(data) {
                        var status = data['status'];
                        if(status == 'enabled') {
                            Log.log('Bluetooth enabled');
                            startIbeacon();
                        } else {
                            Log.log('Bluetooth enable failed.');
                        }
                    }, Log.log, {'request': true});
                } else {
                    startIbeacon();
                }
            });
        }

        function syncDataFromServer(callback) {
            if(!Storage) {      // for Firefox that not support WebSQL
                callback && callback(true);
                return ;
            } 
            
            Storage.createDBs();
            var date = Util.lastUpdateDate();
            if(Util.getCustomerServerURL()) {
                Storage.syncData(date).then(function() {
                    Util.lastUpdateDate(new Date());
                    if(callback) callback(true);
                }, function() {
                    if(callback) callback(false);
                });
            }
        }


        function deviceready() {
            checkAndEnableBluetooth();
            // syncDataFromServer();
        }

        
        return {
            deviceready: deviceready,
            syncData: syncDataFromServer, 
            checkAndEnableBluetooth: checkAndEnableBluetooth
        };
    }])

     // run config on startup
    .run(['$rootScope', '$state', '$stateParams', 'Util', 'Storage', 'Bootstrap', function($rootScope, $state, $stateParams, Util, Storage, Bootstrap) {
        
        // allow use underscore in view. e.g. ng-repeat="x in _.range(3)"
        $rootScope._ = window._;
        
        // It's very handy to add references to $state and $stateParams to the $rootScope
        // so that you can access them from any scope within your applications


        
        // if(!Util.isRunningOnPhonegap() && Storage) {
        //     Storage.createDBs();
        // }


        // device ready
        $rootScope.$on('deviceready', function(e) {
            console.log('bootstrap');
            Bootstrap.deviceready();
        });

    }])

    .config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider) {

        $stateProvider
        
            .state("home", {
                url: "/",
                templateUrl: "partials/loading.html", // "partials/phonegap.html"
                resolve: {
                    authenticated: ['User', function(User) {
                        return User.isAuthenticated();
                    }],

                    isCheckin: ['User', function(User) {
                        return User.hasCheckIn();
                    }]
                }, 
                controller: ['$scope', '$state', 'authenticated', 'isCheckin', 'User', 'Util', function($scope, $state, authenticated, isCheckin, User, Util) {

                    // do automatically state transition here according to user status
                    if( !authenticated ){
                        $state.go('welcome', {}, {location: false});
                        return;
                    }

                    if( isCheckin ){
                        var seatInfo = isCheckin;
                        var floorId = seatInfo["FloorId"],
                            seat = parseInt(seatInfo["SeatCode"]);
                        $state.go('app.index', {f:floorId, s:seat}, {location: false});
                    } else {
                        $state.go('app.checkin', {}, {location: false});
                    }
                    
                }]
            })
        
            .state("welcome", {
                url: "/welcome", 
                templateUrl: "partials/welcome.html"
            })

        
            .state("app", {
                url: "/app",
                abstract: true,
                templateUrl: "partials/main.html"
            })

            .state("app.checkin", {
                url: "/checkin",
                views: {
                    "subContent": {
                        templateUrl: "partials/checkin.html"
                    }
                }
            })

            .state("app.index", {
                url: "/index?f&s", // floorId&seatNo
                views: {
                    "mainContent": {
                        templateUrl: "partials/app-index.html"
                    }
                }
            })

            .state("app.floors", {
                url: "/floors",
                views: {
                    "subContent": {
                        templateUrl: "partials/floors.html"
                    }
                }
            })

            .state("app.floor_select", {
                url: "/floor/:f?s", // :floorId?seat ; seat is optional
                views: {
                    "subContent": {
                        templateUrl: "partials/floor_select.html"
                    }
                }
            })

            .state("app.profile", {
                url: "/profile/:uid",
                views: {
                    "mainContent": {
                        templateUrl: "partials/profile.html"
                    }
                }
            })

            .state("app.employees", {
                url: "/employees",
                views: {
                    "subContent": {
                        templateUrl: "partials/employees.html"
                    }
                }
            })

        ;
        
        $urlRouterProvider.otherwise('/');
        
    }])
;

