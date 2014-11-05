

angular.module('nhw.services', ['ngResource']) // , 'angular-underscore'

    .factory('User', ['$resource', '$http', '$q', '_', '$rootScope', 'Util', function($resource, $http, $q, _, $rootScope, Util) {

        // var users = $resource('js/data/users.json');

        return {
            baseurl: function() {
                return Util.getCustomerServerURL() + '/api/user';
            },

            favouriteurl: function() {
                return Util.getCustomerServerURL() + '/api/favorite';
            }, 

            isAuthenticated: function(user) { // 
                // console.log('User.isAuthenticated')
                // console.log(JSON.stringify(user));
                
                var cUser = Util.currUser();
                
                console.log(JSON.stringify(cUser));
                
                if(!user && !cUser) {
                    return false;
                }
                else if(!user && cUser) {
                    user = {
                        name: cUser.name,
                        email: cUser.email,
                        num: cUser.num
                    };
                }

                /*
                return users.query().$promise.then(function(data) {
                    var ret =  _.where(data, user);
                    return ret.length > 0 ? ret[0]: false;
                });
                 */

                var checkurl = Util.getCustomerServerURL(user.email)+'/api/user/checkuser/'+user.email+'/'+user.num;
                console.log(checkurl);
                return Util.httpget(checkurl, DataTransform.user);
            }, 

            hasCheckIn: function(id) {
                // return false;
                var uid; 
                if(!id) {
                    var currUser = $rootScope.cuser;
                    if(!currUser) return false;
                    uid = currUser.id;
                } else {
                    uid = id;
                }
                var url = this.baseurl() + '/ischeckin/' + uid;
                return Util.httpget(url);
            },

            all: function() {
                // return users.query();
                return $resource(this.baseurl()+"/:id").query();
            },

            findById: function(id) {
                /*
                return this.all().$promise.then(function(users) {
                    return _.find(users, function(user) {
                        return user.id == id;
                    });
                });
                 */
                return $resource(this.baseurl()+"/:id").get({id: id});
            },

            checkout: function() {
                var user = Util.currUser();
                return $http.put(this.baseurl() + '/checkout/' + user.id);
            }, 

            favourites: function() {
                var user = Util.currUser();
                return $resource(this.baseurl() + '/favorite/:id', {id: '@id'}).query({id: user.id});
            },

            allWithFavourites: function() {
                var user = Util.currUser();
                return $resource(this.baseurl() + '/withfavorite/:id', {id: '@id'}).query({id: user.id});
            }, 

            checkins: function() {
                var user = Util.currUser();                
                return $resource(this.baseurl() + '/online/:id', {id: '@id'}).query({id: user.id});
            },

            addFavourite: function(uid) {
                var user = Util.currUser();
                $http.post(this.favouriteurl() + '/add/' + user.id + '/' + uid);
            },

            cancelFavourite: function(uid) {
                var user = Util.currUser();
                $http.delete(this.favouriteurl() + '/cancel/' + user.id + '/' + uid);
            },

            favoriteCount: function(uid) {
                return Util.httpget(this.favouriteurl() + '/count/' + uid );
            },

            isFavourite: function(uid) {
                var user = Util.currUser();
                return Util.httpget(this.favouriteurl() + '/isfavorite/' + user.id + '/' + uid);
            }, 

            notCheckins: function() {
                var user = Util.currUser();                
                return $resource(this.baseurl() + '/offline/:id', {id: '@id'}).query({id: user.id});
            },

            setUserState: function(isavailable) {
                var cuser = Util.currUser(),
                    url = this.baseurl() + '/setuserstatus/'+cuser.id+'/'+isavailable;
                return $http.put(url);
            }, 

            incrementalUpdate: function(date) {
                // return $q.when([]);
                return Util.httpget(this.baseurl() + '/incremental/' + date);
            }
        };
    }])

    .factory('Building', ['$resource', '$q', '_', 'Util', function($resource, $q, _, Util) {
        // var buildings = $resource('js/data/buildings.json');

        return {
            baseurl: function() {
                return Util.getCustomerServerURL() + '/api/building';
            }, 

            all: function() {
                // return buildings.query();
                return $resource(this.baseurl() + '/:id').query();
            },

            seatCount: function(buildingId) {
                return Util.httpget(this.baseurl() + '/count/' + buildingId);
            }, 

            incrementalUpdate: function(date) {
                // return $q.when([]);
                return Util.httpget(this.baseurl() + '/incremental/' + date);
            }
        };
    }])

    .factory('Floors', ['$resource', '$http', '$q', '_', 'Util', function($resource, $http, $q, _, Util) {
        // var floors = $resource('js/data/floors.json');

        return {
            baseurl: function() {
                return Util.getCustomerServerURL() + '/api/floor';
            },

            seaturl: function() {
                return Util.getCustomerServerURL() + '/api/seat';
            }, 

            all: function() {
                // return floors.query(function(data) {
                //     var floors = _.each(data, function(floor) {
                //         floor['available'] = (floor.workspace > 0)
                //             && (floor.workspace - floor.present_people > 0);
                //     });
                //     return floors;
                // });
                // console.log('Floors service, all: ' + baseurl + "; getCustomerServerURL:" + Util.getCustomerServerURL());
                // console.log(Floor);
                return $resource(this.baseurl() + '/:id').query();
            },

            floorsByBuildingId: function(buildingId) {
                return $resource(this.baseurl() + '/building/:buildingId').query({
                    buildingId: buildingId
                });
            }, 

            findById: function(id) {
                // return this.all().$promise.then(function(floors) {
                //     return _.find(floors, function(floor) {
                //         return floor.id == id;
                //     });
                // });
                
                return $resource(this.baseurl() + '/:id').get({id: id});
            },

            findByBuildingNoAndFloorNo: function(buildingNo, floorNo) {
                return $resource(this.baseurl() + '/:buildno/:floorno').get({
                    buildno: buildingNo,
                    floorno: floorNo
                });
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
                var url = this.baseurl() + '/unavailableseat/' + floorId;
                return Util.httpget(url, function(data) {
                    var unavailables = data['FloorSeats'];
                    var ret = _.map(unavailables, function(obj) {
                        return {
                            'seat': parseInt(obj['SeatCode']),
                            'userId': obj['UserId']
                        };
                    });
                    return ret;
                });
            },

            checkin: function(floorId, seat) {
                var cuser = Util.currUser();
                var url = this.seaturl() + '/checkin/' + floorId + '/' + seat + '/' + cuser.id;
                return $http.put(url);
                // return $q.when(true);
            },

            reserveseat: function(floorId) {
                var url = this.seaturl() + '/reserveraseat/' + floorId;
                return Util.httpget(url);
            },

            incrementalUpdate: function(date) {
                // return $q.when([]);
                return Util.httpget(this.baseurl() + '/incremental/' + date);
            }
        };
    }])

    .factory('Beacons', ['$resource', '$q', '_', function($resource, $q, _) {
        var beacons = $resource('js/data/beacons.json');

        return {
            baseurl: function() {
                return Util.getCustomerServerURL() + '/api/ibeacon';
            }, 

            all: function() {
                // return beacons.query();
                return $resource(this.baseurl() + '/:id').query();
            }, 

            incrementalUpdate: function(date) {
                // return $q.when([]);
                return Util.httpget(this.baseurl() + '/incremental/' + date);
            }
        };
    }])

    .factory('LicenseServer', ['$resource', '$http', '$q', 'Util', function($resource, $http, $q, Util) {
        // var LICENSE_SERVER_URL = "http://10.81.231.198/license";
        var LICENSE_SERVER_URL = "http://www.hongding.nl";
        
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

    .factory('CtrlService', ['$rootScope', '$state', '$modal', '$log', 'User', function($rootScope, $state, $modal, $log, User) {

        function checkout() {
            User.checkout().then(function(ret) {
                if(ret) {
                    $state.go("app.checkin");
                    $rootScope.$broadcast(EVENTS.CHECKIN_STATE_CHANGE);

                    // close sidemenu
                    console.log('toggle mainSidebar off');
                    // $rootScope.toggle('mainSidebar', 'off');
                } else {
                    // notify user that checkout failed
                    console.log("user checkout failed");
                }
            });   
        }

        
        return {
            checkout: checkout, 

            checkout_confirm: function() {
                var modalInstance = $modal.open({
                    templateUrl: 'confirm_checkout_modal.html',
                    controller:  'CheckInModalCtrl',
                    windowClass: 'mymodal',
                    size: 'sm',
                    resolve: {
                        data: function() {
                            return {};
                        }
                    }
                });
                
                modalInstance.result.then(function(ret) {
                    // click on buttons. 'true' if click yes, 'false' if click no.
                    if(ret) {
                        checkout();
                    }
                    
                }, function() {
                    // dismissed
                    // $rootScope.toggle('mainSidebar', 'off');
                    $log.info('Modal dismissed at: ' + new Date());
                });
            }
        };
    }])
;

