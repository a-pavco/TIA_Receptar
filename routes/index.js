var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var multiparty = require('multiparty');

var connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'drinksdb'
});

connection.connect();

/* GET home page od recipes. */
router.get('/', function (req, res, next) {
  connection.query('SELECT * from drinks', function (err, rows, fields) {
    if (err) throw err;
    res.render('index', {
      "rows": rows,
    });
  });
});

/* GET recipe edit */
router.get('/editDrink/:id', function (req, res, next) {
  connection.query('SELECT * from drinks WHERE id =' + req.params.id, function (err, row, fields) {
    if (err) throw err;
    res.render('editDrink', {
      "row": row[0],
    });
  });
});

/* Adding to favourites */
router.get('/addToFav/:id', function (req, res, next) {
  console.log(req.params.id);
  console.log(res.locals.user.id);
  var pair = {
    user_id: res.locals.user.id,
    drink_id: req.params.id
  };
  var query = connection.query('INSERT INTO users_drinks SET ?', pair, function (err, result) {
    // pair inserted
    req.flash('success', 'Drink favourited.');
    res.location('/');
    res.redirect('/');
    if (err) {
      console.log(err);
    }
  });
});

/* Removing to favourites */
router.get('/removeFromFav/:id', function (req, res, next) {
  console.log(req.params.id);
  console.log(res.locals.user.id);
  var pair = {
    user_id: res.locals.user.id,
    drink_id: req.params.id
  };
  var query = connection.query("DELETE FROM `users_drinks` WHERE `user_id` = '" + res.locals.user.id + "' and `drink_id` = '" + req.params.id + "'", pair, function (err, result) {
    // pair deleted
    req.flash('success', 'Drink removed from favourites');
    res.location('/favourites');
    res.redirect('/favourites');
    if (err) {
      console.log(err);
    }
  });
});


/* GET ingredients page. */

router.get('/ingredients', function (req, res, next) {
  connection.query('SELECT * from ingredients', function (err, rows, fields) {
    if (err) throw err;
    res.render('ingredients', {
      "rows": rows
    });
  });
});


router.get('/favourites', function (req, res, next) {
  connection.query("SELECT * from `drinks` left join `users_drinks` on `id` = `drink_id` where `user_id` = '" + res.locals.user.id + "'", function (err, rows, fields) {
    if (err) throw err;
    res.render('favourites', {
      "rows": rows
    });
  });
});

router.get('/new', function (req, res, next) {
  res.render('new', { errors: [] });
});

router.post('/new', function (req, res, next) {
  (new multiparty.Form()).parse(req, function (err, fields, files) {

    req.body = fields;

    var name = fields.name[0];
    var description = fields.description[0];
    //req.flash('WTF');

    //check image
    if (files.imgpath[0].originalFilename !== '') {
      var drinkImageName = files.imgpath[0].originalFilename;
    } else {
      //req.flash('success', 'WTF');
      var drinkImageName = 'noimage.jpg';
    }

    /*console.log(name);
    console.log(description);
    console.log(drinkImageName);*/

    // form field validation
    req.checkBody('name', 'Je potrebný názov drinku.').notEmpty();
    req.checkBody('description', 'Je potrebný popis drinku.').notEmpty();

    //req.assert('name', 'Je potrebný názov drinku.').notEmpty();
    //req.assert('description', 'Je potrebný popis drinku.').notEmpty();

    var errors = req.validationErrors();

    if (errors) {
      console.log(errors);
      errors.forEach(function (error) {
      });
      res.render('new', {
        errors: errors,
        name: name,
        description: description
      });
    } else {
      console.log('rip');
      var drink = {
        name: name,
        description: description,
        img_path: drinkImageName
      };
      var query = connection.query('INSERT INTO drinks SET ?', drink, function (err, result) {
        // project inserted
        req.flash('success', 'Drink Added');

        res.location('/');
        res.redirect('/');
        if (err) {
          console.log(err);
        }
      });

    }
  });
});


router.post('/editDrink/:id', function (req, res, next) {
  (new multiparty.Form()).parse(req, function (err, fields, files) {

    req.body = fields;

    var name = fields.name[0];
    var description = fields.description[0];
    //req.flash('WTF');

    //check image
    if (files.imgpath[0].originalFilename !== '') {
      var drinkImageName = files.imgpath[0].originalFilename;
    } else {
      //req.flash('success', 'WTF');
      var drinkImageName = 'noimage.jpg';
    }

    /*console.log(name);
    console.log(description);
    console.log(drinkImageName);*/

    // form field validation
    req.checkBody('name', 'Je potrebný názov drinku.').notEmpty();
    req.checkBody('description', 'Je potrebný popis drinku.').notEmpty();

    //req.assert('name', 'Je potrebný názov drinku.').notEmpty();
    //req.assert('description', 'Je potrebný popis drinku.').notEmpty();

    var errors = req.validationErrors();

    if (errors) {
      console.log(errors);
      errors.forEach(function (error) {
      });
      res.location('/editDrink/' + req.params.id);
      res.redirect('/editDrink/' + req.params.id);
    } else {
      console.log('rip');
      var drink = {
        name: name,
        description: description,
        img_path: drinkImageName
      };
      var query = connection.query('UPDATE drinks SET ? WHERE id=' + req.params.id, drink, function (err, result) {
        // project inserted
        req.flash('success', 'Drink Edited');

        res.location('/');
        res.redirect('/');
        if (err) {
          console.log(err);
        }
      });

    }
  });
});

// delete a drink //

router.delete('/delete/:id', function (req, res) {
  console.log('DRINK DELETED LOL');
  connection.query('DELETE FROM drinks WHERE id = ' + req.params.id, function (err, result) {
    if (err) {
      console.log(err);
    }
  });
  req.flash('success', 'Drink deleted');
  res.location('/');
  res.redirect('/');
});

module.exports = router;
