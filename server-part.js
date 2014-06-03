    // This function implements anonymous creation logic.
//https://gist.github.com/nleush/2654061
    function loadOrCreateAnonymousProfile(req, res, next) {
        var sess = req.session,
            auth = sess && sess.auth;
        if (!auth || !auth.userId) {
            dbCounter('anonymousUsers', function(err, counter) {
                if (err) {
                    console.log('Error getting anonymous users counter', err);
                    next();
                    return;
                }

                User.create({
                    login: "User " + counter,
                    is_anonymous: true
                }, function (err, user) {
                    if (err) {
                        console.log("Error creating anonymous", err);
                    } else {
                        var _auth = sess.auth || (sess.auth = {});
                        _auth.userId = user.id;
                        _auth.loggedIn = true;
                    }

                    next();
                });
            });
        } else {
            next();
        }
    }
    

    // The rest is usual setup.




    // Counters.
    var CounterSchema = new Schema({
        next: Number
    });
    CounterSchema.statics.findAndModify = function (query, sort, doc, options, callback) {
        return this.collection.findAndModify(query, sort, doc, options, callback);
    };
    var Counter = mongoose.model('Counter', CounterSchema);
    function dbCounter(name, cb) {
        var ret = Counter.findAndModify({_id:name}, [], {$inc : {next:1}}, {"new":true, upsert:true}, function(err, data) {
            if (err) {
                cb(err);
            } else {
                cb(null, data.next);
            }

        });
    }

    // User.
    var UserSchema = new Schema({
        is_anonymous: {'type': Boolean, 'default': false}
    });
    var User;

    UserSchema.plugin(mongooseAuth, {
        everymodule: {
            everyauth: {
                User: function () {
                    return User;
                }
            }
        },
        password: {
            everyauth: {
                getLoginPath: '/signin',
                postLoginPath: '/signin',
                loginView: 'signin.jade',
                getRegisterPath: '/signup',
                postRegisterPath: '/signup',
                registerView: 'signup.jade',
                loginSuccessRedirect: '/',
                registerSuccessRedirect: '/'
            }
        }
    });
    mongoose.model('User', UserSchema);
    User = mongoose.model('User');



    // Express server create.
    var app = exports.app = express.createServer();

    // Express server configure.
    app.configure(function() {
        app.use(express.cookieParser('secret'))
            .use(express.session({
                secret: 'secret',
                cookie: {maxAge: 60000 * 60 * 24 * 30}, // Month
                store: new mongoStore({db: mongoose.connection.db})
            }))
            .use(express.bodyParser())
            .use(loadOrCreateAnonymousProfile) // Should be placed before auth middleware.
            .use(mongooseAuth.middleware()); // Anonymous user loaded here.
    });