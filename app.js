const express = require('express')
const dotenv = require('dotenv')
const morgan = require('morgan')
const ejs = require('ejs')
const passport = require('passport')
const session = require('express-session')
const mongoose = require('mongoose')
const MongoStore = require('connect-mongo')(session)
const moment = require('moment')
const methodOverride = require('method-override')
const connectDB = require('./config/db')


// Load config
dotenv.config({
    path: './config/config.env'
})

// Passport config
require('./config/passport')(passport)

// Connecting to MongoDB
connectDB()

// Initialize app
const app = express()

// Body parser
app.use(express.urlencoded({
    extended: false
}))
app.use(express.json())

// Method Override
app.use(methodOverride(function (req, res) {
    if (req.body && typeof req.body === 'object' && '_method' in req.body) {
        var method = req.body._method
        delete req.body._method
        return method
    }
}))

// Setup morgan for login
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'))
}

// Helpers
app.locals.formatDate = (date, format) => moment(date).format(format)
app.locals.truncate = (str, len) => {
    if (str.length > len && str.length > 0) {
        let new_str = str + ' '
        new_str = str.substr(0, len)
        new_str = str.substr(0, new_str.lastIndexOf(' '))
        new_str = new_str.length > 0 ? new_str : str.substr(0, len)
        return new_str + '...'
    }
    return str
}
app.locals.stripTags = (input) => input.replace(/<(?:.|\n)*?>/gm, '')
app.locals.editIcon = (storyUser, loggedUser, storyId, floating = true) => {
    if (storyUser._id.toString() == loggedUser._id.toString()) {
        if (floating) {
            return `<a href="/stories/edit/${storyId}" class="btn-floating halfway-fab red"><i class="fas fa-edit fa-small"></i></a>`
        } else {
            return `<a href="/stories/edit/${storyId}"><i class="fas fa-edit fa-small"></i></a>`
        }
    } else {
        return ''
    }
}
// app.locals.select = (selected, options) => {
//     return options.fn(this).replace(new RegExp(' value="' + selected + '"'), '$& selected="selected"').replace(new RegExp('>' + selected + '</option>'), 'selected="selected"$&')
// }

// Setting up ejs as view engine
app.set('view engine', 'ejs')

// Sessions
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: false,
    store: new MongoStore({
        mongooseConnection: mongoose.connection
    })
}))
// Passport middleware
app.use(passport.initialize())
app.use(passport.session())

// Set global variable
app.use(function (req, res, next) {
    res.locals.user = req.user || null
    next()
})

// Routes
app.use('/', require('./routes/index'))
app.use('/auth', require('./routes/auth'))
app.use('/stories', require('./routes/stories'))

// Initializing static files
app.use(express.static('public'))
const PORT = process.env.PORT || 3000

// Listening to the port
app.listen(PORT, console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`))