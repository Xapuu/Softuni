import { createFormEntity } from './form-helpers.js';
import { fireBaseRequestFactory } from './firebase-requests.js';
const NO_VALUE = 'no_value_placeholder';

async function applyCommon() {
    /** 
     * Gets data about the user and adds it the context
     */
    this.username = sessionStorage.getItem('username');
    this.loggedIn = !!sessionStorage.getItem('token');
    const firebaseUserMeta = fireBaseRequestFactory('https://fir-playground-6c579.firebaseio.com/', 'userMeta', sessionStorage.getItem('token'));


    /**
     * Applies hbs templates
     */
    this.partials = {
        header: await this.load('./templates/common/header.hbs'),
        footer: await this.load('./templates/common/footer.hbs')
    };
    /**
     * Keep in mind the next lines are not very efficient, because
     * each time a path is accessed and a user is logged in we will make request to get data about the user
     */
    if (sessionStorage.getItem('userId')) {
        this.hasNoTeam = await firebaseUserMeta
            .getById(sessionStorage.getItem('userId'))
            .then(res => {
                return !res || (res && res.team == NO_VALUE);
            });
    }
}

async function homeViewHandler() {
    await applyCommon.call(this);
    this.partial('./templates/home/home.hbs');
}

async function aboutViewHandler() {
    await applyCommon.call(this);
    this.partial('./templates/about/about.hbs');
}
/**
 * Logs user
 */
async function loginHandler() {
    /**
     * Load hbs templates
     */
    await applyCommon.call(this);
    this.partials.loginForm = await this.load('./templates/login/loginForm.hbs');
    await this.partial('./templates/login/loginPage.hbs');

    /**
     * Handling form events part
     */
    let formRef = document.querySelector('#login-form');
    formRef.addEventListener('submit', async e => {
        e.preventDefault();

        let form = createFormEntity(formRef, ['username', 'password']);
        let formValue = form.getValue();

        /**
         * Authenticates a user with email and password
         */
        const loggedInUser = await firebase.auth().signInWithEmailAndPassword(formValue.username, formValue.password);
        const userToken = await firebase.auth().currentUser.getIdToken();
        sessionStorage.setItem('username', loggedInUser.user.email);
        sessionStorage.setItem('userId', firebase.auth().currentUser.uid);

        sessionStorage.setItem('token', userToken);

        this.redirect(['#/home']);
    });
}

/**
 * Registers user
 */
async function registerViewHandler() {
    /**
     * Load hbs templates
     */
    await applyCommon.call(this);
    this.partials.registerForm = await this.load('./templates/register/registerForm.hbs');
    await this.partial('./templates/register/registerPage.hbs');

    /**
     * Handling form events part
     */
    let formRef = document.querySelector('#register-form');
    formRef.addEventListener('submit', async (e) => {
        e.preventDefault();
        let form = createFormEntity(formRef, ['username', 'password', 'repeatPassword']);
        let formValue = form.getValue();

        if (formValue.password !== formValue.repeatPassword) {
            throw new Error('Password and repeat password must match');
        }

        /**
         * Creates new user
         */
        const newUser = await firebase.auth().createUserWithEmailAndPassword(formValue.username, formValue.password);

        let userToken = await firebase.auth().currentUser.getIdToken();
        sessionStorage.setItem('username', newUser.user.email);
        sessionStorage.setItem('userId', firebase.auth().currentUser.uid);

        sessionStorage.setItem('token', userToken);

        /**
         * Creates a collection that hold the user's team, and the teams created by him 
         */
        const firebaseUserMeta = fireBaseRequestFactory('https://fir-playground-6c579.firebaseio.com/', 'userMeta', sessionStorage.getItem('token'));
        await firebaseUserMeta.patchEntity({
            team: NO_VALUE,
            createdTeams: NO_VALUE
        }, sessionStorage.getItem('userId'));

        this.redirect(['#/home']);
    });

}

/**
 * Signs out user
 */
function logoutHandler() {
    sessionStorage.clear();
    firebase.auth().signOut();
    this.redirect(['#/home']);
}

async function catalogueHandler() {
    const firebaseTeams = fireBaseRequestFactory('https://fir-playground-6c579.firebaseio.com/', 'teams', sessionStorage.getItem('token'));

    /**
     * Gets all teams from the db and maps them to the expected by the template value + add them to the template context
     */
    this.teams = Object.entries(await firebaseTeams.getAll().then(x => x || {})).map(([id, value]) => ({ _id: id, ...value }));

    /**
     * Load hbs templates
     */
    await applyCommon.call(this);
    this.partials.team = await this.load('./templates/catalog/team.hbs');
    this.partial('./templates/catalog/teamCatalog.hbs');
}

