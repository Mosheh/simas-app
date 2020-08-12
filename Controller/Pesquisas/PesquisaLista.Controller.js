sap.ui.define([
    "SIMAS/Controller/BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator"    
], function(BaseController, JSONModel, Filter, FilterOperator) {
    "use strict";
    
    return BaseController.extend("SIMAS.Controller.Pesquisas.PesquisaLista", {      

      
        inputId: '',        
      onInit:function(){
              

        },      
        
        aoAbrirListagemDeInstituicoes : function (oEvent) {
			var sInputValue = oEvent.getSource().getValue();

			this.inputId = oEvent.getSource().getId();
			// create value help dialog
			if (!this._valueHelpDialog) {
				this._valueHelpDialog = sap.ui.xmlfragment(
					"SIMAS.View.Fragments.ListagemDeInstituicoes",
					this
				);
				this.getView().addDependent(this._valueHelpDialog);
			}

            // create a filter for the binding
            if(this._valueHelpDialog.getBinding("items"))
                if(this._valueHelpDialog.getBinding("items").filter)
                    this._valueHelpDialog.getBinding("items").filter([new Filter(
                    "Nome",
                    FilterOperator.Contains, sInputValue
			    )]);

			// open value help dialog filtered by the input value
			this._valueHelpDialog.open(sInputValue);
		},

        aoPesquisarInstituicaoNome: function(evt)
        {
            var sValue = evt.getParameter("value");
			var oFilterNome = new Filter(
				"Nome",
				FilterOperator.Contains, sValue
            );            
            
			evt.getSource().getBinding("items").filter([oFilterNome]);
        },

        aoSelecionarInstituicao : function (evt) {
			var oSelectedItem = evt.getParameter("selectedItem");
			if (oSelectedItem) {
				var oInputInstituicao = this.byId(this.inputId);
                oInputInstituicao.setValue(oSelectedItem.getTitle());
                
                let instituicaoSelecionada = new Object();
                instituicaoSelecionada.Id = oSelectedItem.getInfo();
                instituicaoSelecionada.Nome = oSelectedItem.getTitle();
                instituicaoSelecionada.NomeFantasia = oSelectedItem.getDescription();

                this.getView().setModel(new JSONModel(instituicaoSelecionada), "instituicaoSelecionada");
                this.buscarListaDePesquisas();
			}
			evt.getSource().getBinding("items").filter([]);
        },
        
        buscarListaDePesquisas(){

            let instituicaoSelecionada = this.getView().getModel("instituicaoSelecionada");
            if(!instituicaoSelecionada)
            {
                this.exibirMensagem("Message.InstitutionIsNotSelected");
                return;
            }

            let that = this;
            let serverUrl = this.getServerUrl("v1", `DefinicaoPesquisas/ObterPorInstituicao/${instituicaoSelecionada.oData.Id}`);            

           let usuario = this.obterUsuarioLogado();           
            new Promise((ok, bad)=>
           {
               jQuery.ajax({
                   contentType: 'application/x-www-form-urlencoded; charset=UTF-8',
                   url: serverUrl,
                   type: 'GET',
                   beforeSend: function(xhr){
                       xhr.setRequestHeader("authorization", "bearer "+usuario.token);
                   }
               }).success((response) => ok(response)
               ).error((error) => bad(error));            
           }).then((response)=> {
               let model = new JSONModel(response);
               
               that.getView().setModel(model, "pesquisas");
               
           }).catch((error)=>{
               if(error.status == 0)
                    that.exibirMensagem("Message.ServerIsOffline");
                else
                    that.exibirMensagemDeErro(error);

               console.log(error);
           });
        },

        onAfterRendering: function(oEvent)
        {        
            let that = this;
            let serverUrl = this.getServerUrl("v1", "instituicoes");            

           let usuario = this.obterUsuarioLogado();           
            new Promise((ok, bad)=>
           {
               jQuery.ajax({
                   contentType: 'application/x-www-form-urlencoded; charset=UTF-8',
                   url: serverUrl,
                   type: 'GET',
                   beforeSend: function(xhr){
                       xhr.setRequestHeader("authorization", "bearer "+usuario.token);
                   }
               }).success((response) => ok(response)
               ).error((error) => bad(error));            
           }).then((response)=> {
               let model = new JSONModel(response);
               that.getView().setModel(model, "instituicoes");
               if(response != undefined && response.length==1)
               {
                    let instituicaoSelecionada = new Object();
                    instituicaoSelecionada.Id = response[0].Id;
                    instituicaoSelecionada.Nome = response[0].Nome;
                    instituicaoSelecionada.NomeFantasia = response[0].NomeFantasia;
                    that.getView().setModel(new JSONModel(instituicaoSelecionada), "instituicaoSelecionada");
                    let oInput = that.getView().byId("inputInstituicao");
                    oInput.setValue(instituicaoSelecionada.Nome);

                    that.buscarListaDePesquisas();
               }
           }).catch((error)=>{
               if(error.status == 0)
                    that.exibirMensagem("Message.ServerIsOffline");
                else
                    that.exibirMensagemDeErro(error);

               console.log(error);
           });
        },

        aoClicarEmPesquisa(oEvt)
        {
            let router = this.getRouter();
            var oContext = oEvt.oSource.getBindingContext("pesquisas");
            var sPath = oContext.getPath();
            var model = oContext.getObject(sPath);
            var sRoute = `PesquisaResposta/${model.Id}`;
            router.navTo("PesquisaResposta", {pesquisaId: model.Id});
        }

    });

});