
angular.module('nhw', ['ui.router', 'mobile-angular-ui', 'ui.bootstrap', 'nhw.directives', 'nhw.utils', 'nhw.services', 'nhw.storage', 'nhw.controllers', 'nhw.test']) 

    .constant("_", window._)    // allow DI for underscore

    // bootstrap etc
    .factory("Bootstrap", ['Util', 'Beacons', 'SingleBeacon', 'Storage', function(Util, Beacons, SingleBeacon, Storage) {

        function startIbeacon() {
            Beacons.all().$promise.then(function(beacons) {
                _.each(beacons, function(beacon) {
                    var singleBeacon = new SingleBeacon(beacon.uuid, beacon.identifier, beacon.major, beacon.minor);
                    singleBeacon.addEventListener('enter', function(result) {
                        Util.createLocalNotification(beacon.message);
                    });
                    singleBeacon.startMonitoring();
                });
            });
        }

        function checkAndEnableBluetooth() {
            bluetoothle.isEnabled(function(ret) {
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
            console.log('sync data');
            Storage.createDBs();
            var date = Util.lastUpdateDate();
            if(Util.customerServerURL()) {
                console.log('sync data 2');
                Storage.syncData(date).then(function() {
                    Util.lastUpdateDate(new Date());

                    console.log('success');
                    if(callback) callback(true);
                }, function() {
                    Log.log('sync data error. ');

                    if(callback) callback(false);
                });
            }
        }



        function deviceready() {
            checkAndEnableBluetooth();
            syncDataFromServer();
        }

        
        return {
            deviceready: deviceready,
            syncData: syncDataFromServer
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
                templateUrl: "partials/phonegap.html", // "partials/phonegap.html"
                resolve: {
                    authenticated: ['User', function(User) {
                        return User.isAuthenticated();
                    }]
                }, 
                controller: ['$scope', '$state', 'authenticated', 'User', 'Util', function($scope, $state, authenticated, User, Util) {

                    // do automatically state transition here according to user status
                    if( !authenticated ){
                        $state.go('welcome', {}, {location: false});
                        return;
                    }
                    if( User.hasCheckIn() ){
                        $state.go('app.index', {}, {location: false});
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
                url: "/index",
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
                url: "/floor/:floorId",
                views: {
                    "subContent": {
                        templateUrl: "partials/floor_select.html"
                    }
                }
            })

            .state("app.profile", {
                url: "/profile",
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

