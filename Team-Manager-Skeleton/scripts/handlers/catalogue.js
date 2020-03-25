import { applyCommon } from './common.js';
import { requester } from './../services/app-service.js';

export async function catalogueHandler() {

    /**
     * Gets all teams from the db and maps them to the expected by the template value + add them to the template context
     */
    this.teams = Object.entries(await requester.teams.getAll().then(x => x || {})).map(([id, value]) => ({ _id: id, ...value }));
    
    /**
     * Load hbs templates
     */
    await applyCommon.call(this);
    this.partials.team = await this.load('./templates/catalog/team.hbs');
    this.partial('./templates/catalog/teamCatalog.hbs');
}

export async function catalogueDetailsHandler() {
    /**
     * Gets one team from the db and map it to the expected by the template value + add it to the template context
     * 
     * -- this.params comes from the navigation url!!
     */
    this.teamId = this.params.id;
    let { name, comment, teamMembers, createdBy } = await requester.teams.getById(this.params.id);
    this.name = name;
    this.comment = comment;
    this.members = (teamMembers || []).map(member => ({ username: member.name }));
    this.isAuthor = createdBy === sessionStorage.getItem('userId');
    this.isOnTeam = (teamMembers || []).find(x => x.id === sessionStorage.getItem('userId'));
    /**
     * Load hbs templates
     */
    await applyCommon.call(this);
    this.partials.teamMember = await this.load('./templates/catalog/teamMember.hbs');
    this.partials.teamControls = await this.load('./templates/catalog/teamControls.hbs');
    this.partial('./templates/catalog/details.hbs');
}