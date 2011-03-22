 /**
 * @author IL
 */

(function($, undefined ) {
	var getTaskId = function(id){
		return id.substr(6);
	};
	
	$('a[id$="Task"][id!="addTask"]').live('click', function(){
		var id = $(this).closest('[id^="dotask"]')[0].id;
		var taskId = getTaskId(id);
		
		if(this.id === "startTask") {
			taskBook.startTask(taskId);
		} else if(this.id === "completeTask") {
			taskBook.completeTask(taskId);
		} else if(this.id === "holdTask") {
			taskBook.holdTask(taskId);
		} else if(this.id === "postponeTask") {
			taskBook.postponeTask(taskId);
		} else if(this.id === "cancelTask") {
			taskBook.cancelTask(taskId);
		}
		refresh();
	});
	
	$('a[id="addTask"]').live('click', function(){
		var name = $('input[id="addTask"]').val();
		if(name.length) {
			var task = {
					name: name,
					status: 'next'
			};
			taskBook.addTask(task);
			refresh();
		}
	});

	$('a[id="postponePage"]').live('click', function(){
		var pageId = $(this).closest('div[id^="page"]')[0].id;
		var pageNumber = getPageNumber(pageId);
		taskBook.postponePage(pageNumber);
		refresh();
	});
})(jQuery);