async function catalogueDetailsHandler() {
    const firebaseTeams = fireBaseRequestFactory('https://fir-playground-6c579.firebaseio.com/', 'teams', sessionStorage.getItem('token'));

    /**
     * Gets one team from the db and map it to the expected by the template value + add it to the template context
     * 
     * -- this.params comes from the navigation url!!
     */
    this.teamId = this.params.id;
    let { name, comment, teamMembers, createdBy } = await firebaseTeams.getById(this.params.id);
    this.name = name;
    this.comment = comment;
    this.members = (teamMembers || []).map(member => ({ username: member.name }));
    this.isAuthor = createdBy === sessionStorage.getItem('userId');
    this.isOnTeam = (teamMembers || []).find(x => x.id === sessionStorage.getItem('userId'));
;
    /**
     * Load hbs templates
     */
    await applyCommon.call(this);
    this.partials.teamMember = await this.load('./templates/catalog/teamMember.hbs');
    this.partials.teamControls = await this.load('./templates/catalog/teamControls.hbs');
    this.partial('./templates/catalog/details.hbs');
}

async function joinTeamHandler() {
    /**
     * Get data about the team the user wants to join
     * -- this.params comes from the url
     */
    const firebaseTeams = fireBaseRequestFactory('https://fir-playground-6c579.firebaseio.com/', 'teams', sessionStorage.getItem('token'));
    const firebaseUserMeta = fireBaseRequestFactory('https://fir-playground-6c579.firebaseio.com/', 'userMeta', sessionStorage.getItem('token'));
    let team = await firebaseTeams.getById(this.params.id);
    /** 
     * Updates the user meta data with the id of the team he/she joins 
     * Updates the teamsData with the id and the name of the user that is joining
     */
    await firebaseUserMeta.patchEntity({ team: this.params.id }, sessionStorage.getItem('userId'));
    await firebaseTeams.patchEntity(
        {
            teamMembers: [...(team.teamMembers || []),
            {
                name: sessionStorage.getItem('username'),
                id: sessionStorage.getItem('userId')
            }
            ]
        },
        this.params.id
    );
    /** 
     * Navigates back to the catalog details
     */
    this.redirect(`#/catalog/${this.params.id}`);
}

async function leaveTeamHandler() {
    /**
     * Get data about the team the user wants to leave
     * -- this.params comes from the url
     */
    const firebaseTeams = fireBaseRequestFactory('https://fir-playground-6c579.firebaseio.com/', 'teams', sessionStorage.getItem('token'));
    const firebaseUserMeta = fireBaseRequestFactory('https://fir-playground-6c579.firebaseio.com/', 'userMeta', sessionStorage.getItem('token'));
    let team = await firebaseTeams.getById(this.params.id);

    /** 
     * Updates the user meta data with the id of the team he/she leave 
     * Removes from teamsData the leaving user
     */
    await firebaseUserMeta.patchEntity({ team: NO_VALUE, createdTeams: NO_VALUE }, sessionStorage.getItem('userId'));
    await firebaseTeams.patchEntity(
        {
            teamMembers: [
                ...(team.teamMembers || [])
                    .filter(teamMember => teamMember.id !== sessionStorage.getItem('userId'))
            ]
        },
        this.params.id
    );
    /** 
     * Navigates back to the catalog details
     */
    this.redirect(`#/catalog/${this.params.id}`);
}

async function createTeamHandler() {
    /**
     * Load hbs templates
     */
    await applyCommon.call(this);
    this.partials.createForm = await this.load('./templates/create/createForm.hbs');

    await this.partial('./templates/create/createPage.hbs');

    const firebaseTeams = fireBaseRequestFactory('https://fir-playground-6c579.firebaseio.com/', 'teams', sessionStorage.getItem('token'));
    const firebaseUserMeta = fireBaseRequestFactory('https://fir-playground-6c579.firebaseio.com/', 'userMeta', sessionStorage.getItem('token'));
    /**
     * Handling form events part
     */
    let formRef = document.querySelector('#create-form');
    formRef.addEventListener('submit', async e => {
        e.preventDefault();

        let form = createFormEntity(formRef, ['name', 'comment']);
        let formValue = form.getValue();
        formValue.teamMembers = [{
            id: sessionStorage.getItem('userId'),
            name: sessionStorage.getItem('username')
        }];
        formValue.createdBy = sessionStorage.getItem('userId');

        let createdTeam = await firebaseTeams.createEntity(formValue);

        await firebaseUserMeta.patchEntity({
            createdTeams: createdTeam.name,
            team: createdTeam.name,
        }, sessionStorage.getItem('userId'));

        this.redirect('#/catalog');
    });
}

async function editTeamHandler() {
    /**
     * Load hbs templates
     */
    await applyCommon.call(this);
    this.partials.editForm = await this.load('./templates/edit/editForm.hbs');
    await this.partial('./templates/edit/editPage.hbs');

    const firebaseTeams = fireBaseRequestFactory('https://fir-playground-6c579.firebaseio.com/', 'teams', sessionStorage.getItem('token'));
    /**
     * Handling form events part
     */
    let formRef = document.querySelector('#edit-form');
    let form = createFormEntity(formRef, ['name', 'comment']);

    /**
     * Load and set the initial form value for edit
     */
    const teamToEdit = await firebaseTeams.getById(this.params.id);
    form.setValue(teamToEdit);

    formRef.addEventListener('submit', async e => {
        e.preventDefault();
        let form = createFormEntity(formRef, ['name', 'comment']);
        let formValue = form.getValue();

        await firebaseTeams.patchEntity(formValue, this.params.id);

        /** 
         * Navigates back to the catalog details
         */
        this.redirect(`#/catalog/${this.params.id}`);
    });
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
// start the application
app.run('#/');
