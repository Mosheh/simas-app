sap.ui.define([
    "SIMAS/Controller/BaseController",
    "SIMAS/libs/DadosDeConfiguracao"    
], function(BaseController, DadosDeConfiguracao) {
    "use strict";

    let dadosDeConfiguracao = new DadosDeConfiguracao();
    
        return BaseController.extend("SIMAS.Controller.Configuracoes.Configuracao", {
            
            onInit()
            {
               
                let configuracaoModelo = dadosDeConfiguracao.ObterDadosDeConfiguracao();                       
                 
                this.setModelWithName(configuracaoModelo, "Configuracao");                                             
            },

            onAfterRendering()
            {
                let configuracao = this.getModel("Configuracao");
                if(configuracao)
                {
                    let inputUsuarioNome = this.getView().byId("inputUsuarioNomePadrao");
                    let inputUsuarioSenha = this.getView().byId("inputUsuarioSenhaPadrao");
                    let checkBoxRequererPesquisaAuto = this.getView().byId("checkBoxRequererNovaPesquisa"); 
                    let checkBoxLoginAutomatico = this.getView().byId("checkLoginAutomatico"); 

                    inputUsuarioNome.setValue(configuracao.oData.UsuarioNomePadrao);
                    inputUsuarioSenha.setValue(configuracao.oData.UsuarioSenhaPadrao);
                    checkBoxRequererPesquisaAuto.setSelected(configuracao.oData.RequererNovaPesquisa);
                    checkBoxLoginAutomatico.setSelected(configuracao.oData.LoginAutomatico)
                }
            },

            aoSalvarConfiguracao()
            {
                let inputUsuarioNomeValue = this.getView().byId("inputUsuarioNomePadrao").getValue();
                let inputUsuarioSenhaValue = this.getView().byId("inputUsuarioSenhaPadrao").getValue();
                let checkBoxRequererPesquisaAutoValue = this.getView().byId("checkBoxRequererNovaPesquisa").getSelected();
                let checkBoxLoginAutoValue = this.getView().byId("checkLoginAutomatico").getSelected();
                if(!inputUsuarioNomeValue || !inputUsuarioSenhaValue)
                {
                    exibirMensagem("Message.InvalidSetting");
                    return;
                }

                let configuracao = this.getModel("Configuracao");
                configuracao.oData.UsuarioNomePadrao = inputUsuarioNomeValue;
                configuracao.oData.UsuarioSenhaPadrao = inputUsuarioSenhaValue;
                configuracao.oData.RequererNovaPesquisa = checkBoxRequererPesquisaAutoValue;
                configuracao.oData.LoginAutomatico = checkBoxLoginAutoValue;
                dadosDeConfiguracao.SalvarConfiguracao(
                    {
                        nome: configuracao.oData.UsuarioNomePadrao,
                        senha: configuracao.oData.UsuarioSenhaPadrao,
                        requererNovaPesquisa: configuracao.oData.RequererNovaPesquisa,
                        loginAutomatico: configuracao.oData.LoginAutomatico
                });

                this.exibirMensagemSucessoNaOperacao();
            },

          

    });

});