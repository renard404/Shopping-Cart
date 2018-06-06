// var cors = require('cors');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var schema = new Schema({
    title: {type: String, required: true},
    description: {type: String, required: true},
    price: {type: Number, required: true}
});

 module.exports = mongoose.model('Product', schema);

var MongoClient = require('mongodb').MongoClient;

MongoClient.connect('mongodb://localhost:27017/', function(err, db){
    if(err) throw err;
    var db1 = db.db('shopping');
    db1.collection('products').drop();
    if(!products){
        var products = [
            {title: 'Product 1',
            description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit.',
            price: 69
        },
            {title: 'Product 2',
            description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit.',
            price: 56
        },
            {title: 'Product 3',
            description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit.',
            price: 67
        },
            {title: 'Product 4',
            description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit.',
            price: 99
        },
            {title: 'Product 5',
            description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit.',
            price: 47
        },
            {title: 'Product 6',
            description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit.',
            price: 89
        }];
    }
    else var products = {}
        db1.collection('products').insert(products, function(err, res){
            if (err) throw err;
            console.log('document inserted');
            db.close();
        });
});