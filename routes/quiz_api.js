var app = require('../app').app;
var questionModel = require('../model/question_model');
var moment = require('moment');

app.get('/quiz/testSet',function(req,res){
	console.log('retrieve testSet');

	questionModel.QuestionModel.count(function(err,data){
    	console.log("questions count %d",data);
    	if(data == 0){
    		for(var i=0;i<5;i++)
    			questionModel.createNewQuestion({'type':0,'level':0,'question':'is what?', 'answer':'1'},function(err,docs){
    				res.send(data);
    			});
    		
    	}else{
    		questionModel.QuestionModel.find({},function(err,data){
    			if(err) console.log(err);
    			else console.log('questions find    '+data.length);
    			res.send(data);
    			/*
    			questionModel.QuestionModel.remove({},function(err){
    				  if(err){console.log('err remove');}	
    				  else {
    					  console.log('remove good ');				 
    				  }
    			});
    			*/
    		})
    	}
	});
});

app.get("/quiz/questions",function(req,res){
	console.log('quiz questions');
	questionModel.findQuestions({},function(err,data){
		if(err) res.send(405);
		else res.send(data);
	})
	console.log('get questions by id  '+req.params.id);
	
});

app.get("/quiz/questions/:id",function(req,res){
	//questionModel.findOneQuestion
	console.log('get questions by id  '+req.params.id);
	res.send('abc');
});

app.delete('/quiz/questions/:id',function(req,res){
	
	console.log('delete questions '+req.params.id);
	questionModel.deleteQuestion({'_id':req.params.id},function(err,data){
		if(err) res.send(405);
		else res.send(200);
	});
	
});
app.put("/quiz/questions/:id",function(req,res){
	//questionModel.updateQuestion
	console.log('update questions '+req.params.id+ "  "+ req.body);
	res.send('abc');
});
app.post("/quiz/questions",function(req,res){
	// 
	//console.log('post questions '+req.body.question+"   "+req.body.answer );
	console.log('post questions');
	questionModel.createNewQuestion({'type':0,'level':0,'question':'is what  agbcdd?', 'answer':'1   how it is'},function(err,data){
		res.send(data);
	});
	res.send('abc');
});



app.get('/quiz/new',function(req,res){
	console.log('retrieve login page');
	
	//res.render('quiz');     
	res.send('abc');
});

app.get('/quiz/finish',function(req,res){
	console.log('finish the quiz');
	
	res.send('finish');
})

/*
app.get('/quiz/join',function(req,res){
	console.log('retrieve login page');
	res.render('login');
});
*/


app.get('/user/:id/quiz',function(req,res){
	console.log('post session');
	
})

/*
app.get('/user/:id/group',function(req,res){
	
})
*/

function startNewQuiz(tag,level){
	
	// select the questions
	questionModel.findQuestions();
	// start a quiz session for one person
	
	// 
}




