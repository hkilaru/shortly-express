var db = require('../config');
var bcrypt = require('bcrypt-nodejs');
var Promise = require('bluebird');

var User = db.Model.extend({
  tableName:'users',
  hasTimestamps:false,
  defaults:{

  },
  clicks: function(){
     return this.hasMany(Click);
  },
  initialize: function(){
  //create hash of pwd,add user,create session
      this.on('creating', function(model, attrs, options){
        bcrypt.hash(attrs.password, null,null,function(err,hPass){
          if (!err){
            model.set('password', hPass);
          }
        });
    });
  }
});

module.exports = User;


