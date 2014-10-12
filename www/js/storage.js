
//
//
//
// class User(models.Model):
//     name = models.CharField(max_length=20)
//     email = models.EmailField()
//     photo = models.CharField(max_length=20)

// class Building(models.Model):
//     code = models.CharField(max_length=20)
//     name = models.CharField(max_length=20)
//     floorCount = models.IntegerField()

// class Floor(models.Model):
//     buildingId = models.ForeignKey(Building)
//     num = models.IntegerField()
//     svg = models.CharField(max_length=20)



//
//

// CREATE TABLE "testapp_user" (
//     "id" integer NOT NULL PRIMARY KEY,
//     "name" varchar(20) NOT NULL,
//     "email" varchar(75) NOT NULL,
//     "photo" varchar(20) NOT NULL
// )
// ;
// CREATE TABLE "testapp_building" (
//     "id" integer NOT NULL PRIMARY KEY,
//     "code" varchar(20) NOT NULL,
//     "name" varchar(20) NOT NULL,
//     "floorCount" integer NOT NULL
// )
// ;
// CREATE TABLE "testapp_floor" (
//     "id" integer NOT NULL PRIMARY KEY,
//     "buildingId_id" integer NOT NULL REFERENCES "testapp_building" ("id"),
//     "num" integer NOT NULL,
//     "svg" varchar(20) NOT NULL
// )
// ;




angular.module('nhw.storage', [])
    .factory('Storage', ['$window', '_', function($window, _) {

        var isPhonegap = typeof sqlitePlugin != 'undefined', 
            openDatabase = isPhonegap? sqlitePlugin.openDatabase: $window.openDatabase; // chrome support. firefox not support.

        console.log(isPhonegap);
        console.log(openDatabase);
        
        var dbname = 'mhw.db';
        var db = isPhonegap? openDatabase({name: dbname}): openDatabase(dbname, "1.0", "nhw", -1);

        var errorHandler = function(transaction, error) {
            console.log("SQLITE DB ERROR. " + error.message + " (Code " + error.code + ")");

            // handle errors here
            var we_think_this_error_is_fatal = false;
            if(we_think_this_error_is_fatal) return true;
            return false;
        };

        var DDLs = [
            'CREATE TABLE IF NOT EXISTS "user" (' +
                '    "id" integer NOT NULL PRIMARY KEY,' +
                '    "name" varchar(20) NOT NULL,' +
                '    "email" varchar(75) NOT NULL,' +
                '    "photo" varchar(20) NOT NULL' +
                ');' , 
            
            'CREATE TABLE IF NOT EXISTS "building" (' +
                '    "id" integer NOT NULL PRIMARY KEY,' +
                '    "code" varchar(20) NOT NULL,' +
                '    "name" varchar(20) NOT NULL,' +
                '    "floorCount" integer NOT NULL' +
                ');', 
            
            'CREATE TABLE IF NOT EXISTS "floor" ( ' +
                '    "id" integer NOT NULL PRIMARY KEY, ' +
                '    "buildingId_id" integer NOT NULL REFERENCES "building" ("id"), ' +
                '    "num" integer NOT NULL, ' +
                '    "svg" varchar(20) NOT NULL ' +
                '); '
        ];


        var User = {
            insert: function(data) {
                
            }, 
            all: function() {
                
            }, 
            findById: function() {
                
            }
        };

        var Building = {
        };

        var Floors = {
        };

        return {
            initDB: function() {
                db.transaction(function(transaction) {
                    _.each(DDLs, function(sql) {
                        transaction.executeSql(sql, [], function(transaction, result) {
                            // do nothing
                        }, errorHandler);
                    });                    
                });
            }, 

            User: User,
            Building: Building,
            Floors: Floors
        };
    }]
);
