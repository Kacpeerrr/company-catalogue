const express = require('express')
const path = require('path')
const ejsLayouts = require('express-ejs-layouts')
const app = express()
const cookieParser = require('cookie-parser')
const session = require('express-session')
const { sessionKeySecret } = require('./config')
const helmet = require('helmet')
const rateLimiterMiddleware = require('./middleware/rate-limiter-middleware')

require('./db/mongoose')

app.use(helmet({
	contentSecurityPolicy: {
		directives: {
			defaultSrc: ["'self'"],
			scriptSrc: ["'self'", "cdn.jsdelivr.net"],
			styleSrc: ["'self'", "cdn.jsdelivr.net"]
		}
	}
}))

app.use(rateLimiterMiddleware)

//session
app.use(
	session({
		secret: sessionKeySecret,
		saveUninitialized: true,
		cookie: { maxAge: 1000 * 60 * 60 * 24 * 2 }, //2 day
		resave: false,
	})
)

//view engine
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname + '/../views'))
//set layout
app.use(ejsLayouts)
app.set('layout', './layouts/main')
//public folder
app.use(express.static('public'))

//body parser
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())
app.use(express.json())

//middleware
app.use('/', require('./middleware/view-variables-middleware'))
app.use('/', require('./middleware/user-middleware'))
app.use('/admin', require('./middleware/is-auth-middleware'))

app.use('/api', require('./routes/api'))
app.use(require('./routes/web'))

module.exports = app
