import { createFormEntity } from './form-helpers.js';
import { fireBaseRequestFactory } from './firebase-requests.js';

async function applyCommon() {
    this.partials = {
        header: await this.load('./templates/common/header.hbs'),
        footer: await this.load('./templates/common/footer.hbs')
    };

    this.username = sessionStorage.getItem('username');
    this.loggedIn = !!sessionStorage.getItem('token');
    this.hasNoTeam = true;
}

async function homeViewHandler() {
    await applyCommon.call(this);
    this.partial('./templates/home/home.hbs');
}

async function aboutViewHandler() {
    await applyCommon.call(this);
    this.partial('./templates/about/about.hbs');
}

async function loginHandler() {
    await applyCommon.call(this);
    this.partials.loginForm = await this.load('./templates/login/loginForm.hbs');

    await this.partial('./templates/login/loginPage.hbs');

    let formRef = document.querySelector('#login-form');

    formRef.addEventListener('submit', e => {
        e.preventDefault();

        let form = createFormEntity(formRef, ['username', 'password']);
        let formValue = form.getValue();

        firebase.auth().signInWithEmailAndPassword(formValue.username, formValue.password)
            .then((response) => {
                firebase.auth().currentUser.getIdToken().then(token => {
                    sessionStorage.setItem('token', token);
                    sessionStorage.setItem('username', response.user.email);
                    this.redirect(['#/home']);
                });
            })
            .catch(function (error) {
                var errorCode = error.code;
                var errorMessage = error.message;
                // ...
            });
    });
}

async function registerViewHandler() {
    await applyCommon.call(this);
    this.partials.registerForm = await this.load('./templates/register/registerForm.hbs');

    await this.partial('./templates/register/registerPage.hbs');

    let formRef = document.querySelector('#register-form');

    formRef.addEventListener('submit', (e) => {
        e.preventDefault();
        let form = createFormEntity(formRef, ['username', 'password', 'repeatPassword']);
        let formValue = form.getValue();

        if (formValue.password !== formValue.repeatPassword) {
            return;
        }
        firebase.auth().createUserWithEmailAndPassword(formValue.username, formValue.password)
            .then(response => {
                firebase.auth().currentUser.getIdToken().then(token => {
                    sessionStorage.setItem('token', token);
                    sessionStorage.setItem('username', response.user.email);
                });

                this.redirect(['#/home']);
            });
    });

}

async function catalogueHandler() {
    await applyCommon.call(this);
    this.partial('./templates/catalog/teamCatalog.hbs');
}

async function createTeamHandler() {
    await applyCommon.call(this);
    this.partials.createForm = await this.load('./templates/create/createForm.hbs');

    await this.partial('./templates/create/createPage.hbs');

    const firebaseTeams = fireBaseRequestFactory('https://fir-playground-6c579.firebaseio.com/', 'teams', sessionStorage.getItem('token'));

    let formRef = document.querySelector('#create-form');

    formRef.addEventListener('submit', e => {
        e.preventDefault();

        let form = createFormEntity(formRef, ['name', 'comment']);
        let formValue = form.getValue();

        firebaseTeams.createEntity(formValue).then(x => {
            this.redirect('#/catalog');
        });
    });
}

function logoutHandler() {
    sessionStorage.clear();
    firebase.auth().signOut();
    this.redirect(['#/home']);
}

// initialize the application
const app = Sammy('#main', function () {
    // Set handlebars as template engine
    this.use('Handlebars', 'hbs');

    // define a 'route'
    this.get('#/', homeViewHandler);
    this.get('#/home', homeViewHandler);
    this.get('#/about', aboutViewHandler);
    this.get('#/login', loginHandler);
    this.post('#/login', () => false);
    this.get('#/register', registerViewHandler);
    this.post('#/register', () => false);
    this.get('#/logout', logoutHandler);
    this.get('#/catalog', catalogueHandler);
    this.get('#/create', createTeamHandler);
    this.post('#/create', () => false);

});
// start the application
app.run('#/');
