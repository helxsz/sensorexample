/***
   still to do   
   Embedded images in HTML
   Different transport methods -  Amazon SES
   the problem of behind of proxy -- https://github.com/andris9/Nodemailer/issues/176
****/


var emailer = require('nodemailer');
var config = require('../conf/config.js');
/*
var config = {
    user:"feynlabs.uk@gmail.com"
   ,pass:"newstartup"
   ,name:"Feynlabs"
};
*/
var SITE_ROOT_URL = "https://"+config.host;  //"http:localhost:8080"
console.log(config.email.user,config.email.pass);
var smtpTransport = emailer.createTransport("SMTP", {
    host: "smtp.gmail.com", // hostname
    secureConnection: true, // use SSL
    port: 465, // port for secure SMTP
    auth: {
        user: config.email.user,
        pass: config.email.pass
    }
});

/*
// Create an Amazon SES transport object
var transport = nodemailer.createTransport("SES", {
        AWSAccessKeyID: "AWSACCESSKEY",
        AWSSecretKey: "/AWS/SECRET",
        ServiceUrl: "https://email.us-east-1.amazonaws.com" // optional
});
*/

//sendActiveMail('584829839@qq.com','token','name');
//sendResetPassMail('584829839@qq.com','token','name');

exports.sendActiveMail = sendActiveMail;
exports.sendResetPassMail = sendResetPassMail; 
exports.sendMail = sendMail;
exports.sendInvitationMail = sendInvitationMail;
exports.sendRegistraionMail = sendRegistraionMail;

// email template  http://net.tutsplus.com/tutorials/html-css-techniques/the-state-of-css3-in-email-templates/
// http://htmlemailboilerplate.com
function sendInvitationMail(url, description,tutor,mail,callback){
  var from = config.email.user;
  var to = mail;
  var subject = 'Feynlabs Invitation';
  console.log('sendInvitationMail'.green,from, to , subject);
  //course/:id/invitation/:token/reply
  /*
  var html = 
              '<p style="text-shadow: 2px 2px 2px #000;">   Welcome to the Feynlabs </p> '   
            + '<p style="border-radius: 5px; -moz-border-radius: 5px; -webkit-border-radius: 5px; border: 3px solid #000; background-color: #ccc; padding: 5px;">   View it in a web browser.  </p> '   
            + '<div id="airmail-line" style="overflow: hidden; margin: 0 -40px; text-indent: -20px; white-space: nowrap; min-height: 15px; padding: 0; font: italic bold 260px/15px Helvetica, sans-serif; height: 15px; max-height: 15px; -webkit-border-top-right-radius: 10px; -moz-border-radius: 10px; -webkit-border-top-left-radius: 10px; letter-spacing: -44px;">  <b style="color: #f5290a;">/</b> <i style="color: #006699;">/</i> <b style="color: #f5290a;">/</b> <i style="color: #006699;">/</i> <b style="color: #f5290a;">/</b> <i style="color: #006699;">/</i>      <b style="color: #f5290a;">/</b>      <i style="color: #006699;">/</i> </div> '
  
            + '<p>hello:<p/>'
            + '<p>we receive ' + config.name + ' the message for registration, please click the link：</p>'
            + '<a href="' + SITE_ROOT_URL + url +'">invitation link</a>'
			+ '<a href="http://htmlemailboilerplate.com" target ="_blank" title="Styling Links" style="color: orange; text-decoration: none;">Coloring Links appropriately</a>'
            + '<p>' + description + '</p>'
            + '<p>' + tutor + '</p>';
    */
			
			
    html = 
	       '<table cellpadding="0" cellspacing="0" style="width:600px;color: #f5290a;">'
            +'<tbody style="font-size:16px;color:#333333">'
			    +'<tr><td style="font-size:16px;color:#333333;line-height:1.0"><img src="https://www.feynlabs.com/wp-content/themes/globex/feynlabs/images/headerimage.jpg" alt="Blog Post"></td></tr>'
                +'<tr><td style="font-size:16px;color:#333333;line-height:1.0"> '                  
                       +'Hi,'
                        +'<br><br> We are happy to see you are signing up <span style="font-size:20px;color:#33ccff;"> <a href="https://Feynlabs.com" style="font-size:24px;font-weight:bold;color:#33ccff;text-decoration:none" target="_blank">   Feynlabs  </a></span> . To ensure your Recipes remain active, please confirm your account:<br><br><br><br>'
                        +'<a href="' + SITE_ROOT_URL + url +'" style="text-decoration:none;padding:18px 48px 18px 48px;font-size:24px;font-weight:bold;color:#ffffff;background-color:#33ccff;border-radius:34px" target="_blank">Confirm your account</a>'
                        +'<br><br><br><br>'
				        +'The <span class="il">Feynlabs</span> Team'				    
				+'</td></tr>'
                +'<tr> <td style="border-bottom:1px solid #ebebeb"><br><br><br></td></tr> <tr> <td style="font-size:16px"> <br> </td> </tr>'                 
                +'<tr> <td>'
                        +'<table cellpadding="0" cellspacing="0" style="width:600px">  <tbody style="font-size:16px;font-family:"Helvetica Neue,Arial,Helvetica,sans-serif";color:#333333">'                      
                           +'<tr><td style="font-size:18px;font-weight:normal;color:#333333;line-height:1.6" width="270px">'
                                +'<a href="https://feynlabs.com" style="font-size:24px;font-weight:bold;color:#333333;text-decoration:none" target="_blank"> <img src="http://www.feynlabs.com/wp-content/uploads/2012/11/logo.png" alt="Blog Post"> </a>'
                                +'<br> Concepts of programming lanuage for kids.'                                          
                            +'</td>'                                             
                            +'<td align="right" style="font-size:16px;color:#333333;padding-top:5px"></td>'
                           +'</tr>'
                        +'</tbody> </table>'                       
                  +'</td> </tr> </tbody> </table>'
			
  sendMail({
    from: from,
    to: to,
    subject: subject,
    html: html
	/*,
	attachments:[
        {
            filename: "notes.txt",
            contents: "Some notes about this e-mail"
        },
        {
            filename: "image.png",
            contents: new Buffer("iVBORw0KGgoAAAANSUhEUgAAABAAAAAQAQMAAAAlPW0iAAAABlBMVEUAAAD/"+
                                 "//+l2Z/dAAAAM0lEQVR4nGP4/5/h/1+G/58ZDrAz3D/McH8yw83NDDeNGe4U"+
                                 "g9C9zwz3gVLMDA/A6P9/AFGGFyjOXZtQAAAAAElFTkSuQmCC", "base64"),
            cid: "abc"
        }
	]*/
  },callback);   

}


