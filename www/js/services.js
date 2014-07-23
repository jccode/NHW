
var nhmService = angular.module('nhw.services', ['ngResource']) // , 'angular-underscore'

    .factory('Util', function() {

        return {
            getAthorizationKey: function() {
                return "sdfkihernvioerj";
            }
        };
    })

/*
    .factory('LocalStorage', ['$window', function($window) {
        var storage = $window[]
        
        return {
            get: function(key) {
                
            }, 

            set: function(key, value) {
                
            },

            remove: function(key) {
                
            }

        };
    }])*/
             
    .factory('User', ['$resource', '$rootScope', '_', 'Util', function($resource, $rootScope, _, Util) {

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


/**
 * Helper function to return a factory function which construct 
 * `localStorage` & `sessionStorage` service
 * 
 * @param type: localStorage / sessionStorage
 */
var WebStorage = function(type) {

    return function($window) {
        var storage = $window[ type.charAt(0).toLowerCase() + type.slice(1) ];

        return {
            get: function(key) {
                var item = storage.getItem(key);
                if(!item || item === "null") return null;
                if(item.charAt(0) === "{" || item.charAt(0) === "[") {
                    return angular.fromJson(item);
                }
                return item;
            }, 

            set: function(key, value) {
                if(typeof value === "undefined") {
                    value = null;
                } else if( angular.isObject(value) || angular.isArray(value) ){
                    value = angular.toJson(value);
                }
                storage.setItem(key, value);
            },

            remove: function(key) {
                storage.removeItem(key);
            },

            clear: function() {
                storage.clear();
            }

        };
    }

}

_.each(['LocalStorage', 'SessionStorage'], function(storageType) {    
    nhmService.factory(storageType, ['$window', WebStorage(storageType)]);
});
