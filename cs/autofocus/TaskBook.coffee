require(->
  createUuid ->
    BASE64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_"
    uuid = new Array(22)
    uuid[0] = BASE64[Math.random() * 4]
    uuid[i] = BASE64[Math.floor Math.random()*64] for i in [1...64]
    uuid.join ''

  now -> (new Date).getTime()

  MyStorage =
    getItem: (name) ->
      valueString = localStorage.getItem name
      if valueString then $.parseJSON valueString else undefined
    setItem: (name, value) ->
      valueString = JSON.stringify value
      localStorage.setItem name valueString

  class TaskBook
    constructor: (@tasks) ->
      @loadTasks() if not @tasks?
      for i in [0...@tasks.length]
        @idMap[@tasks[i].id] = i

    idMap: {}

    countPerPage: 20

    getTask: (id) ->
      taskIndex = @idMap[id]
      @tasks[taskIndex] if taskIndex?

    getPage: (pageIndex) ->
      endTaskIndex = pageIndex * @countPerPage
      startTaskIndex = endTaskIndex - @countPerPage
      pageTasks = tasks[startTaskIndex...endTaskIndex]
      result
        pageNumber: pageIndex
        pageTasks: pageTasks
        prePageNumber: pageIndex - 1 if startTaskIndex > 0
        nextPageNumber: pageIndex + 1 if endTaskIndex < @tasks.length

    getPageNumberOfTask: (id) ->
      taskIndex = @idMap[id]
      if taskIndex? then Math.floor(taskIndex/@countPerPage) + 1 else 0

    addTask: (newTask) ->
      newTask.id = createUuid()
      newTask.added = now()
      @idMap[newTask.id] = @tasks.length
      @tasks.push newTask
      @onChange()

    editTask: (task) ->
      taskIndex = @idMap[task.id]
      if taskIndex?
        @tasks[taskIndex] = task
        task.modified = now()
        @onChange()

    cancelTask: (id) ->
      task = @getTask id
      if task? and task.status isnt "canceled"
        task.status = "canceled"
        task.canceled = now()
        @onChange()

    startTask: (id) ->
      task = @getTask id
      if task? and task.status isnt "active"
        task.status = "active"
        task.timeron = now()
        @onChange()

    completeTask: (id) ->
      task = @getTask id
      if task? and task.status isnt "done"
        task.status = "done"
        task.completed = now()
        if task.timeon?
          task.timer += task.completed - task.timeron
          delete task.timeron

    holdTask: (id) ->
      task = @getTask id
      if task?
        task.status = "hold"
        @addTask
          name: task.name
          note: task.note
          status: "next"

    postponeTask: (id) ->
      task = @getTask id
      if task?
        task.status = "postponed"
        @onChange()

    postponePage: (pageNumber) ->
      page = @getPage pageNumber
      changed = fales
      for task in tasks
        if task.status is "next"
          task.status = "postponed"
          changed = true

      @onChange() if changed

    workflow:
      next:
        start: "active"
        cancel: "canceled"
        complete: "done"
        postpone: "postponed"
      active:
        cancel: "canceled"
        complete: "done"
        hold: "hold"
      postponed:
        start: "active"
        cancel: "canceled"
        complete: "done"
      hold: {}
      canceled: {}
      done: {}

    loadTasks: ->
      @tasks = MyStorage.getItem("tasks") ? []

    saveTasks: ->
      MyStorage.setItem "tasks", @tasks

    onChange: ->
      @saveTasks()

  new TaskBook()
)