var express = require('express');
var router = express.Router();
var Cart = require('../models/cart');
var mongoose = require('mongoose');

var Product = require('../models/product');
var Order = require('../models/order');

router.get('/', function (req, res, next) {
    var successMsg = req.flash('success')[0];
    Product.find(function (err, docs) {
        var productList = [];
        var listSize = 3;
        for (var i = 0; i < docs.length; i += listSize) {
            productList.push(docs.slice(i, i + listSize));
        }
        res.render('shop/index', {title: 'Shopping Cart', products: productList, successMsg: successMsg, noMessages: !successMsg});
    });
});

router.get('/add-to-cart/:id', function(req, res, next) {
    // if (req.user == null) {
    //     return res.redirect('/user/signin');
    // }
    var productId = req.params.id;
    var cart = new Cart(req.session.cart ? req.session.cart : {});

    Product.findById(productId, function(err, product) {
       if (err) {
           return res.redirect('/');
       }
         cart.add(product, product.id);  
         req.session.cart = cart;
         console.log(req.session.cart);
    //     var MongoClient = require('mongodb').MongoClient;
    //     MongoClient.connect('mongodb://localhost:27017/', function(err, db){
    //         if(err) throw err;
    //       var x = 'ObjectId('+productId+')'
    //         db.db('shopping').collection('carts').insert({user: req.user.email, product: x})
    // });
        res.redirect('/');
    });
});

router.get('/reduce/:id', function(req, res, next) {
    var productId = req.params.id;
    var cart = new Cart(req.session.cart ? req.session.cart : {});

    cart.reduceByOne(productId);
    req.session.cart = cart;
    // var MongoClient = require('mongodb').MongoClient;
    //     MongoClient.connect('mongodb://localhost:27017/', function(err, db){
    //         if(err) throw err;
    //       var x = 'ObjectId('+productId+')'
    //         db.db('shopping').collection('carts').remove({product: x}, {justOne: true})
//});
    res.redirect('/shopping-cart');
});


router.get('/shopping-cart', function(req, res, next) {
   if (!req.session.cart) {
       return res.render('shop/shopping-cart', {products: null});
   } 
    var cart = new Cart(req.session.cart);
    var MongoClient = require('mongodb').MongoClient;
    MongoClient.connect('mongodb://localhost:27017/', function(err, db){
        if(err) throw err;
        //var list = db.db('shopping').collection('carts').find({user: req.user.email},{product: 1, _id: 0})
        //var addedProducts = db.db('shopping').collection('products').find({_id: {$in: list}})
        //var list = {title: 'xyz', description: 'budhfrkmk', price: 34}
        console.log(list);
    res.render('shop/shopping-cart', {products: cart.generateArray(), totalPrice: cart.totalPrice});
    });
});

router.get('/checkout', isLoggedIn, function(req, res, next) {
    if (!req.session.cart) {
        return res.redirect('/shopping-cart');
    }
    var cart = new Cart(req.session.cart);
    var errMsg = req.flash('error')[0];
    res.render('shop/checkout', {total: cart.totalPrice, errMsg: errMsg, noError: !errMsg});
});

router.post('/checkout', isLoggedIn, function(req, res, next) {
    if (!req.session.cart) {
        return res.redirect('/shopping-cart');
    }
    var cart = new Cart(req.session.cart);
    
    var stripe = require("stripe")(
        "sk_test_7OnaipRX0D7diWzLvdXkKZ3k"
    );
    const token = req.body.stripeToken;
    stripe.charges.create({
        amount: cart.totalPrice * 100,
      //  customer: req.user,
       // customer: null,
        currency: "usd",
        source: 'tok_amex',
        description: "Charges",
        capture: false
    }, function(err, charge) {
        if (err) {
            req.flash('error', err.message);
            return res.redirect('/checkout');
        }
        var order = new Order({
            user: req.user,
            cart: cart,
            address: req.body.address,
            name: req.body.name,
            paymentId: charge.id
        });
        order.save(function(err, result) {
            req.flash('success', 'Product purchased successfully!');
            req.session.cart = null;
            res.redirect('/');
        });
    }); 
});

module.exports = router;

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    req.session.oldUrl = req.url;
    res.redirect('/user/signin');
}
