
//
// beacon.js
// 
// @author jcchen (2014-11-05)
// @dependency observer.js
// 

// ;(function(window, observer) {
    


/**
 * Beacon
 * 
 */
function Beacon(uuid, name, major, minor) {
    // arguments.length
    this.uuid = uuid;
    this.identifier = name;
    this.major = major;
    this.minor = minor;
    
    this.state = null;          // null or "IN_RANGE" or "OUT_OF_RANGE"
    this.ts = null;             // timestamp. last update time.

    observer.make(this);
}

// constant
Beacon.IN_RANGE = 1;
Beacon.OUT_OF_RANGE = 2;

Beacon.prototype = {
    stateChange: function(state) {
        this.state = state;
        this.ts = Date.now();
        this.publish(this);
    },

    toString: function() {
        var ss = [];
        ss.push("[object Beacon]");
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
function BeaconGroup(num, beacons) {
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
        return "[object BeaconGroup]["+this.num+"]";
    }
};


function Rule(id, from, to, message) {
    this.id = id;
    this.from = from;
    this.to = to;
    this.message = message;
}

Rule.prototype = {
    action: function(beacon) {
        console.log( this + ' action. Fired by ' + beacon );
    }, 

    toString: function() {
        return "[object Rule]["+this.id+"]";
    }

};


// })(window, window.observer);

