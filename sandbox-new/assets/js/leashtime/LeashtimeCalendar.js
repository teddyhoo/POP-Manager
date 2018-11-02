(function (namespace, $) {
    "use strict";

    var all_visits = [];
    var event_visits = [];
    var startDateService;
    var endDateService;
    var currentPetsChosen = {};
    var currentTimeWindowBegin;
    var currentTimeWindowEnd;
    var currentServiceChosen;

    function getTodayString(todayDate) {
        let clickDay = new Date(todayDate);
        let daysOfWeek = ['MON','TUE','WED','THU','FRI','SAT','SUN'];
        let dayWeek = daysOfWeek[clickDay.getDay()];
        return dayWeek;
    }
    function getTodayNum(todayDate) {
        let clickDay = new Date(todayDate);
        return clickDay.getDate()+1;
    }
    function getMonthString(todayDate) {
        let clickDate = new Date(todayDate);
        let months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
        let monthString = months[clickDate.getMonth()];
        return monthString;
    }

    var LeashtimeCal = function () {
        var o = this;
        var petOwnerProfile;
        var surchargeItems =[];
        var serviceList = [];
        var timeWindowList =[];

        function populateServiceList(serviceListItems) {

            let serviceEl = document.getElementById('serviceList');

            serviceListItems.forEach((serviceItem)=> {
                let listEl = document.createElement('li');
                listEl.setAttribute('class','tile lightgrey ui-draggable ui-draggable-handle padding');
                listEl.setAttribute('data-class-name', 'event-info');
                        
                let divElTileContent = document.createElement('div');
                divElTileContent.setAttribute('class', 'tile-content');

                let divElTileText = document.createElement('div');
                divElTileText.setAttribute('class','tileText');
                divElTileText.setAttribute('id', serviceItem.serviceCode);
                divElTileText.innerHTML = serviceItem.serviceName;

                divElTileContent.appendChild(divElTileText);
                listEl.appendChild(divElTileContent);
                serviceEl.appendChild(listEl);
            });
        }
        function chooseTimeWindow(event, beg, end) {
            event.preventDefault();
            currentTimeWindowBegin = beg;
            currentTimeWindowEnd = end;
        }
        function chooseService(event, serviceID) {
            event.preventDefault();
            currentServiceChosen = serviceID;
        }
        function choosePet(event, petID) {

            if(currentPetsChosen[petID] == 'on') {
                currentPetsChosen[petID] = 'off';
            } else  {
                currentPetsChosen[petID] = 'on';
            }
        }

        function processRequestService(event) {

            let petKeys = Object.keys(currentPetsChosen);
                petKeys.forEach((chosen) => {
                console.log(chosen  + ' -> ' + currentPetsChosen[chosen]);
            });

            let invoice = document.getElementById('invoice');
            let newRow = document.createElement('tr');
            let newDateRow = document.createElement('td');
            newDateRow.innerHTML = getMonthString(new Date(startDateService)) + ' ' +getTodayNum(new Date(startDateService));

            let newServiceRow = document.createElement('td');
            newServiceRow.setAttribute('class','text-center');
            let newChargeRow = document.createElement('td');
            newChargeRow.setAttribute('class','text-right');
            serviceList.forEach((service)=> {
                if (currentServiceChosen == service.serviceCode) {
                    newServiceRow.innerHTML = service.serviceName;
                    newChargeRow.innerHTML = service.serviceCharge;
                }
            });

            let newTimeWindowRow = document.createElement('td');
            newTimeWindowRow.setAttribute('class','text-right');
            newTimeWindowRow.innerHTML = currentTimeWindowBegin + '-' + currentTimeWindowEnd;

            newRow.appendChild(newDateRow);
            newRow.appendChild(newServiceRow);
            newRow.appendChild(newTimeWindowRow);
            newRow.appendChild(newChargeRow);
            invoice.appendChild(newRow);

            let cancelVisitRequestButton = document.getElementById('cancelServiceRequest');
            let sendVisitRequestButton = document.getElementById('sendVisitRequest');

            cancelVisitRequestButton.addEventListener('click', function() {
                if (invoice.hasChildNodes) {
                    while(invoice.firstChild) {
                        invoice.removeChild(invoice.firstChild);
                    }
                }
            });

            $('#formModal2').modal('show');


        }
        function makeServicePicker(serviceList, timeWindowList, petOwn) {

            let servicePicker = document.getElementById('selectService');
            let timeWindowPicker = document.getElementById('timeWindowPicker');
            let todayDatePicker = document.getElementById('dateToday');
            let petPicker = document.getElementById('petPicker')
            let endDatePicker = document.getElementById('untilDate');
            let requestVisit = document.getElementById('requestServiceButton');

            requestVisit.addEventListener('click', function() {processRequestService(event); });

            endDatePicker.innerHTML = 'End Date';
            endDatePicker.addEventListener('mouseleave', function(e) {
                endDateService = endDatePicker.value;
                console.log(endDatePicker.value);
            });

            timeWindowList.forEach((tw)=> {
                let timeWindow = document.createElement('a');
                timeWindow.setAttribute('href', '#');
                timeWindow.setAttribute('class', 'btn btn-default-bright');
                timeWindow.setAttribute('type','checkbox');
                timeWindow.setAttribute('role', 'checkbox');
                timeWindow.addEventListener('click', function(){chooseTimeWindow(event, tw.begin, tw.endTW);});
                timeWindow.innerHTML = tw.label;
                timeWindowPicker.appendChild(timeWindow)
            });

            serviceList.forEach((service) => {
                let serviceItem = document.createElement('a');
                let breakTag = document.createElement('br');
                serviceItem.setAttribute('href', '#');
                serviceItem.setAttribute('class','btn btn-default-bright');
                serviceItem.setAttribute('type','checkbox');
                serviceItem.setAttribute('role', 'checkbox');
                serviceItem.addEventListener('click', function() {chooseService(event, service.serviceCode);});
                serviceItem.innerHTML = service.serviceName;
                servicePicker.appendChild(serviceItem);
            });

            petOwn.pets.forEach((pet)=> {
                let petInfo = document.createElement('a');
                let breakTag = document.createElement('br');
                petInfo.setAttribute('href','#');
                petInfo.setAttribute('class','btn btn-default-bright');
                petInfo.setAttribute('type','checkbox');
                petInfo.setAttribute('role', 'checkbox');
                petInfo.addEventListener('click', function() {choosePet(event, pet.petID)});
                petInfo.innerHTML = pet.petName;
                petPicker.appendChild(petInfo);

            })
        }
        function createEvents(eventData, petOwnerInfo) {

            console.log('Create events: ' + petOwnerInfo);
            all_visits = LT.getVisits(eventData);
            surchargeItems = LT.getSurchargeItems(eventData); 
            serviceList = LT.getServiceItems(eventData);
            timeWindowList = LT.getTimeWindows(eventData);

            populateServiceList(serviceList);
            makeServicePicker(serviceList, timeWindowList,petOwnerInfo);

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
                    color : visitColor,
                    status : visitInfo.status,
                    sitter: visitInfo.sitter,
                };

                event_visits.push(event);
            });
        }

        $(document).ready(function () {
            $.ajax({
                "url" : "http://localhost:3300",
                "type" : "GET",
                "data" : {"type" : "visits"},
                "dataTYPE" : "JSON"
            }).done((data)=> {

                $.ajax({
                    "url" : "http://localhost:3300",
                    "type" : "GET",
                    "data" : {"type" : "clients"},
                    "dataTYPE" : "JSON"
                }).done((clientdata)=>{
                    petOwnerProfile = LT.getClientProfileInfo(clientdata);
                    createEvents(data, petOwnerProfile);
                    o.initialize();
                 })
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

        $('.list-events li ').each(function () {
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
        var calendar = $('#calendar').fullCalendar('getCalendar');

        calendar.fullCalendar({
            height: 700,
            header: false,
            selectable: true,
            events: event_visits,
            editable : true,

            select: function(start, end, jsEvent, view) {
                let monthString = getMonthString(start);
                let todayNum = getTodayNum(start);
                let todayStr = getTodayString(start);
                let dateElem = document.getElementById('dateToday');
                dateElem.innerHTML =  todayStr + ' ' +monthString + ' ' + todayNum;
                startDateService = new Date(start);
                endDateService = new Date(end);
                console.log('Start date: ' + startDateService +', end Date service: ' + endDateService);
                $('#formModal').modal('show');
            },

            eventClick:  function(event, jsEvent, view) {
                console.log('Event full calendar clicked: ' + event.status);

                all_visits.forEach((visit) => {

                    if (visit.appointmentid == event.id) {
                        if (visit.status == 'completed') {

                        } else if (visit.status == 'canceled') {

                        } else if (visit.status == 'future' || visit.status == 'late') {

                            $('#formModal2').modal('show');
                            let visitInfoTag = document.getElementById("formModalLabelEdit");
                        }
                    }
                });
                
            },
            eventRender: function(event, element){

                $(element).find(".fc-content").append("");

                var $calendar = $("#calendar").fullCalendar("getCalendar");

                 function remove_event(eventID){
                     var remove = confirm("Remove event ID " + eventID + "?");

                     if(remove == true){
                        calendar.fullCalendar("removeEvents", eventID);
                     }
                 }
            },
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
    namespace.LeashtimeCal = new LeashtimeCal;

}(this.materialadmin, jQuery)); // pass in (namespace, jQuery):
