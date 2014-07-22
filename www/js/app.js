
angular.module('nhw', ['ui.router', 'mobile-angular-ui', 'nhw.services', 'nhw.controllers']) 

    .constant("_", window._)    // allow DI for underscore

    .run(['$rootScope', '$state', '$stateParams', function($rootScope, $state, $stateParams) {
        
        // allow use underscore in view. e.g. ng-repeat="x in _.range(3)"
        $rootScope._ = window._;
        
        // It's very handy to add references to $state and $stateParams to the $rootScope
        // so that you can access them from any scope within your applications
        
    }])

    .config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider) {

        $stateProvider
        
            .state("home", {
                url: "/",
                templateUrl: "partials/phonegap.html",
                controller: ['$scope', '$state', 'User', 'Util', function($scope, $state, User, Util) {

                    // console.log( 'go state home' );


                    // do automatically state transition here according to user status
                    if( !User.isAuthenticated() ){
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
                    "mainContent": {
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


            // ========================================
            // for testing
            // ========================================
            .state("test", {
                url: "/test", 
                abstract: true, 
                templateUrl: "partials/test/test.html"
            })

            .state("test.navgation", {
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
        ;
        
        $urlRouterProvider.otherwise('/');
        
    }])
;
