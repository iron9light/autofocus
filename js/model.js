/**
 * @author IL
 */

var uuid = function() {
	var BASE64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";
	var uuid = new Array(22);
	uuid[0] = BASE64[Math.random()*4];
	for(var i=1; i<64; ++i) {
		uuid[i] = BASE64[Math.floor(Math.random()*64)];
	}
	return uuid.join('');
};

	var now = function() {
		return (new Date).getTime();
	};
 
var generateRandomTasks = function(count) {
    // generate random integer in [0, num)
	random = function(num) {
		return Math.floor(Math.random()*num);
	};
	
	randomString = function(num) {
		charlist = "0123456789abcdefghijklmnopqrstuvwxyz";
		
		var length = random(num);
		var result = "";
		for(var i=0;i<length;++i) {
			result += charlist.charAt(random(36));
		}
		
		return result;
	}
	
	randomStatus = function() {
		statuslist = ["next", "active", "hold", "postponed", "canceled", "done"];
		
		return statuslist[random(statuslist.length)];
	}
	
	var tasks = [];
	
	var taskNameLength = 30;
	var noteLength = 100;
	
	for(var i=0;i<count;++i) {
		var task = {id: uuid(),
				    name: "Task " + i + " - " + randomString(taskNameLength),
				    note: randomString(noteLength),
				    status: randomStatus()
		};
		
		if(task.note.length == 0){
			delete task.note;
		}
		
		tasks.push(task);
	}
	
	return tasks;
};


MyStorage = {
	getItem: function(name){
		var valueString = localStorage.getItem(name);
		if(valueString) {
			return jQuery.parseJSON(valueString);
		} else {
			return undefined;
		}
	},
	setItem: function(name, value){
		var valueString = JSON.stringify(value);
		localStorage.setItem(name, valueString);
	}
}

TaskBook = function(tasks) {
	if(tasks) {
		this.tasks = tasks;
	} else {
		this.loadTasks();
	}
	for(var i=0; i<this.tasks.length; ++i) {
		this.idMap[this.tasks[i].id] = i;
	}
}

TaskBook.prototype = {
	constructor: TaskBook,
	tasks: [],
	idMap: {},
	countPerPage: 20,
	getTask: function(id) {
		var taskIndex = this.idMap[id];
		if(taskIndex !== undefined) {
			return this.tasks[taskIndex];
		} else {
			return undefined;
		}
	},
		now: function() {
		return (new Date).getTime();
	},
	getPage: function(pageIndex) {
		// page index is 1-based.
		var endTaskIndex = pageIndex * this.countPerPage;
		var startTaskIndex = endTaskIndex - this.countPerPage;
		var pageTasks = this.tasks.slice(startTaskIndex, endTaskIndex);
		var result = {
			pageNumber: pageIndex,
			pageTasks: pageTasks, 
		}
		
		if(startTaskIndex > 0) {
			result.prePageNumber = pageIndex - 1;
		};
		
		if(endTaskIndex < this.tasks.length) {
			result.nextPageNumber = pageIndex + 1;
		};
		
		return result;
	},
	
	getPageNumberOfTask: function(id) {
		var taskIndex = this.idMap[id];
		if(taskIndex !== undefined) {
			var pageNumber = Math.floor(taskIndex/this.countPerPage) + 1;
			return pageNumber;
		} else {
			return 0;
		}
	},
	
	addTask: function(newTask) {
		newTask.id = uuid();
		newTask.added = this.now();
		this.idMap[newTask.id] = this.tasks.length;
		this.tasks.push(newTask);
		
		this.onChange();
	},
	
	editTask: function(task) {
		var taskIndex = this.idMap[task.id];
		if(taskIndex) {
			this.tasks[taskIndex]  = task;
			task.modified = now();
			
			this.onChange();
		}
	},
	
	cancelTask: function(id) {
		var task = this.getTask(id);
		if(task && task.status != "canceled") {
			task.status = "canceled";
			task.canceled = now();
			
			this.onChange();
		}
	},
	
	startTask: function(id) {
		var task = this.getTask(id);
		if(task && task.status != "active") {
			task.status = "active";
			task.timeron = now();
			
			this.onChange();
		}
	},
	
	completeTask: function(id) {	
		var task = this.getTask(id);
		if(task && task.status != "done") {
			task.status = "done";
			task.completed = now();
			if(task.timeron) {pageIndex
				taskstask.timer += task.completed - task.timeron;
				task.timeron = 0;
			}
			
			this.onChange();
		}
	},
	
	holdTask: function(id) {
		var task = this.getTask(id);
		if(task) {
			task.status = "hold";
			var newTask = {
				name: task.name,
				note: task.note,
				status: "next"
			}
			
			this.addTask(newTask);
		}
	},
	
	postponeTask: function(id) {
		var task = this.getTask(id);
		if(task) {
			task.status = "postponed";
			
			this.onChange();
		}
	},
	
	postponePage: function(pageNumber) {
		var page = this.getPage(pageNumber);
		for(task in page.pageTasks) {
			task.status = "postponed";
		}
		
		this.onChange();
	},
	
	taskStateMachine: {
		next: {
			start: 'active',
			cancel: 'canceled',
			complete: 'done',
			postpone: 'postponed'
		},
		active: {
			cancel: 'canceled',
			complete: 'done',
			hold: 'hold'
		},
		postponed: {
			start: 'active',
			cancel: 'canceled',
			complete: 'done'
		},
		hold: {},
		canceled: {},
		done: {}
	},
	
	loadTasks: function(){
		var tasks = MyStorage.getItem("tasks");
		this.tasks = tasks ? tasks : [];
	},
	
	saveTasks: function(){
		MyStorage.setItem("tasks", this.tasks);
	},
	
	onChange: function(){
		this.saveTasks();
	}
}

// var taskBook = new TaskBook(generateRandomTasks(123));
var taskBook = new TaskBook();
