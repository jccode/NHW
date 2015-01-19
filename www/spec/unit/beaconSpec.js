'use strict';

/* jasmine specs for beacon */

describe('beacon', function() {

    var beacons_data = 
            [
                {
                    "UUID":"b9407f30-f5f8-466e-aff9-25556b57fe6d",
                    "Name":"Estimote Beacon",
                    "Major":"58877",
                    "Minor":"52730",
                    "Message":"Welcome to NS.", 
                    "Active": true
                },
                {
                    "UUID":"b9407f30-f5f8-466e-aff9-25556b57fe6d",
                    "Name":"Estimote Beacon",
                    "Major":"55445",
                    "Minor":"53655",
                    "Message":"Welcome to NS2.", 
                    "Active": true
                },
                {
                    "UUID":"e2c56db5-dffb-48d2-b060-d0f5a71096e0",
                    "Name":"AprilBeacon",
                    "Major":0,
                    "Minor":1,
                    "Message":"Here's April Beacon",
                    "Active": true
                }
            ]
    ;

    function sleep(n) {        //millis
        var s = Date.now();
        while(Date.now() - s < n) {
        }
    }


    var beacons = [];
    _.each(beacons_data, function(data) {
        var b = new Beacon(data.UUID, data.Name, data.Major, data.Minor);
        beacons.push(b);
    });

    var g1 = new BeaconGroup(1, [beacons[0]]);
    var g2 = new BeaconGroup(2, [beacons[1]]);
    var g3 = new BeaconGroup(3, [beacons[2]]);
    var g12 = new BeaconGroup(12, [beacons[0], beacons[1]]);
    var g123 = new BeaconGroup(123, beacons);

    var r12_3 = new Rule('12-3', g12, g3, 'I come from g12, going to g3');
    var r3_12 = new Rule('3-12', g3, g12, 'I come from g3, going to g12');
    var r2_3 = new Rule('2-3', g2, g3, 'I come from g2, going to g3');
    
    var rules = [];
    rules.push(r12_3);
    rules.push(r3_12);
    rules.push(r2_3);

    function resetStates() {
        _.each(rules, function(rule) {
            rule.from.resetState();
            rule.to.resetState();
        });
        _.each(beacons, function(beacon) {
            expect(beacon.state).toBeNull();
        });
    }


    describe('Basic object creation test', function() {
        it("beacon should exist", function() {
            expect(3).toEqual(beacons.length);
            expect(beacons_data[0].UUID).toEqual(beacons[0].uuid);
        });

        it("group should exist", function() {
            expect(g1).not.toBeNull();
            expect(1).toEqual(g1.beacons.length);
            expect(beacons_data[0].UUID).toEqual(g1.beacons[0].uuid);
        });

        it("group remove beacon should works all right", function() {
            var gg = new BeaconGroup(1000);
            gg.addBeacon(beacons[0]);
            gg.addBeacon(beacons[1]);
            expect(2).toEqual(gg.beacons.length);
            gg.removeBeacon(beacons[0]);
            expect(1).toEqual(gg.beacons.length);
        });

        it("rule should exist", function() {
            expect(r12_3).not.toBeNull();
        });
    });

    describe('Subscribe/publish works', function() {
        _.each(rules, function(rule) {
            _.each(rule.from.beacons, function(beacon) {
                beacon.addSubscriber(rule.action.bind(rule));
                console.log( 'beacon ' + beacon + ' add subscriber: ' + rule );

            });
            _.each(rule.to.beacons, function(beacon) {
                beacon.addSubscriber(rule.action.bind(rule));
                console.log( 'beacon ' + beacon + ' add subscriber: ' + rule );                
            });
        });

        beacons[0].stateChange(Beacon.IN_RANGE);
        
        // expected rule.action have been called. However, spy not work here.
        // don't know how to write assertion here. pls see the console output
    });

    describe("Logical function test", function() {
        it("Rule.isBeaconInRule should works", function() {
            var b1 = beacons[0];
            b1.stateChange(Beacon.IN_RANGE);
            expect(r12_3.isBeaconInRule(b1)).toBe(true);
            
            // console.log(r12_3);
            expect(r12_3.from.beacons.length).toEqual(2);
            expect(r12_3.to.beacons.length).toEqual(1);
        });

        it("Group's latestUpdateBeacon should works'", function() {
            beacons[0].stateChange(Beacon.IN_RANGE);
            sleep(100);
            beacons[1].stateChange(Beacon.OUT_OF_RANGE);
            sleep(100);
            beacons[2].stateChange(Beacon.IN_RANGE);

            expect(g1.latestUpdateBeacon().state).toEqual(Beacon.IN_RANGE);
            expect(g2.latestUpdateBeacon().state).toEqual(Beacon.OUT_OF_RANGE);
            expect(g3.latestUpdateBeacon().state).toEqual(Beacon.IN_RANGE);

            expect(g12.latestUpdateBeacon().state).toEqual(Beacon.OUT_OF_RANGE);
            expect(g123.latestUpdateBeacon().state).toEqual(Beacon.IN_RANGE);
        });

    });

    describe("Should detect the rule and do corrosponding action", function() {
        it("should do corrosponding actions, show notification messages", function() {
            console.log('==================== TEST NOTIFICATION ==============================');
            beacons[0].stateChange(Beacon.OUT_OF_RANGE);
            sleep(100);
            beacons[2].stateChange(Beacon.IN_RANGE);
            // expected r12_3 notification

            sleep(100);
            beacons[1].stateChange(Beacon.IN_RANGE);
            sleep(100);
            beacons[2].stateChange(Beacon.IN_RANGE);
            // expected r12_3, r2_3 notification

        });
    });

    describe("Multiple notification test.", function() {
        it("reset all states", function() {
            resetStates();
        });

        it("should not receive multiple notification for rule r12_3, when user walk into b3 multiple times", function() {
            console.log( 'User walk into b0, pass by b0, then into b2' );
            beacons[0].stateChange(Beacon.IN_RANGE);
            sleep(100);
            beacons[0].stateChange(Beacon.OUT_OF_RANGE);
            sleep(100);
            beacons[2].stateChange(Beacon.IN_RANGE);
            // expected r12_3 notification

            console.log( 'User walk outside b2, then into b2 again. Should not receive any notification' );
            beacons[2].stateChange(Beacon.OUT_OF_RANGE);
            sleep(100);
            beacons[2].stateChange(Beacon.IN_RANGE);
            // r12_3 notification should not receive 
        });

        it("should not receive notification multiple times if a group have more than one beacon", function() {
            console.log( 'User walk outside b2, then walk into group12, which means user get into b0 & b1, he should not receive notification 2 times' );
            beacons[2].stateChange(Beacon.OUT_OF_RANGE);
            sleep(100);
            beacons[1].stateChange(Beacon.IN_RANGE);
            sleep(100);
            beacons[0].stateChange(Beacon.IN_RANGE);
            // r3_12 notification should be received only one time.

            sleep(100);
            console.log( "Even though user can walk out and in g12, he should not receive any notifications" );
            beacons[0].stateChange(Beacon.OUT_OF_RANGE);
            sleep(100);
            beacons[0].stateChange(Beacon.IN_RANGE);
            sleep(100);
            beacons[1].stateChange(Beacon.OUT_OF_RANGE);
            sleep(100);
            beacons[1].stateChange(Beacon.IN_RANGE);

            console.log( "User walk into g3 again. r12_3 notification should be received" );
            sleep(100);
            beacons[0].stateChange(Beacon.OUT_OF_RANGE);
            sleep(100);
            beacons[1].stateChange(Beacon.OUT_OF_RANGE);
            sleep(100);
            beacons[2].stateChange(Beacon.IN_RANGE);
        });
    });
});
