
angular.module('nhw', ['ui.router', 'ngTouch', 'ngSanitize', 'mobile-angular-ui', 'ui.bootstrap', 'nhw.directives', 'nhw.filters', 'nhw.utils', 'nhw.services', 'nhw.storage', 'nhw.controllers', 'nhw.test']) 

    .constant("_", window._)    // allow DI for underscore

    // bootstrap etc
    .factory("Bootstrap", ['$log', '$rootScope', '$window', '_', 'Util', 'Beacons', 'SingleBeacon', 'Storage', 'BeaconUtil', function($log, $rootScope, $window, _, Util, Beacons, SingleBeacon, Storage, BeaconUtil) {

        
        function startIbeacon() {
            if(!Util.getCustomerServerURL()) { // if url not exist, skip
                return;
            }
            // Beacons.all().$promise.then(function(beacons) {
            //     console.log(angular.toJson(beacons));
            //     _.each(beacons, function(beacon) {
            //         $log.log(beacon);
            //         if(beacon.Active) {
            //             var singleBeacon = new SingleBeacon(beacon.UUID, beacon.Name, beacon.Major, beacon.Minor);
            //             singleBeacon.addEventListener('enter', function(result) {
            //                 Util.createLocalNotification(beacon.Message);
            //             });
            //             console.log('start monitoring');
            //             singleBeacon.startMonitoring();
            //         }
            //     });
            // });

            
            Beacons.all().$promise.then(function(beacons) {
                var ibeacons = _.map(beacons, function(beacon) {
                    if(!beacon.Active) {
                        return null;
                    }
                    return BeaconUtil.createBeacon(beacon.UUID, beacon.Name, beacon.Major, beacon.Minor);
                });

                var delegate = BeaconUtil.createDelegate(beacons);
                cordova.plugins.locationManager.setDelegate(delegate);
                _.each(ibeacons, function(ibeacon) {
                    if(ibeacon) {
                        cordova.plugins.locationManager.startMonitoringForRegion(ibeacon)
                            .fail(console.log)
                            .done();
                    }
                });
            });

            /*
            var identifier1 = 'Estimote Beacon',
                uuid1 = 'b9407f30-f5f8-466e-aff9-25556b57fe6d',
                major1 = 58877,
                minor1 = 52730,
                major11 = 55445,
                minor11 = 53655;
            // var beacon1 = new cordova.plugins.locationManager.BeaconRegion(identifier1, uuid1);
            var beacon1 = new cordova.plugins.locationManager.BeaconRegion(identifier1, uuid1, major1, minor1);
            var beacon11 = new cordova.plugins.locationManager.BeaconRegion(identifier1, uuid1, major11, minor11);

            var identifier2 = 'AprilBeacon',
                uuid2 = 'e2c56db5-dffb-48d2-b060-d0f5a71096e0',
                major2 = 0,
                minor2 = 1;
            var beacon2 = new cordova.plugins.locationManager.BeaconRegion(identifier2, uuid2, major2, minor2);

            Beacons.all().$promise.then(function(beacons) {
                var delegate = BeaconUtil.createDelegate(beacons);
                cordova.plugins.locationManager.setDelegate(delegate);
                cordova.plugins.locationManager.startMonitoringForRegion(beacon1).fail(console.log).done();
                cordova.plugins.locationManager.startMonitoringForRegion(beacon11).fail(console.log).done();
                cordova.plugins.locationManager.startMonitoringForRegion(beacon2).fail(console.log).done();
            });
             */
            
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


        function onError(e) {
            console.log('[ERROR] File api error.');
            console.log( JSON.stringify(e) );
        }

        
        function initCacheFiles() {
            var os = $window.device.platform.toLowerCase(),
                datadir = (os == 'android' && cordova.file.externalApplicationStorageDirectory) ||
                    (os == 'ios' && cordova.file.applicationStorageDirectory) ||
                    cordova.file.dataDirectory,
                avatardir = datadir + 'avatar/',
                avatars = [];

            $log.log('[initCacheFiles] os:' + os + "; datadir: " + datadir + "; avatardir: " + avatardir );
            
            $rootScope.DATADIR = datadir;
            $rootScope.AVATAR_DIR = avatardir;
            $rootScope.SVG_DIR = datadir + 'svg/';

            $window.resolveLocalFileSystemURL(datadir, function(data_dir) {
                data_dir.getDirectory('avatar', {create: true}, function(d) {
                    var reader = d.createReader();
                    reader.readEntries(function(entries) {
                        _.each(entries, function(e) {
                            avatars.push(e.name);
                        });
                        
                        $rootScope.userpics = avatars;
                        $log.log('[initCacheFiles] userpics: ' + JSON.stringify(avatars));
                        
                    }, onError);
                }, onError);
            }, onError);
            

            // $window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function(fileSystem) {
            //     fileSystem.root.getDirectory(avatardir, {create: true}, function(d) {
            //         var reader = DATADIR.createReader();
            //         reader.readEntries(function(entries) {
            //             _.each(entries, function(e) {
            //                 avatars.push(e.name);
            //             });
                        
            //             $rootScope.userpics = avatars;
            //             $log.log('[initCacheFiles] userpics: ' + JSON.stringify(avatars));
                        
            //         }, onError);
            //     }, onError);
            // }, null);

        }



        function deviceready() {
            checkAndEnableBluetooth();
            // syncDataFromServer();
            initCacheFiles();
        }

        
        return {
            deviceready: deviceready,
            syncData: syncDataFromServer, 
            checkAndEnableBluetooth: checkAndEnableBluetooth
        };
    }])

     // run config on startup
    .run(['$rootScope', '$state', '$stateParams', 'Util', 'Storage', 'Bootstrap', '$modalStack', function($rootScope, $state, $stateParams, Util, Storage, Bootstrap, $modalStack) {
        
        // allow use underscore in view. e.g. ng-repeat="x in _.range(3)"
        $rootScope._ = window._;
        $rootScope.cuser = Util.currUser();
        $rootScope.picurl = Util.getPictureRootUrl();
        
        // It's very handy to add references to $state and $stateParams to the $rootScope
        // so that you can access them from any scope within your applications


        // legacy. for upgrade check
        // That's because the localStorage value: current_user.
        // The current user stored in localStorage, should be {id:xx, email:xx},
        // but not {UserId:xx, Email:xxx} 
        (function() {
            var cuser = Util.currUser();
            if(cuser) { // upgrade issues.
                if(cuser['Email'] || (cuser['email'] !== cuser['email'].toLowerCase())) {
                    Util.clearCurrUser();
                    Util.clearAllUserData();
                }
            }
        })();


        // angular-bootstrap dismiss modal
        $rootScope.$on('$locationChangeSuccess', function () {
            var topModal = $modalStack.getTop();
            while (topModal) {
                $modalStack.dismiss(topModal.key, '$locationChangeSuccess');
                topModal = $modalStack.getTop();
            }
        });

        

        
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
                        $state.go('app.welcome', {}, {location: false});
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
        
            .state("app", {
                url: "/app",
                abstract: true,
                templateUrl: "partials/main.html"
            })

            .state("app.welcome", {
                url: "/welcome", 
                // templateUrl: "partials/welcome.html"
                views: {
                    "subContent": {
                        templateUrl: "partials/welcome.html"
                    }
                }
            })

            .state("app.checkin", {
                url: "/checkin",
                views: {
                    "mainContent": {
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

            .state("app.buildings", {
                url: "/buildings",
                views: {
                    "subContent": {
                        templateUrl: "partials/buildings.html"
                    }
                }
            })

            .state("app.floors", {
                url: "/floors/:buildingId",
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
                url: "/employees?t",
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

