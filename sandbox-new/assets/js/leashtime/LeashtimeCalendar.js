(function (namespace, $) {
    "use strict";

    var all_visits;
    var petOwnerProfile;
    var surchargeItems;
    var serviceList;
    var timeWindowList;
    var event_visits = [];
    
    var LeashtimeCal = function () {
        var o = this;
        $(document).ready(function () {
            $.ajax({
                "url" : "http://localhost:3300",
                "type" : "GET",
                "data" : {"type" : "visits"},
                "dataTYPE" : "JSON"
            }).done((data)=> {

                surchargeItems = LT.getSurchargeItems(data);
                all_visits = LT.getVisits(data);
                serviceList = LT.getServiceItems(data);
                timeWindowList = LT.getTimeWindows(data);

                all_visits.forEach((visit) => {
                    let visitInfo = visit;
                    let eventTitle = visit.service;
                    let eventStart = visit.time_window_start;
                    let eventEnd = visit.time_window_end;
                    let eventDateStart = visit.date + ' ' + eventStart;
                    let eventDateEnd = visit.date + ' ' + eventEnd;
                    let visitColor = '';
                    let visitURL = '';

                    if(visit.status == 'canceled') {
                        visitColor = 'red';
                    } else if (visit.status == 'completed') {
                        visitColor = 'green';
                        visitURL ='<LINK TO VISIT REPORT>';
                    } else if (visit.status  == 'future') {
                        visitColor = 'blue';
                    } else if (visit.status == 'late') {
                        visitColor = 'orange';
                    }

                    let event = {
                        id : visitInfo.appointmentid,
                        title: eventTitle,
                        start : eventDateStart,
                        end : eventDateEnd,
                        color : visitColor
                    };

                    event_visits.push(event);

                });
                o.initialize();
            })

            $.ajax({
                  "url" : "http://localhost:3300",
                  "type" : "GET",
                  "data" : {"type" : "clients"},
                  "dataTYPE" : "JSON"
            }).done((clientdata)=>{
                  petOwnerProfile = LT.getClientProfileInfo(clientdata);

            })
            
        });

    };
    var p = LeashtimeCal.prototype;
    p.initialize = function () {
        this._enableEvents();
        this._initEventslist();
        this._initCalendar();
        this._displayDate();
    };
    p._enableEvents = function () {
        var o = this;

        $('#calender-prev').on('click', function (e) {
            console.log('Calendar Prev clicked');
            o._handleCalendarPrevClick(e);
        });
        $('#calender-next').on('click', function (e) {
           console.log('Calendar Next clicked');
            o._handleCalendarNextClick(e);
        });
        $('.nav-tabs li').on('show.bs.tab', function (e) {
            console.log('Nav tabs clicked');
            o._handleCalendarMode(e);
        });

        $('#form-modal2').on('click', function(e) {
            console.log('Calendar Modal clicked');
            o._clickModal(e);
        });
    };
    p._handleCalendarPrevClick = function (e) {
        $('#calendar').fullCalendar('prev');
        this._displayDate();
    };
    p._handleCalendarNextClick = function (e) {
        $('#calendar').fullCalendar('next');
        this._displayDate();
    };
    p._handleCalendarMode = function (e) {
        $('#calendar').fullCalendar('changeView', $(e.currentTarget).data('mode'));
    };
    p._displayDate = function () {
        var selectedDate = $('#calendar').fullCalendar('getDate');
        $('.selected-day').html(moment(selectedDate).format("dddd"));
        $('.selected-date').html(moment(selectedDate).format("DD MMMM YYYY"));
        $('.selected-year').html(moment(selectedDate).format("YYYY"));
    };
    p._clickDate = function () {
        var selectedDate = $('#calendar').fullCalendar('getDate');
        var visitDiv = $('#visitDiv')
            $('.selected-day').html(moment(selectedDate).format("dddd"));
            $('.selected-date').html(moment(selectedDate).format("DD MMMM YYYY"));
            $('.selected-year').html(moment(selectedDate).format("YYYY"));
    };
    p._clickModal = function() {
        var selectedDate = $('#calendar').fullCalendar('getDate');
        console.log('Modal clicked');
    }
    p._initEventslist = function () {
        if (!$.isFunction($.fn.draggable)) {
            return;
        }
        var o = this;
        let serviceDiv = document.getElementById("serviceList");
        serviceList.forEach((service) => {
            //var eventObject ={
            //    title: service.serviceName
            //    className: serviceLI.data('className')
           // };
            /*$(this).data('eventObject',eventObject);
            $(this).draggable({
                zIndex: 999,
                revert: true,
                revertDuration: 0
            });*/
        });

        $('.list-events li ').each(function () {
            console.log($(this).text());
            // create an Event Object
            // it doesn't need to have a start or end
            var eventObject = {
                title: $.trim($(this).text()), 
                className: $.trim($(this).data('className'))
            };

            $(this).data('eventObject', eventObject);
            $(this).draggable({
                zIndex: 999,
                revert: true, 
                revertDuration: 0, 
            });
        });
    };

    p._initCalendar = function (e) {
        if (!$.isFunction($.fn.fullCalendar)) {
            return;
        }

        var date = new Date();
        var d = date.getDate();
        var m = date.getMonth();
        var y = date.getFullYear();

        //var event_visits = [];
        var calendar = $('#calendar').fullCalendar('getCalendar');

        calendar.fullCalendar({
            height: 700,
            header: false,
            selectable: true,
            events: event_visits,
            editable : true,

            /*select : function(start, end, allDay) {
                var dialogTitle = $('#calCreateEventDialog').find('#eventDescription ').val().trim() != "" ? $('#eventDescription').val(): "Appointment";
                $('#calCreateEventDialog').find('#eventTitle').val("Appointment");
                $('#calCreateEventDialog').find('#eventDescription').html("<b>" + start.format("dddd, MMMM Do YYYY") + " from " + start.format("hh:mm a") + " to " + end.format("hh:mm a") + "</b>");
                $('#calCreateEventDialog').data({ 'start':start, 'end':end });
                $('#calCreateEventDialog').dialog({title: "Event: " + dialogTitle});
                $('#calCreateEventDialog').dialog('open');
            },

            eventClick : function(event) {
                $('#calModifyEventDialog').find('#eventDescription').html("<b>",event.start.format("dddd, MMMM Do YYYY") + " from " + event.start.format("hh:mm a") + " to " + event.end.format("hh:mm a") + "</b>");
                $('#calModifyEventDialog').data({'event':event});
                $('#calModifyEventDialog').dialog({title: "Event: " + event.title});
                $('#calModifyEventDialog').find("#eventTitle").val(event.title);
                $('#calModifyEventDialog').dialog('open');
            },*/

            select: function(start, end, jsEvent, view) {
                console.log('Selected day on Calendar');
                $('#formModal').modal('show');
            },

            eventClick:  function(event, jsEvent, view) {
                console.log('Event full calendar clicked: ' + event.id);
                $('#formModal2').modal('show');
                let visitInfoTag = document.getElementById("formModalLabelEdit");
                all_visits.forEach((visit) => {

                    if (visit.appointmentid == event.id) {
                        visitInfoTag.innerHTML = visit.date + ': ' + visit.service;
                    }

                });
                
            },



            /*select: function(start, end, jsEvent, view) {
                    var title = prompt("Enter a title for this event", "New event");
                    if (title != null) {
                        var event = {
                            title: title.trim() != "" ? title : "New event",
                            start: start,
                            end: end
                        };
                        calendar.fullCalendar("renderEvent", event, true);
                    };
                    calendar.fullCalendar("unselect");
            }, */
            /*eventClick: function(event, jsEvent, view){
                var newTitle = prompt("Visit ID: ", event.id);

                if (newTitle != null) {
                    event.title = newTitle.trim() != "" ? newTitle : event.title;
                    calendar.fullCalendar("updateEvent", event);
                }
            }, */
            eventRender: function(event, element){

                console.log('Event render');

                $(element).find(".fc-content").append("<div style='float:right'><a class='delete-link' href='javascript:remove_event(\""
                        + event._id + "\")'>Delete</a></div>");

                var $calendar = $("#calendar").fullCalendar("getCalendar");

                 function remove_event(eventID){
                     var remove = confirm("Remove event ID " + eventID + "?");

                     if(remove == true){
                        calendar.fullCalendar("removeEvents", eventID);
                     }
                 }
            },
            //eventRender: function (event, element) {
            //   element.find('#date-title').html(element.find('span.fc-event-title').text());
            //},
            views: {
                basic: {
                  // options apply to basicWeek and basicDay views
                },
                agenda: {
                  // options apply to agendaWeek and agendaDay views
                },
                week: {
                  // options apply to basicWeek and agendaWeek views
                },
                day: {
                  // options apply to basicDay and agendaDay views
                }
            },
            droppable: true,
            drop: function (date, allDay) { 
                var originalEventObject = $(this).data('eventObject');
                // we need to copy it, so that multiple events don't have a reference to the same object
                var copiedEventObject = $.extend({}, originalEventObject);

                // assign it the date that was reported
                copiedEventObject.start = date;
                copiedEventObject.allDay = allDay;
                copiedEventObject.className = originalEventObject.className;

                // render the event on the calendar
                // the last `true` argument determines if the event "sticks" (http://arshaw.com/fullcalendar/docs/event_rendering/renderEvent/)
                $('#calendar').fullCalendar('renderEvent', copiedEventObject, true);

                // is the "remove after drop" checkbox checked?
                if ($('#drop-remove').is(':checked')) {
                    // if so, remove the element from the "Draggable Events" list
                    $(this).remove();
                }
            },
        });
    };

    var calendar = $('#calendar').fullCalendar('getCalendar');
    //calendar.on('dayClick', function(date, jsEvent, view) {
     //   console.log('clicked on ' + date.format());
    //});

    /*$('#calCreateEventDialog').dialog({
        resizable: false,
        autoOpen: false,
        modal: true,
        width: 500,
        buttons: {
            Create: function() {
                
               var event = {
                    title: eventTitle != "" ? eventTitle: "Appointment",
                    color: 'DeepSkyBlue',
                    textColor: 'black',
                    start: start.format(),
                    end: end.format()
                }
 
                $calendar.fullCalendar('renderEvent', event, true );
                $calendar.fullCalendar('unselect');
                $(this).dialog('close');
            },
            Cancel: function() {
                $(this).dialog('close');
            }
        }
    });*/

    namespace.LeashtimeCal = new LeashtimeCal;

}(this.materialadmin, jQuery)); // pass in (namespace, jQuery):
