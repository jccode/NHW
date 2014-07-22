
angular.module("nhw.test", [])

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

    .controller('TestFnCtrl', ['$scope', function($scope) {
        $scope.logout = function () {
            
        };

    }])
;
