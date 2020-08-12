sap.ui.define([
    "sap/ui/core/UIComponent",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/resource/ResourceModel",
    "./Controller/Fragments/MessageDialog"
], function(UIComponent, JSONModel, ResourceModel, MessageDialog){
    "use strict";

    return UIComponent.extend("SIMAS.Component", {
        metadata: {
           manifest: "json"
        },

        init: function(){
            UIComponent.prototype.init.apply(this, arguments);

            var i18nModel = new ResourceModel({
                bundleName: "SIMAS.i18n.i18n"
            });
            this.setModel(i18nModel, "i18n");

            this._messageDialog = new MessageDialog(this.getRootControl());

            this.getRouter().initialize();
        },

        exit: function(){
            this._messageDialog.distroy();
            delete this._messageDialog;
        },

        showDialog: function(){
            this._messageDialog.open();
        }
    });
});