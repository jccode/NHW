
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
}

// constant
Beacon.IN_RANGE = 1;
Beacon.OUT_OF_RANGE = 2;

Beacon.prototype = {
    stateChange: function(state) {
        this.state = state;
        this.ts = Date.now();
        this.publish(this);
    }
};

observer.make(Beacon.prototype);


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
        console.log(this.id + ' rule action. fired by ' + beacon.uuid + ',' + beacon.identifier);
    }

};


// })(window, window.observer);

