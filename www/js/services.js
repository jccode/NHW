
angular.module('nhw.services', ['ngResource', 'angular-underscore'])

    .factory('Util', function() {

        return {
            getAthorizationKey: function() {
                return "sdfkihernvioerj";
            }
        };
    })
             
    .factory('User', ['$resource', '$rootScope', 'Util', function($resource, $rootScope, Util) {

        var users = $resource('js/data/users.json').query();

        return {
            currUser: function() {
                return $rootScope.user;
            }, 

            isAuthenticated: function(user) {
                var cUser = this.currUser();
                if(!user && cUser) {
                    user = {
                        name: cUser.name,
                        email: cUser.email
                    };
                }
                var ret =  _.where(users, user);
                return ret.length > 0 ? ret[0]: false;
            }, 

            hasCheckIn: function() {
                return false;
            },

            all: function() {
                return users;
            }

        };
    }])
;
