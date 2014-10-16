

angular.module('nhw.services', ['ngResource']) // , 'angular-underscore'

    .factory('User', ['$resource', '$http', '$q', '_', 'Util', function($resource, $http, $q, _, Util) {

        // var users = $resource('js/data/users.json');
        var baseurl = Util.getCustomerServerURL() + '/api/user';
        var User = $resource(baseurl+"/:id");

        return {
            isAuthenticated: function(user) { // TODO: only need to verify email
                var cUser = Util.currUser();
                
                if(!user && !cUser) {
                    return false;
                }
                else if(!user && cUser) {
                    user = {
                        name: cUser.name,
                        email: cUser.email
                    };
                }

                /*
                return users.query().$promise.then(function(data) {
                    var ret =  _.where(data, user);
                    return ret.length > 0 ? ret[0]: false;
                });
                 */
                
                var checkurl = Util.getCustomerServerURL(user.email) + '/api/user/checkuser/' + user.email;
                return Util.httpget(checkurl, DataTransform.user);
            }, 

            hasCheckIn: function() {
                return false;

                // var currUser = Util.currUser();
                // if(!currUser) return false;
                // var url = baseurl + '/ischeckin/' + currUser.id;
                // return Util.httpget(url);
            },

            all: function() {
                // return users.query();
                return User.query().$promise;
            },

            findById: function(id) {
                /*
                return this.all().$promise.then(function(users) {
                    return _.find(users, function(user) {
                        return user.id == id;
                    });
                });
                 */
                return User.get({id: id}).$promise;
            },

            incrementalUpdate: function(date) {
                // return $q.when([]);
                return Util.httpget(baseurl + '/incremental/' + date);
            }
        };
    }])

    .factory('Building', ['$resource', '$q', '_', function($resource, $q, _) {
        // var buildings = $resource('js/data/buildings.json');
        var baseurl = Util.getCustomerServerURL() + '/api/building';
        var Building = $resource(baseurl + '/:id');

        return {
            all: function() {
                // return buildings.query();
                return Building.query().$promise;
            },

            incrementalUpdate: function(date) {
                // return $q.when([]);
                return Util.httpget(baseurl + '/incremental/' + date);
            }
        };
    }])

    .factory('Floors', ['$resource', '$http', '$q', '_', 'Util', function($resource, $http, $q, _, Util) {
        // var floors = $resource('js/data/floors.json');
        var baseurl = Util.getCustomerServerURL() + '/api/floor';
        var seaturl = Util.getCustomerServerURL() + '/api/seat';
        var Floor = $resource(baseurl + '/:id');

        return {
            all: function() {
                // return floors.query(function(data) {
                //     var floors = _.each(data, function(floor) {
                //         floor['available'] = (floor.workspace > 0)
                //             && (floor.workspace - floor.present_people > 0);
                //     });
                //     return floors;
                // });
                return Floor.query();
            }, 

            findById: function(id) {
                // return this.all().$promise.then(function(floors) {
                //     return _.find(floors, function(floor) {
                //         return floor.id == id;
                //     });
                // });
                
                return Floor.get({id: id});
            },

            getUnAvailableSeatsByFloor: function(floorId) {
                // return [73, 75, 77, 79, 133, 135, 137, 139];
                // return [
                //     {"seat": 73, "userId": 2}, 
                //     {"seat": 75, "userId": 2}, 
                //     {"seat": 77, "userId": 2}, 
                //     {"seat": 79, "userId": 3}, 
                //     {"seat": 133, "userId": 3}, 
                //     {"seat": 135, "userId": 4}, 
                //     {"seat": 137, "userId": 4}, 
                //     {"seat": 139, "userId": 5}, 
                // ];
                var url = baseurl + '/unavailableseat/' + floorId;
                return Util.httpget(url, function(data) {
                    var unavailables = data['FloorSeats'];
                    var ret = _.map(unavailables, function(obj) {
                        return {
                            'seat': obj['SeatCode'],
                            'userId': obj['UserId']
                        };
                    });
                    return ret;
                });
            },

            checkin: function(floorId, seat) {
                // var cuser = Util.currUser();
                // var url = seaturl + '/checkin/' + seatId + '/' + cuser.id;
                // return $http.put(url, null);
                return $q.when(true);
            }, 

            incrementalUpdate: function(date) {
                // return $q.when([]);
                return Util.httpget(baseurl + '/incremental/' + date);
            }
        };
    }])

    .factory('Beacons', ['$resource', '$q', '_', function($resource, $q, _) {
        // var beacons = $resource('http://10.81.231.198/hnwapi/api/Ibeacon/');
        // var beacons = $resource('js/data/beacons.json');
        var baseurl = Util.getCustomerServerURL() + '/api/Ibeacon';
        var Beacon = $resource(baseurl + '/:id');

        return {
            all: function() {
                // return beacons.query();
                Beacon.query();
            }, 

            incrementalUpdate: function(date) {
                // return $q.when([]);
                return Util.httpget(baseurl + '/incremental/' + date);
            }
        };
    }])

    .factory('LicenseServer', ['$resource', '$http', '$q', 'Util', function($resource, $http, $q, Util) {
        var LICENSE_SERVER_URL = "http://10.81.231.198/license";
        
        return {
            getCustomerServerURL: function(key) {
                // return $q.when('http://customer_url_here');

                var url = LICENSE_SERVER_URL + '/api/customer/CheckLicense/' + key; // 'ServerUrl'
                return Util.httpget(url, function(data) {
                    return data['ServerUrl'];
                });
            }
        };
    }])
;

