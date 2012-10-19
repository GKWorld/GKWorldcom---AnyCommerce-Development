var app = app || {vars:{},u:{}}; //make sure app exists.

// A list of all the extensions that are going to be used.
//if an extension is 'required' for any page within the store to load properly, the extension should be added as a dependency within quickstart.js
app.vars.extensions = [
	{"namespace":"store_prodlist","filename":"extensions/store_prodlist.js"},
//	{"namespace":"convertSessionToOrder","filename":"extensions/checkout_passive/extension.js"},  /* checkout_passive does not require buyer to login */
	{"namespace":"convertSessionToOrder","filename":"extensions/checkout_nice/extension.js"},	/* checkout_nice prompts buyer to login */
	{"namespace":"store_checkout","filename":"extensions/store_checkout.js"},
	{"namespace":"store_navcats","filename":"extensions/gkworld_navcats.js"},
	{"namespace":"store_search","filename":"extensions/store_search.js"},
	{"namespace":"store_product","filename":"extensions/store_product.js"},
	{"namespace":"store_cart","filename":"extensions/gkworld_cart.js"}, /* updateCartSummary tweaked */
//	{"namespace":"analytics_google","filename":"extensions/analytics_google.js","callback":"addTriggers"},
//	{"namespace":"bonding_buysafe","filename":"extensions/bonding_buysafe.js","callback":"addTriggers"},
	{"namespace":"store_crm","filename":"extensions/store_crm.js"},
	{"namespace":"myRIA","filename":"gkworld_quickstart.js","callback":"startMyProgram"}
	];


/*
app.vars.scripts is an object containing a list of scripts that are required/desired.
for each script, include:  
	pass -> scripts are loaded in a loop. pass 1 is loaded before app gets initiated and should only include 'required' scripts. Use > 1 for other scripts.
	location -> the location of the file. be sure to load a secure script on secure pages to avoid an ssl error.
	validator -> a function returning true or false if the script is loaded. Used primarily on pass 1.
optionally also include:
	callback -> a function to execute after the script is loaded.
*/
app.vars.scripts = new Array();



app.vars.scripts.push({
	'pass':1,
	'location':app.vars.baseURL+'controller.js',
	'validator':function(){return (typeof zController == 'function') ? true : false;},
	'callback':function(){app.u.initMVC()} //the app.u.initMVC callback is what instantiates the controller.
	})



app.vars.scripts.push({
	'pass':1,
	'location':(location.protocol == 'https:' ? 'https:' : 'http:')+'//ajax.googleapis.com/ajax/libs/jqueryui/1.8.21/jquery-ui.js',
	'validator':function(){return (typeof $ == 'function' && jQuery.ui) ? true : false;}
	})
//The config.js file is 'never' local. it's a remote file, so...
//when opening the app locally, always use the nonsecure config file. Makes testing easier.
//when opening the app remotely, use app.vars.baseURL which will be http/https as needed.

app.vars.scripts.push({
	'pass':1,
	'location':(location.protocol == 'file:') ? app.vars.httpURL+'jquery/config.js' : app.vars.baseURL+'jquery/config.js',
	'validator':function(){return (typeof zGlobals == 'object') ? true : false;}
	})

app.vars.scripts.push({'pass':1,'location':app.vars.baseURL+'model.js','validator':function(){return (typeof zoovyModel == 'function') ? true : false;}})
app.vars.scripts.push({'pass':1,'location':app.vars.baseURL+'includes.js','validator':function(){return (typeof handlePogs == 'function') ? true : false;}})

//for banner slideshow used on homepage.
app.vars.scripts.push({'pass':1,'location':app.vars.baseURL+'cycle-2.9998.js','validator':function(){return (jQuery().cycle) ? true : false;}})
app.vars.scripts.push({'pass':2,'location':app.vars.baseURL+'jcarousellite.min.js','validator':function(){return (jQuery.cycle) ? true : false;}})


//used for making text editable (customer address). non-essential. loaded late.
app.vars.scripts.push({'pass':8,'location':app.vars.baseURL+'jeditable.js','validator':function(){return (typeof $ == 'function' && jQuery().editable) ? true : false;}})


