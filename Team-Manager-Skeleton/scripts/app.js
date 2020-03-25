import { requester } from './services/app-service.js';
import {
    homeViewHandler,
    aboutViewHandler,
    loginHandler,
    registerViewHandler,
    logoutHandler,
    catalogueHandler,
    catalogueDetailsHandler,
    editTeamHandler,
    joinTeamHandler,
    leaveTeamHandler,
    createTeamHandler
} from './handlers/index.js';

const apiKey = 'https://fir-playground-6c579.firebaseio.com/';
requester.init(apiKey, sessionStorage.getItem('token'));


/**
 * Configure the application with all it's routes and the template engine that it uses 
 */
const app = Sammy('#main', function () {
    /**
     * Setting handlebars as template engine
     */
    this.use('Handlebars', 'hbs');

    /**
     * Define routes to be used by the application
     */
    this.get('#/', homeViewHandler);
    this.get('#/home', homeViewHandler);
    this.get('#/about', aboutViewHandler);
    this.get('#/login', loginHandler);
    this.post('#/login', () => false);
    this.get('#/register', registerViewHandler);
    this.post('#/register', () => false);
    this.get('#/logout', logoutHandler);
    this.get('#/catalog', catalogueHandler);
    this.post('#/catalog', () => false);
    this.get('#/catalog/:id', catalogueDetailsHandler);
    this.post('#/catalog', false);
    this.get('#/edit/:id', editTeamHandler);
    this.post('#/edit/:id', () => false);
    this.get('#/join/:id', joinTeamHandler);
    this.get('#/leave/:id', leaveTeamHandler);
    this.get('#/create', createTeamHandler);
    this.post('#/create', () => false);
});
/**
 * Start the application
 */
app.run('#/');
