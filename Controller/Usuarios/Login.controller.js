sap.ui.define([
    "SIMAS/Controller/BaseController",
    "sap/m/MessageToast",
    "SIMAS/libs/DadosDeConfiguracao"
], function(BaseController, MessageToast, DadosDeConfiguracao) {
    'use strict';
    
    let dadosDeConfiguracao = new DadosDeConfiguracao();

    return BaseController.extend("SIMAS.Controller.Usuarios.Login", {

        onAfterRendering: function(){
            let configuracaoModelo = dadosDeConfiguracao.ObterDadosDeConfiguracao();   
            if(configuracaoModelo.LoginAutomatico)
            {
                let oNomeUsuarioInput = this.byId("usuarioInput");
                let oSenhaUsuarioInput = this.byId("senhaInput");
    
                let oButtonLogin = this.byId("buttonLogin");

                oNomeUsuarioInput.setValue(configuracaoModelo.UsuarioNomePadrao);
                oSenhaUsuarioInput.setValue(configuracaoModelo.UsuarioSenhaPadrao);
                oButtonLogin.firePress();
            }
        },

        aoLogar:function(){
            
            
            let oNomeUsuarioInput = this.byId("usuarioInput");
            let oSenhaUsuarioInput = this.byId("senhaInput");

            let oButtonLogin = this.byId("buttonLogin");

            let sNomeUsuario = oNomeUsuarioInput.getValue();
            let sSenha = oSenhaUsuarioInput.getValue();

            // setTimeout(()=> {console.log("Login!");}, 2000);            

            var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            

            let usuario = new Object();
            usuario.Login = sNomeUsuario;
            usuario.Password = sSenha;

            if(!usuario.Login || !usuario.Password)
            {
                this.exibirMensagem("Message.NameAndPasswordIsRequired");
                return;
            }
            oButtonLogin.setBusy(true);

            this.obterToken(usuario)
                .then((response)=>{
                    usuario.token = response.Token;
                    usuario.expiracao = response.Expiracao;
                    usuario.email = response.Usuario.Email;
                    this.definirUsuario(usuario);
                    oRouter.navTo("App");
                    oButtonLogin.setBusy(false);
                }).catch((error)=> {
                    oButtonLogin.setBusy(false);
                    if(error.status == 0)
                        this.exibirMensagem("Message.ServerIsOffline");
                    else
                        MessageToast.show(error.responseText);

                });

        }

    });

});