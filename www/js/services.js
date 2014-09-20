


var nhmService = angular.module('nhw.services', ['ngResource']) // , 'angular-underscore'

    .factory('Util', function() {

        return {
            getAthorizationKey: function() {
                return "sdfkihernvioerj";
            }
        };
    })

    .factory('User', ['$resource', '_', 'LocalStorage', function($resource, _, LocalStorage) {

        var KEY_CURR_USER = 'curr_user';
        var users = $resource('js/data/users.json');

        return {
            currUser: function() {
                return LocalStorage.get(KEY_CURR_USER);
            },

            storeUserToLocalStorage: function(user) {
                LocalStorage.set(KEY_CURR_USER, user);
            },

            removeUserFromLocalStorage: function() {
                LocalStorage.remove(KEY_CURR_USER);
            }, 

            isAuthenticated: function(user) {
                var cUser = this.currUser();
                
                if(!user && !cUser) {
                    return false;
                }
                else if(!user && cUser) {
                    user = {
                        name: cUser.name,
                        email: cUser.email
                    };
                }
                return users.query(function(data) {
                    var ret =  _.where(data, user);
                    return ret.length > 0 ? ret[0]: false;
                });
            }, 

            hasCheckIn: function() {
                return false;
            },

            all: function() {
                return users.query();
            }

        };
    }])

        .factory('Floors', ['$resource', '_', function($resource, _) {
            var floors = $resource('js/data/floors.json');

            return {
                all: function() {
                    // return floors.query();
                    return floors.query(function(data) {
                        var floors = _.each(data, function(floor) {
                            floor['available'] = (floor.workspace > 0)
                                && (floor.workspace - floor.present_people > 0);
                        });
                        return floors;
                    });
                }, 

                findById: function(id) {
                    // var floors = this.all();
                    // return _.find(floors, function(floor) {
                    //     return floor.id == id;
                    // });

                    return this.all().$promise.then(function(floors) {
                        return _.find(floors, function(floor) {
                            return floor.id == id;
                        });
                    });
                    
                },

                getUnAvailableSeatsByFloor: function(floorId) {
                    // return [73, 75, 77, 79, 133, 135, 137, 139];
                    return [
                        {"seat": 73, "userId": 2}, 
                        {"seat": 75, "userId": 2}, 
                        {"seat": 77, "userId": 2}, 
                        {"seat": 79, "userId": 3}, 
                        {"seat": 133, "userId": 3}, 
                        {"seat": 135, "userId": 4}, 
                        {"seat": 137, "userId": 4}, 
                        {"seat": 139, "userId": 5}, 
                    ];
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