function sendRegistraionMail(username,mail,callback){
    var from = config.email.user;
    var to = mail;
    var subject = 'Feynlabs Registraion';
  
    console.log('sendRegistraionMail'.green, from,to,subject);
    //course/:id/invitation/:token/reply
			
    html = 
	       '<table cellpadding="0" cellspacing="0" style="width:600px;color: #f5290a;">'
            +'<tbody style="font-size:16px;color:#333333">'
			    +'<tr><td style="font-size:16px;color:#333333;line-height:1.0"><img src="https://www.feynlabs.com/wp-content/themes/globex/feynlabs/images/headerimage.jpg" alt="Blog Post"></td></tr>'
                +'<tr><td style="font-size:16px;color:#333333;line-height:1.0"> '                  
                       +'Hi,'+username
                        +'<br><br> We are happy to see you are signing up <span style="font-size:20px;color:#33ccff;"> <a href="https://Feynlabs.com" style="font-size:24px;font-weight:bold;color:#33ccff;text-decoration:none" target="_blank">   Feynlabs  </a></span> . To ensure your Recipes remain active, please confirm your account:<br><br><br><br>'
                        +'<a href="' + SITE_ROOT_URL +'" style="text-decoration:none;padding:18px 48px 18px 48px;font-size:24px;font-weight:bold;color:#ffffff;background-color:#33ccff;border-radius:34px" target="_blank">Confirm your account</a>'
                        +'<br><br><br><br>'
				        +'The <span class="il">Feynlabs</span> Team'				    
				+'</td></tr>'
                +'<tr> <td style="border-bottom:1px solid #ebebeb"><br><br><br></td></tr> <tr> <td style="font-size:16px"> <br> </td> </tr>'                 
                +'<tr> <td>'
                        +'<table cellpadding="0" cellspacing="0" style="width:600px">  <tbody style="font-size:16px;font-family:"Helvetica Neue,Arial,Helvetica,sans-serif";color:#333333">'                      
                           +'<tr><td style="font-size:18px;font-weight:normal;color:#333333;line-height:1.6" width="270px">'
                                +'<a href="https://feynlabs.com" style="font-size:24px;font-weight:bold;color:#333333;text-decoration:none" target="_blank"> <img src="http://www.feynlabs.com/wp-content/uploads/2012/11/logo.png" alt="Blog Post"> </a>'
                                +'<br> Concepts of programming lanuage for kids.'                                          
                            +'</td>'                                             
                            +'<td align="right" style="font-size:16px;color:#333333;padding-top:5px"></td>'
                           +'</tr>'
                        +'</tbody> </table>'                       
                  +'</td> </tr> </tbody> </table>'
			
  sendMail({
    from: from,
    to: to,
    subject: subject,
    html: html
	/*,
	attachments:[
        {
            filename: "notes.txt",
            contents: "Some notes about this e-mail"
        },
        {
            filename: "image.png",
            contents: new Buffer("iVBORw0KGgoAAAANSUhEUgAAABAAAAAQAQMAAAAlPW0iAAAABlBMVEUAAAD/"+
                                 "//+l2Z/dAAAAM0lEQVR4nGP4/5/h/1+G/58ZDrAz3D/McH8yw83NDDeNGe4U"+
                                 "g9C9zwz3gVLMDA/A6P9/AFGGFyjOXZtQAAAAAElFTkSuQmCC", "base64"),
            cid: "abc"
        }
	]*/
  },callback);   
}


