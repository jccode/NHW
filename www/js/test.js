
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
    }])


    // ========================================
    // controllers
    // ========================================

    .controller('TestNavCtrl', ['$scope', function($scope) {
        $scope.navs = [
            {name: "Login page", sref: "welcome"}, 
            {name: "Checkin page", sref: "app.checkin"}, 
            {name: "After checkin", sref: "app.index"}, 
        ];
        
    }])

    .controller('TestFnCtrl', ['$scope', '$state', '$window', 'User', function($scope, $state, $window, User) {
        $scope.logout = function () {
            User.removeUserFromLocalStorage();
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

;
