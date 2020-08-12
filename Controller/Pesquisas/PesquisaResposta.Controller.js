sap.ui.define([
    'SIMAS/Controller/BaseController',
    'sap/ui/model/json/JSONModel',
    'sap/m/WizardStep',
    'sap/ui/core/Fragment'
], function(BaseController, JSONModel, WizardStep, Fragment) {
    'use strict';

    // const MultiplaEscolha  =  1;
    // const Dicotomica = 2;
    // const RespostaUnica = 3;
    // const Ranking = 4;
    // const PerguntaAberta = 5,
    // const NPS = 6;

    return BaseController.extend("SIMAS.Controller.Pesquisas.PesquisaResposta", {
        _legendaBotaoResponderNovamente: {
            TextoBotaoResponder: "Moisés"
        },

        _wizard: undefined,

        onInit: function(){
            var oRouter = this.getRouter();
            oRouter.getRoute("PesquisaResposta").attachMatched(this._onRouteMatched, this);

            
            this._oNavContainer = this.byId("wizardNavContainer");
            this._oWizardContentPage = this.byId("wizardNavContainer");

            this._legendaBotaoResponderNovamente.TextoBotaoResponder = "Responder novamente";
            this.setModelWithName(new JSONModel(this._legendaBotaoResponderNovamente), "legendaBotaoResponder");              

            Fragment.load({
                name: "SIMAS.View.fragments.ObrigadoMsg",                
                controller: this,                
            }).then(function (oObrigadoView){
                this._oObrigadoView = oObrigadoView;
                this._oNavContainer.addPage(this._oObrigadoView);
            }.bind(this));

        },

        onAfterRendering(){            
                     
        },

        definirModeloDeResposta(){
            let resposta= {
                DefinicaoPesquisaId: 0,
                SessaoId: "",
                RespostasPerguntaUsuarioAberta:[],
                RespostasPerguntaUsuarioDicotomica:[],
                RespostasPerguntaUsuarioMultEsc: [],
                RespostasPerguntaUsuarioNPS: [],
                RespostasPerguntaUsuarioRK: [],
                RespostasPerguntaUsuarioRU: []
            };
            let oDataRespostas = new JSONModel(resposta);
            this.setModelWithName(oDataRespostas, "Respostas");
        },

        _onRouteMatched: function(oEvent){
            let oArgs, oView;

            oArgs = oEvent.getParameter("arguments");

            this.definirModeloDeResposta();

            if(oArgs)
                this.iniciarPerguntasNoWizard(oArgs.pesquisaId);
        },      

        iniciarPerguntasNoWizard(pesquisaDeSatisfacaoId)
        {
            
            let that = this;
            let serverUrl = this.getServerUrl("v1", `PesquisasdeSatisfacao/iniciar/${pesquisaDeSatisfacaoId}`);            

            let usuario = this.obterUsuarioLogado();       
            if(usuario ==null)
             {
                this.exibirMensagem("Message.EnterUserName");
                this.navTo("Login")    
             }
            new Promise((ok, bad)=>
           {
               jQuery.ajax({
                   contentType: 'application/x-www-form-urlencoded; charset=UTF-8',
                   url: serverUrl,
                   type: 'POST',
                   beforeSend: function(xhr){
                       xhr.setRequestHeader("authorization", "bearer "+usuario.token);
                   }
               }).success((response) => ok(response)
               ).error((error) => bad(error));            
           }).then((response)=> {
               let model = new JSONModel(response);
               that.getView().setModel(model, "perguntaIniciada");
               that._sessaoId = model.oData.SessaoId;
               that.definirEtapas();
           }).catch((error)=>{
               if(error.status == 0)
                    that.exibirMensagem("Message.ServerIsOffline");
                else
                    that.exibirMensagemDeErro(error);

               console.log(error);
           });

        },


        obterNomeTipoDePergunta(tipoPerguntaId)
        {
            // const MultiplaEscolha  =  1;
            // const Dicotomica = 2;
            // const RespostaUnica = 3;
            // const Ranking = 4;
            // const PerguntaAberta = 5;
            // const NPS = 6;
            switch(tipoPerguntaId){
                case 1:
                    return "Escolha uma ou mais marcando retângulo (quadrado) - Múltiplas escolhas";                    
                case 2:
                    return "Selecione uma opção, negando ou afirmando - Dicotômica";                    
                case 3:
                    return "Selecione apenas uma marcando círculo a direita - Resposta única";            
                case 4:
                    return "Pontue marcando apenas uma opção no círculo a direita - Ranking";                    
                case 5:
                    return "Sinta-se a vontade para se expressar, texto livre - Resposta aberta";
                case 6:
                    return "Selecione dentre uma escala, selecione apenas uma marcando círculo a direita - NPS";
                
            }
        
        },

        definirEtapas()
        {
            
           let model = this.getModel("perguntaIniciada");

           let pergunta = {};
           let count;
           let page = this.obterControleVisualPorId("wizardContentPage");
           this.removerWizardCasoExista(page);
           
           let wizardControl = new sap.m.Wizard();
           wizardControl.setFinishButtonText(this.obterMensagem().getText("Label.SendAnswer"));
           let that = this;
           wizardControl.attachComplete((oEvent)=>{
               that.aoFinalizarPerguntas(that)
            });
           this._wizard = wizardControl;
           //let wizardControl = this.obterControleVisualPorId("CreateProductWizard");           

          for (count in  model.oData.DefinicaoPesquisa.Perguntas)          
          {
                pergunta = model.oData.DefinicaoPesquisa.Perguntas[count];
                
                let newStep = new WizardStep();                
                newStep.setValidated(false);
                newStep.setTitle (pergunta.Texto);                
                newStep._oNextButton.setText("Próximo");

                let messageStrip = new sap.m.MessageStrip();
                messageStrip.setText(this.obterNomeTipoDePergunta(pergunta.Tipo));
                newStep.addContent(messageStrip);
    
              
                    
                switch(pergunta.Tipo){
                    case 1:
                        this.criarControlesParaPerguntaDeMultiplaEscolha(newStep, pergunta);
                        break;
                    case 2:
                        this.criarControlesParaPerguntaDicotomica(newStep, pergunta);
                        break;
                    case 3:
                        this.criarControlesParaPerguntaRespostaUnica(newStep, pergunta);
                        break;
                    case 4:
                        this.criarControlesParaPerguntaRanking(newStep, pergunta);
                        break;
                    case 5:
                        this.criarControlesParaPerguntaAberta(newStep, pergunta);
                        break;
                    case 6:
                        this.criarControlesParaPerguntaNPS(newStep, pergunta);
                        break;                                                
                }

                wizardControl.addStep(newStep);
          }

         this.criarPaginaDeRevisaoDeRespostas(wizardControl);
         
         page.addContent(wizardControl);
        },

        removerWizardCasoExista(page)
        {
            if(this._wizard)
            {                               
                page.removeContent(this._wizard);
            }
            
        },

        mostrarControles()
        {
            let wizardControl = this.obterControleVisualPorId("CreateProductWizard");
        },
        
        criarPaginaDeRevisaoDeRespostas(wizardControl)
        {
            
            let newStepCheckingAnswer = new WizardStep();                
            newStepCheckingAnswer.setTitle (this.obterMensagem().getText("Label.CheckAnswer"));
            wizardControl.addStep(newStepCheckingAnswer);
            var model = this.getModel("perguntaIniciada");
                           
           model.oData.DefinicaoPesquisa.Perguntas.forEach((pergunta, index)=>          
           {
            switch(pergunta.Tipo){
                case 1:
                    
                    break;
                case 2:
                    
                    break;
                case 3:
                    
                    break;
                case 4:
                    
                    break;
                case 5:
                    
                    break;
                case 6:
                    
                    break;                                                
            }
           });

        },
        criarControlesParaPerguntaDeMultiplaEscolha(stepControl, pergunta)
        {            
            let data = new JSONModel(pergunta.DefinicoesPossivelRespostaPerguntaMultEsc);
            let modelName = `perguntaMultiplaEscolha${pergunta.Id}`;
            this.getView().setModel(data,  modelName);                        

            var oItemTemplate = new sap.m.StandardListItem({
                title : `{${modelName}>DescricaoResposta}`                  
                });                                                                         

            var listRespostas = new sap.m.List({
                items:{
                    path: modelName+">/",
                    template: oItemTemplate
                }                                
            });
            listRespostas.setMode("MultiSelect");   

            listRespostas.attachSelect((oEvent)=> {
                let oSelectedItems = listRespostas.getSelectedItems();
                let oRespostasModel = this.getModel("Respostas").oData.getData();

                let itemFoiSelecionado = oEvent.mParameters.listItem.isSelected();

                let path = oEvent.mParameters.listItem.mBindingInfos.title.binding.oContext.getPath();
                let modeloCorrente = oEvent.mParameters.listItem.mBindingInfos.title.binding.oContext.getObject(path);             

                    if(itemFoiSelecionado)
                    {   
                        let respostaSelecionada =    oRespostasModel.RespostasPerguntaUsuarioMultEsc.find((item)=>{
                            return item.Id == modeloCorrente.Id;
                        });
                        if(!respostaSelecionada)
                        {
                            modeloCorrente.SessaoId = this._sessaoId;
                            modeloCorrente.DefinicaoRespostaPerguntaMultEscId = modeloCorrente.Id;
                            oRespostasModel.RespostasPerguntaUsuarioMultEsc.push(modeloCorrente);
                        }
                    }
                    else
                    {
                        let indiceEncontradado = -1;
                        oRespostasModel.RespostasPerguntaUsuarioMultEsc.forEach((oItem, index)=>{
                            if(oItem.Id == modeloCorrente.Id)
                            {
                                indiceEncontradado = index;
                                return index;
                            }
                        });
                        if(indiceEncontradado>-1)
                            oRespostasModel.RespostasPerguntaUsuarioMultEsc.splice(indiceEncontradado, 1);
                    }
                    
                stepControl._oNextButton.setText("Próxima");
                stepControl.setValidated(oSelectedItems != undefined && oSelectedItems.length>0);
            });
           
            stepControl.addContent(listRespostas);
        },      

        criarControlesParaPerguntaDicotomica(stepControl, pergunta)
        {
            var sModelName = `pergunta${pergunta.Id}`;

            this.setModelWithName(pergunta.DefinicaoPossivelRespostaPerguntaDicotomica, sModelName);
            var oBox = new sap.m.VBox();
            var oRadioButtonGroup = new sap.m.RadioButtonGroup();

            var oRadioButtonPositiveAnswer = new sap.m.RadioButton({text: pergunta.DefinicaoPossivelRespostaPerguntaDicotomica.DescricaoRespostaVerdadeiro});
            var oRadioButtonNegativeAnswer = new sap.m.RadioButton({text: pergunta.DefinicaoPossivelRespostaPerguntaDicotomica.DescricaoRespostaFalso});

            oRadioButtonPositiveAnswer.attachSelect((oEvt)=> {
                let oRespostasModel = this.getModel("Respostas").oData.getData();

                let respostaDaPerguntaDicotomica = oRespostasModel.RespostasPerguntaUsuarioDicotomica.find((item)=>{
                    return item.DefinicaoPerguntaId == pergunta.DefinicaoPossivelRespostaPerguntaDicotomica.DefinicaoPerguntaId;
                });
                if(respostaDaPerguntaDicotomica)
                {
                    respostaDaPerguntaDicotomica.Resposta=true;
                }
                else
                {
                    respostaDaPerguntaDicotomica = {};
                    respostaDaPerguntaDicotomica.DefinicaoPerguntaId = pergunta.Id;                    
                    respostaDaPerguntaDicotomica.SessaoId = this._sessaoId;
                    respostaDaPerguntaDicotomica.Resposta=true;
                    oRespostasModel.RespostasPerguntaUsuarioDicotomica.push(respostaDaPerguntaDicotomica);
                }
                stepControl._oNextButton.setText("Próxima");
                stepControl.setValidated(true);
            });

            oRadioButtonNegativeAnswer.attachSelect((oEvt)=> {
                let oRespostasModel = this.getModel("Respostas").oData.getData();
                var respostaDaPerguntaDicotomica = oRespostasModel.RespostasPerguntaUsuarioDicotomica.find((item)=>{
                    return item.DefinicaoPerguntaId == pergunta.DefinicaoPossivelRespostaPerguntaDicotomica.DefinicaoPerguntaId;
                });
                if(respostaDaPerguntaDicotomica)
                {
                    respostaDaPerguntaDicotomica.Resposta=false;
                }
                else
                {
                    respostaDaPerguntaDicotomica = {};
                    respostaDaPerguntaDicotomica.DefinicaoPerguntaId = pergunta.Id;
                    respostaDaPerguntaDicotomica.SessaoId = this._sessaoId;
                    respostaDaPerguntaDicotomica.Resposta=false;
                    oRespostasModel.RespostasPerguntaUsuarioDicotomica.push(respostaDaPerguntaDicotomica);
                }
                stepControl._oNextButton.setText("Próxima");
                stepControl.setValidated(true);
            });

            oRadioButtonGroup.addButton(oRadioButtonPositiveAnswer);
            oRadioButtonGroup.addButton(oRadioButtonNegativeAnswer);
            oRadioButtonGroup.setSelectedIndex(-1);
            oBox.addItem(oRadioButtonGroup);
            stepControl.addContent(oBox);

            
        },

        criarControlesParaPerguntaRespostaUnica(stepControl, pergunta)
        {
            var sModelName = "respostaUnica"+pergunta.Id;
            var oData = new JSONModel(pergunta.DefinicoesPossivelRespostaPerguntaRU);
            this.getView().setModel(oData, sModelName);

            let list = new sap.m.List();
            list.setMode("SingleSelect");
            list.attachSelect((oEvent)=> {

                let oRespostasModel = this.getModel("Respostas").oData.getData();
                let sPath= oEvent.mParameters.listItem.mBindingInfos.title.binding.oContext.getPath();
                let sSelectedModel = oEvent.mParameters.listItem.mBindingInfos.title.binding.oContext.getObject(sPath);
                                
                var oListToRemove = [];
                if(sSelectedModel)
                {
                    let respostaSelecionada = oRespostasModel.RespostasPerguntaUsuarioRU.forEach((item, index)=>{
                        if(item.DefinicaoPerguntaId == sSelectedModel.DefinicaoPerguntaId &&
                            item.Id != sSelectedModel.Id)
                        {
                            oListToRemove.push(item);
                        }
                    });

                    let countListToRemove = 0;
                    for (let countListToRemove = 0; countListToRemove < oListToRemove.length; countListToRemove++) {
                        const element = oListToRemove[countListToRemove];
                        var index = oRespostasModel.RespostasPerguntaUsuarioRU.indexOf(element);
                        oRespostasModel.RespostasPerguntaUsuarioRU.splice(index, 1);
                    }
                   
                    if(!respostaSelecionada)
                    {
                        sSelectedModel.SessaoId = this._sessaoId;
                        sSelectedModel. DefinicaoRespostaPerguntaRUId = sSelectedModel.Id;
                        oRespostasModel.RespostasPerguntaUsuarioRU.push(sSelectedModel);
                    }                    
                }           
                stepControl._oNextButton.setText("Próxima");                
                stepControl.setValidated(true);
            });

            var oItemTemplate = new sap.m.StandardListItem({

                title : `{${sModelName}>DescricaoResposta}`                
                });                                          
            
            let sPath = sModelName+">/";
            list.bindAggregation("items", sPath, oItemTemplate);

            stepControl.addContent(list);
        },

        criarControlesParaPerguntaRanking(stepControl, pergunta)
        {
            var sModelName = "perguntaRanking"+pergunta.Id;
            this.setModelWithName(pergunta.DefinicoesPossivelRespostaPerguntaRK, sModelName);

            let list = new sap.m.List("idListPerguntaRanking"+pergunta.Id);
            list.setMode("SingleSelect");
            list.attachSelect((oEvent)=> {

                let oRespostasModel = this.getModel("Respostas").oData.getData();
                let sPath= oEvent.mParameters.listItem.mBindingInfos.title.binding.oContext.getPath();
                let oSelectedModel = oEvent.mParameters.listItem.mBindingInfos.title.binding.oContext.getObject(sPath);

                var oListToRemove = [];
                if(oSelectedModel)
                {
                    let respostaSelecionada = oRespostasModel.RespostasPerguntaUsuarioRK.forEach((item, index)=>{
                        if(item.DefinicaoPerguntaId == oSelectedModel.DefinicaoPerguntaId &&
                            item.Id != oSelectedModel.Id)
                        {
                            oListToRemove.push(item);
                        }
                    });

                    let countListToRemove = 0;
                    for (let countListToRemove = 0; countListToRemove < oListToRemove.length; countListToRemove++) {
                        const element = oListToRemove[countListToRemove];
                        var index = oRespostasModel.RespostasPerguntaUsuarioRK.indexOf(element);
                        oRespostasModel.RespostasPerguntaUsuarioRK.splice(index, 1);
                    }
                   
                    if(!respostaSelecionada)
                    {
                        oSelectedModel.SessaoId = this._sessaoId;
                        oSelectedModel.DefinicaoRespostaPerguntaRankingId = oSelectedModel.Id;                                       
                        oRespostasModel.RespostasPerguntaUsuarioRK.push(oSelectedModel);
                    }                    
                }  
                stepControl._oNextButton.setText("Próxima");
                stepControl.setValidated(true);
            });

            var oItemTemplate = new sap.m.StandardListItem({
                title : `{${sModelName}>DescricaoResposta}`  
                });                
                            
            let sPath = sModelName+">/";
            list.bindAggregation("items", sPath, oItemTemplate);

            stepControl.addContent(list);
        },       

        criarControlesParaPerguntaAberta(stepControl, pergunta)
        {           
            var sModelName = "perguntaAberta"+pergunta.Id;
            this.setModelWithName(pergunta, sModelName);
            let sPath = sModelName+">/";
            
           let oTextArea = new sap.m.TextArea({maxLength: 300});
           oTextArea.setWidth("100%");
           oTextArea.setShowExceededText(true);
            oTextArea.attachLiveChange((oEvt)=>{
                let sText = oTextArea.getValue();
                if(sText)
                {
                    let oRespostasModel = this.getModel("Respostas").oData.getData();
                    let respostaDaPerguntaDoControleAtual = undefined;

                    oRespostasModel.RespostasPerguntaUsuarioAberta.forEach((oItem, index)=>{
                        if(oItem.DefinicaoPerguntaId == pergunta.Id)
                        {
                            respostaDaPerguntaDoControleAtual = oItem;
                        }
                    });

                    if(respostaDaPerguntaDoControleAtual)
                    {
                        respostaDaPerguntaDoControleAtual.Resposta = sText;                        
                    }
                    else
                    {
                        respostaDaPerguntaDoControleAtual = {
                            SessaoId: this._sessaoId,
                            Resposta: sText,
                            DefinicaoPerguntaId: pergunta.Id
                        };  

                        oRespostasModel.RespostasPerguntaUsuarioAberta.push(respostaDaPerguntaDoControleAtual);
                    }

                    stepControl._oNextButton.setText("Próxima");                    
                    stepControl.setValidated(sText.length>3);

                }
            });
            
            stepControl.addContent(oTextArea);
        },

        criarControlesParaPerguntaNPS(stepControl, pergunta)
        {
            let sModelName = "perguntaNPS"+pergunta.Id;
            this.setModelWithName(pergunta.DefinicoesPossivelRespostaPerguntaNPS, sModelName);
            let list = new sap.m.List("idListPerguntaNPS"+pergunta.Id);
            list.setMode("SingleSelect");
            list.attachSelect((oEvent)=> {
                let oRespostasModel = this.getModel("Respostas").oData.getData();
                let sPath= oEvent.mParameters.listItem.mBindingInfos.title.binding.oContext.getPath();
                let oSelectedModel= oEvent.mParameters.listItem.mBindingInfos.title.binding.oContext.getObject(sPath);

                var oListToRemove = [];
                if(oSelectedModel)
                {
                    let respostaSelecionada = oRespostasModel.RespostasPerguntaUsuarioNPS.forEach((item, index)=>{
                        if(item.DefinicaoPerguntaId == oSelectedModel.DefinicaoPerguntaId &&
                            item.Id != oSelectedModel.Id)
                        {
                            oListToRemove.push(item);
                        }
                    });

                    let countListToRemove = 0;
                    for (let countListToRemove = 0; countListToRemove < oListToRemove.length; countListToRemove++) {
                        const element = oListToRemove[countListToRemove];
                        var index = oRespostasModel.RespostasPerguntaUsuarioNPS.indexOf(element);
                        oRespostasModel.RespostasPerguntaUsuarioNPS.splice(index, 1);
                    }
                   
                    if(!respostaSelecionada)
                    {
                        oSelectedModel.SessaoId = this._sessaoId;
                        oRespostasModel.RespostasPerguntaUsuarioNPS.push(oSelectedModel);
                    }                    
                } 
                stepControl._oNextButton.setText("Próxima");
                stepControl.setValidated(true);
            });

            let oItemTemplate = new sap.m.StandardListItem(
                {
                title : `{${sModelName}>DescricaoResposta}` 
                });                                            
            
            let sPath = sModelName+">/";
            list.bindAggregation("items",sPath, oItemTemplate);

            stepControl.addContent(list);
        },

        aoResponderNovamente(oEvent)
        {
           let currentUrl = window.location.href;
                      
           location.reload();
        },

        aoIniciarContagemDeReinicio()
        {            
            let that = this;                               
            let count = 5;

            let internvalId = setInterval(function(that)
            {               
                let legenda = that.getModel("legendaBotaoResponder").oData.getData(); 
                var labelBotao = `${legenda.TextoBotaoResponder} em ${count} segundos`;
                console.log(labelBotao);
                count = count -1;                                    

                if(count<=0)
                {                    
                    clearInterval(internvalId);
                    that.aoResponderNovamente(that);
                }
            }, 1000, that);

            if(count<=0)
                clearInterval();
        },

        aoFinalizarPerguntas(oEvent)
        {
            let that = oEvent;
            let serverUrl = this.getServerUrl("v1", "PesquisasdeSatisfacao/Responder");            

            let usuario = this.obterUsuarioLogado();       
            if(usuario ==null)
             {
                this.exibirMensagem("Message.EnterUserName");
                this.navTo("Login")    
             }

             let perguntas = this.getModel("perguntaIniciada").oData;
             let respostas = this.getModel("Respostas").oData.oData;
             respostas.SessaoId = perguntas.SessaoId;
             respostas.DefinicaoPesquisaId = perguntas.DefinicaoPesquisaId;
            new Promise((ok, bad)=>
           {
               jQuery.ajax({
                   contentType: 'application/x-www-form-urlencoded; charset=UTF-8',
                   url: serverUrl,
                   type: 'POST',
                   data: respostas,
                   beforeSend: function(xhr){
                       xhr.setRequestHeader("authorization", "bearer "+usuario.token);
                   }
               }).success((response) => ok(response)
               ).error((error) => bad(error));            
           }).then((response)=> {

                that._oNavContainer.to(this._oObrigadoView.getId());
                that.aoIniciarContagemDeReinicio();

           }).catch((error)=>{
               if(error.status == 0)
                    that.exibirMensagem("Message.ServerIsOffline");
                else
                    that.exibirMensagemDeErro(error);

               console.log(error);
           });

           
        }

    });
    
});