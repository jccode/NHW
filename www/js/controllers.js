
angular.module("nhw.controllers", ['nhw.services'])

    .controller('LoginCtrl', ['$scope', '$rootScope', '$state', 'User', function($scope, $rootScope, $state, User) {
        $scope.login = function (user) {
            // console.log(user);
            // console.log( User.all() );
            
            var available = User.isAuthenticated(user);
            if( available ){
                $scope.error = "";
                $rootScope.user = available;
                User.storeUserToLocalStorage(available);
                $state.go('app.checkin');

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

    .controller('FloorsCtrl', ['$scope', 'Floors', function($scope, Floors) {
        var floors = Floors.all();
        _.each(floors, function(floor) {
            floor['available'] = (floor.workspace > 0) && (floor.workspace - floor.present_people > 0);
        });
        console.log(floors);
        $scope.floors = floors;
        
    }])
;
