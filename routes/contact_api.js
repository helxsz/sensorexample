var app = require('../app').app;
var userModel = require('../model/user_model');
var contactModel = require('../model/contact_model');

var crypto = require('crypto');
var fs = require('fs');

var moment = require('moment');
require('colors');
var async = require('async');
var check = require('validator').check,
    sanitize = require('validator').sanitize;

app.get('/contact_us',getContactPage);	
app.post('/contact',contact);

function getContactPage(req,res,next){
   var locals = {};
   res.render('other/contact', locals);
}

function contact(req,res,next){
    var locals = {};
	var errors = [];
	console.log('post  /contact  ',req.body.email,req.body.message,req.body.subject);	
	var email ;

	if (req.session.uid) {
		 console.log('contactpage,found session '.green, req.session.username,req.session.uid);
		 userModel.findUserById(req.session.uid,function(err,user){
		    if(err || !user) {
			    console.log('user uid not found'.red);
		    }
			else{
			   console.log('find user uid'.green,user._id);
                locals.user = {
                    username : user.username,
					email : user.email
                };
                email = user.email;				
            }			
		 })
	}else{
	    console.log('no user session');
        if (!req.body.email) errors.push("Missing email");
        else email = req.body.email;		
	}
	
    if (!req.body.message) errors.push("Missing message")
    if (errors.length){
        res.statusCode = 400;
        res.end(JSON.stringify({status:"error", errors:errors}));      
        return;    
	}
	
	email = req.body.email;
	var message = req.body.message;
	var subject = req.body.subject;
	contactModel.createContact({'email':email,'msg':message,'sub':subject},function(err,data){
	    if(err) {console.log('contact err',err);next(err);}
	    else{
		    console.log('create contact'.green,data);
		    res.send(200);
		}
	})
}