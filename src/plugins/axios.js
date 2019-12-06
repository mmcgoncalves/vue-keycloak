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

keycloak.init({  onLoad: 'login-required',   promiseType: 'native', checkLoginIframe: false }).then(function(auth) { 
    
    if(!auth) {
        window.location.reload();
    } 
  
    localStorage.setItem("vue-token", keycloak.token);
    localStorage.setItem("vue-refresh-token", keycloak.refreshToken);
  
    keycloak.updateToken(30).then(function() {       

        const token = keycloak.token  
        Vue.use({
            install(Vue) {
                Vue.prototype.$keycloak = keycloak

                Vue.prototype.$http = axios.create({
                    baseURL: URL,
                    headers: {
                      "Content-type": "application/json; charset=UTF-8",
                      "Authorization": 'Bearer ' + token
                    }
                })
        
                Vue.prototype.$http.interceptors.response.use(
                    res => res,                        
                    error => Promise.reject(error)
                )
        
            }
        })

    }).catch(function() {
        console.error('Failed to refresh token');
        keycloak.logout();
    });

    keycloak.loadUserProfile().then(function(profile) {        
        localStorage.setItem("vue-user-profile", JSON.stringify(profile, null, "  "));
    }).catch(function() {
        console.error('Failed to load user profile');
    });

}).catch(function() {    
    console.error("Authenticated Failed");
    keycloak.logout();
});




