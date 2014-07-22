
angular.module("nhw.controllers", ['nhw.services'])

    .controller('LoginCtrl', ['$scope', '$rootScope', '$state', 'User', function($scope, $rootScope, $state, User) {
        $scope.login = function (user) {
            // console.log(user);
            // console.log( User.all() );
            
            var available = User.isAuthenticated(user);
            if( available ){
                $scope.error = "";
                $rootScope.user = available;
                $state.go('home');

            } else {
                $scope.error = "Sorry, you're not authorized to use this app.";
            }
        };

    }])

    .controller('NavCtrl', ['$scope', function($scope) {
        
    }])

    .controller('CheckInCtrl', ['$scope', 'User', function($scope, User) {

        $scope.scanBarcode = function () {
            console.log(User.currUser());
        };

    }])

    .controller('AppIndexCtrl', ['$scope', function($scope) {

        // $scope.user = ;

    }])


    // ========================================
    // test
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
