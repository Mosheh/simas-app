sap.ui.define([
    'sap/ui/core/ComponentContainer'
],function(ComponentContainer) {
    "use strict";

    new ComponentContainer({
        name: "SIMAS",
        height: "100%",
        width: "100%",
        settings:{
            id: "SIMAS"
        }, 
        async: true
    }).placeAt("content");

});