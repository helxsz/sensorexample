var emailer = require('nodemailer');

var config = {
    user:"helxsz@gmail.com"
   ,pass:"uranus1027303"
   ,name:"fablab"
};

var SITE_ROOT_URL = "http:localhost:8080"

var smtpTransport = emailer.createTransport("SMTP", {
    host: "smtp.gmail.com", // hostname
    secureConnection: true, // use SSL
    port: 465, // port for secure SMTP
    auth: {
        user: config.user,
        pass: config.pass
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

function sendActiveMail(who, token, name) {
  var from = config.user;
  var to = who;
  var subject = config.name + 'account activation';
  var html = '<p>hello��<p/>' +
    '<p>we receive ' + config.name + ' the message for registration, please click the link��</p>' +
    '<a href="' + SITE_ROOT_URL + '/active_account?key=' + token + '&name=' + name + '">activation link</a>' +
    '<p>if you haven t' + config.name + 'fill in the form��please delete the mail, we are sorry for that��</p>' +
    '<p>' + config.name + 'thank you</p>';

  sendMail({
    from: from,
    to: to,
    subject: subject,
    html: html
  });
};

function sendResetPassMail(who, token, name) {
  var from = config.user;
  var to = who;
  var subject = config.name + 'account reset';
  var html = '<p>hello��<p/>' +
    '<p>we receive ' + config.name + ' the message for reset please click the link��</p>' +
    '<a href="' + SITE_ROOT_URL + '/reset_pass?key=' + token + '&name=' + name + '">reset link</a>' +
    '<p>if you haven t' + config.name + 'fill in the form��please delete the mail, we are sorry for that��</p>' +
    '<p>' + config.name + 'thank you</p>';

  sendMail({
    from: from,
    to: to,
    subject: subject,
    html: html
  });
};

function sendMail(mailOpts){

    // send mail with defined transport object
    smtpTransport.sendMail(mailOpts, function(error, response){
        if(error){
            console.log(error);
        }else{
            console.log("Message sent: " + response.message);
        }
        //smtpTransport.close(); 
    }); 
}

/*
exports.sendReplyMail = function (who, msg) {
  var from = config.user;
  var to = who;
  var subject = config.name + ' ����Ϣ';
  var html = '<p>���ã�<p/>' +
    '<p>' +
    '<a href="' + SITE_ROOT_URL + '/user/' + msg.author.name + '">' + msg.author.name + '</a>' +
    ' �ڻ��� ' + '<a href="' + SITE_ROOT_URL + '/topic/' + msg.topic._id + '">' + msg.topic.title + '</a>' +
    ' �лظ����㡣</p>' +
    '<p>����û����' + config.name + '������д��ע����Ϣ��˵���������������ĵ������䣬��ɾ�����ʼ������ǶԸ�����ɵĴ��Ÿе���Ǹ��</p>' +
    '<p>' + config.name + '���� ���ϡ�</p>';

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
  var subject = config.name + ' ����Ϣ';
  var html = '<p>���ã�<p/>' +
    '<p>' +
    '<a href="' + SITE_ROOT_URL + '/user/' + msg.author.name + '">' + msg.author.name + '</a>' +
    ' �ڻ��� ' + '<a href="' + SITE_ROOT_URL + '/topic/' + msg.topic._id + '">' + msg.topic.title + '</a>' +
    ' ��@���㡣</p>' +
    '<p>����û����' + config.name + '������д��ע����Ϣ��˵���������������ĵ������䣬��ɾ�����ʼ������ǶԸ�����ɵĴ��Ÿе���Ǹ��</p>' +
    '<p>' + config.name + '���� ���ϡ�</p>';

  sendMail({
    from: from,
    to: to,
    subject: subject,
    html: html
  });
};
*/