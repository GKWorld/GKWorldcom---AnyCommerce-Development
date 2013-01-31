var app = app || {vars:{},u:{}}; //make sure app exists.
app.rq = app.rq || []; //ensure array is defined. rq = resource queue.




//app.rq.push(['extension',0,'convertSessionToOrder','extensions/checkout_passive/extension.js']);
app.rq.push(['extension',0,'convertSessionToOrder','extensions/checkout_nice/extension.js']);
app.rq.push(['extension',0,'store_checkout','extensions/store_checkout.js']);
app.rq.push(['extension',0,'store_prodlist','extensions/store_prodlist.js']);
app.rq.push(['extension',0,'store_navcats','extensions/store_navcats.js']);
app.rq.push(['extension',0,'store_search','extensions/store_search.js']);
app.rq.push(['extension',0,'store_product','extensions/store_product.js']);
app.rq.push(['extension',0,'store_cart','extensions/store_cart.js']);
app.rq.push(['extension',0,'store_crm','extensions/store_crm.js']);
app.rq.push(['extension',0,'myRIA','quickstart.js','startMyProgram']);

app.rq.push(['extension',1,'analytics_google','extensions/analytics_google.js','startExtension']);
//app.rq.push(['extension',1,'bonding_buysafe','extensions/bonding_buysafe.js','startExtension']);
//app.rq.push(['extension',1,'powerReviews','extensions/reviews_powerreviews.js','startExtension']);
//app.rq.push(['extension',0,'magicToolBox','extensions/imaging_magictoolbox.js','startExtension']); // (not working yet - ticket in to MTB)


//spec_LLTRSHIRT017_0
//add tabs to product data.
//tabs are handled this way because jquery UI tabs REALLY wants an id and this ensures unique id's between product
app.rq.push(['templateFunction','productTemplate','onCompletes',function(P) {
	var safePID = app.u.makeSafeHTMLId(P.pid); //can't use jqSelector because productTEmplate_pid still used makesafe. planned Q1-2012 update ###
	var $tabContainer = $( ".tabbedProductContent",$('#productTemplate_'+safePID));
		if($tabContainer.length)	{
			if($tabContainer.data("tabs")){} //tabs have already been instantiated. no need to be redundant.
			else	{
				$("div.tabContent",$tabContainer).each(function (index) {
					$(this).attr("id", "spec_"+safePID+"_" + index.toString());
					})
				$(".tabs li a",$tabContainer).each(function (index) {
					$(this).attr('id','href_'+safePID+"_" + index.toString());
					$(this).attr("href", "#spec_"+safePID+"_" + index.toString());
					});
				$tabContainer.localtabs();
				}
			}
		else	{} //couldn't find the tab to tabificate.
	}]);

app.rq.push(['script',0,(document.location.protocol == 'file:') ? app.vars.httpURL+'jquery/config.js' : app.vars.baseURL+'jquery/config.js']); //The config.js is dynamically generated.
app.rq.push(['script',0,app.vars.baseURL+'model.js']); //'validator':function(){return (typeof zoovyModel == 'function') ? true : false;}}
app.rq.push(['script',0,app.vars.baseURL+'includes.js']); //','validator':function(){return (typeof handlePogs == 'function') ? true : false;}})
app.rq.push(['script',1,app.vars.baseURL+'jeditable.js']); //used for making text editable (customer address). non-essential. loaded late.
app.rq.push(['script',0,app.vars.baseURL+'controller.js']);

//sample of an onDeparts. executed any time a user leaves this page/template type.
app.rq.push(['templateFunction','homepageTemplate','onDeparts',function(P) {app.u.dump("just left the homepage")}]);
app.rq.push(['templateFunction','homepageTemplate','onCompletes',function(P) {
		var $target=$('#wideSlideshow');
//		$target.cycle({fx:'fade',speed:'slow',timeout:5000,pager:'#slideshowNav',pagerAnchorBuilder:function(index,el){return'<a href="#"> </a>';},slideExpr:'li'});	
		//$target.cycle({fx:'fade',speed:'slow',timeout:5000,slideExpr:'li'});
		}]);

//group any third party files together (regardless of pass) to make troubleshooting easier.
app.rq.push(['script',0,(document.location.protocol == 'https:' ? 'https:' : 'http:')+'//ajax.googleapis.com/ajax/libs/jqueryui/1.9.0/jquery-ui.js']);
//for homepage and product slideshows
app.rq.push(['script',0,app.vars.baseURL+'cycle-2.9998.js']);//','validator':function(){return (jQuery().cycle) ? true : false;}});
//app.rq.push(['script':2,'location':app.vars.baseURL+'jcarousellite.min.js']);//,'validator':function(){return (jQuery.cycle) ? true : false;}})
//renders AddThis block on product pages
app.rq.push(['script',0,(document.location.protocol == 'https:' ? 'https:' : 'http:')+'//s7.addthis.com/js/250/addthis_widget.js#pubid=gkworld', function(P) {var addthis_config = {"data_track_clickback":false,"ui_click":true,"ui_use_image_picker": true};}]);//	'validator':function(){return (typeof addthis == 'object') ? true : false;}

