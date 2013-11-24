var mongoose = require('mongoose');
var ObjectId = mongoose.Schema.ObjectId;
//http://www.ibm.com/developerworks/library/os-rulesengines/
//http://docs.oracle.com/cd/E11882_01/server.112/e17069/strms_adrules.htm
//http://www.infoq.com/articles/Rule-Engines
//http://www.dotnetrdf.org/blogitem.asp?blogID=35
var ruleSchema = new mongoose.Schema({
    creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
	,date: {type:Date,default: new Date}	
    ,cond: {
	         context: String // sensor's sound value  in url
			,pre:String  // equals ,not equals >= <= == >, <
			,value:String
		   }
	,act:[ actor:{url:String, group:[ObjectId]}, pre:String, value:String]  // url:notify    
});

var ruleGroupSchema = new mongoose.Schema({
   name:String
   ,date:{type:Date,default:new Date}
   ,actor:{url:String, group:[ObjectId]}
   ,rules: [{ type: ObjectId, ref: 'Rule' }]
});
 
var RuleModel = mongoose.model('Rule',ruleSchema);
exports.RuleModel = RuleModel; 



function hookRule(){

}

function noHookRule(){

}