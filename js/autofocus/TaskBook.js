require(function() {
  var MyStorage, TaskBook;
  createUuid(function() {
    var BASE64, i, uuid;
    BASE64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";
    uuid = new Array(22);
    uuid[0] = BASE64[Math.random() * 4];
    for (i = 1; i < 64; i++) {
      uuid[i] = BASE64[Math.floor(Math.random() * 64)];
    }
    return uuid.join('');
  });
  now(function() {
    return (new Date).getTime();
  });
  MyStorage = {
    getItem: function(name) {
      var valueString;
      valueString = localStorage.getItem(name);
      if (valueString) {
        return $.parseJSON(valueString);
      } else {
        return;
      }
    },
    setItem: function(name, value) {
      var valueString;
      valueString = JSON.stringify(value);
      return localStorage.setItem(name(valueString));
    }
  };
  TaskBook = (function() {
    function TaskBook(tasks) {
      var i, _ref;
      this.tasks = tasks;
      if (!(this.tasks != null)) {
        this.loadTasks();
      }
      for (i = 0, _ref = this.tasks.length; 0 <= _ref ? i < _ref : i > _ref; 0 <= _ref ? i++ : i--) {
        this.idMap[this.tasks[i].id] = i;
      }
    }
    TaskBook.prototype.idMap = {};
    TaskBook.prototype.countPerPage = 20;
    TaskBook.prototype.getTask = function(id) {
      var taskIndex;
      taskIndex = this.idMap[id];
      if (taskIndex != null) {
        return this.tasks[taskIndex];
      }
    };
    TaskBook.prototype.getPage = function(pageIndex) {
      var endTaskIndex, pageTasks, startTaskIndex;
      endTaskIndex = pageIndex * this.countPerPage;
      startTaskIndex = endTaskIndex - this.countPerPage;
      pageTasks = tasks.slice(startTaskIndex, endTaskIndex);
      return result({
        pageNumber: pageIndex,
        pageTasks: pageTasks,
        prePageNumber: startTaskIndex > 0 ? pageIndex - 1 : void 0,
        nextPageNumber: endTaskIndex < this.tasks.length ? pageIndex + 1 : void 0
      });
    };
    TaskBook.prototype.getPageNumberOfTask = function(id) {
      var taskIndex;
      taskIndex = this.idMap[id];
      if (taskIndex != null) {
        return Math.floor(taskIndex / this.countPerPage) + 1;
      } else {
        return 0;
      }
    };
    TaskBook.prototype.addTask = function(newTask) {
      newTask.id = createUuid();
      newTask.added = now();
      this.idMap[newTask.id] = this.tasks.length;
      this.tasks.push(newTask);
      return this.onChange();
    };
    TaskBook.prototype.editTask = function(task) {
      var taskIndex;
      taskIndex = this.idMap[task.id];
      if (taskIndex != null) {
        this.tasks[taskIndex] = task;
        task.modified = now();
        return this.onChange();
      }
    };
    TaskBook.prototype.cancelTask = function(id) {
      var task;
      task = this.getTask(id);
      if ((task != null) && task.status !== "canceled") {
        task.status = "canceled";
        task.canceled = now();
        return this.onChange();
      }
    };
    TaskBook.prototype.startTask = function(id) {
      var task;
      task = this.getTask(id);
      if ((task != null) && task.status !== "active") {
        task.status = "active";
        task.timeron = now();
        return this.onChange();
      }
    };
    TaskBook.prototype.completeTask = function(id) {
      var task;
      task = this.getTask(id);
      if ((task != null) && task.status !== "done") {
        task.status = "done";
        task.completed = now();
        if (task.timeon != null) {
          task.timer += task.completed - task.timeron;
          return delete task.timeron;
        }
      }
    };
    TaskBook.prototype.holdTask = function(id) {
      var task;
      task = this.getTask(id);
      if (task != null) {
        task.status = "hold";
        return this.addTask({
          name: task.name,
          note: task.note,
          status: "next"
        });
      }
    };
    TaskBook.prototype.postponeTask = function(id) {
      var task;
      task = this.getTask(id);
      if (task != null) {
        task.status = "postponed";
        return this.onChange();
      }
    };
    TaskBook.prototype.postponePage = function(pageNumber) {
      var changed, page, task, _i, _len;
      page = this.getPage(pageNumber);
      changed = fales;
      for (_i = 0, _len = tasks.length; _i < _len; _i++) {
        task = tasks[_i];
        if (task.status === "next") {
          task.status = "postponed";
          changed = true;
        }
      }
      if (changed) {
        return this.onChange();
      }
    };
    TaskBook.prototype.workflow = {
      next: {
        start: "active",
        cancel: "canceled",
        complete: "done",
        postpone: "postponed"
      },
      active: {
        cancel: "canceled",
        complete: "done",
        hold: "hold"
      },
      postponed: {
        start: "active",
        cancel: "canceled",
        complete: "done"
      },
      hold: {},
      canceled: {},
      done: {}
    };
    TaskBook.prototype.loadTasks = function() {
      var _ref;
      return this.tasks = (_ref = MyStorage.getItem("tasks")) != null ? _ref : [];
    };
    TaskBook.prototype.saveTasks = function() {
      return MyStorage.setItem("tasks", this.tasks);
    };
    TaskBook.prototype.onChange = function() {
      return this.saveTasks();
    };
    return TaskBook;
  })();
  return new TaskBook();
});