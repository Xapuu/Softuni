import { requester } from './../services/app-service.js';
export async function deleteHandler() {

    await requester.treks.deleteEntity(this.params.id);

    this.redirect('#/home');
}