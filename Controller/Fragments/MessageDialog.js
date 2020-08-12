sap.ui.define([
    'sap/ui/base/ManagedObject',
    'sap/ui/core/Fragment'
], function(ManagedObject, Fragment) {
    'use strict';
    
    return ManagedObject.extend("SIMAS.Controller.Fragments.MessageDialog", {

        constructor: function(oView){
            this._oView = oView;            
        },

        exit: function(){
            delete this._oView;
        },

        open: function(){
            var oView = this._oView;

            if(!oView.byId("messageDialog")){
                
                var oFragmentController = {
                    onCloseDialog: function(){
                        oView.byId("messageDialog").close();
                    }
                };

                Fragment.load({
                    id: oView.getId(),
                    name: "SIMAS.View.Fragments.MessageDialog",
                    controller: oFragmentController
                }).then(function(oDialog){
                    oView.addDependent(oDialog);
                    oDialog.open();
                });
        }else{
            oView.byId("messageDialog").open();
        }
    }
    });
});