app.vars.scripts.push({
	'pass':5,
	'location':(location.protocol == 'https:' ? 'https:' : 'http:')+'//s7.addthis.com/js/300/addthis_widget.js#pubid=gkworld',
	'callback':function(){var addthis_config = {"data_track_clickback":false,"ui_click":true,"ui_use_image_picker": true};}, 
	'validator':function(){return (typeof addthis == 'object') ? true : false;}
	})

/*
Will load all the scripts from pass X where X is an integer less than 10.
This will load all of the scripts in the app.vars.scripts object that have a matching 'pass' value.

*/

app.u.loadScriptsByPass = function(PASS,CONTINUE)	{
//	app.u.dump("BEGIN app.u.loadScriptsByPass ["+PASS+"]");
	var L = app.vars.scripts.length;
	var numIncludes = 0; //what is returned. The total number of includes for this pass.
	for(var i = 0; i < L; i += 1)	{
		if(app.vars.scripts[i].pass == PASS)	{
			numIncludes++
			app.u.loadScript(app.vars.scripts[i].location,app.vars.scripts[i].callback);
			}
		}
	if(CONTINUE == true && PASS <= 10)	{app.u.loadScriptsByPass((PASS + 1),true)}
	return numIncludes;
	}


/*
This function is overwritten once the controller is instantiated. 
Having a placeholder allows us to always reference the same messaging function, but not impede load time with a bulky error function.
*/
app.u.throwMessage = function(m)	{
	alert(m); 
	}




