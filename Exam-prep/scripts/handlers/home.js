import { applyCommon } from './common.js';
import { requester } from './../services/app-service.js';
import { successNotification } from './../notifications.js'

export async function homeViewHandler() {
    /**
     * Load hbs templates
     */
    await applyCommon.call(this);


    let treks = await requester.treks.getAll()

    console.log(treks)
    this.treks = Object.entries(treks || {}).map(([trekId, trek]) => ({...trek, trekId}) );

    this.loggedInWithTreks = sessionStorage.getItem('token') && this.treks.length > 0;

    this.loggedInWithNoTreks = sessionStorage.getItem('token') && this.treks.length === 0;

    this.partial('./templates/home/home.hbs');

    successNotification('Please work and disappear')
}
