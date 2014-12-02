
;(function(window) {
    



// Constants

var STORAGE_KEYS = {
    CURR_USER: 'KEY_LOCAL_CURR_USER',
    USER_DATA: 'KEY_LOCAL_USER_DATA', 
    LAST_UPDATE_DATE: 'KEY_LOCAL_LAST_UPDATE_DATE',
    CUSTOMER_SERVER_URL: 'KEY_LOCAL_CUSTOMER_SERVER_URL',
    BEACON_STATE: 'KEY_LOCAL_BEACON_STATE',
    IS_IN_BUILDEING: 'KEY_LOCAL_IS_IN_BUILDING', 
    SEAT_WILLING_CHECKIN: 'KEY_SESSION_SEAT_WILLING_CHECKIN',
    SCAN_CONFIRM_CHECKIN: 'KEY_SESSION_SCAN_CONFIRM_CHECKIN',
    FIRSTTIME_USE: 'KEY_LOCAL_FIRSTTIME_USE'    
};

var EVENTS = {
    DEVICE_READY: 'deviceready',
    CHECKIN_STATE_CHANGE: 'checkin_state_change',
    BEACON_STATE_CHANGE: 'beacon_state_change',
    UPDATE_SVG_STATUS: 'update_svg_status'
};

// Utilities

var Log = {
    log: function(msg) {
        if(msg == null) msg = 'null';
        console.log("["+new Date()+"] "+msg);
    }
};


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

};


// Functions enhancement
(function() {
    if(!String.prototype.endsWith) {
        String.prototype.endsWith = function(suffix) {
            return this.indexOf(suffix, this.length - suffix.length) !== -1;
        };
    }
})();



var Util = {
    localStorage: WebStorage('LocalStorage')(window),

    IMG_REGEX: /.*\/(.+\.(jpg|png|gif|bmp|jpeg))/i, 

    getAthorizationKey: function() {
        return "sdfkihernvioerj";
    },

    isRunningOnPhonegap: function() {
        return navigator.userAgent.match(/(iPhone|iPod|iPad|Android|BlackBerry|IEMobile)/);
    },

    isCordovaNotSupport: function() {
        try {
            return !cordova;
        } catch (e) {
            return true;
        }
    },

    isIOS: function() {
        if(!window.device)
            return false;
        return device.platform.toLowerCase() == 'ios';
    }, 

    isIbeaconSupported: function() {
        if(!window.device)
            return false;
        var platform = device.platform.toLowerCase(),
            version = device.version;
        
        console.log('[util.js 110] platform: ' + platform);
        
        return platform == 'ios' || (platform == 'android' && version >= '4.3');
    },

    createLocalNotification: function(msg) {
        var defaultOpts = {
            id: +new Date() + "",
            title: "NS Werkplek",
            message: ""
        };
        var obj = _.isObject(msg)? msg: {"message": msg};
        obj = _.extend(defaultOpts, obj);
        window.plugin.notification.local.add(obj);
    },

    toast: function(msg, opts) {
        if(!window.plugins) {   // toast not support(desktop)
            return window.alert(msg);
        }
        var def = {
            'duration': 'short',
            'position': 'bottom'
        };
        var opts = _.extend(def, opts);
        window.plugins.toast.show(msg, opts['duration'], opts['position'], function(a) {
            console.log('Toast success:' + a);
        }, function(b) {
            console.log('Toast error:' + a);
        });
    }, 

    currUser: function(user) {
        var key = STORAGE_KEYS.CURR_USER;
        if(user) {
            this.localStorage.set(key, user);
        } else {
            return this.localStorage.get(key);
        }
    },

    clearCurrUser: function() {
        this.localStorage.remove(STORAGE_KEYS.CURR_USER);
    },

    /**
     *
     * @param uId is optional. if omitted, use current user email.
     */
    getUserData: function(key, uid) {
        if(!uid) {
            var user = this.currUser();
            if(!user) {
                Log.log('getUserData Error. Current user not exist.');
                // throw 'getUserData Error. Current user not exist.';
                return null;
            }
            uid = user.email;
        }
        uid = uid.toLowerCase();
        var dataKey = STORAGE_KEYS.USER_DATA;
        var userdata = this.localStorage.get(dataKey);
        if(!userdata) {
            return null;
        } else {
            return userdata[uid][key];
        }
    }, 

    setUserData: function(key, value, uid) {
        if(!uid) {
            var user = this.currUser();
            if(!user) {
                Log.log('getUserData Error. Current user not exist.');
                throw 'getUserData Error. Current user not exist.';
            }
            uid = user.email;
        }
        uid = uid.toLowerCase();

        var dataKey = STORAGE_KEYS.USER_DATA;
        var userdata = this.localStorage.get(dataKey);
        if(!userdata) {
            userdata = {};
        }
        
        userdata2 = userdata[uid];
        if(!userdata2) {
            userdata[uid] = {};
        }

        // console.log(uid);
        // console.log(key);
        // console.log(userdata);
        
        userdata[uid][key] = value;
        this.localStorage.set(dataKey, userdata);
    },

    clearAllUserData: function() {
        this.localStorage.remove(STORAGE_KEYS.USER_DATA);
    }, 

    lastUpdateDate: function(date) {
        var key = STORAGE_KEYS.LAST_UPDATE_DATE;
        if(date) {
            // this.localStorage.set(key, date);
            this.setUserData(key, date);
        } else {
            // return this.localStorage.get(key);
            return this.getUserData(key);
        }
    },

    // isFirstTime: function(b) {
    //     var key = STORAGE_KEYS.FIRSTTIME_USE;
    //     if(b == undefined) {
    //         return this.getUserData(key);
    //     } else {
    //         this.setUserData(key, b);
    //     }
    // }, 


    /**
     * @param uid is optional. 
     */
    getCustomerServerURL: function(uid) {
        var url = this.getUserData(STORAGE_KEYS.CUSTOMER_SERVER_URL, uid);
        if(url && url.endsWith('/')) {
            return url.substring(0, url.length-1);
        } else {
            return url;
        }
    }, 

    /**
     * @param uid is optional. 
     */
    setCustomerServerURL: function(url, uid) {
        this.setUserData(STORAGE_KEYS.CUSTOMER_SERVER_URL, url, uid);
    },

    getPictureRootUrl: function() {
        var customer_url = this.getCustomerServerURL();
        if(customer_url) {
            return customer_url.substring(0, customer_url.length - 3);
        } else {
            return null;
        }
    },

    /**
     * {'beaconId1':{'state':'IN_RANGE / OUT_OF_RANGE', 'ts':'int_of_timestamp'}, 'beaconId2':{xxxx}, ... }
     * 
     */
    getBeaconStates: function() {
        return this.localStorage.get(STORAGE_KEYS.BEACON_STATE);
    }, 

    setBeaconState: function(id, state) {
        var key = STORAGE_KEYS.BEACON_STATE;
        var ss = Util.getBeaconStates() || {};
        ss[id] = {
            'state': state,
            'ts': Date.now()
        };
        this.localStorage.set(key, ss);
    },

    clearBeaconStates: function() {
        this.localStorage.remove(STORAGE_KEYS.BEACON_STATE);
    }, 

    isInBuilding: function(flag) {
        // var states = Util.getBeaconStates();
        // return _.some(_.values(states), function(s) {
        //     return s.state == BEACON_IN_RANGE;
        // });
        
        if(flag == undefined) {
            return this.getUserData(STORAGE_KEYS.IS_IN_BUILDEING);
        } else {
            this.setUserData(STORAGE_KEYS.IS_IN_BUILDEING, flag);
        }
    }, 


    // trim: function(x) {
    //     return x.replace(/^\s+|\s+$/gm,'');
    // }, 

    parseBarcode: function(content) {
        //  e.g.     HNW://001-10-0001
        //  format.  "HNW://" + building_code(3 bit) + floor_num(2 bit) + seat_code(4 bit)

        if(!content) return null;
        content = content.trim().toLowerCase();
        // var prefix = 'hnw://';
        var reg = /hnw:\/\/\d{3}-\d{2}-\d{4}/;
        if(!reg.test(content)) {
            return null;
        }

        return {
            building: content.substring(6,9),
            floor: content.substring(10,12),
            seat: content.substring(13)
        };
    },

    normalizeAttrName: function(attr) {
        var SPECIAL_CHARS_REGEXP = /([\:\-\_]+(.))/g;
        var MOZ_HACK_REGEXP = /^moz([A-Z])/;
        var PREFIX_REGEXP = /^((?:x|data)[\:\-_])/i;
        
        /**
         * Converts all accepted directives format into proper directive name.
         * All of these will become 'myDirective':
         * my:Directive
         * my-directive
         * x-my-directive
         * data-my:directive
         *
         * Also there is special case for Moz prefix starting with upper case letter.
         * @param name Name to normalize
         */
        function directiveNormalize(name) {
            return camelCase(name.replace(PREFIX_REGEXP, ''));
        }

        function camelCase(name) {
            return name.
                replace(SPECIAL_CHARS_REGEXP, function(_, separator, letter, offset) {
                    return offset ? letter.toUpperCase() : letter;
                }).
                replace(MOZ_HACK_REGEXP, 'Moz$1');
        }

        return directiveNormalize(attr);
    }, 

    imgName: function(url) {
        return url.replace(this.IMG_REGEX, '$1');
    },

    svgName: function(url) {
        return url.replace(/.*\/(.+\.svg)/i, '$1');
    }

};


// DataTransform

var DataTransform = (function() {

    var mapping = {
        user: [
            ['id', 'UserId'],
            ['name', function(data) {
                var ret = [data['FirstName'] || '', data['MiddleName'] || '', data['LastName'] || ''].join(' ');
                return ret;
            }],
            ['num', 'PersId'], 
            ['email', 'Email'],
            ['photo', 'UserPic']
        ]
    };

    var transform = function(type, data) {
         var ret = {},
            m = mapping[type];
        _.each(m, function(tuple) {
            // console.log('[DataTransfer] '+tuple);
            var destKey = tuple[1];
            var val = _.isFunction(destKey)? destKey(data): data[destKey];
            if(val != undefined) {
                ret[tuple[0]] = val;
            }
        });
        return ret;
    };

    
    var export_ = {};
    _.each(_.keys(mapping), function(key) {
        export_[key] = function(data) {
            return transform(key, data);
        }
    });

    return export_;
})();




// ibeacon

var SingleBeacon = function(uuid, identifier, major, minor) {
    this.uuid = uuid;
    this.identifier = identifier;
    this.major = major;
    this.minor = minor;

    this.beaconRegion = this.createBeacon(uuid, identifier, major, minor);
    
    this.events = {
        'enter': [],
        'leave': []
    };
    this.errorHandler = console.log;
};

SingleBeacon.prototype = {
    
    createBeacon: function(uuid, identifier, major, minor) {
        var beaconRegion = new cordova.plugins.locationManager.BeaconRegion(identifier, uuid, major, minor);
        return beaconRegion; 
    },

    _createDelegate: function() {
        var self = this;
        var delegate = new cordova.plugins.locationManager.Delegate().implement({
            didDetermineStateForRegion: function (pluginResult) {
                console.log('[ibeacon:'+self.uuid+']didDetermineStateForRegion: ' + JSON.stringify(pluginResult));

                if(pluginResult['state'] == 'CLRegionStateInside') {
                    _.each(self.events['enter'], function(fn) {
                        fn.apply(self, [pluginResult]);
                    });
                }
                else if(pluginResult['state'] == 'CLRegionStateOutside') {
                    _.each(self.events['leave'], function(fn) {
                        fn.apply(self, [pluginResult]);
                    });
                }
                
                cordova.plugins.locationManager.appendToDeviceLog('[ibeacon:'+this.uuid+']didDetermineStateForRegion: ' + JSON.stringify(pluginResult));
            },
            didStartMonitoringForRegion: function (pluginResult) {
                console.log('[ibeacon:'+this.uuid+']didStartMonitoringForRegion:' + JSON.stringify(pluginResult));
            },
            didRangeBeaconsInRegion: function (pluginResult) {
                console.log('[ibeacon:'+this.uuid+']didRangeBeaconsInRegion: ' + JSON.stringify(pluginResult));
            }
        });
        
        return delegate;
    }, 


    /**
     * Add event listener
     *
     * @param type enter|leave  
     */
    addEventListener: function(type, listener) {
        this.events[type].push(listener);
    },

    removeEventListener: function(type, listener) {
        var index = this.events[type].indexOf(listener);
        this.events[type].splice(index, 1);
    }, 

    startMonitoring: function() {
        var delegate = this._createDelegate();
        cordova.plugins.locationManager.setDelegate(delegate);
        cordova.plugins.locationManager.startMonitoringForRegion(this.beaconRegion)
            .fail(this.errorHandler)
            .done();
    },

    stopMonitoring: function() {
        cordova.plugins.locationManager.stopRangingBeaconsInRegion(this.beaconRegion)
            .fail(this.errorHandler)
            .done();
    }
};


var BeaconUtil = function($rootScope) {

    return {
        createBeacon: function(uuid, identifier, major, minor) {
            var beaconRegion = new cordova.plugins.locationManager.BeaconRegion(identifier, uuid, major, minor);
            return beaconRegion; 
        },
        
        createDelegate: function() {
            var delegate = new cordova.plugins.locationManager.Delegate().implement({
                didDetermineStateForRegion: function (pluginResult) {
                    // console.log("--------------------------------------------------");
                    console.log('[ibeacon]didDetermineStateForRegion: ' + JSON.stringify(pluginResult));
                    // console.log("--------------------------------------------------");

                    var state = pluginResult['state'],
                        region = pluginResult['region'];

                    // if(pluginResult['state'] == 'CLRegionStateInside') {
                    //     _.each(self.events['enter'], function(fn) {
                    //         fn.apply(self, [pluginResult]);
                    //     });
                    // }
                    // else if(pluginResult['state'] == 'CLRegionStateOutside') {
                    //     _.each(self.events['leave'], function(fn) {
                    //         fn.apply(self, [pluginResult]);
                    //     });
                    // }

                    // if(state == 'CLRegionStateInside') {
                    //     var match = _.find(beacons, function(beacon) {
                    //         return beacon['UUID'] == region['uuid'] &&
                    //             beacon['Name'] == region['identifier'] &&
                    //             beacon['Major'] == region['major'] &&
                    //             beacon['Minor'] == region['minor'];
                    //     });
                    //     if(match) {
                    //         var now = +new Date();
                    //         Util.createLocalNotification({
                    //             title: region['identifier'],
                    //             message: match['Message'], 
                    //             date: new Date(now + 2*1000)
                    //         });
                    //         console.log("[PUSH NOTIFICATION] " + region['identifier'] + " " + match['Message']);
                    //     }
                    // }

                    var beacons = $rootScope.beaconmodel.beacons;
                    var match = _.find(beacons, function(beacon) {
                        return beacon['uuid'] == region['uuid'] &&
                            beacon['identifier'] == region['identifier'] &&
                            beacon['major'] == region['major'] &&
                            beacon['minor'] == region['minor'];
                    });
                    if(match) {
                        console.log('beacon in range ' + state);
                        
                        if(state == 'CLRegionStateInside') {
                            match.stateChange(BEACON_IN_RANGE);
                        }
                        else if(state == 'CLRegionStateOutside') {
                            match.stateChange(BEACON_OUT_OF_RANGE);
                        }
                        
                    }
                    
                    cordova.plugins.locationManager.appendToDeviceLog('[ibeacon]didDetermineStateForRegion: ' + JSON.stringify(pluginResult));
                },
                didStartMonitoringForRegion: function (pluginResult) {
                    console.log('[ibeacon]didStartMonitoringForRegion: ' + JSON.stringify(pluginResult));
                },
                didRangeBeaconsInRegion: function (pluginResult) {
                    console.log('[ibeacon]didRangeBeaconsInRegion: ' + JSON.stringify(pluginResult));
                }
            });
            
            return delegate;
        },

        createIosDelegate: function() {
            var delegate = new cordova.plugins.locationManager.Delegate().implement({
                didDetermineStateForRegion: function (pluginResult) {

                    console.log('[ibeacon]didDetermineStateForRegion: ' + JSON.stringify(pluginResult));

                },
                didStartMonitoringForRegion: function (pluginResult) {
                    console.log('[ibeacon]didStartMonitoringForRegion: ' + JSON.stringify(pluginResult));
                },
                didRangeBeaconsInRegion: function (pluginResult) {
                    console.log('[ibeacon]didRangeBeaconsInRegion: ' + JSON.stringify(pluginResult));
                    // console.log( '-------------------jclog--------------------' );

                    var retbeacons = pluginResult.beacons;
                    var beacons = $rootScope.beaconmodel.beacons;
                    _.each(beacons, function(beacon) {
                        // console.log( '1. detecting ' + beacon );

                        var match = _.find(retbeacons, function(region) {
                            return beacon['uuid'].toLowerCase() == region['uuid'].toLowerCase() &&
                                // beacon['identifier'] == region['identifier'] &&
                                beacon['major'] == region['major'] &&
                                beacon['minor'] == region['minor'];
                        });
                        // console.log( '2. ' + (match? 'in range': 'out of range') + ' current state is ' + beacon.state );
                        
                        // determine state really change
                        var state = beacon.state;
                        if(match) {
                            if(state != BEACON_IN_RANGE) { // state changed
                                console.log( 'beacon: ' + beacon['major'] + ' change state to ' + BEACON_IN_RANGE );
                                beacon.stateChange(BEACON_IN_RANGE);
                            }
                        } else {
                            if(state != BEACON_OUT_OF_RANGE) {
                                console.log( 'beacon: ' + beacon['major'] + ' change state to ' + BEACON_OUT_OF_RANGE );
                                beacon.stateChange(BEACON_OUT_OF_RANGE);
                            }
                        }
                    });

                }
            });
            
            return delegate;            
        }

    };
    
};


// register to angular

var nhwUtils = angular.module("nhw.utils", []);

nhwUtils.factory('Log', function() {
    return Log;
    
}).factory('Util', ['$http', '$q', 'Log', function($http, $q, Log) {
    
    function httpget(url, resultTransform) {
        
        // console.log('HTTPGET: ' + url + ' ;');
        // if(resultTransform) {
        //     console.log('HTTPGET: resultTransform ' + resultTransform);
        // }
        
        var deferred = $q.defer();
        $http.get(url).success(function(data, status, headers, config) {
            // console.log('HTTPGET success. ' + JSON.stringify(data));
            if(data) {
                if(resultTransform) {
                    data = resultTransform(data);
                }
                deferred.resolve(data);
            } else {
                deferred.resolve(null);
            }
        })
            .error(function(data, status, headers, config) {
                // console.log('HTTPGET failed. ' + JSON.stringify(data));
                // failed to connect to the server
                Util.toast('Er kon geen verbinding tot stand worden gebracht met de applicatie server.');
                Log.log('[HTTPGET ERROR]: get ' + url + ' error.');
                Log.log('[HTTPGET ERROR]: data: ' + JSON.stringify(data) + '; status:' + JSON.stringify(status) +
                       '; headers: ' + JSON.stringify(headers) + '; config:' + JSON.stringify(config));

                deferred.reject(data);
            });
        return deferred.promise;
    }

    
    function download(url, savepath) {
        // if(!window.resolveLocalFileSystemURL) { // for desktop user
        //     return $q.when(false);
        // }
        
        var deferred = $q.defer();
        window.resolveLocalFileSystemURL(savepath, function(f) {
            console.log( f.toURL() + ' is exist. download cancel.' );
            deferred.resolve(f.toURL());
            
        }, function(e) {
            if(e.code == 1) {
                console.log( 'download from ' + url + ' ...' );
                var ft = new FileTransfer();
                ft.download(url, savepath, function(entry) {
                    deferred.resolve(entry.toURL());
                    
                }, function(msg, e) {
                    console.log( 'error occured while downloading. ' + msg );
                    console.log( JSON.stringify(e) );
                    deferred.reject(e);
                });
            } else {
                console.log( 'error occured when resolve local file url ' + savepath
                           + '. error code is ' + e.code);
                deferred.reject(e);
            }
        });
        return deferred.promise;
    }

    var util = _.extend({
        httpget: httpget,
        download: download
    }, Util);
    
    return util;
    
}]).factory('DataTransform', function() {
    return DataTransform;
}).factory('BeaconUtil', ['$rootScope', function($rootScope) {
    return BeaconUtil($rootScope);
}]);

_.each(['LocalStorage', 'SessionStorage'], function(storageType) {    
    nhwUtils.factory(storageType, ['$window', WebStorage(storageType)]);
});




    // --------------------
    // Export
    //

    var exports = {
        "STORAGE_KEYS": STORAGE_KEYS,
        "EVENTS": EVENTS,
        "Log": Log,
        "WebStorage": WebStorage,
        "Util": Util,
        "DataTransform": DataTransform,
        "SingleBeacon": SingleBeacon,
        "BeaconUtil": BeaconUtil
    };

    _.extend(window, exports);
    

})(window);    
