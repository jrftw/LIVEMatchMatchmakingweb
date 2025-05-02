export const calendarConfig = {
  defaultView: 'timeGridWeek',
  headerToolbar: {
    left: 'prev,next today',
    center: 'title',
    right: 'dayGridMonth,timeGridWeek,timeGridDay'
  },
  slotMinTime: '08:00:00',
  slotMaxTime: '22:00:00',
  slotDuration: '00:30:00',
  allDaySlot: false,
  expandRows: true,
  height: 'auto',
  eventTimeFormat: {
    hour: '2-digit',
    minute: '2-digit',
    meridiem: false
  },
  eventColor: '#2196f3',
  eventTextColor: '#ffffff',
  eventBorderColor: '#1976d2',
  eventDisplay: 'block',
  eventConstraint: {
    startTime: '08:00',
    endTime: '22:00'
  }
};

export const eventTypes = {
  match: {
    color: '#2196f3',
    textColor: '#ffffff',
    borderColor: '#1976d2'
  },
  tournament: {
    color: '#4caf50',
    textColor: '#ffffff',
    borderColor: '#388e3c'
  },
  practice: {
    color: '#ff9800',
    textColor: '#ffffff',
    borderColor: '#f57c00'
  },
  meeting: {
    color: '#9c27b0',
    textColor: '#ffffff',
    borderColor: '#7b1fa2'
  }
}; 