// Create calendar when document is ready
$(document).ready(function() {
    
// We will refer to $calendar in future code
var $calendar = $("#calendar").fullCalendar({


// Start of calendar OPTIONS
header: {
    left: 'title',
    right: 'today,month,agendaDay,agendaWeek prev,next'
 },

//////////SELECT
// Make possible to respond to clicks and selections
selectable: true,
    
// This is the callback that will be triggered when a selection is made
 select: function(start, end, jsEvent, view) {
     alert(start.format("MM/DD/YYYY hh:mm a") + " to " + end.format("MM/DD/YYYY h\
     h:mm a") + " in view " + view.name);
 },   
    
// This is the callback that will be triggered when a selection is made.
// It gets start and end date/time as part of its arguments
select: function(start, end, jsEvent, view) {
    // Ask for a title. If empty it will default to "New event"
    var title = prompt("Enter a title for this event", "New event");
        console.log(title)
    // If did not pressed Cancel button
    if (title != null) {
    // Create event
    var event = {
    title: title.trim() != "" ? title : "New event",
    start: start,
    end: end
    };
    // Push event into fullCalendar's array of events
    // and displays it. The last argument is the
    // "stick" value. If set to true the event
    // will "stick" even after you move to other
    // year, month, day or week.
    $calendar.fullCalendar("renderEvent", event, true);
    };
    // Whatever happens, unselect selection
    $calendar.fullCalendar("unselect");
  }, // End select callback

//////////EDIT
// Make events editable, globally
editable : true,
    
// Callback triggered when we click on an event
eventClick: function(event, jsEvent, view){

    // Ask for a title. If empty it will default to "New event"
    var newTitle = prompt("Enter a new title for this event", event.title);

    // If did not pressed Cancel button
    if (newTitle != null) {
    // Update event
    event.title = newTitle.trim() != "" ? newTitle : event.title;
    // Call the "updateEvent" method
    $calendar.fullCalendar("updateEvent", event);
    }
  } // End callback eventClick
} // End of calendar options
);
});

