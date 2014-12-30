
//
// beacon.js
// 
// @author jcchen (2014-11-05)
// @dependency observer.js
//

// Constants
;
BEACON_IN_RANGE = 1;
BEACON_OUT_OF_RANGE = 2;
RULE_TYPE_Enter = 1;
RULE_TYPE_Exit = 2;

angular.module('nhw.beacon-model', [])
    .factory('BeaconModel', ['$rootScope', 'Util', 'Beacons', function($rootScope, Util, Beacons) {


        /**
         * Beacon
         * 
         */
        function Beacon(id, uuid, name, major, minor) {
            // arguments.length
            this.id = id;
            this.uuid = uuid;
            this.identifier = name;
            this.major = major;
            this.minor = minor;
            
            this.state = null;          // null or "IN_RANGE" or "OUT_OF_RANGE"
            this.ts = 0;                // timestamp. last update time.

            observer.make(this);
        }

        Beacon.prototype = {
            stateChange: function(state) {
                // console.log( 'beacon ' + this.major + ' set state. ' + 'current state is ' + this.state + ((state == this.state)? ' state not change. skip. ': '') );
                // if(state == this.state) return;
                
                // only apply when state really changed
                this.state = state;
                this.ts = Date.now();
                this.publish(this);
                
                // state persistence
                Util.setBeaconState(this.id, state);
            },

            toString: function() {
                var ss = [];
                ss.push("[object Beacon]");
                ss.push("[" + this.id + "]");
                ss.push("[" + this.identifier + "]");
                // ss.push("[" + this.uuid + "]");
                ss.push("[" + this.major + "]");
                ss.push("[" + this.minor + "]");
                return ss.join("");
            }
        };


        /**
         * Group
         * 
         * @param beacons optional
         */
        function BeaconGroup(id, num, beacons) {
            this.id = id;
            this.num = num;
            this.beacons = beacons || [];
        }

        BeaconGroup.prototype = {
            addBeacon: function(beacon) {
                this.beacons.push(beacon);
            }, 

            removeBeacon: function(beacon) {
                var index = this.beacons.indexOf(beacon);
                this.beacons.splice(index, 1);
            },

            toString: function() {
                return "[object BeaconGroup]["+this.id+"]";
            },

            /**
             * get BeaconGroup state
             *
             * @return {state: BEACON_IN_RANGE/BEACON_OUT_OF_RANGE, ts: int}
             */
            lastUpdateBeacon: function() {
                if(this.beacons.length == 0) {
                    return null;
                }
                else if(this.beacons.length == 1) {
                    return this.beacons[0];
                }
                var latest = _.max(this.beacons, function(beacon) {
                    return beacon.ts;
                });
                return latest;
            }

        };


        function Rule(id, from, to, message, type) {
            this.id = id;
            this.from = from;
            this.to = to;
            this.message = message;
            this.type = type;
        }

        Rule.THRESHOLD = 10 * 60 * 1000;          // 10 * 60 * 1000; 10 min;

        Rule.prototype = {
            action: function(beacon) {
                console.log( this + ' action. Fired by ' + beacon );
                if(!this.isBeaconInRule(beacon)) {
                    return;
                }
                if(this.isRuleTrigger()) {
                    // push notifications.
                    console.log("[Rule "+this.id+" trigger] Push Notification: "+this.message);
                    Util.createLocalNotification(this.message);
                    Beacons.logRuleTrigger(this.id);

                    // inside / outside building
                    if(this.type == RULE_TYPE_Enter) {
                        Util.isInBuilding(true);
                        $rootScope.isInBuilding = true;
                    } else if(this.type == RULE_TYPE_Exit) {
                        Util.isInBuilding(false);
                        $rootScope.isInBuilding = false;
                    }
                }
            }, 

            toString: function() {
                return "[object Rule]["+this.id+"]";
            },

            isBeaconInRule: function(beacon) {
                var beacons = this.from.beacons;
                beacons = beacons.concat(this.to.beacons);
                return _.contains(beacons, beacon);
            }, 

            isRuleTrigger:function() {
                var fb = this.from.lastUpdateBeacon(),
                    tb = this.to.lastUpdateBeacon();
                if(tb.ts - fb.ts > 0 && tb.ts - fb.ts < Rule.THRESHOLD) {
                    if( (fb.state == BEACON_OUT_OF_RANGE && tb.state == BEACON_IN_RANGE) ||
                        (fb.state == BEACON_IN_RANGE && tb.state == BEACON_IN_RANGE) ||
                        (fb.state == BEACON_OUT_OF_RANGE && tb.state == BEACON_OUT_OF_RANGE) ) {

                        return true;
                    }
                }
                
                return false;
            }
            
        };

        return {
            Beacon: Beacon,
            BeaconGroup: BeaconGroup,
            Rule: Rule
        };
        
    }])
;