function sendActiveMail(who, token, name,callback) {
  var from = config.email.user;
  var to = who;
  var subject = config.name + 'account activation';
  var html = '<p>hello：<p/>' +
    '<p>we receive ' + config.name + ' the message for registration, please click the link：</p>' +
    '<a href="' + SITE_ROOT_URL + '/active_account?key=' + token + '&name=' + name + '">activation link</a>' +
    '<p>if you haven t' + config.name + 'fill in the form，please delete the mail, we are sorry for that。</p>' +
    '<p>' + config.name + 'thank you</p>';

  sendMail({
    from: from,
    to: to,
    subject: subject,
    html: html
  },callback);
};




function sendResetPassMail(who, token, name,callback) {
  var from = config.email.user;
  var to = who;
  var subject = config.name + 'account reset';
  var html = '<p>hello：<p/>' +
    '<p>we receive ' + config.name + ' the message for reset please click the link：</p>' +
    '<a href="' + SITE_ROOT_URL + '/reset_pass?key=' + token + '&name=' + name + '">reset link</a>' +
    '<p>if you haven t' + config.name + 'fill in the form，please delete the mail, we are sorry for that。</p>' +
    '<p>' + config.name + 'thank you</p>';

  sendMail({
    from: from,
    to: to,
    subject: subject,
    html: html
  },callback);
};

function sendMail(mailOpts,callback){
    // send mail with defined transport object
    smtpTransport.sendMail(mailOpts, callback); 
}

/*
exports.sendReplyMail = function (who, msg) {
  var from = config.user;
  var to = who;
  var subject = config.name + ' 新消息';
  var html = '<p>您好：<p/>' +
    '<p>' +
    '<a href="' + SITE_ROOT_URL + '/user/' + msg.author.name + '">' + msg.author.name + '</a>' +
    ' 在话题 ' + '<a href="' + SITE_ROOT_URL + '/topic/' + msg.topic._id + '">' + msg.topic.title + '</a>' +
    ' 中回复了你。</p>' +
    '<p>若您没有在' + config.name + '社区填写过注册信息，说明有人滥用了您的电子邮箱，请删除此邮件，我们对给您造成的打扰感到抱歉。</p>' +
    '<p>' + config.name + '社区 谨上。</p>';

  sendMail({
    from: from,
    to: to,
    subject: subject,
    html: html
  });
};


exports.sendAtMail = function (who, msg) {
  var from = config.user;
  var to = who;
  var subject = config.name + ' 新消息';
  var html = '<p>您好：<p/>' +
    '<p>' +
    '<a href="' + SITE_ROOT_URL + '/user/' + msg.author.name + '">' + msg.author.name + '</a>' +
    ' 在话题 ' + '<a href="' + SITE_ROOT_URL + '/topic/' + msg.topic._id + '">' + msg.topic.title + '</a>' +
    ' 中@了你。</p>' +
    '<p>若您没有在' + config.name + '社区填写过注册信息，说明有人滥用了您的电子邮箱，请删除此邮件，我们对给您造成的打扰感到抱歉。</p>' +
    '<p>' + config.name + '社区 谨上。</p>';

  sendMail({
    from: from,
    to: to,
    subject: subject,
    html: html
  });
};
*/