
angular.module('nhw', ['ui.router', 'mobile-angular-ui', 'nhw.services', 'nhw.controllers', 'nhw.test']) 

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

            .state("app.floors", {
                url: "/floors",
                views: {
                    "mainContent": {
                        templateUrl: "partials/floors.html"
                    }
                }
            })

        ;
        
        $urlRouterProvider.otherwise('/');
        
    }])
;
