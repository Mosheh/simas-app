sap.ui.define([
    'sap/ui/base/Object'    
], function(Object) {
    'use strict';

    const NOME_USUARIO = "SIMAS.UsuarioNomePadrao";
    const SENHA_USUARIO = "SIMAS.UsuarioSenhaPadrao"
    const REQUERER_PESQUISA_AUTO = "SIMAS.RequererNovaPesquisa";
    const LOGIN_AUTOMATICO = "SIMAS.LoginAutomatico";
    const configuracaoModelo = {
        UsuarioNomePadrao: "",
        UsuarioSenhaPadrao: "",
        RequererNovaPesquisa: false,
        LoginAutomatico: false
    }
    return Object.extend("SIMAS.libs.DadosDeConfiguracao",
    {

        ObterDadosDeConfiguracao: function(){
            
            let nomeUsuarioPadrao = localStorage.getItem(NOME_USUARIO);
            let senhaUsuarioPadrao = localStorage.getItem(SENHA_USUARIO);
            let requererNovaPesquisa = localStorage.getItem(REQUERER_PESQUISA_AUTO);
            let loginAutomatico = localStorage.getItem(LOGIN_AUTOMATICO);
            if(nomeUsuarioPadrao)                
                configuracaoModelo.UsuarioNomePadrao = nomeUsuarioPadrao;
            if(nomeUsuarioPadrao)                
                configuracaoModelo.UsuarioSenhaPadrao = senhaUsuarioPadrao;                    
            if(requererNovaPesquisa)                
                configuracaoModelo.RequererNovaPesquisa = Boolean(requererNovaPesquisa==='true');    
           if(loginAutomatico)                
                configuracaoModelo.LoginAutomatico = Boolean(loginAutomatico==='true');    

            return configuracaoModelo;
        },

        SalvarConfiguracao(dados)
        {        
            this.definirNomeUsuarioPadrao(dados.nome);
            this.definirSenhaUsuarioPadrao(dados.senha);
            this.definirRequererNovaPesquisa(dados.requererNovaPesquisa);
            this.definirLoginAutomatico(dados.loginAutomatico);
        },

        definirNomeUsuarioPadrao(nome)
        {
            localStorage.setItem(NOME_USUARIO, nome);                
        },

        definirSenhaUsuarioPadrao(senha)
        {
            localStorage.setItem(SENHA_USUARIO, senha);
        },

        definirRequererNovaPesquisa(verdadeiro)
        {
            localStorage.setItem(REQUERER_PESQUISA_AUTO, verdadeiro);
        },

        definirLoginAutomatico(verdadeiro)
        {
            localStorage.setItem(LOGIN_AUTOMATICO, verdadeiro);
        }

    });

});