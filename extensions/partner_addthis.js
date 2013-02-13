/* **************************************************************

   Copyright 2011 Zoovy, Inc.

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

/*
Adds AddThis social sharing code to the product page.

For AddThis API docs, go here: http://support.addthis.com/customer/portal/articles/381263-addthis-client-api

This extension is untested.

*/

//Global object that will be updated before addThis code is rendered.


var partner_addthis = function() {
	var r= {
		vars : {
			selector : ".socialLinks"
		},
		
		callbacks : {
			init : {
				onSuccess : function(){
					app.u.dump(addthis_share);
					app.u.loadScript((document.location.protocol == 'https:' ? 'https:' : 'http:')+'//s7.addthis.com/js/250/addthis_widget.js');
					app.u.dump(addthis_share);
					
					return true;
				},
				onError : function() {
					app.u.dump('BEGIN app.ext.partner_addthis.callbacks.init.onError');
				}
			},
			
			startExtension : {
				onSuccess : function (){
					if(app.ext.myRIA && app.ext.myRIA.template){
						app.u.dump("Loading Addthis Extension");
						app.ext.myRIA.template.productTemplate.onCompletes.push(function(P) {
							
							$(app.ext.partner_addthis.vars.selector, '#productTemplate_'+app.u.makeSafeHTMLId(P.pid)).append(
									'<div id="socialLinks" class="addthis_toolbox addthis_default_style">'
								+		'<a class="addthis_button_facebook_like" fb:like:layout="button_count"></a>'
								+		'<a class="addthis_button_tweet"></a>'
								+		'<a class="addthis_button_pinterest_pinit"></a>'
								+		'<a class="addthis_counter addthis_pill_style" onClick="return false;"></a>'
								+	'</div>');
							var url = zGlobals.appSettings.http_app_url+"product/"+P.pid+"/";
							//console.log("URL: "+url);
							addthis_share.url = url;
							if(typeof app.data[P.datapointer]['%attribs']['zoovy:prod_seo_title'] !== 'undefined')
								addthis_share.title = app.data[P.datapointer]['%attribs']['zoovy:prod_seo_title'];
							else
								delete addthis_share.title;
							
							
							addthis.toolbox('#socialLinks');
							});
						app.ext.myRIA.template.productTemplate.onDeparts.push(function(P) {
							$(app.ext.partner_addthis.vars.selector, '#productTemplate_'+app.u.makeSafeHTMLId(P.pid)).empty();
						});
					} else	{
						setTimeout(function(){app.ext.partner_addthis.callbacks.startExtension.onSuccess()},250);
					}
				},
				onError : function (){
					app.u.dump('BEGIN app.ext.partner_addthis.callbacks.startExtension.onError');
				}
			}
		}
	}
	return r;
}