
module.exports = function(db){
  console.log('db ready? '+db.isOpen())
  var rs = db.createReadStream({ keys: true, values: false })
  rs.on('data', function (data) {
    console.log('key= '+data)
  })
}