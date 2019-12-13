import Vue from 'vue'
import axios from 'axios'
import Keycloak from 'keycloak-js'

const URL = process.env.VUE_APP_ROOT_API

let initOptions = {
  url: 'https://idm-homologacao.prodam.am.gov.br/auth', 
  realm: 'Ajuri', 
  clientId: 'ajuri-wms-web'            
}

let keycloak = new Keycloak(initOptions);  

keycloak.onTokenExpired = () => {    
    keycloak.updateToken(30).then(function() {})
    .catch(function() {
        keycloak.logout();
    });
}

keycloak.init({  onLoad: 'login-required',   promiseType: 'native', checkLoginIframe: true }).then(function(authenticated) {

    if (!authenticated) {
        window.location.reload();        
    }

    Vue.use({
        install(Vue) {
            Vue.prototype.$keycloak = keycloak

            Vue.prototype.$http = axios.create({
                baseURL: URL,
                headers: {
                  "Content-type": "application/json; charset=UTF-8"                      
                }
            })                

            Vue.prototype.$http.interceptors.request.use(config => {                
                config.headers = {                             
                    'Authorization' : 'Bearer ' + keycloak.token                            
                }

                return config;                      
                }, error => Promise.reject(error)
            )
    
            Vue.prototype.$http.interceptors.response.use(res => res, function (error) {
                const status = error.response ? error.response.status : null                    
                
                if (status === null || status === 401) {   
                    const requestConfig = error.config   
                    keycloak.onTokenExpired();                                        
                    requestConfig.headers['Authorization'] = 'Bearer ' + keycloak.token
                    return axios(requestConfig)                        
                } else {
                    return Promise.reject(error)
                }

            })    
        }
    })

    keycloak.loadUserProfile().then(function(profile) {        
        localStorage.setItem("vue-user-profile", JSON.stringify(profile, null, "  "));
    }).catch(function() {
        console.error('Failed to load user profile');
    });

}).catch(function() {    
    console.error("Authenticated Failed");
    keycloak.logout();
});




