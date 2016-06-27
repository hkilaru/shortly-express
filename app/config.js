
var path = require('path');
var db = require('knex')({
  client: 'sqlite3',
  connection: {
    host: '127.0.0.1',
    user: 'your_database_user',
    password: 'password',
    database: 'shortlydb',
    charset: 'utf8',
    filename: path.join(__dirname, '../db/shortly.sqlite')
  }
});

db.schema.hasTable('urls').then(function(exists) {
  if (!exists) {
    db.schema.createTable('urls', function (link) {
      link.increments('id').primary();
      link.string('url', 255);
      link.string('base_url', 255);
      link.string('code', 100);
      link.string('title', 255);
      link.integer('visits');
      link.timestamps();
    }).then(function (table) {
      console.log('Created Url Table', table);
    });
  }
});

db.schema.hasTable('clicks').then(function(exists) {
  if (!exists) {
    db.schema.createTable('clicks', function (click) {
      click.increments('id').primary();
      click.integer('link_id');
      click.integer('user_id');
      click.timestamps();
    }).then(function (table) {
      console.log('Created Click Table', table);
    });
  }
});

/************************************************************/
// Add additional schema definitions below
/************************************************************/

var Bookshelf = require('bookshelf')(db);
module.exports = Bookshelf;


db.schema.hasTable('users').then(function(exists) {
  if (!exists) {
    db.schema.createTable('users', function (data) {
      data.increments('id').primary();
      data.string('username', 255);
      data.string('password', 255);
      data.string('session', 100);
//      link.timestamps();
    }).then(function (table) {
      console.log('Created Users Table', table);
    });
  }
});


