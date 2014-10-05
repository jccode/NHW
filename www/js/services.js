


angular.module('nhw.services', ['ngResource']) // , 'angular-underscore'

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

                return users.query().$promise.then(function(data) {
                    var ret =  _.where(data, user);
                    return ret.length > 0 ? ret[0]: false;
                });
            }, 

            hasCheckIn: function() {
                return false;
            },

            all: function() {
                return users.query();
            },

            findById: function(id) {
                return this.all().$promise.then(function(users) {
                    return _.find(users, function(user) {
                        return user.id == id;
                    });
                });
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

