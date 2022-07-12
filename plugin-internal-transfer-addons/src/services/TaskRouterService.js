import { Manager } from '@twilio/flex-ui';

import { utils } from '../helpers';

let workflows = null

class TaskRouterService {
    manager = Manager.getInstance();

    serverlessDomain = process.env.REACT_APP_SERVERLESS_DOMAIN;

    buildBody(encodedParams){
        return Object.keys(encodedParams).reduce((result, paramName,idx) => {
            if(encodedParams[paramName] === undefined) {
                return result;
            }
            if(idx > 0){
                return `${result}&${paramName}=${encodedParams[paramName]}`;
            }
            return `${paramName}=${encodedParams[paramName]}`;
        }, '')
    }

    // does a one time fetch for workflows per session
	// since workflow configuration seldom changes

    async getWorkflows() {
        if(workflows) return workflows

        workflows = await this.#getWorkflows();
        return workflows
    }

    #getWorkflows = () => {
        const encodedParams = {
            Token: encodeURIComponent(this.manager.user.token)
        };
        
        return utils.fetchJsonWithReject(
            `https://${this.serverlessDomain}/list-workflows`,
            {
				method: 'post',
				headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
				body: this.buildBody(encodedParams)
			})
            .then((response) => {
                const { workflows } = response;
                return workflows;

            });
    };
}

export default new TaskRouterService();