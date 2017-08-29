import * as request from 'request-promise';
import * as qs from 'querystring';

import Config from './config';
import BitrixAuth from './auth';

export class Bitrix24{
    auth: BitrixAuth;
    /**
     * Create Bitrix Client
     * @param init Configuration Initializer
     */
    constructor(private init:Config){
        if(init.config.host.indexOf('.') == -1){
            init.config.host = `http://${init.config.host}.bitrix24.com`;
        }

        if(init.config.mode != undefined){
            if((init.config.mode != 'api') && (init.config.mode != "webhook")){
                throw Error("Mode not supported");
            }
        }else{
            init.config.mode = "api"
        }

        if(!init.config.mode || init.config.mode == "api"){
            this.auth = new BitrixAuth(init);        
        }
        
    }
    
    /**
     * Call Bitrix rest API
     * @param {string} method - Method that will be called
     * @param {Object} param - Parameter and field that will send to API
     * @return {Promise} Return as object
     */
    async callMethod(method:string, param: any = {}){
        return __awaiter(this, void 0, void 0, function* () {
            let url;
            let access_token;
            if (this.init.config.mode == "api") {
                if (this.init.config.refresh === true) {
                    access_token = yield this.auth.refreshToken().access_token;
                }
                else {
                    access_token = this.init.methods.retriveToken().access_token;
                }

                param['auth'] = access_token;
                url = `${this.init.config.host}/rest/${method}?${qs.stringify(param)}`;
            }
            else {
                url = `${this.init.config.host}/rest/${this.init.config.user_id}/${this.init.config.code}/${method}?${qs.stringify(param)}`;
            }
            const result = yield request.get(url);
            return JSON.parse(result);
        });
    }
}
