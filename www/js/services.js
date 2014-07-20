
angular.module('nhw.services', [])

    .factory('Util', function() {

        return {
            getAthorizationKey: function() {
                return "sdfkihernvioerj";
            }
        };
    })
             
    .factory('User', ['Util', function(Util) {

        return {
            isAuthenticated: function() {
                // console.log( Util.getAthorizationKey() );

                return false;
            }, 

            hasCheckIn: function() {
                return false;
            }
        };
    }])
;
