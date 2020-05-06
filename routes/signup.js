var express = require('express');
var router = express.Router();
var monk = require('monk');
var bcrypt = require('bcrypt');
var db = monk('localhost:27017/newton');

/* GET users listing. */
router.get('/', function(req, res, next) {
    res.render('signup');
});

router.post('/', function(req,res) {
	var collection = db.get('users');

    collection.findOne({ email: req.body.Email }, function(err, user){
        if (user) {
            res.render('signup', { error: 'An account already exists with this email!' });
        } else {
            bcrypt.hash(req.body.Password, 8, function(err, hash) {
                if (err)
                    return res.json({ error: true });
      
                collection.insert({
                    firstName: req.body.FirstName,
                    lastName: req.body.LastName,
                    email: req.body.Email,
                    phone:req.body.Phone,
                    address:req.body.Address,
                    password: hash,
                    createDate: new Date(Date.now()).toISOString(),
                    lastModifiedDate: new Date(Date.now()).toISOString(),
                    role:'customer'
                }, function(err, user){
                    if (err) {
                        res.render('signup', { error: 'Error creating user account!' });
                    } else {
                        db.get('carts').insert({
                            userID: user._id.toString(),
                            products: [],
                            createDate: new Date(Date.now()).toISOString(),
                            lastModifiedDate: new Date(Date.now()).toISOString()
                        });
                    }  
                });
                res.redirect('/login'); 
            });
        }
    });
});

module.exports = router;