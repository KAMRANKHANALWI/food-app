require('dotenv').config(); // Load environment variables from .env file
const express = require('express');
const app = express();
const ejs = require('ejs');
const path = require('path');
const expressLayout = require('express-ejs-layouts');
const PORT = process.env.PORT || 3000;
const mongoose = require('mongoose');
const session = require('express-session');
const flash = require('express-flash');
const MongoStore = require('connect-mongo');
const Emitter = require('events')

// Initialize passport
const passport = require('passport');
const passportInit = require('./app/config/passport');
const order = require('./app/models/order');
passportInit(passport);

// Database connection
const url = 'mongodb://localhost/pizza';
mongoose.connect(url);
const connection = mongoose.connection;
connection.on('error', console.error.bind(console, 'connection error:'));
connection.once('open', function () {
    console.log('Database connected...');
});

// Initialize session with MongoStore
const sessionStore = MongoStore.create({
    mongoUrl: url,
    // dbName: 'your_database_name', // Replace 'your_database_name' with your database name
    collectionName: 'sessions', // Optional, defaults to 'sessions'
    ttl: 24 * 60 * 60, // Session TTL (optional)
});

// Event emitter
const eventEmitter = new Emitter()
app.set('eventEmitter', eventEmitter)

// Session config
app.use(session({
    secret: process.env.COOKIE_SECRET,
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
    cookie: { maxAge: 1000 * 60 * 60 * 24 } // 24 hours
}));

app.use(passport.initialize());
app.use(passport.session());

app.use(flash());
// Assets
app.use(express.static('public'));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Global middleware
app.use((req, res, next) => {
    res.locals.session = req.session;
    res.locals.user = req.user;
    next();
});

// set Template engine
app.use(expressLayout);
app.set('views', path.join(__dirname, '/resources/views'));
app.set('view engine', 'ejs');

require('./routes/web')(app);

const server = app.listen(PORT, () => {
                console.log(`Listening on port ${PORT}`);
            });

// Socket

const io = require('socket.io')(server)
io.on('connection', (socket) => {
    // Join
    socket.on('join', (orderId) => {
        socket.join(orderId)
    })
})

eventEmitter.on('orderUpdated', (data) => {
    io.to(`order_${data.id}`).emit('orderUpdated', data)
})

eventEmitter.on('orderPlaced', (data) => {
    io.to('adminRoom').emit('orderPlaced', data)
})