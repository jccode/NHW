

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

    .factory('Beacons', ['$resource', '$q', '$http', '$rootScope', '_', function($resource, $q, $http, $rootScope, _) {
        var beacons = $resource('js/data/beacons.json');

        return {
            baseurl: function() {
                return Util.getCustomerServerURL() + '/api/ibeacon';
            }, 

            allBeacons: function() {
                // return beacons.query();
                return $resource(this.baseurl() + '/:id').query();
            },

            allGroups: function() {
                return $resource(this.baseurl() + '/group').query();
            },

            allRules:function() {
                return $resource(this.baseurl() + '/rules').query();
            },

            logRuleTrigger: function(ruleId) {
                return $http.post(this.baseurl() + '/userpassinandout/' + $rootScope.cuser.id + '/' + ruleId);
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


// ////////////////////////////////////////////////////////////////////////////////


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

        function checkout_confirm() {
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

        function toggle_favourite(uid, favouried) {
            if(favouried) {
                User.cancelFavourite(uid);
            } else {
                User.addFavourite(uid);
            }
        }

        
        return {
            checkout: checkout, 
            checkout_confirm: checkout_confirm,
            toggle_favourite: toggle_favourite
        };
    }])

    .factory('SVG', ['$rootScope', '$window', '$q', 'Floors', function($rootScope, $window, $q, Floors) {

        var svg_name = function(path) {
            return path.replace(/.*\/(.+\.svg)/i, '$1');
        };

        var svg_wrapper_size = function() {
            var el_wrapper = document.getElementById("svg-wrapper"), 
                style = el_wrapper.currentStyle || $window.getComputedStyle(el_wrapper);
            return {
                "w": el_wrapper.offsetWidth,
                "h": el_wrapper.offsetHeight - (parseInt(style.paddingBottom, 10) + parseInt(style.paddingTop, 10))
            };
        };

        var margin = {top: -5, right: -5, bottom: -5, left: -5};
        

        /**
         * Usage:
         *
         *      var svg =  new SVG(floorId);
         *      svg.load().then(function() {
         *         // ...
         *         svg.init_seat_state();
         *         svg.bind_event(function() {
         *             // ...
         *         });
         *      });
         *
         *
         * @param seat optional. if set, map will center to this seat.
         *
         */
        function SVG(floorId, seat) {
            this.floorId = floorId;
            this.seat = seat;
            
            var ws = svg_wrapper_size();
            this.width = ws["w"];
            this.height = ws["h"];

            this.zoom = d3.behavior.zoom()
                .scaleExtent([1, 10])
                .on('zoomstart', this.zoomstarted.bind(this))
                .on('zoom', this.zoomed.bind(this))
                .on('zoomend', this.zoomended.bind(this));

            this.svg = d3.select("#svg-wrapper").append("svg")
                .attr("width", this.width + margin.left + margin.right)
                .attr("height", this.height + margin.top + margin.bottom)
                .append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.right + ")" )
                .call(this.zoom);
            
            this.rect = this.svg.append("rect")
                .attr('width', this.width)
                .attr('height', this.height)
                .style('fill', 'none')
                .style('pointer-events', 'all');

            this.container = this.svg.append('g');

            this.bind_resize();
        }

        SVG.prototype = {
            zoomstarted: function() {
            },
            
            zoomended: function() {
            }, 

            zoomed: function() {
                this.container.attr("transform", "translate("+ d3.event.translate +") scale("+ d3.event.scale +")");
            },

            _load_svg: function(path, callback) {
                var self = this;
                d3.xml(path, 'image/svg+xml', function(xml) {
                    self.innersvg = self.container.append('g')
                        .append(function() {
                            return xml.documentElement;
                        });

                    callback && callback();
                }); 
            }, 

            load: function() {
                var deferred = $q.defer();
                var self = this;
                var loadSuccess = function() {
                    deferred.resolve(self);
                }


                Floors.findById(self.floorId).$promise.then(function(floor) {
                    self.floor = floor;
                    var svgurl = $rootScope.picurl + floor.SvgFile;

                    // for desktop user
                    if(!Util.isRunningOnPhonegap()) {
                        self._load_svg('img/map.svg', loadSuccess); //svgurl
                        return;
                    }

                    // for phonegap user
                    var svgname = svg_name(floor.SvgFile),
                        svgpath = $rootScope.SVG_DIR + svgname;
                    
                    $window.resolveLocalFileSystemURL(svgpath, function(f) {
                        console.log( 'Found svg file in ' + f.toURL() );
                        self._load_svg(f.toURL(), loadSuccess);
                        return;
                        
                    }, function(e) {
                        if(e.code == 1) {
                            console.log( 'Svg file ' + svgpath + ' not found.' );
                            console.log( 'Download from ' + svgurl + ' ...' );
                            
                            var ft = new FileTransfer();
                            ft.download(svgurl, svgpath, function(entry) {
                                self._load_svg(entry.toURL(), loadSuccess);
                                
                            }, function(msg, e) {
                                console.log('ERROR.' + msg);
                                console.log(JSON.stringify(e));
                                deferred.reject(e);
                            });
                            
                        } else {
                            console.log( 'ERROR. Cannot find svg file in ' + svgpath
                                         + '. Error code is ' + e.code );
                            self._load_svg(svgurl, loadSuccess);
                        }
                    });
                    
                }, function(error) {
                    deferred.reject(error);
                });
                
                return deferred.promise;
            }, 

            init_seat_state: function() {
                var self = this;
                this.innersvg.selectAll("[id^='circle']").classed('seat-available', true);
                Floors.getUnAvailableSeatsByFloor(this.floorId).then(function(unavailable_seats) {
                    // console.log(unavailable_seats);
                    var classes = {
                        "seat-available": false,
                        "seat-unavailable": true
                    };
                    _.each(unavailable_seats, function(item) {
                        var el = self.innersvg.select("#circle" + item.seat);
                        el.classed(classes).attr("data-user", item.userId);
                    });
                });
            }, 

            bind_event: function(handler) {
                this.innersvg.selectAll("[id^='circle']").on("click", function(d, i) {
                    handler(this);
                });
            },

            bind_resize: function() {
                var self = this;
                angular.element($window).bind('resize', function() {
                    var ws = svg_wrapper_size();
                    self.width = ws["w"];
                    self.height = ws["h"];
                    d3.select("#svg-wrapper").select("svg")
                        .attr({
                            'width': self.width + margin.left + margin.right,
                            'height': self.height + margin.top + margin.bottom
                        })
                        .select('rect')
                        .attr({
                            'width': self.width,
                            'height': self.height
                        });
                    
                });
                // end
            },

            center_map: function() {
                if(this.seat) {
                    var el = this.innersvg.select("#circle" + this.seat);
                    var cx = el.attr("cx"), cy = el.attr("cy");
                    var deltax = (cx >= this.width) ? -(cx - this.width/2) : 0,
                        deltay = (cy >= this.height) ? -(cy - this.height/2) : 0;
                    this.zoom.translate([deltax, deltay]).event(this.svg);
                }
            },

            wrapper_size: function() {
                var el_wrapper = document.getElementById("svg-wrapper"), 
                    style = el_wrapper.currentStyle || $window.getComputedStyle(el_wrapper);
                return {
                    "w": el_wrapper.offsetWidth,
                    "h": el_wrapper.offsetHeight - (parseInt(style.paddingBottom, 10) + parseInt(style.paddingTop, 10))
                };
            }

        };

        return SVG;
        
    }])
;