app.rq.push(['templateFunction','productTemplate','onCompletes',function(P) {
	var url = zGlobals.appSettings.http_app_url+"product/"+P.pid+"/";
	//update the openGraph and meta content. mostly for social/addThis.
	$('#ogTitle').attr('content',app.data[P.datapointer]['%attribs']['zoovy:prod_name']);
	$('#ogImage').attr('content',app.u.makeImage({"name":app.data[P.datapointer]['%attribs']['zoovy:prod_image1'],"w":150,"h":150,"b":"FFFFFF","tag":0}));
	$('#ogDescription, #metaDescription').attr('content',app.data[P.datapointer]['%attribs']['zoovy:prod_desc']);
			addthis.toolbox('#socialLinks');
	if(typeof addthis == 'object' && addthis.update)	{
		addthis.update('share','url',url);
		$("#socialLinks .addthis_button_facebook_like").attr("fb:like:href",url);
		$("#socialLinks .addthis_button_pinterest_pinit").attr({"pi:pinit:media":app.u.makeImage({"h":"300","w":"300","b":"ffffff","name":app.data['appProductGet|'+P.pid]['%attribs']['zoovy:prod_image1'],"tag":0}),"pi:pinit:url":url});	
		}

		}]); //addThis productTemplate code	

/*
This function is overwritten once the controller is instantiated. 
Having a placeholder allows us to always reference the same messaging function, but not impede load time with a bulky error function.
*/
app.u.throwMessage = function(m)	{
	alert(m); 
	}

app.u.howManyPassZeroResourcesAreLoaded = function(debug)	{
	var L = app.vars.rq.length;
	var r = 0; //what is returned. total # of scripts that have finished loading.
	for(var i = 0; i < L; i++)	{
		if(app.vars.rq[i][app.vars.rq[i].length - 1] === true)	{
			r++;
			}
		if(debug)	{app.u.dump(" -> "+i+": "+app.vars.rq[i][2]+": "+app.vars.rq[i][app.vars.rq[i].length -1]);}
		}
	return r;
	}


//gets executed once controller.js is loaded.
//check dependencies and make sure all other .js files are done, then init controller.
//function will get re-executed if not all the scripts in app.vars.scripts pass 1 are done loading.
//the 'attempts' var is incremented each time the function is executed.

app.u.initMVC = function(attempts){
//	app.u.dump("app.u.initMVC activated ["+attempts+"]");
	var includesAreDone = true;

//what percentage of completion a single include represents (if 10 includes, each is 10%).
	var percentPerInclude = (100 / app.vars.rq.length);  
	var resourcesLoaded = app.u.howManyPassZeroResourcesAreLoaded();
	var percentComplete = Math.round(resourcesLoaded * percentPerInclude); //used to sum how many includes have successfully loaded.
	//make sure precentage is never over 100
	if(percentComplete > 100 )	{
		percentComplete = 100;
		}
	
	$('#appPreViewProgressBar').val(percentComplete);
	$('#appPreViewProgressText').empty().append(percentComplete+"% Complete");

	if(resourcesLoaded == app.vars.rq.length)	{

		var clickToLoad = false;
		if(clickToLoad){
			$('#loader').fadeOut(1000);
			$('#clickToLoad').delay(1000).fadeIn(1000).click(function() {
				app.u.loadApp();
			});
		} else {
			app.u.loadApp();
			}
		}
	else if(attempts > 50)	{
		app.u.dump("WARNING! something went wrong in init.js");
		//this is 10 seconds of trying. something isn't going well.
		$('#appPreView').empty().append("<h2>Uh Oh. Something seems to have gone wrong. </h2><p>Several attempts were made to load the store but some necessary files were not found or could not load. We apologize for the inconvenience. Please try 'refresh' and see if that helps.<br><b>If the error persists, please contact the site administrator</b><br> - dev: see console.</p>");
		app.u.howManyPassZeroResourcesAreLoaded(true);
		}
	else	{
		setTimeout("app.u.initMVC("+(attempts+1)+")",250);
		}

	}

