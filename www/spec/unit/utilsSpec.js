'use strict';

/* jasmine specs for services go here */

describe('utils', function() {
    beforeEach(module('nhw.utils'));


    // describe('version', function() {
    //     it('should return current version', inject(function(version) {
    //         expect(version).toEqual('0.1');
    //     }));
    // });


    // LocalStorage, SessionStorage 
    _.each(['LocalStorage', 'SessionStorage'], function(storageType) {

        describe(storageType + " Service", function(){
            var storage,
                KEY = "UNIT_TEST_KEY",
                val = "SOME VALUE";
            
            beforeEach(inject(function($injector) {
                storage = $injector.get(storageType);
            }));
            // var LocalStorage = $injector.get('LocalStorage');
            // var KEY = "UNIT_TEST_KEY";

            it("should add to "+storageType+" and can get from it", function(){
                storage.set(KEY, val);
                expect(val).toEqual(storage.get(KEY));
            });

            it("should remove value from "+storageType, function(){
                storage.remove(KEY);
                expect(storage.get(KEY)).toBeNull();
            });


            it("should clear "+storageType+" and get nothing", function(){
                storage.set(KEY, val);
                expect(val).toEqual(storage.get(KEY));
                storage.clear();
                expect(storage.get(KEY)).toBeNull();
            });

        });
        
    });

    describe("Utils", function() {
        // it("should set date to storage, if we past the date argument. Also can get it back, if we past nothing", inject(['Util', function(Util) {
        //     var date = new Date();
        //     Util.lastUpdateDate(date);
        //     var date2 = Util.lastUpdateDate();
        //     expect( JSON.stringify(date) ).toEqual(date2);
        // }]));

        it("should save user to localStorage", inject(['Util', function(Util) {
            var user = {'name':'Tom', 'email':'Tom@gmail.com'};
            Util.currUser(user);
            var user2 = Util.currUser();
            expect(user).toEqual(user2);
        }]));

        it("should get lastUpdateDate from user data", inject(['Util', function(Util) {
            var email = 'Tom@gmail.com', 
                user = {'name':'Tom', 'email':email},
                date = new Date();
            // expect(Util.lastUpdateDate).toThrow();
            
            Util.currUser(user);
            Util.lastUpdateDate(date);
            var date2 = Util.lastUpdateDate();
            expect( date.toISOString() ).toEqual(date2);
        }]));

        it("should get customer server url from user data", inject(['Util', function(Util) {
            var url = "http://some_url",
                uid = "tom@gmail.com";
            Util.setCustomerServerURL(url, uid);
            expect(url).toEqual(Util.getCustomerServerURL(uid));
        }]));

        it("getBeaconState, setBeaconState should works", inject(['Util', function(Util) {
            var IN_RANGE = 1, OUT_OF_RANGE = 2;
            Util.clearBeaconStates();
            expect(Util.getBeaconStates()).toBeNull();
            
            Util.setBeaconState('id1', IN_RANGE);
            var s = Util.getBeaconStates();
            expect(s.id1).not.toBeNull();
            expect(s.id1.state).toEqual(IN_RANGE);
            var diff = Date.now() - s.id1.ts;
            // expect(diff).toBeGreaterThan(0);
            expect(diff >= 0).toBeTruthy();
            
        }]));
    });
    
});
