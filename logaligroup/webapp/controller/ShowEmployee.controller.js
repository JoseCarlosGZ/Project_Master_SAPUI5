sap.ui.define([
	"sap/ui/core/mvc/Controller",
    "sap/ui/core/routing/History"
], function (Controller,History) {
	"use strict";
	
	function onInit(){
		this._splitAppEmployee = this.byId("splitAppEmployee");
	}
	
	//Función al pulsar "<" para regresar al menú
	function onPressBack(){
			// vamos al menu
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("menu", {}, true);
	}
	
	//Función para filtrar empleados
	function onSearchEmployee(oEvent){
		    //1º) Crear el array que contendrá el filtro.
			const aFilter = [];
			//2º) Recuperar la cadena/s a comparar.
			// const sQuery = oEvent.getParameter("query");
			var sQuery = this.getView().byId("id_searchField_Employees").getValue();
			//3º) Añadir nuevo filtro/s al array.
			if (sQuery) {
			aFilter.push(
				new sap.ui.model.Filter( "FirstName",  sap.ui.model.FilterOperator.Contains,  sQuery ))
			}
			//4) Recuperar el listado (Table, List...)
			const oList = this.getView().byId("idMiLista");
			//5) Recuperar el bindeo asociado al listado.
			//'items'→ atributo del componente List/Table donde hemos bindeado el modelo.
			const oBinding = oList.getBinding("items");
			//6) Aplicar el array de filtros al objeto bindeo.
			oBinding.filter(aFilter);

		
	}
	
	//Función al seleccionar un empleado
	function onSelectEmployee(oEvent){
		//Se navega al detalle del empleado
		this._splitAppEmployee.to(this.createId("detailEmployee"));
		var context = oEvent.getParameter("listItem").getBindingContext("odataModel");
		//Se almacena el usuario seleccionado
		this.employeeId = context.getProperty("EmployeeId");
		var detailEmployee = this.byId("detailEmployee");
		//Se bindea a la vista con la entidad Users y las claves del id del empleado y el id del alumno
		detailEmployee.bindElement("odataModel>/Users(EmployeeId='"+ this.employeeId +"',SapId='"+this.getOwnerComponent().SapId+"')");
		
	}
	
	//Función para eliminar el empleado seleccionado
	function onDeleteEmployee(oEvent){
		//Se muestra un mensaje de confirmación
		sap.m.MessageBox.confirm(this.getView().getModel("i18n").getResourceBundle().getText("estaSeguroEliminar"),{
			title : this.getView().getModel("i18n").getResourceBundle().getText("confirm"),
			onClose : function(oAction){
			    	if(oAction === "OK"){
			    		//Se llama a la función remove
						this.getView().getModel("odataModel").remove("/Users(EmployeeId='" + this.employeeId + "',SapId='"+this.getOwnerComponent().SapId+"')",{
							success : function(data){
								sap.m.MessageToast.show(this.getView().getModel("i18n").getResourceBundle().getText("seHaEliminadoUsuario"));
								//En el detalle se muestra el mensaje "Seleecione empleado"
								this._splitAppEmployee.to(this.createId("detailSelectEmployee"));
							}.bind(this),
							error : function(e){
								sap.base.Log.info(e);
							}.bind(this)
						});
			    	}
			}.bind(this)
		});
	}
	
	//Función para ascender a un empleado
	function onRiseEmployee(oEvent){
		if(!this.riseDialog){
            //this.riseDialog = sap.ui.xmlfragment("logaligroup/rrhh/fragment/RiseEmployee", this);
			this.riseDialog = sap.ui.xmlfragment("htlm5module/logaligroup/fragment/RiseEmployee", this);
			this.getView().addDependent(this.riseDialog);
		}
		this.riseDialog.setModel(new sap.ui.model.json.JSONModel({}),"newRise");
		this.riseDialog.open();
	}
	
	//Función para cerrar el dialogo
	function onCloseRiseDialog(){
		this.riseDialog.close();
	}
	
	//Función para crear un nuevo ascenso
	function addRise(oEvent){
		//Se obtiene el modelo newRise
		var newRise = this.riseDialog.getModel("newRise");
		//Se obtiene los datos
		var odata = newRise.getData();
		//Se prepara la informacion para enviar a sap y se agrega el campo sapId con el id del alumno y el id del empleado
		var body = {
			Ammount : odata.Ammount,
			CreationDate : odata.CreationDate,
			Comments : odata.Comments,
			SapId : this.getOwnerComponent().SapId,
			EmployeeId : this.employeeId
		};
		this.getView().setBusy(true);
		this.getView().getModel("odataModel").create("/Salaries",body,{
			success : function(){
				this.getView().setBusy(false);
				sap.m.MessageToast.show(this.getView().getModel("i18n").getResourceBundle().getText("ascensoCorrectamente"));
				this.onCloseRiseDialog();
			}.bind(this),
			error : function(){
                this.getView().setBusy(false);
                sap.m.MessageToast.show(this.getView().getModel("i18n").getResourceBundle().getText("ascensoErroneo"));
			}.bind(this)
		});
		
    }
    
    //Función que se ejecuta al cargar un fichero en el uploadCollection
	//Se agrega el parametro de cabecera x-csrf-token con el valor del token del modelo
	//Es necesario para validarse contra sap
	function onChange (oEvent) {
	   var oUploadCollection = oEvent.getSource();
	   // Header Token
	   var oCustomerHeaderToken = new sap.m.UploadCollectionParameter({
	    name: "x-csrf-token",
	    value: this.getView().getModel("odataModel").getSecurityToken()
	   });
	   oUploadCollection.addHeaderParameter(oCustomerHeaderToken);
	 }
	
	//Función que se ejecuta por cada fichero que se va a subir a sap
	//Se debe agregar el parametro de cabecera "slug" con el valor "id de sap del alumno",id del nuevo usuario y nombre del fichero, separados por ;
	 function onBeforeUploadStart (oEvent) {
	   var oCustomerHeaderSlug = new sap.m.UploadCollectionParameter({
				name: "slug",
				value: this.getOwnerComponent().SapId+";"+this.employeeId+";"+oEvent.getParameter("fileName")
			});
			oEvent.getParameters().addHeaderParameter(oCustomerHeaderSlug);
      }
    
      function onUploadComplete (oEvent) {
        var oUploadCollection = oEvent.getSource();
        oUploadCollection.getBinding("items").refresh();
    }

    function onFileDeleted(oEvent){
        var oUploadCollection = oEvent.getSource();
        var sPath = oEvent.getParameter("item").getBindingContext("odataModel").getPath();
        this.getView().getModel("odataModel").remove(sPath, {
            success: function(){
                oUploadCollection.getBinding("items").refresh();
            },
            error: function(){

            }
        });
    }

    function downloadFile(oEvent){
        var sPath = oEvent.getSource().getBindingContext("odataModel").getPath();
        window.open("/sap/opu/odata/sap/ZEMPLOYEES_SRV"+sPath+"/$value");
    }

	return Controller.extend("htlm5module.logaligroup.controller.ShowEmployee", {
		onInit: onInit,
		onPressBack : onPressBack,
		onSearchEmployee : onSearchEmployee,
		onSelectEmployee : onSelectEmployee,
		onDeleteEmployee : onDeleteEmployee,
		onRiseEmployee : onRiseEmployee,
		onCloseRiseDialog : onCloseRiseDialog,
        addRise : addRise,
        onChange : onChange,
        onBeforeUploadStart : onBeforeUploadStart,
        onUploadComplete : onUploadComplete,
        onFileDeleted : onFileDeleted,
        downloadFile : downloadFile
	});

});