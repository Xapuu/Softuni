import { NO_VALUE } from './../utils.js';
import { requester } from './../services/app-service.js';

export async function applyCommon() {
    /** 
     * Gets data about the user and adds it the context
     */
    this.email = sessionStorage.getItem('email');
    this.loggedIn = !!sessionStorage.getItem('token');


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
    // if (sessionStorage.getItem('userId')) {
    //     this.hasNoTeam = await requester.userMeta
    //         .getById(sessionStorage.getItem('userId'))
    //         .then(res => {
    //             return  !res || (res && res.team == NO_VALUE);
    //         });
    // }
}