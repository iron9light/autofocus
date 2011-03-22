/**
 * @author IL
 */
 
createPage = function(pageInfo) {
	return $('#pagetmpl').tmpl(pageInfo);
}

createTask = function(taskInfo) {
	var pageNumber = taskBook.getPageNumberOfTask(taskInfo.id);
	return $('#tasktmpl').tmpl(taskInfo, {
		pageNumber: pageNumber
	});
}

createDoTask = function(taskInfo) {
	var moreInfo = taskBook.taskStateMachine[taskInfo.status];
	return $('#dotasktmpl').tmpl(taskInfo, moreInfo);
}

createNewTask = function(taskInfo) {
	return $('#addtasktmpl').tmpl(taskInfo);
}

$(function() {
	var pageNumber = 1
	if(window.location.hash){
		pageNumber = getPageNumber(window.location.hash.substr(1));
	}

	var pageInfo = taskBook.getPage(pageNumber);
	var page = createPage(pageInfo);
	page.appendTo('body');
});

// todo: improve use regex.
getPageNumber = function(pageId) {
	var pageNumber = Number(pageId.substr(4));
	return pageNumber;
};

getTaskId = function(taskId) {
	return taskId.substr(4);
};

getDoTaskId = function(taskId) {
	return taskId.substr(6);
};

$(document).bind('changePage', function(event, to){
	if(to) {
		var id = (typeof(to) == 'string')?to:to.id;
		
		if(id.match(/^page\d+/)) {
			var pageNumber = getPageNumber(id);
			changeToPage(pageNumber);
		} else if(id.match(/^task[A-Za-z0-9\-_]{22}/)) {
			var taskId = getTaskId(id);
			changeToTask(taskId);
		} else if(id.match(/^dotask[A-Za-z0-9\-_]{22}/)){
			var taskId = getDoTaskId(id);
			changeToDoTask(taskId);
		}
	} else {
		changeToDefaultPage();
	}
});

changeToDefaultPage = function() {
	var defaultPageNumber = 1;
	changeToPage(defaultPageNumber);
}

changeToPage = function(pageNumber) {
	if($('#page'+pageNumber).length) {
		return;
	}
	
	var pageInfo = taskBook.getPage(pageNumber);
	var page = createPage(pageInfo);

	page.appendTo('body');
}

changeToTask = function(taskId){
	if($('div#task'+taskId).length) {
		return;
	}
	
	var taskInfo = taskBook.getTask(taskId);
	var task = createTask(taskInfo);
	
	task.appendTo('body');
}

changeToDoTask = function(taskId){
	if($('div#dotask'+taskId).length) {
		return;
	}
	
	var taskInfo = taskBook.getTask(taskId);
	var task = createDoTask(taskInfo);
	
	task.appendTo('body');
}

refresh = function() {
	$('div[id^="page"]').each(function(){
		var pageNumber = getPageNumber(this.id);
		var pageInfo = taskBook.getPage(pageNumber);
		var page = createPage(pageInfo);
		page.appendTo('body');
		page.page();
		$(this).children().remove();
		page.children().appendTo(this);
		page.remove();
	})
}

$('div[id^="page"]').live('pageshow', function(){
	$('div[id^="page"]').not(this).remove();
	$('div[id^="task"]').remove();
	$('div[id^="dotask"]').remove();
});

//$('input[id="addTask"]').live('input', function(){
//	if(this.value.trim().length) {
//		$('a[id="addTask"]').show();
//	} else {
//		$('a[id="addTask"]').hide();
//	}
//})

//$('input[id="addTask"]').live('blur', function(){
//	if(this.value.trim().length) {
//		var dialog = createNewTask({name: $(this).val()});
//		dialog.appendTo($.mobile.pageContainer);
//		dialog.page();
//		$.mobile.changePage(dialog, 'pop', false, true);
//	}
//});

$('input[id="addTask"]').live('keypress', function(event){
	if(event.which != 13) {
		return;
	}
	
	if(this.value.trim().length) {
		var name = $(this).val();
		$(this).simpledialog({
			'mode' : 'bool',
			'prompt' : name,
			'buttons' : {
				'Add': function () {
					$(document).trigger('addtask', name);
				},
				'Cancel': function () {
				}
			}
		})
	}
});

//$('div[id="newTaskDialog"]').live('pagehide', function(){
//	$(this).remove();
//});

// todo: swipe event not work
$('div[id^="page"]').live('swipeleft', function(){
	$('header a.nextPageButton', this).click();
});

$('div[id^="page"]').live('swiperight', function(){
	$('header a.prePageButton', this).click();
});

var statustheme = {
		'next':"c",
		'active':"b",
		'postponed':"e",
		'hold':"c",
		'canceled':"c",
		'done':"c"
};

$(document).ready(function(){
	window.scrollTo(0, 1);
});
