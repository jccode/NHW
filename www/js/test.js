
angular.module("nhw.test", ["nhw.services"])

    .config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider) {

        $stateProvider
        
            .state("test", {
                url: "/test", 
                abstract: true, 
                templateUrl: "partials/test/test.html"
            })

            .state("test.navigation", {
                url: "", 
                views: {
                    "testContent": {
                        templateUrl: "partials/test/navigation.html"
                    }
                }
            })

            .state("test.fns", {
                url: "/fn", 
                views: {
                    "testContent": {
                        templateUrl: "partials/test/functions.html"
                    }
                }
            })

            .state("test.quicktest", {
                url: "/quicktest", 
                views: {
                    "testContent": {
                        templateUrl: "partials/test/quicktest.html"
                    }
                }
            })

            .state("test.plugintest", {
                url: "/plugintest",
                views: {
                    "testContent": {
                        templateUrl: "partials/test/plugintest.html"
                    }
                }
            })

            .state("test.apitest", {
                url: "/apitest",
                views: {
                    "testContent": {
                        templateUrl: "partials/test/apitest.html"
                    }
                }
            })
    }])


    // ========================================
    // controllers
    // ========================================

    .controller('TestNavCtrl', ['$scope', function($scope) {
        $scope.navs = [
            {name: "Login page", sref: "welcome"}, 
            {name: "Checkin page", sref: "app.checkin"}, 
            {name: "After checkin", sref: "app.index"}, 
            {name: "Plugin Test", sref: "test.plugintest"}, 
            {name: "API Test", sref: "test.apitest"}, 
        ];
        
    }])

    .controller('TestFnCtrl', ['$scope', '$state', '$window', 'Util', function($scope, $state, $window, Util) {
        $scope.logout = function () {
            Util.clearCurrUser();
            $state.go('home', {}, {location: 'replace'});
        };

    }])

    .controller('QuickTestCtrl', ['$scope', function($scope) {
        
    }])

    .controller('StorageTestCtrl', ['$scope', 'LocalStorage', 'SessionStorage', function($scope, LocalStorage, SessionStorage) {
        var KEY = 'STORAGE_TEST_KEY';
        
        $scope.save = function () {
            LocalStorage.set(KEY, $scope.localtext);
            SessionStorage.set(KEY, $scope.sessiontext);
        };

        $scope.clear = function () {
            LocalStorage.clear();
            SessionStorage.clear();
        };

        var localtext = LocalStorage.get(KEY) || 'not values set',
            sessiontext = SessionStorage.get(KEY) || 'not values set';
        $scope.msg = "localStorage: " + localtext + " -- sessionStorage: " + sessiontext;
    }])

    .controller('ModalInstanceCtrl', ['$scope', '$modalInstance', 'items', function($scope, $modalInstance, items) {
        $scope.items = items;
        $scope.selected = {
            item: $scope.items[0]
        };
        $scope.ok = function () {
            $modalInstance.close($scope.selected.item);
        };
        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };
    }])

    .controller('ModalTestCtrl', ['$scope', '$modal', '$log', function($scope, $modal, $log) {
        $scope.items = ['item1', 'item2', 'item3'];

        $scope.open = function (size) {
            var modalInstance = $modal.open({
                templateUrl: 'myModalContent.html',
                controller: 'ModalInstanceCtrl',
                size: size,
                resolve: {
                    items: function() {
                        return $scope.items;
                    }
                }
            });

            modalInstance.result.then(function(selectedItem) {
                $scope.selected = selectedItem;
            }, function() {
                $log.info('Modal dismissed at: ' + new Date());
            });
        };
    }])

    .controller('IBeaconTestCtrl', ['$scope', 'Util', function($scope, Util) {

        // var uuid = $scope.beacon.uuid;             // mandatory
        // var identifier = $scope.beacon.identifier; // mandatory
        // var major = $scope.beacon.major;
        // var minor = $scope.beacon.minor;

        $scope.beacon = {};
        $scope.beacon.uuid = "b9407f30-f5f8-466e-aff9-25556b57fe6d";
        $scope.beacon.identifier = "Estimote Beacon";
        $scope.beacon.major = "58877";
        $scope.beacon.minor = "52730";

        
        function createBeacon(identifier, uuid, major, minor) {
            var beaconRegion = new cordova.plugins.locationManager.BeaconRegion(identifier, uuid, major, minor);
            return beaconRegion; 
        }


        var writeMsg = function(message) {
            // $scope.$apply(function() {
            //     $scope.result = ($scope.result || '') + ' ' + message;
            // });

            // window.plugin.notification.local.add({
            //     id: "1",
            //     title: "NHW",
            //     message: message
            // });

            Util.createLocalNotification( message );
        }


        var delegate = new cordova.plugins.locationManager.Delegate().implement({
            didDetermineStateForRegion: function (pluginResult) {
                writeMsg('[DOM] didDetermineStateForRegion: ' + JSON.stringify(pluginResult));
                cordova.plugins.locationManager.appendToDeviceLog('[DOM] didDetermineStateForRegion: '
                                                                  + JSON.stringify(pluginResult));
            },
            didStartMonitoringForRegion: function (pluginResult) {
                writeMsg('didStartMonitoringForRegion:', pluginResult);
                writeMsg('didStartMonitoringForRegion:' + JSON.stringify(pluginResult));
            },
            didRangeBeaconsInRegion: function (pluginResult) {
                writeMsg('[DOM] didRangeBeaconsInRegion: ' + JSON.stringify(pluginResult));
            }
        });

        var beaconRegion = createBeacon($scope.beacon.identifier, $scope.beacon.uuid, $scope.beacon.major, $scope.beacon.minor);

        $scope.startMonitoringSingleBeacon = function () {
            cordova.plugins.locationManager.setDelegate(delegate);
            cordova.plugins.locationManager.startMonitoringForRegion(beaconRegion)
                .fail(writeMsg)
                .done();
        };

        $scope.stopMonitoringSingleBeacon = function () {
            cordova.plugins.locationManager.stopRangingBeaconsInRegion(beaconRegion)
                .fail(writeMsg)
                .done();
        };

        $scope.testWriteMsg = function () {
            writeMsg(Math.round(Math.random()*100));
            // writeMsg( $scope.beacon.uuid + ";" + $scope.beacon.identifier );
        };


    }])

    .controller('NotificationTestCtrl', ['$scope', 'Util', function($scope, Util) {
        $scope.notify1 = function () {
            Util.createLocalNotification('sample message');
        };
        $scope.notify2 = function () {
            Util.createLocalNotification({
                "id": "ID",
                "message": "sample message2"
            });
        };
    }])

    .controller('BluetoothleTestCtrl', ['$scope', function($scope) {

        function showMsg(msg) {
            console.log(msg);
        }

        function leErrorCallback(e) {
            showMsg('Bluetooth request failded. type: ' + e["error"] + " error msg: " + e["message"]);
        }

        
        $scope.leIsEnabled = function() {
            bluetoothle.isEnabled(function(ret) {
                showMsg('Bluetooth is' + ret?' ':' not ' + "enabled");
            });
        }
        $scope.leIsInitialize = function() {
            bluetoothle.isInitialized(function(data) {
                var ret = data['isInitialized'];
                showMsg('Bluetooth is' + ret?' ':' not ' + "initialize");
            });
        }
        $scope.leInitialize = function() {
            bluetoothle.initialize(function(data) {
                var ret = data['status'] == 'enabled';
                if(ret) {
                    showMsg('Bluetooth initialize successful')
                } else {
                    showMsg('Bluetooth initialize failed. status: ' + data['status'])
                }
            }, leErrorCallback, {'request': true});
        }
        $scope.leStartScan = function() {
            bluetoothle.startScan(function(data) {
                var status = data['status'];
                if(status == 'scanStarted') {
                    showMsg('Bluetooth scan started ...');
                }
                else if(status == 'scanResult') {
                    showMsg('Find device ' + data['name'] + ', address: ' + data['address']);
                }
                else {
                    showMsg("Bluetooth successful callback");
                }
            }, leErrorCallback, null);
        }
        $scope.leStopScan = function() {
            bluetoothle.stopScan(function(data) {
                var status = data['status'];
                if(status == 'scanStopped') {
                    showMsg('Bluetooth scan stopped');
                }
                else {
                    showMsg('Bluetooth stopScan callback');
                }
            }, leErrorCallback);
        }
        $scope.leClose = function() {
            bluetoothle.close(function(data) {
                var status = data['status'];
                if(status == 'closed') {
                    showMsg('Bluetooth closed.');
                } else {
                    showMsg('bluetooth close callback');
                }
            }, leErrorCallback);
        }
    }])

    .controller('APITestCtrl', ['$scope', '$log', '$sce', 'LicenseServer', 'User', function($scope, $log, $sce, LicenseServer, User) {
        $scope.licenseKey = '1234567';
        $scope.getLicenseServerUrl = function () {
            LicenseServer.getCustomerServerURL($scope.licenseKey).then(function(data) {
                $log.log(data);
                if(data) {
                    $scope.result = data.ServerUrl;
                }
            });
        };

        $scope.user_all = function () {
            User.all().then(function(data) {
                $log.log(data);
                $scope.result = data;
            });
        };

        $scope.user_by_id = function () {
            User.findById($scope.user.id).then(function(data) {
                $log.log(data);
                $scope.result = data;
            });
        };


    }])

    .controller('FileDownloadTestCtrl', ['$scope', '$rootScope', '$window', 'Floors', function($scope, $rootScope, $window, Floors) {

        var svgName = function(path) {
            return path.replace(/.*\/(.+\.svg)/ig, '$1');
        };

        function onError(e) {
            console.log('ERROR. Error information as belows: ');
            console.log(JSON.stringify(e));
        }


                
        $scope.download = function () {
            Floors.all().$promise.then(function(data) {
                var floor = data[0];
                var svg_name = svgName(floor.SvgFile), 
                    svgpath = cordova.file.externalApplicationStorageDirectory + svg_name;
                console.log('File download test: ' + svgpath);
                $window.resolveLocalFileSystemURL(svgpath, function(f) {
                    console.log('Found file :' + JSON.stringify(f) );
                    console.log('file url is ' + f.toURL());
                }, function(e) {
                    console.log('ERROR: ');
                    console.log(e);
                    if(e.code == 1) {
                        var baseurl = 'https://www.nweapp.nl/hnw',
                            svgurl = baseurl + floor.SvgFile;
                        console.log('File not exist. Download file from ' + svgurl);

                        var ft = new FileTransfer();
                        ft.download(svgurl, svgpath, function(entry) {
                            console.log("File download successful. local url is " + entry.toURL());
                        }, onError);
                    }
                });
            });            
        };


    }])

;
