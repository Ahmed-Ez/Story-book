const path = require('path');
const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const morgan = require('morgan');
const hbs = require('express-handlebars');
const methodOverride = require('method-override');
const passport = require('passport');
const session = require('express-session');
const mongoStore = require('connect-mongo')(session);

//routes
const mainRouter = require('./routes/index');
const authRouter = require('./routes/auth');
const storiesRouter = require('./routes/stories');

//Load config
dotenv.config({ path: './config/config.env' });

//passport config
require('./config/passport')(passport);

//DB connection
connectDB();

const app = express();

//bodyparser
app.use(express.urlencoded({ extended: true }));

//Override
app.use(
  methodOverride((req, res) => {
    if (req.body && typeof req.body === 'object' && '_method' in req.body) {
      let method = req.body._method;
      delete req.body._method;
      return method;
    }
  })
);

//logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

//helpers
const {
  formatDate,
  truncate,
  stripTags,
  editIcon,
  select,
} = require('./helpers/hbs');

//View Engine
app.engine(
  '.hbs',
  hbs({
    helpers: { formatDate, truncate, stripTags, editIcon, select },
    defaultLayout: 'main',
    extname: '.hbs',
  })
);
app.set('view engine', '.hbs');

//express session
app.use(
  session({
    secret: 'secret',
    resave: false,
    saveUninitialized: false,
    store: new mongoStore({ mongooseConnection: mongoose.connection }),
  })
);
//Passport middleware
app.use(passport.initialize());
app.use(passport.session());

//Set global user
app.use((req, res, next) => {
  res.locals.user = req.user || null;
  next();
});

//Static
app.use(express.static(path.join(__dirname, 'public')));

//Routes
app.use('/auth', authRouter);
app.use('/', mainRouter);
app.use('/Stories', storiesRouter);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} on port ${PORT}`);
});
