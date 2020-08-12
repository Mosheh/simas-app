sap.ui.define([
    "SIMAS/Controller/BaseController",
    "sap/m/MessageToast",
    "sap/ui/model/json/JSONModel"
], function(BaseController, MessageToast, JSONModel){
    "use strict";
    return BaseController.extend("SIMAS.Controller.App", {

        onInit : function () {
            
            let oModel = new JSONModel();

            var urlServer = this.getServerUrl();
            var resource = "/v1/Dashboard";
            var url = urlServer + resource;
            
            let that = this;
            let error = undefined;

            var data = jQuery.ajax({
                type: "GET",
                contentType: "application/json",
                url: url,
                dataType: "json",
                success: function(data, status, jqXHR){
                    oModel.setData(data);   
                    return jqXHR;
                },
                error: function(xhr, textStatus, errorThrow){
                    if(xhr.status == 0)
                        that.exibirMensagem("Message.ServerIsOffline")
                    return xhr;    
                }
            });
                     

            this.getView().setModel(oModel);

         

        },
        
        onTilePress: function(oEvent){

            var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            var model = oEvent.oSource.getBindingContext().getObject();
            // var element = oEvent.oSource.bindElement({path: sPath, model: "tileCollection"});
            
            oRouter.navTo(model.Route);            
            
        }
     
    });
});