//put any code that you want executed AFTER the app has been initiated in here.  This may include adding onCompletes or onInits for a given template.
app.u.appInitComplete = function()	{
	app.u.loadScriptsByPass(2,true); //loads the rest of the scripts.
	app.u.dump("Executing myAppIsLoaded code...");
	$('.subcatListContainer a',$('#nav')).click(function(){$('.subcatListContainer',$('#nav')).hide();}); //make sure hard coded links close the nav
	$('.topCat').click(function(event){
		event.preventDefault();
		$('.subcatListContainer').hide(); //closes all open menus
		$('.subcatListContainer',$(this).parent()).css('display','block'); //opens active menu.
	})
	$('.subcatListContainer').append("<span class='ui-state-default ui-corner-all floatRight removeButton center' onClick='$(\".subcatListContainer\",$(\"#nav\")).hide();' ><span class='ui-icon ui-icon-closethick'></span></span>");
	
//display product blob fields in tabbed format.
	app.ext.myRIA.template.productTemplate.onCompletes.push(function(P) {$( "#tabbedProductContent" ).tabs()}) 
	app.ext.myRIA.template.productTemplate.onCompletes.push(function(P) {
		app.ext.myRIA.u.handleToolTip('#'+P.parentID);
		}) 

//get an elastic list of similar items (ugenre) and throw them into a carousel.
	app.ext.myRIA.template.productTemplate.onCompletes.push(function(P) {
		var ugenre = app.data['appProductGet|'+P.pid]['%attribs']['zoovy:prod_ugenre'];
		app.u.dump(" -> ugenre: "+ugenre);
		if(ugenre)	{
			$('#prodTemplateUgenreCarousel').append("<h2 class='greyGradient marginBottom'>Similar "+ugenre+" Items</h2><div class='jCarouselLite clearfix'><ul id='prodpageUgenreSearch' class='productList' data-bind='var: elastic-native({'size':'25','mode':'elastic-native','filter':{'term':{'prod_name':'halo'}}}); format: productSearch; extension: myRIA; loadsTemplate: productListTemplateResults;'></ul><div class='nav'><a href='#' class='prev greenGradient'>&#171;</a><a href='#' class='next greenGradient'>&#187;</a></div></div>");
			
			app.ext.store_search.calls.appPublicProductSearch.init({"size":"20","mode":"elastic-native","filter":{"term":{"prod_ugenre":ugenre}}},{'datapointer':'appPublicSearch|prodTemplateUgenreCarousel','parentID':'prodTemplateUgenreCarousel','callback':'handleCustomSearch','extension':'myRIA'});
			app.model.dispatchThis();
			}
		}) 

/* code for obtaining and displaying the dropdowns for the top level nav */
	var topCats = new Array('.genre.anime_categories','.genre.cartoon_categories','.genre.comic_series_-_marvel','.genre.comic_series_-_dc','.genre.disney_categories','.genre.disney','.genre.movie_categories','.genre.music_categories','.genre.tv_series_categories','.genre.tv_series','.genre.video_game_categories','.genre.zmore');
	var tcl = topCats.length
	var safeid; //recycled.
	for(var i = 0; i < tcl; i +=1){
		safeid = app.u.makeSafeHTMLId(topCats[i])
		$('#subcats_'+safeid).append(app.renderFunctions.createTemplateInstance('topLevelSubs',"subcats_"+safeid+"_ul"));
		app.ext.store_navcats.calls.appCategoryDetailMax.init(topCats[i],{'callback':'translateSelector','selector':'#subcats_'+safeid},'mutable');
		}
	
	app.model.dispatchThis('mutable');

	//addthis code for productTemplate
	app.ext.myRIA.template.productTemplate.onCompletes.push(function(P) {
var url = zGlobals.appSettings.http_app_url+"product/"+P.pid+"/";
//update the openGraph and meta content. mostly for social/addThis.
$('#ogTitle').attr('content',app.data[P.datapointer]['%attribs']['zoovy:prod_name'])
$('#ogImage').attr('content',app.u.makeImage({"name":app.data[P.datapointer]['%attribs']['zoovy:prod_image1'],"w":150,"h":150,"b":"FFFFFF","tag":0}))
$('#ogDescription, #metaDescription').attr('content',app.data[P.datapointer]['%attribs']['zoovy:prod_desc'])


//		addthis.toolbox('#socialLinks');
if(typeof addthis == 'object' && addthis.update)	{
	addthis.update('share','url',url);
	$(".addthis_toolbox .addthis_button_facebook_like").attr("fb:like:href",url);
	$(".addthis_toolbox .addthis_button_pinterest_pinit").attr({"pi:pinit:media":app.u.makeImage({"h":"300","w":"300","b":"ffffff","name":app.data['appProductGet|'+P.pid]['%attribs']['zoovy:prod_image1'],"tag":0}),"pi:pinit:url":url});	
	}

	}); //addThis productTemplate code
	
	app.ext.myRIA.template.productTemplate.onCompletes.push(function(){
		if($("#prodTemplateRelatedCarousel ul li").length > 4)	{
			$('#prodTemplateRelatedCarousel .nav').show();
			$('.jCarouselLite').jCarouselLite({
				// auto: true,
				visible: 5,
				scroll: 5,
				speed: 1000,
				pause: true,
				btnPrev: function() {
					return $(this).find('.prev');
					},
				btnNext: function() {
					return $(this).find('.next');
					}
				});
			}
		});

	app.ext.myRIA.template.homepageTemplate.onCompletes.push(function(){
		if($('#wideSlideshow li').length > 1)	{
			$('#wideSlideshow').cycle({
				fx:     'fade',
				speed:  'slow',
				timeout: 5000,
				pager:  '#slideshowNav',
				slideExpr: 'li'
				});
			}
		}) //homepageTemplate.onCompletes
	
	
	
	app.ext.myRIA.renderFormats.prodlistATC = function($tag,data){
		var pid = data.value;
		var showATC = true;
		var showVariations = true;
// add _pid to end of atc button to make sure it has a unique id.
// add a success message div to be output before the button so that messaging can be added to it.
// atcButton class is added as well, so that the addToCart call can disable and re-enable the buttons.
		$tag.before("<div class='atcSuccessMessage' id='atcMessaging_"+pid+"'><\/div>"); 
		if(app.ext.store_product.u.productIsPurchaseable(pid))	{
//product is purchaseable.
			if(typeof app.data['appProductGet|'+pid]['@variations'] == 'undefined')	{showATC = false; showVariation = false;}
			else if(!$.isEmptyObject(app.data['appProductGet|'+pid]['@variations'])){showATC = false}					

/*
when the template is initially created (using createInstance and then translate template
the button gets generated, then updated. This may result in multiple events being added.
so the atc events are unbinded, then binded.
*/

			if(showATC)	{
				$tag.addClass('addToCartButton').unbind('.myATCEvent').bind('click.myATCEvent',function(event){
				event.preventDefault();
				$(this).parent.submit();
				}).text('Add To Cart')
				}
			else if(showVariations)	{
				$tag.addClass('chooseOptionsButton').unbind('.myATCEvent').bind('click.myATCEvent',function(event){
				event.preventDefault();
				showContent('product',{'pid':pid})
				})}
			else 	{
				$tag.unbind('.myATCEvent').bind('click.myATCEvent',function(event){
				event.preventDefault();
				showContent('product',{'pid':pid})
				})}
			}
		else	{
			$tag.replaceWith("<span class='notAvailable'>not available</span>");
			}
//				app.u.dump(" -> ID at end: "+$tag.attr('id'));
		} //addToCartButton
	}