app.u.loadApp = function() {
//instantiate controller. handles all logic and communication between model and view.
//passing in app will extend app so all previously declared functions will exist in addition to all the built in functions.
//tmp is a throw away variable. app is what should be used as is referenced within the mvc.
		app.vars.rq = null; //to get here, all these resources have been loaded. nuke record to keep DOM clean and avoid any duplication.
		var tmp = new zController(app);
//instantiate wiki parser.
		myCreole = new Parse.Simple.Creole();
		
		//Ship Latency messaging - yes it's ugly but client wanted a custom message for _every_value_
	app.renderFormats.shippingLatencyAddClass = function ($tag, data){
		if(data.value == 2 || data.value == 4 || data.value == 4){
			//do nothing, already has green circle
		} else {
			$tag.addClass('backorder');
			$tag.removeClass('inStock');
		}
		
	}
	app.renderFormats.shippingLatency = function ($tag, data){
		var latVal = data.value;
		var latString = "";
		if(latVal == 2){
			latString = 'Ships in 1-2 days';
		} else if(latVal == 3){
			latString = 'Ships in 2-4 days';
		} else if(latVal == 4){
			latString = 'Ships in 3-5 days';
		} else if(latVal == 5){
			latString = 'Ships in 5-10 days';
		} else if(latVal == 7){
			latString = 'Ships in 7-10 days';
		} else if(latVal == 10){
			latString = 'Ships in 10-14 days';
		} else if(latVal == 14){
			latString = 'Ships in 4+ weeks';
		} else if(latVal == 20){
			latString = 'Pre-Order January/February';
		} else if(latVal == 21){
			latString = 'Pre-Order February/March';
		} else if(latVal == 22){
			latString = 'Pre-Order March/April';
		} else if(latVal == 23){
			latString = 'Pre-Order April/May';
		} else if(latVal == 24){
			latString = 'Pre-Order May/June';
		} else if(latVal == 25){
			latString = 'Pre-Order June/July';
		} else if(latVal == 26){
			latString = 'Pre-Order July/August';
		} else if(latVal == 27){
			latString = 'Pre-Order August/September';
		} else if(latVal == 28){
			latString = 'Pre-Order September/October';
		} else if(latVal == 29){
			latString = 'Pre-Order October/November';
		} else if(latVal == 30){
			latString = 'Pre-Order November/December';
		} else if(latVal == 31){
			latString = 'Pre-Order December/January';
		} else if(latVal == 50){
			latString = 'Not Available. Re-stock TBD';
		} else {
			//do not render
		}
		$tag.text(latString);
	}
}


//Any code that needs to be executed after the app init has occured can go here.
//will pass in the page info object. (pageType, templateID, pid/navcat/show and more)
app.u.appInitComplete = function(P)	{
	app.u.dump("Executing myAppIsLoaded code...");
	$('.subcatListContainer a',$('#nav')).click(function(){$('.subcatListContainer',$('#nav')).hide();}); //make sure hard coded links close the nav
	$('.topCat').click(function(event){
		event.preventDefault();
		$('.subcatListContainer').hide(); //closes all open menus
		$('.subcatListContainer',$(this).parent()).css('display','block'); //opens active menu.
	})
	$('.subcatListContainer').append("<span class='ui-state-default ui-corner-all floatRight removeButton center' onClick='$(\".subcatListContainer\",$(\"#nav\")).hide();' ><span class='ui-icon ui-icon-closethick'></span></span>");
	// code for obtaining and displaying the dropdowns for the top level nav 
	var topCats = new Array('.genre.anime_categories','.genre.cartoon_categories','.genre.comic_series_-_marvel','.genre.comic_series_-_dc','.genre.disney_categories','.genre.disney','.genre.movie_categories','.genre.music_categories','.genre.tv_series_categories','.genre.tv_series','.genre.video_game_categories','.genre.zmore');
	var tcl = topCats.length
	var safeid; //recycled.
	for(var i = 0; i < tcl; i +=1){
		safeid = app.u.makeSafeHTMLId(topCats[i])
		$('#subcats_'+safeid).append(app.renderFunctions.createTemplateInstance('topLevelSubs',"subcats_"+safeid+"_ul"));
		app.ext.store_navcats.calls.appCategoryDetailMax.init(topCats[i],{'callback':'translateSelector','selector':'#subcats_'+safeid},'mutable');
		}
	
	app.model.dispatchThis('mutable');
	//Homepage Slideshow
	
	//Product Page Slideshow	
//	app.rq.push(['templateFunction','productTemplate','onCompletes',function(P) {
//		if($("#prodTemplateRelatedCarousel ul li").length > 4)	{
//			$('#prodTemplateRelatedCarousel .nav').show();
//			$('.jCarouselLite').jCarouselLite({
				// auto: true,
//				visible: 5,
//				scroll: 5,
//				speed: 1000,
//				pause: true,
//				btnPrev: function() {
//					return $(this).find('.prev');
//					},
//				btnNext: function() {
//					return $(this).find('.next');
//					}
//				});
//			}		
//		}]);
		
	//addthis code for productTemplate
	

	
// michael's modal popup, see if it offers something different from neal's -- okay in init	
	app.u.showBillShipModal = function(){
		$('#shipBillingTip').dialog({
			title : "No Billing Occurs Until Shipping",
			modal:"true",
			width : 600
		});
	}
	app.u.showReturnPolModal = function(){
		$('#returnPolicyTip').dialog({
			title : "60-Day Return Policy",
			modal:"true",
			width : 600
		});
	}
	app.u.showStockShipModal = function(){
		$('#stockShipTip').dialog({
			title : "In-Stock Items and Shipping",
			modal:"true",
			width : 600
		});
	}
	app.u.showWorldShipModal = function(){
		$('#worldShipTip').dialog({
			title : "Worldwide Shipping",
			modal:"true",
			width : 600
		});
	}	
};




//don't execute script till both jquery AND the dom are ready.
$(document).ready(function(){
	app.u.handleRQ(0)
	});






