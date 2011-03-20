 /**
 * @author IL
 */
 
 (function($, undefined ) {
   var proxied = $.mobile.changePage;
   $.mobile.changePage = function() {
   	 var to = arguments[0];
     $(document).trigger('changePage', to);
     return proxied.apply(this, arguments);
   };
 })(jQuery);