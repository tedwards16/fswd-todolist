import $ from 'jquery';
import {
    indexTasks,
    postTask,
    deleteTask,
    markTaskActive,
    markTaskComplete
  } from "./requests.js";
  
function getLatestTask() {
  indexTasks(function (response) {
    var htmlString = response.tasks.map(function(task) {
      return (
        "<div class='d-flex justify-content-between col-12 mb-3 p-2 border rounded task' data-id='" + task.id + "'> \
        <div class='d-flex'>\
        <div class='task-content d-flex align-content-center" + (task.completed ? " completed-task" : "") + "'>\
        <input type='checkbox' class='m-1 task-checkbox' id='checkbox_" + task.id + "' data-id='" + task.id + "'>\
        <div class='align-self-center'>" +
        task.content + 
        "</div>\
        </div>\
        </div>\
        <button data-id='" + task.id +"' class='delete-button btn btn-secondary'>Delete</button>\
        </div>"
      )
    });
    $("#tasks").html(htmlString);

    loadCheckboxState();

    $("#tasks")
      .off("click", ".delete-button")
      .on("click", ".delete-button", function () {
        var taskId = $(this).data("id");
        handleDeleteClick(taskId);
      });
    
      $("#tasks")
      .off("change", ".task-checkbox")
      .on("change", ".task-checkbox", function () {
        var taskId = $(this).data("id");
        var goToChecked = $(this).prop("checked");
        handleCheckboxChange(taskId, goToChecked);
      });
  });
}

function handleDeleteClick (taskId) {
  deleteTask(taskId, function () {
    $(".task[data-id='" + taskId + "']").remove();
  });
}

function handleAddTaskClick () {
  var newTaskContent= $("#newTaskInput").val();
  if (newTaskContent) {
    postTask(newTaskContent, getLatestTask);
  }
  
  $("#newTaskInput").val("");
}

function handleCheckboxChange(taskId, goToChecked) {
  var $taskContent = $(".task[data-id='" + taskId + "'] .task-content");

  if (goToChecked) {
    markTaskComplete(taskId, function () {
      console.log("Task marked complete");
      $taskContent.addClass("completed-task");
      $("#checkbox_" + taskId).prop("checked", true);
      saveCheckboxState(taskId, true);
    });
  } else {
    markTaskActive(taskId, function () {
      console.log("Task marked active");
      $taskContent.removeClass("completed-task");
      $("#checkbox_" + taskId).prop("checked", false);
      saveCheckboxState(taskId, false);
    });
  }
}

function saveCheckboxState(taskId, checked) {
  var checkboxState = JSON.parse(localStorage.getItem("checkboxState")) || {};
  checkboxState[taskId] = checked;
  localStorage.setItem("checkboxState", JSON.stringify(checkboxState));
}

function loadCheckboxState() {
  var checkboxState = JSON.parse(localStorage.getItem("checkboxState")) || {};

  $(".task-checkbox").each(function() {
    var taskId = $(this).data("id");
    if(checkboxState[taskId]) {
      $(this).prop("checked", true);
      $(this).closest(".task-content").addClass("completed-task");
    } else {
      $(this).prop("checked", false);
      $(this).closest(".task-content").removeClass("completed-task");
    }
  })
}

$(document).on("turbolinks:load", function () {
    $("#addTaskButton").on("click", function () {
      handleAddTaskClick();
    });

    $("#newTaskInput").keypress(function(event) {
      if (event.which === 13) {
        handleAddTaskClick();
    }
    });
    
    $("#tasks").on("change", ".task-checkbox", function () {
      var taskId = $(this).data("id");
      var goToChecked = $(this).prop("checked");
      handleCheckboxChange(taskId, goToChecked);
    });

    getLatestTask();
    
});