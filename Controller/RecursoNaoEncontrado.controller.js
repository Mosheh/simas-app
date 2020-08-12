sap.ui.define([
    'SIMAS/Controller/BaseController'    
], function(BaseController) {
    'use strict';
    
    return BaseController.extend("SIMAS.Controller.RecursoNaoEncontrado", {
        voltarParaPaginaPrincipal()
        {
            this.navTo("App");
        }
    });

});