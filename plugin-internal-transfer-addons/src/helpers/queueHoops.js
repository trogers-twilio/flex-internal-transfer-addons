import { Manager } from '@twilio/flex-ui';

const manager = Manager.getInstance();

const getHoopsAsset = async (myTz) => {
  const fetchUrl = `https://${process.env.REACT_APP_SERVERLESS_DOMAIN}/fetch-queue-hoops`;

  const fetchBody = {
    Token: manager.store.getState().flex.session.ssoTokenPayload.token,
    clientTz: myTz
  };
  const fetchOptions = {
    method: 'POST',
    body: new URLSearchParams(fetchBody),
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
    }
  };

  let resText;
  try {
    const response = await fetch(fetchUrl, fetchOptions);
    resText = await response.json();
    return resText;
  } catch (error) {
    console.error('Failed to get asset file');
  }
};

export const loadHoops = (storeHoopsAction) => {
  getHoopsAsset(Intl.DateTimeFormat().resolvedOptions().timeZone).then(response => {
    manager.store.dispatch(storeHoopsAction(response));
  });
};

// Evaluates Hours Of Operation data and compares to "now"
// to create a Queue filter that shows only available Queues
export const evalHoops = () => {

  // The HOOP data
  const theData = manager.store.getState()['internal-transfer-addons'].hoopData.hoopData;

  // Need to find queue names that are open now!
  // Where "now" is translated to the timezone
  // used in the Hours Of Operation json

  const formatOptions = {
    timeZone: theData.timezone,
    weekday: 'short',
    hour: 'numeric',
    hour12: false,
    month: 'short',
    day: 'numeric'
  };
  const formatter = new Intl.DateTimeFormat('en-US', formatOptions);

  // Get the current time, day of the week, and month/day for agent's time zone
  const formattedDate = formatter.format(new Date()).split(', ');

  const hour = formattedDate[2];
  const day = formattedDate[0];
  const monthDay = formattedDate[1];

  const invalidKeys = ['timezone', 'holidays'];

  // Convert to query syntax
  let newFilters = [];
  let subAry = [];
  let i = 1;

  for( const [key, value] of Object.entries(theData)) {
    // This means value is object listing days and open/close
    if(!(invalidKeys.includes(key)) 
        && value[day].open <= hour 
        && value[day].close > hour
        && !(value.holidays.includes(monthDay))) {
      subAry.push('"' + key + '"');
    }
    if(subAry.length == 29) {
      newFilters.push(subAry.join(", "));
      subAry = [];
    }
  }

  if(subAry.length > 0) {
    newFilters.push(subAry.join(", "));
  }

  let newQuery = 'data.queue_name IN [' + newFilters.join('] OR data.queue_name IN [') + ']';

  return newQuery;
};

export const getClosedQueues = () => {
  // The HOOP data
  const theData = manager.store.getState()['internal-transfer-addons'].hoopData.hoopData;

  const formatOptions = {
    timeZone: theData.timezone,
    weekday: 'short',
    hour: 'numeric',
    hour12: false,
    month: 'short',
    day: 'numeric'
  };
  const formatter = new Intl.DateTimeFormat('en-US', formatOptions);

  // Get the current time, day of the week, and month/day for agent's time zone
  const formattedDate = formatter.format(new Date()).split(', ');

  const hour = formattedDate[2];
  const day = formattedDate[0];
  const monthDay = formattedDate[1];

  const invalidKeys = ['timezone', 'holidays'];

  const closedQueues = new Map();

  for( const [key, value] of Object.entries(theData)) {
    if (invalidKeys.includes(key)) {
      // No need to evaluate open/close hours since this is not a queue
      continue;
    }
    
    // This means value is object listing days and open/close
    const queueName = key;
    const queueSid = value.sid;
    const queueOpenHour = value[day].open;
    const queueCloseHour = value[day].close;
    const queueHolidays = value.holidays;

    const isTodayHoliday = queueHolidays.includes(monthDay);

    const isQueueClosed = isTodayHoliday
      || hour < queueOpenHour
      || hour >= queueCloseHour;

    if(isQueueClosed) {
      console.debug('getClosedQueues, adding queue to closedQueues:', queueSid, queueName);
      closedQueues.set(queueSid, {
        queueName,
        queueOpenHour,
        queueCloseHour,
        isTodayHoliday
      });
    }
  }

  return closedQueues;
};

export const getQueueHoopForToday = (queueSid) => {
  const hoops = manager.store.getState()['internal-transfer-addons'].hoopData.hoopData;

  const dateFormatOptions = {
    timeZone: hoops.timezone,
    timeZoneName: 'short',
    weekday: 'short',
    hour: 'numeric',
    hour12: false,
    month: 'short',
    day: 'numeric'
  };
  const dateFormatter = new Intl.DateTimeFormat('en-US', dateFormatOptions);

  // Get the current date formatted for defined timezone and split into parts
  const formattedDateParts = dateFormatter.formatToParts(new Date());
  console.debug('getQueueHoopForToday, formattedDateParts24H:', formattedDateParts);

  const weekday = formattedDateParts.find(d => d.type === 'weekday')?.value;;
  const month = formattedDateParts.find(d => d.type === 'month')?.value;
  const day = formattedDateParts.find(d => d.type === 'day')?.value;
  const monthDay = `${month} ${day}`;
  const hour = formattedDateParts.find(d => d.type === 'hour')?.value;
  const timezoneName = formattedDateParts.find(d => d.type === 'timeZoneName')?.value;

  const queueHoop = hoops[queueSid];

  console.debug('getQueueHoopForToday, queueHoop:', queueHoop);


  if (!queueHoop) {
    // Unable to find matching queue in the HOOP data, so defaulting to not closed
    return false;
  }

  const queueName = queueHoop.friendlyName;
  const queueOpenHour = queueHoop[weekday].open;
  const queueCloseHour = queueHoop[weekday].close;
  const queueHolidays = queueHoop.holidays;

  console.debug('getQueueHoopForToday, queueOpenHour:', queueOpenHour);
  console.debug('getQueueHoopForToday, queueCloseHour:', queueCloseHour);

  const isTodayHoliday = Array.isArray(queueHolidays) && queueHolidays.includes(monthDay);

  const isQueueClosed = isTodayHoliday
    || hour < queueOpenHour
    || hour >= queueCloseHour

  const openHourDayPeriod = queueOpenHour < 12 ? 'AM' : 'PM';
  const closeHourDayPeriod = queueCloseHour < 12 ? 'AM' : 'PM';
  const formattedOpenHour = `${queueOpenHour <= 12 ? queueOpenHour : queueOpenHour - 12}:00 ${openHourDayPeriod}`;
  const formattedCloseHour = `${queueCloseHour <= 12 ? queueCloseHour : queueCloseHour - 12}:00 ${closeHourDayPeriod}`;

  return {
    queueName,
    queueOpenHour: formattedOpenHour,
    queueCloseHour: formattedCloseHour,
    timezoneName,
    isQueueClosed,
    isTodayHoliday
  };
}
