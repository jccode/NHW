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
        it("should set date to storage, if we past the date argument. Also can get it back, if we past nothing", inject(function(Util) {
            var date = new Date();
            Util.lastUpdateDate(date);
            var date2 = Util.lastUpdateDate();
            expect( JSON.stringify(date) ).toEqual(date2);
        }));
    });
    
});
