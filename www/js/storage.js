
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




angular.module('nhw.storage', ['nhw.services'])
    .factory('Storage', ['$window', '$q', '_', 'User', 'Floors', 'Beacons', function($window, $q, _, User, Floors, Beacons) {

        var isPhonegap = typeof sqlitePlugin != 'undefined',
            // chrome support. firefox not support.
            openDatabase = isPhonegap? sqlitePlugin.openDatabase: $window.openDatabase; 

        // if openDatabase not supported, 
        if(!openDatabase) {
            return null;
        }

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
                '    "floor_count" integer NOT NULL' +
                ');', 
            
            'CREATE TABLE IF NOT EXISTS "floor" ( ' +
                '    "id" integer NOT NULL PRIMARY KEY, ' +
                '    "building_id" integer NOT NULL REFERENCES "building" ("id"), ' +
                '    "num" integer NOT NULL, ' +
                '    "svg" varchar(20) NOT NULL ' +
                '); '
            ,

            'CREATE TABLE IF NOT EXISTS "beacon" ( ' +
                '    "id" integer NOT NULL PRIMARY KEY, ' +
                '    "uuid" varchar(40) NOT NULL, ' +
                '    "identifier" varchar(40) NOT NULL, ' +
                '    "major" integer NOT NULL, ' +
                '    "minor" integer NOT NULL, ' +
                '    "message" text, ' +
                '    "active" bool ' +
                '); '
        ];

        function executeSql(sql, argArray, callback, errorCallback) {
            db.transaction(function(transaction) {
                transaction.executeSql(sql, argArray, function(transaction, resultSet) {
                    if(!resultSet.rowsAffected) {
                        console.log('No rows affected!');
                    }
                    if(callback) {
                        callback(transaction, resultSet);
                    } else {
                        return false;
                    }
                }, function(transaction, error) {
                    if(errorCallback) {
                        errorCallback(transaction, error);
                    } else {
                        errorHandler(transaction, error);
                    }
                });
            });
        }

        function query(sql, argArray) {
            var deferred = $q.defer();
            executeSql(sql, argArray, function(transaction, resultSet) {
                console.log('QUERY' + resultSet.rows);
                var rets = [];
                for(var i = 0; i < resultSet.rows.length; i++) {
                    rets.push(_.clone(resultSet.rows.item(i)));
                }
                deferred.resolve(rets);
            }, function(transaction, error) {
                console.log("SQLITE DB ERROR. " + error.message + " (Code " + error.code + ")");
                deferred.reject(error);
            });
            return deferred.promise;
        }



        var sUser = {
            insert: function(data) {
                var sql = "INSERT INTO user (name, email, photo) VALUES (?, ?, ?);",
                    args = [data.name, data.email, data.photo];
                executeSql(sql, args);
            }, 
            all: function() {
                var sql = "SELECT name, email, photo FROM user;";
                // return $q(function(resolve, reject) {
                //     executeSql(sql, [], function(transaction, resultSet) {
                //         var users = [];
                //         for(var i = 0; i < resultSet.rows.length; i++) {
                //             users.push(_.clone(resultSet.rows.item(i)));
                //         }
                //         resolve(users);
                //     }, function(transaction, error) {
                //         console.log("SQLITE DB ERROR. " + error.message + " (Code " + error.code + ")");
                //         reject(error);
                //     });
                // });
                return query(sql, []);
            }, 
            findById: function(id) {
                var sql = "SELECT name, email, photo FROM user where id = ?";
                return query(sql, [id]);
            }
        };

        var sBuilding = {
            insert: function(data) {
                var sql = "INSERT INTO building (code, name, floor_count) VALUES (?, ?, ?);",
                    args = [data.code, data.name, data.floor_count];
                executeSql(sql, args, null);
            }, 

            all: function() {
                
            }
        };

        var sFloors = {
            insert: function(data) {
                var sql = "INSERT INTO floor (building_id, num, svg) VALUES (?, ?, ?);",
                    args = [data.building_id, data.num, data.svg];
                executeSql(sql, args, null);
            }, 

            all: function() {
                
            }, 
            findById: function(id) {
                
            }, 
            getUnAvailableSeatsByFloor: function(floorId) {
                
            }
        };

        var sBeacons = {
            insert: function(data) {
                var sql = "INSERT INTO beacon (uuid, identifier, major, minor, message, active) VALUES (?, ?, ?, ?, ?, ?);",
                    args = [data.uuid, data.identifier, data.major, data.minor, data.message, data.active];
                executeSql(sql, args, null);
            }, 

            all: function() {
                
            }
        };

        return {
            createDBs: function() {
                db.transaction(function(transaction) {
                    _.each(DDLs, function(sql) {
                        transaction.executeSql(sql, [], function(transaction, result) {
                            // do nothing
                        }, errorHandler);
                    });                    
                });
            },

            syncData: function(date) {
                // full data
                if(!date) {
                    
                }
                
                // incremental data
                else {
                    
                }
            }, 

            User: sUser,
            Building: sBuilding,
            Floors: sFloors, 
            Beacons: sBeacons
        };
    }]
);