//gets executed once controller.js is loaded.
//check dependencies and make sure all other .js files are done, then init controller.
//function will get re-executed if not all the scripts in app.vars.scripts pass 1 are done loading.
//the 'attempts' var is incremented each time the function is executed.

app.u.initMVC = function(attempts){
//	app.u.dump("app.u.initMVC activated");
	var includesAreDone = true;

//what percentage of completion a single include represents (if 10 includes, each is 10%). subtract 1 just to make sure percentComplete < 100
	var percentPerInclude = Math.round((100 / acScriptsInPass)) - 1;  
	var percentComplete = 0; //used to sum how many includes have successfully loaded.
	
	if(!attempts){attempts = 1} //the number of attempts that have been made to load. allows for error handling
	var L = app.vars.scripts.length
//	app.u.dump(" -> L: "+L+" and attempt: "+attempts);
//don't break out of the loop on the first false. better to loop the whole way through so that the progress bar can go up as quickly as possible.
	for(var i = 0; i < L; i += 1)	{
		if(app.vars.scripts[i].pass == 1 && app.vars.scripts[i].validator()){
			//this file is loaded.
			percentComplete += percentPerInclude;
			}
		else if(app.vars.scripts[i].pass != 1)	{
			//only first pass items are validated for instantiting the controller.
			}
		else	{
			//file not loaded.
			app.u.dump(" -> attempt "+attempts+" waiting on: "+app.vars.scripts[i].location)
			includesAreDone = false;
			}
		}

	$('#appPreViewProgressBar').val(percentComplete);
	$('#appPreViewProgressText').empty().append(percentComplete+"% Complete");
	
	if(includesAreDone == true && jQuery)	{
		$.support.cors = true;  //cross site scripting for non cors sites. will b needed for IE10. IE8 & 9 don't support xss well.
//instantiate controller. handles all logic and communication between model and view.
//passing in app will extend app so all previously declared functions will exist in addition to all the built in functions.
//tmp is a throw away variable. app is what should be used as is referenced within the mvc.
		var tmp = new zController(app);

		//instantiate wiki parser.
		myCreole = new Parse.Simple.Creole();

		}
	else if(attempts > 80)	{
		app.u.dump("WARNING! something went wrong in init.js");
		//this is 10 seconds of trying. something isn't going well.
		$('#appPreView').empty().append("<h2>Uh Oh. Something seems to have gone wrong. </h2><p>Several attempts were made to load the store but some necessary files were not found or could not load. We apologize for the inconvenience. Please try 'refresh' and see if that helps.<br><b>If the error persists, please contact the site administrator</b><br> - dev: see console.</p>");
//throw some debugging at the console to report what didn't load.
		for(var i = 0; i < L; i += 1)	{
			if(app.vars.scripts[i].pass == 1)	{
				app.u.dump(" -> "+app.vars.scripts[i].location+": "+app.vars.scripts[i].validator());
				}
			}
		
		}
	else	{
		setTimeout("app.u.initMVC("+(attempts+1)+")",250);
		}
	}






//start the app.
var acScriptsInPass;
//don't execute script till both jquery AND the dom are ready.
$(document).ready(function(){
	acScriptsInPass = app.u.loadScriptsByPass(1,false)
	});






