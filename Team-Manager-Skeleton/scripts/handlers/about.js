import { applyCommon } from './common.js';

export async function aboutViewHandler() {
    /**
     * Load hbs templates
     */
    await applyCommon.call(this);
    this.partial('./templates/about/about.hbs');
}
