/* **************************************************************

   Copyright 2013 Zoovy, Inc.

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.

************************************************************** */



//    !!! ->   TODO: replace 'username' in the line below with the merchants username.     <- !!!

var store_gkworld = function() {
	var theseTemplates = new Array('');
	var r = {


////////////////////////////////////   CALLBACKS    \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\

	callbacks : {
//executed when extension is loaded. should include any validation that needs to occur.
		init : {
			onSuccess : function()	{
				var r = false; //return false if extension won't load for some reason (account config, dependencies, etc).
				$.getJSON("extensions/banners.json?_v="+(new Date()).getTime(), function(data){
					for(var banner in data){
						var $img = $("<img src='"+banner.src+"' alt='"+banner.alt+"' title='"+banner.title+"'/>");
							if(banner.prodLink){
								$img.addClass('pointer').click(function(){
									showContent('product',{'pid':banner.prodLink});
									});
								}
							else if(banner.catLink){
								$img.addClass('pointer').click(function(){
									showContent('category',{'navcat':banner.catLink});
									});
								}
							else {
								//just a banner!
								}
						
						}
					});
				//if there is any functionality required for this extension to load, put it here. such as a check for async google, the FB object, etc. return false if dependencies are not present. don't check for other extensions.
				r = true;

				return r;
				},
			onError : function()	{
//errors will get reported for this callback as part of the extensions loading.  This is here for extra error handling purposes.
//you may or may not need it.
				app.u.dump('BEGIN admin_orders.callbacks.init.onError');
				}
			}
		}, //callbacks



////////////////////////////////////   ACTION    \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\

//actions are functions triggered by a user interaction, such as a click/tap.
//these are going the way of the do do, in favor of app events. new extensions should have few (if any) actions.
		a : {
			createAccount : function($form, successMsg){
				successMsg = successMsg || 'Your Account has been created.  Proceed to <a href="#" onClick="return showContent("customer",{"show":"createAccount"});">Log In</a>'
				$('.createAccountMessaging',$form).empty();
					
				var errors = app.ext.store_gkworld.u.validateForm($form);
				if($('input[name=createAccountPassword]', $form).val() !== $('input[name=createAccountPasswordConfirm]', $form).val()){
					errors.push("The password you have entered does not match the verification field");
					}
								
				if(errors.length  > 0){
					for(var key in errors)
					$('.createAccountMessaging',$form).anymessage({'message':errors[key]});
					}
				else {
					var obj={};
					var _tag={};
					obj.project = "3038C4E2-A6F1-11E2-8B13-E07C8CF3";
					obj.permissions = "platform/appBuyerCreate-permissions-default.json";
					
					$("input", $form).each(function(){
						if($(this).data("permissions-field")){
							obj[$(this).data("permissions-field")] = $(this).val();
							}
					});
					
					_tag.datapointer = "appBuyerCreate|"+(new Date()).getTime();
					_tag.callback = function(rd){
						app.u.dump(rd);
						if(app.model.responseHasErrors(rd)){
							$('.createAccountMessaging',$form).anymessage({'message':rd});
							}
						else{
							$('.createAccountMessaging',$form).anymessage(app.u.successMsgObject(successMsg));
							}
					}
					
					app.calls.appBuyerCreate.init(obj, _tag);
					app.model.dispatchThis('immutable');
					}
				
				}
			}, //Actions

////////////////////////////////////   RENDERFORMATS    \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\

//renderFormats are what is used to actually output data.
//on a data-bind, format: is equal to a renderformat. extension: tells the rendering engine where to look for the renderFormat.
//that way, two render formats named the same (but in different extensions) don't overwrite each other.
		renderFormats : {
			printTestObjStr : function($tag, data){
				$tag.text(data.value.string);
				},
			
			printTestArrStr : function($tag, data){
				$tag.text(data.value[data.bindData.index]);
				}
			}, //renderFormats
////////////////////////////////////   UTIL [u]   \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\

//utilities are typically functions that are exected by an event or action.
//any functions that are recycled should be here.
		u : {
		
			validateForm : function($form)	{
	//			app.u.dump("BEGIN admin.u.validateForm");
				if($form && $form instanceof jQuery)	{

					
					var errors = []; //what is returned. false if any required fields are empty.
					$form.showLoading({'message':'Validating'});

					$('.formValidationError',$form).empty().remove(); //clear all previous error messaging
					
					$('input, select, textarea',$form).each(function(){
						var $input = $(this);
						
						$input.removeClass('ui-state-error'); //remove previous error class

	//					app.u.dump(" -> validating input."+$input.attr('name'));
						
						function removeClass($t){
							$t.off('focus.removeClass').on('focus.removeClass',function(){$t.removeClass('ui-state-error')});
							}
	//					app.u.dump(" -> "+$input.attr('name')+" - required: "+$input.attr('required'));
						if($input.is(':hidden') && $input.data('validation-rules') && $input.data('validation-rules').indexOf('skipIfHidden') >= 0)	{
							//allows for a form to allow hidden fields that are only validated if they're displayed. ex: support fieldset for topic based questions.
							}
						else if($input.attr('required') == 'required' && !$input.val())	{
							var e = "Required field(s) missing";
							$input.addClass('ui-state-error');
							if($.inArray(e, errors) == -1){
								errors.push(e);
								}
							removeClass($input);
							}
						else if ($input.attr('type') == 'email' && !app.u.isValidEmail($input.val()))	{
							var e = "Input is not a valid email address";
							$input.addClass('ui-state-error');
							if($.inArray(e, errors) == -1){
								errors.push(e);
								}
							removeClass($input);
							}
						else if($input.attr('maxlength') && $input.val().length > $input.attr('maxlength'))	{
							var e = 'Input requires a max of '+$input.attr('maxlength')+' characters';
							$input.addClass('ui-state-error');
							if($.inArray(e, errors) == -1){
								errors.push(e);
								}
							removeClass($input);
							}
						else if($input.data('minlength') && $input.val().length < $input.data('minlength'))	{
							var e = 'Input requires a min of '+$input.attr('minlength')+' characters';
							$input.addClass('ui-state-error');
							if($.inArray(e, errors) == -1){
								errors.push(e);
								}
							removeClass($input);
							}
						else	{
							$input.removeClass('ui-state-error'); //removed in case added in previous validation attempt.
							}
						});
					$form.hideLoading();
					}
				else	{
					$('#globalMessaging').anymessage({'message':'Object passed into admin.u.validateForm is empty or not a jquery object','gMessage':true});
					}
	//			app.u.dump(" -> r in validateForm: "+r);
				return errors;
				}
			}, //u [utilities]

//app-events are added to an element through data-app-event="extensionName|functionName"
//right now, these are not fully supported, but they will be going forward. 
//they're used heavily in the admin.html file.
//while no naming convention is stricly forced, 
//when adding an event, be sure to do off('click.appEventName') and then on('click.appEventName') to ensure the same event is not double-added if app events were to get run again over the same template.
		e : {
			} //e [app Events]
		} //r object.
	return r;
	}