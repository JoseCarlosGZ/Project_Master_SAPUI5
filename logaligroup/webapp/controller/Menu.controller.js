sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/library"
], function (Controller, sapMLib) {
	"use strict";
	
	function onInit(){
		
	}
	
	function onAfterRendering(){

	}
	
	//Función al pulsar sobre el Tile "Crear empleado". Hace un routing a la vista "createEmployee"
	function navToCreateEmployee(){
			//Se obtiene el conjuntos de routers del programa
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			//Se navega hacia el router "CreateEmployee"
			oRouter.navTo("CreateEmployee",{},false);
	}
	
	//Función al pulsar sobre el Tile "Ver empleados". Hace un routing a la vista "showEmployee"
	function navToShowEmployee(){
			//Se obtiene el conjuntos de routers del programa
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			//Se navega hacia el router "CreateEmployee"
			oRouter.navTo("ShowEmployee",{},false);
	}

	function openEmployees () {
		const url = "https://735bd63dtrial-dev-lastclass-approuter.cfapps.us10-001.hana.ondemand.com";
		const { URLHelper } = sapMLib;
		URLHelper.redirect(url);
	}

	return Controller.extend("htlm5module.logaligroup.controller.Menu", {
		onInit: onInit,
		onAfterRendering : onAfterRendering,
		navToCreateEmployee : navToCreateEmployee,
		navToShowEmployee : navToShowEmployee,
		openEmployees: openEmployees
	});
});