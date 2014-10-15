
// Utilities

var Log = {
    log: function(msg) {
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




var STORAGE_KEYS = {
    CURR_USER: 'KEY_CURR_USER',
    USER_DATA: 'KEY_USER_DATA', 
    LAST_UPDATE_DATE: 'KEY_LAST_UPDATE_DATE',
    CUSTOMER_SERVER_URL: 'KEY_CUSTOMER_SERVER_URL'
};

var Util = {
    localStorage: WebStorage('LocalStorage')(window), 

    getAthorizationKey: function() {
        return "sdfkihernvioerj";
    },

    isRunningOnPhonegap: function() {
        return navigator.userAgent.match(/(iPhone|iPod|iPad|Android|BlackBerry|IEMobile)/);
    }, 

    createLocalNotification: function(msg) {
        var defaultOpts = {
            id: +new Date() + "",
            title: "NHW",
            message: ""
        };
        var obj = _.isObject(msg)? msg: {"message": msg};
        obj = _.extend(defaultOpts, obj);
        window.plugin.notification.local.add(obj);
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

    /**
     * @param uid is optional. 
     */
    getCustomerServerURL: function(uid) {
        return this.getUserData(STORAGE_KEYS.CUSTOMER_SERVER_URL, uid);
    }, 

    /**
     * @param uid is optional. 
     */
    setCustomerServerURL: function(url, uid) {
        this.setUserData(STORAGE_KEYS.CUSTOMER_SERVER_URL, url, uid);
    }
};




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
                console.log('[ibeacon:'+this.uuid+']didDetermineStateForRegion: ' + JSON.stringify(pluginResult));

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


// register to angular

var nhwUtils = angular.module("nhw.utils", []);

nhwUtils.factory('Util', function() {
    return Util;
}).factory('Log', function() {
    return Log;
}).factory('SingleBeacon', function() {
    return SingleBeacon;
});

_.each(['LocalStorage', 'SessionStorage'], function(storageType) {    
    nhwUtils.factory(storageType, ['$window', WebStorage(storageType)]);
});

