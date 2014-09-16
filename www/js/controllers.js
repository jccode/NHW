
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

    .controller('CheckInCtrl', ['$scope', '$state', 'User', function($scope, $state, User) {

        $scope.scanBarcode = function () {
            // console.log(User.currUser());
            $state.go('app.index');
        };

    }])

    .controller('AppIndexCtrl', ['$scope', function($scope) {

        // $scope.user = ;
        
    }])

    .controller('FloorsCtrl', ['$scope', 'Floors', function($scope, Floors) {
        // var floors = Floors.all();
        // floors = _.each(floors, function(floor) {
        //     floor['available'] = (floor.workspace > 0) && (floor.workspace - floor.present_people > 0);
        // });
        $scope.floors = Floors.all();

    }])
;
