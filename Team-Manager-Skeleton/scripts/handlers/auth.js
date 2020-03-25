import { createFormEntity } from './../form-helpers.js';
import { applyCommon } from './common.js';
import { requester } from './../services/app-service.js';
import { NO_VALUE } from './../utils.js';

/**
 * Logs user
 */
export async function loginHandler() {
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

        /**
         * Updates the requester authentication token
         */
        sessionStorage.setItem('token', userToken);
        requester.setAuthToken(userToken);


        this.redirect(['#/home']);
    });
}

/**
 * Registers user
 */
export async function registerViewHandler() {
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
         * Updates the requester authentication token
         */
        requester.setAuthToken(userToken);

        /**
         * Creates a collection that hold the user's team, and the teams created by him 
         */
        await requester.userMeta.patchEntity({
            team: NO_VALUE,
            createdTeams: NO_VALUE
        }, sessionStorage.getItem('userId'));

        this.redirect(['#/home']);
    });

}

/**
 * Signs out user
 */
export function logoutHandler() {
    sessionStorage.clear();
    firebase.auth().signOut();
    this.redirect(['#/home']);
}