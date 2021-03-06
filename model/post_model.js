var mongoose = require('mongoose');
var ObjectId = mongoose.Schema.ObjectId;

var postSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    username: String,
    data: String,
    cdate:{ type: Date, default: Date.now },
	com:[Comment]
});
 
var PostModel = mongoose.model('Post',postSchema);
exports.PostModel = PostModel; 
