
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

    .controller('TestQuickCtrl', ['$scope', 'LocalStorage', 'SessionStorage', function($scope, LocalStorage, SessionStorage) {
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
;
