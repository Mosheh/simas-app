sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/ui/core/routing/History",
    "sap/ui/model/json/JSONModel"    
], function(Controller, MessageToast, History, JSONModel) {
    "use strict";
    
    return Controller.extend("SIMAS.Controller.BaseController", {
        onInit: function(){
            
        },
   
        onShowHello: function(){
            var oBundle = this.getView().getModel("i18n").getResourceBundle();
            var titleApp = oBundle.getText("Label.Title");
            MessageToast.show("Etta "+ titleApp );
        },

        onOpenDialog: function(){
            this.getOwnerComponent().showDialog();            
        }, 

        obterControleVisualPorId(controlId)
        {
            return this.getView().byId(controlId)
        },

        getServerUrl(){
			let base = [];
			let serve = this.getOwnerComponent().getMetadata().getConfig().serviceUrl;
			base.push(serve);

			for (let index = 0; index < arguments.length; index++) {
				const element = arguments[index];
				base.push(element);
			}

			return base.join('/');
		},
         
        definirUsuario: function(usuario)        
        {
            delete usuario.Password;
            localStorage.setItem("usuarioAtual", JSON.stringify(usuario));            
        },

        obterUsuarioLogado: function()
        {
            return JSON.parse(localStorage.getItem("usuarioAtual"));
        },

        existeUsuarioLogado: function()
        {
            return this._usuario != {};
        },

        exibirMensagemDeErro: function(err)
        {
            var oBundle = this.getView().getModel("i18n").getResourceBundle();
            if(err ==null)
            {
                let message = oBundle.getText("Message.UnknowError");
                MessageToast.show(message);
            }
            else if(err.readyState==0)
            {
                let message = oBundle.getText("Message.ServerIsOffline");
                MessageToast.show(message);                
            }
            else if(err.status == 401)
            {                
                var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                oRouter.navTo("Login", {}, true);
                let message = oBundle.getText("Message.ExpiredAccessTime");
                MessageToast.show(message);     
            }
            else
            {
                MessageToast.show(err.responseText)
            }
        },

        navTo: function(simpleRoute)
        {
            var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            oRouter.navTo(simpleRoute);
        },

        getRouter()
        {
            var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            return oRouter;
        },

        getModel(modelName)
        {
            return this.getView().getModel(modelName);
        },

        setModelWithName(oModel, sModelName)
        {
            return this.getView().setModel(new JSONModel(oModel), sModelName);
        },

        setModel(oModel)
        {
            return this.getView().getModel(new JSONModel(oModel));
        },

        obterMensagem: function()
        {
            var oBundle = this.getView().getModel("i18n").getResourceBundle();
            return oBundle;
        },

        exibirMensagem: function(i18Message)
        {
           MessageToast.show(this.obterMensagem().getText(i18Message));
        },

        exibirMensagemSucessoNaOperacao()
        {
           MessageToast.show(this.obterMensagem().getText("Message.SuccessInPerformingOperation"));
        },

        obterToken : function (usuario) 
        {
            let serverUrl = this.getServerUrl("v1", "autenticar");

            if (!usuario)
                exibirMensagem("Message.InvalidUser");

            return new Promise((ok, bad)=>
            {
                jQuery.ajax({
                    contentType: 'application/x-www-form-urlencoded; charset=UTF-8',
                    url: serverUrl,
                    type: 'POST',
                    dataType: 'json',
                    data: new Object({
                        grant_type: 'password',
                        Login: usuario.Login,
                        Password: usuario.Password
                }),
                }).success((response) => ok(response)
                ).error((error) => bad(error));            
            });
        },

        aoFazerNovoLogin()
        {
            this.navTo("Login");
        },        

        aoAbrirConfiguracao()
        {
            this.navTo("Configuracao");
        },

        aoVoltar: function () {
			var oHistory = History.getInstance();
			var sPreviousHash = oHistory.getPreviousHash();

			if (sPreviousHash !== undefined) {
				window.history.go(-1);
			} else {
				var oRouter = sap.ui.core.UIComponent.getRouterFor(this);;
				oRouter.navTo("App", {}, true);
			}
		}
    });
});