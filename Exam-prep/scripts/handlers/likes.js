import { requester } from './../services/app-service.js';

export async function likesHandler() {

    await requester.treks.patchEntity({
        likes: Number(this.params.currentLikes) +1
    }, this.params.id)

    this.redirect(`#/details/${this.params.id}`)
    return false;

}