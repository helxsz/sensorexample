var config = require('../conf/config.js'),
    mailAPI = require('./mail_api.js');
    winston = require('../utils/logging.js'); 
	
	
function reportToAdmin(problem,callback){
    mailAPI.sendProblemReportMail(config.admin.user, problem, function(err,data){
	    if(err) { callback(err,null);}
	    else {  callback(null,'success');}
	})
}
exports.reportToAdmin = reportToAdmin;