const path = require('path');
const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const morgan = require('morgan');
const hbs = require('express-handlebars');
const passport = require('passport');
const session = require('express-session');

//routes
const mainRouter = require('./routes/index');
const authRouter = require('./routes/auth');

//Load config
dotenv.config({ path: './config/config.env' });

//passport config
require('./config/passport')(passport);

connectDB();

const app = express();

//logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

//View Engine
app.engine('.hbs', hbs({ defaultLayout: 'main', extname: '.hbs' }));
app.set('view engine', '.hbs');

//express session
app.use(
  session({
    secret: 'secret',
    resave: false,
    saveUninitialized: false,
  })
);
//Passport middleware
app.use(passport.initialize());
app.use(passport.session());
//Static
app.use(express.static(path.join(__dirname, 'public')));
//Routes
app.use('/', mainRouter);
app.use('/auth', authRouter);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} on port ${PORT}`);
});
