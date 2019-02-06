const express = require('express');
const morgan = require('morgan');
const exphbs = require('express-handlebars');
const path = require('path');
// Initializations
const app = express();


// Settings
app.set('port', process.env.PORT || 4000);
app.set('views', path.join(__dirname, 'views'));
app.engine('.hbs', exphbs({
    defaultLayout: 'main',
    layoutsDir: path.join(app.get('views'), 'layouts'),
    partialsDir: path.join(app.get('views'), 'partials'),
    extname: '.hbs',
    helpers: require('./lib/handlebars')
}));
app.set('view engine', '.hbs');

// Middlewares
app.use(morgan('dev'));// ver peticiones q llegan al sv
app.use(express.urlencoded({extended: false})); //Aceptar desde el form los datos que envian los user. datos comunes
app.use(express.json());
// Global Variables

// app.use((req,res,next) => {

//     next();
// });

// Routes
app.use(require('./routes'));
app.use(require('./routes/authentication'));
app.use('/links',require('./routes/links.js'));

// Public
app.use(express.static(path.join(__dirname, 'public'))); 
// Starting the sv
app.listen(app.get('port'),() =>{
    console.log('Server on port', app.get('port'));
});