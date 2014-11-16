
angular.module('nhw', ['ui.router', 'ngTouch', 'ngSanitize', 'mobile-angular-ui', 'ui.bootstrap', 'nhw.directives', 'nhw.filters', 'nhw.utils', 'nhw.services', 'nhw.controllers', 'nhw.beacon-model', 'nhw.test']) 

    .constant("_", window._)    // allow DI for underscore

    // bootstrap etc
    .factory("Bootstrap", ['$log', '$rootScope', '$window', '_', 'Util', 'Beacons', 'BeaconUtil', 'BeaconModel', function($log, $rootScope, $window, _, Util, Beacons, BeaconUtil, BeaconModel) {

        function init_beacon_model() {
            if(!Util.isIbeaconSupported()) {
                return;
            }
            
            if(!Util.getCustomerServerURL()) { // if url not exist, skip
                return;
            }
            
            var model = {
                beacons: [],
                groups: [],
                rules: []
            };
            var beaconMap = {},
                groupMap = {};

            // beacons
            Beacons.allBeacons().$promise.then(function(beacons) {
                _.each(beacons, function(beacon) {
                    var b = new BeaconModel.Beacon(beacon.IbeaconId, beacon.UUID, beacon.Name, beacon.Major, beacon.Minor);
                    model.beacons.push(b);
                    beaconMap[beacon.IbeaconId] = b;
                });

                // groups
                Beacons.allGroups().$promise.then(function(groups) {
                    _.each(groups, function(group) {
                        var bids = (group.BeaconId+"").split(",");
                        var bcons = _.map(bids, function(id) {
                            return beaconMap[id]; 
                        });
                        var g = new BeaconModel.BeaconGroup(group.GroupId, group.GroupNum, bcons);
                        model.groups.push(g);
                        groupMap[group.GroupId] = g;
                    });

                    // rules
                    Beacons.allRules().$promise.then(function(rules) {
                        _.each(rules, function(rule) {
                            var r = new BeaconModel.Rule(rule.RuleId, groupMap[rule.From], groupMap[rule.To], rule.Message);
                            model.rules.push(r);
                        });

                        // Read beacon state from localStorage, then restore to objects.
                        var states = Util.getBeaconStates();
                        _.each(states, function(val, key) {
                            beaconMap[key].state = val.state;
                            beaconMap[key].ts = val.ts;
                        });
                        

                        // test
                        console.log("Init beacon model complelted");
                        // console.log( JSON.stringify($rootScope.beaconmodel.beacons) );

                        bindRulesToBeacon(model.rules);

                        
                    });
                    
                });
            });

            $rootScope.beaconmodel = model;
        }

        function bindRulesToBeacon(rules) {
            console.log( 'bind rules to beacon' );
            _.each(rules, function(rule) {
                _.each(rule.from.beacons, function(beacon) {
                    beacon.addSubscriber(rule.action.bind(rule));
                    console.log( 'beacon ' + beacon + ' add subscriber: ' + rule );

                });
                _.each(rule.to.beacons, function(beacon) {
                    beacon.addSubscriber(rule.action.bind(rule));
                    console.log( 'beacon ' + beacon + ' add subscriber: ' + rule );                
                });
            });
        }


        
        function startIbeacon() {
            if(!Util.getCustomerServerURL()) { // if url not exist, skip
                return;
            }

            // determine whether a user is inside building
            // $rootScope.isInBuilding = Util.isInBuilding();

            if(Util.isIOS()) {
                // startIbeacon_ios();
                var identifier = 'Estimote Beacon',
                    uuid = 'b9407f30-f5f8-466e-aff9-25556b57fe6d';
                var region = new cordova.plugins.locationManager.BeaconRegion(identifier, uuid);
                var delegate = BeaconUtil.createIosDelegate();
                cordova.plugins.locationManager.setDelegate(delegate);
                cordova.plugins.locationManager.startRangingBeaconsInRegion(region).fail(console.log).done();
                cordova.plugins.locationManager.startMonitoringForRegion(region).fail(console.log).done();
                
                return;
            }
            // below is for android
            
            // start ibeacon
            Beacons.allBeacons().$promise.then(function(beacons) {
                var ibeacons = _.map(beacons, function(beacon) {
                    if(!beacon.Active) {
                        return null;
                    }
                    return BeaconUtil.createBeacon(beacon.UUID, beacon.Name, beacon.Major, beacon.Minor);
                });

                var delegate = BeaconUtil.createDelegate();
                cordova.plugins.locationManager.setDelegate(delegate);
                _.each(ibeacons, function(ibeacon) {
                    if(ibeacon) {
                        cordova.plugins.locationManager.startMonitoringForRegion(ibeacon).fail(console.log).done();
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

            Beacons.allBeacons().$promise.then(function(beacons) {
                var delegate = BeaconUtil.createDelegate(beacons);
                cordova.plugins.locationManager.setDelegate(delegate);
                cordova.plugins.locationManager.startMonitoringForRegion(beacon1).fail(console.log).done();
                cordova.plugins.locationManager.startMonitoringForRegion(beacon11).fail(console.log).done();
                cordova.plugins.locationManager.startMonitoringForRegion(beacon2).fail(console.log).done();
            });
             */
            
        }


        function startIbeacon_ios() {
            console.log( 'start ibeacon for ios' );

            // models
            var STATE_BLANK = 0,
                STATE_VISITED = 1;
            
            var Beacon = function(id, major, minor) {
                this.id = id;
                this.major = major;
                this.minor = minor;
                this.state = STATE_BLANK;
                
                observer.make(this);
            };
            Beacon.prototype = {
                stateChange: function(state) {
                    console.log( 'beacon ' + this.major + ' set state. ' + 'current state is ' + this.state
                                 + ((state == this.state)? ' state not change. skip. ': '') );

                    if(state == this.state) return;
                    // only apply when state really changed
                    this.state = state;
                    this.publish(this);
                },

                setState: function(state) {
                    this.state = state;
                }, 

                toString: function() {
                    return ['[Ojbect beacon]', this.id+'', 'major:' + this.major].join(' ');
                }

            };

            var Group = function(id) {
                this.id = id;
                this.beacons = []; 
            };
            Group.prototype = {
                add: function(beacon) {
                    this.beacons.push(beacon);
                },

                setState: function(state) {
                    _.each(this.beacons, function(b) {
                        b.setState(state);
                    });
                },

                getState: function() {
                    if(_.some(this.beacons, function(beacon) {
                        return beacon.state == STATE_VISITED;
                    })) {
                        return STATE_VISITED;
                    } 
                    else {
                        return STATE_BLANK;
                    }
                }

            };
                

            var Pair = function(front, back, front_msg, back_msg) {
                this.front = front;
                this.back = back;
                this.front_msg = front_msg;
                this.back_msg = back_msg;
            };
            
            Pair.prototype = {
                setState: function(state) {
                    this.front.setState(state);
                    this.back.setState(state);
                }, 

                setStateBlank: function() {
                    this.setState(STATE_BLANK);
                }, 

                setStateVisited: function() {
                    this.setState(STATE_VISITED);
                },

                getSide: function(beacon) {
                    if(_.contains(this.front.beacons, beacon))
                        return 'front';
                    if(_.contains(this.back.beacons, beacon))
                        return 'back';
                    return null;
                }, 

                action: function(beacon) {
                    var side = this.getSide(beacon);
                    console.log( 'Pair action. side: ' + side );

                    if(!side)
                        return;
                    return this[side+'Action'](beacon);
                },
                
                frontAction: function(beacon) {
                    var fs = this.front.getState(),
                        bs = this.back.getState();
                    console.log( 'Pair front action. fs:' + fs + ' bs:' + bs );

                    if(fs == STATE_VISITED && bs == STATE_VISITED) {
                        console.log("ios end -> front: Push Notification: "+this.front_msg);
                        this.setStateBlank();
                        Util.createLocalNotification(this.front_msg);
                    }
                }, 

                backAction: function(beacon) {
                    var fs = this.front.getState(),
                        bs = this.back.getState();
                    console.log( 'Pair front action. fs:' + fs + ' bs:' + bs );
                    
                    if(bs == STATE_BLANK) {
                        console.log("ios front -> end: Push Notification: "+this.back_msg);
                        this.setStateVisited();
                        Util.createLocalNotification(this.back_msg);
                    }
                }
            };

            
            
            // main
            var identifier = 'Estimote Beacon',
                uuid = 'b9407f30-f5f8-466e-aff9-25556b57fe6d';
            
            // var fb = {id: 26, major: 58877, minor: 52730},
            //     tb = {id: 27, major: 55445, minor: 53655};
            
            var fb = new Beacon(26, 58877, 52730),
                bb = new Beacon(27, 55445, 53655),
                beacons = [fb, bb];
            var fg = new Group(1), bg = new Group(2);
            fg.add(fb);
            bg.add(bb);
            var pair = new Pair(fg, bg, 'Welcome ^^', 'Bye :)');
            _.each(beacons, function(beacon) {
                console.log( beacon + ' add subscriber.' );
                beacon.addSubscriber(pair.action.bind(pair));
            });
            
            var region = new cordova.plugins.locationManager.BeaconRegion(identifier, uuid);
            var delegate = new cordova.plugins.locationManager.Delegate().implement({
                didDetermineStateForRegion: function (pluginResult) {
                    console.log('[ibeacon:'+self.uuid+']didDetermineStateForRegion: ' + JSON.stringify(pluginResult));
                },
                didStartMonitoringForRegion: function (pluginResult) {
                    console.log('[ibeacon:'+this.uuid+']didStartMonitoringForRegion:' + JSON.stringify(pluginResult));
                },
                didRangeBeaconsInRegion: function (pluginResult) {
                    console.log('[ibeacon:'+this.uuid+']didRangeBeaconsInRegion: ' + JSON.stringify(pluginResult));
                    /*
                    if(pluginResult && pluginResult.beacons && pluginResult.beacons.length > 0) {
                        var beacons_ret = pluginResult.beacons;
                        _.each(beacons_ret, function(ret) {
                            var bcon = _.find(beacons, function(beacon) {
                                return beacon['major'] == ret['major'] &&
                                    beacon['minor'] == ret['minor'];
                            });
                            bcon.setState(STATE_VISITED);
                        });
                    }
                     */
                    var retbeacons = pluginResult.beacons;
                    _.each(beacons, function(beacon) {
                        var b = _.find(retbeacons, function(ret) {
                            if(!ret) return false;
                            return beacon['major'] == ret['major'] &&
                                beacon['minor'] == ret['minor'];
                        });
                        if(b) {
                            beacon.stateChange(STATE_VISITED);
                        } else {
                            beacon.stateChange(STATE_BLANK);
                        }
                    });
                }
            });
            cordova.plugins.locationManager.setDelegate(delegate);
            cordova.plugins.locationManager.startRangingBeaconsInRegion(region).fail(console.log).done();
            cordova.plugins.locationManager.startMonitoringForRegion(region).fail(console.log).done();
        }


        function checkAndEnableBluetooth() {
            console.log('check and enable bluetooth');
            
            if(!Util.isIbeaconSupported()) {
                Log.log('ibeacon is not supported on this device.');
                Util.toast('ibeacon wordt niet ondersteund'); // ibeacon is not supported
                return;
            }
            console.log('check and enable bluetooth 2.');
            
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

        /*
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
        } */


        function onError(e) {
            console.log('[ERROR] File api error.');
            console.log( JSON.stringify(e) );
        }

        
        function initCacheFiles() {
            var os = $window.device.platform.toLowerCase(),
                datadir = (os == 'android' && cordova.file.externalApplicationStorageDirectory) ||
                    (os == 'ios' && cordova.file.dataDirectory) ||
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
            init_beacon_model();
            checkAndEnableBluetooth();
            // syncDataFromServer();
            initCacheFiles();
        }

        
        return {
            deviceready: deviceready,
            // syncData: syncDataFromServer, 
            checkAndEnableBluetooth: checkAndEnableBluetooth,
            initBeaconModel: init_beacon_model
        };
    }])

     // run config on startup
    .run(['$rootScope', '$state', '$stateParams', 'Util', 'Bootstrap', '$modalStack', 'User', function($rootScope, $state, $stateParams, Util, Bootstrap, $modalStack, User) {
        
        
        // It's very handy to add references to $state and $stateParams to the $rootScope
        // so that you can access them from any scope within your applications


        // legacy. for upgrade check
        // That's because the localStorage value: current_user.
        // The current user stored in localStorage, should be {id:xx, email:xx},
        // but not {UserId:xx, Email:xxx} 
        var cuser = Util.currUser();
        (function() {
            if(cuser) { // upgrade issues.
                if(cuser['Email'] || (cuser['email'] !== cuser['email'].toLowerCase()) || !cuser['num']) {
                    Util.clearCurrUser();
                    Util.clearAllUserData();
                }
            }
        })();

        
        // update user photo if needed
        if(cuser) {
            User.isAuthenticated(cuser).then(function(ret) {
                if(ret) {
                    if(ret.photo !== cuser.photo) {
                        cuser.photo = ret.photo;
                        Util.currUser(cuser);
                    }
                }
            });
        }

        // allow use underscore in view. e.g. ng-repeat="x in _.range(3)"
        $rootScope._ = window._;
        $rootScope.cuser = cuser;
        $rootScope.picurl = Util.getPictureRootUrl();


        // angular-bootstrap dismiss modal
        $rootScope.$on('$locationChangeSuccess', function () {
            var topModal = $modalStack.getTop();
            while (topModal) {
                $modalStack.dismiss(topModal.key, '$locationChangeSuccess');
                topModal = $modalStack.getTop();
            }
        });

        
        $rootScope.$on(EVENTS.BEACON_STATE_CHANGE, function() {
            $rootScope.isInBuilding = Util.isInBuilding();
        });
        
        
        // test
        // if(!Util.isRunningOnPhonegap() && Storage) {
        //     Storage.createDBs();
        // }
        
        // if(!Util.isRunningOnPhonegap() && Storage) {
        //     Bootstrap.initBeaconModel();
        // }

        // for desktop user testing
        if(!Util.isRunningOnPhonegap()) {
            $rootScope.isInBuilding = true;
        }
        


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
                    "mainContent": {
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

