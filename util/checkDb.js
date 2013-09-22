// deps
var path = require('path')
var level = require('level')
var sublevel = require('level-sublevel')

var worldId = 'kumavis'
var dbName = path.resolve(__dirname,'../world/',worldId)
console.log(dbName)
var db = sublevel(level(dbName, function (err, db) {
  if (err) throw err
  console.log('db ready? '+db.isOpen())
  var rs = db.createReadStream({ keys: true, values: false })
  rs.on('data', function (data) {
    console.log('key=', data)
  })

}))