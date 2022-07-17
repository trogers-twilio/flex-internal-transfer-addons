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

export const getQueueHoopForToday = (queueSid) => {
  const hoops = manager.store.getState()['internal-transfer-addons']?.hoopData?.hoopData;

  if (!hoops) {
    return;
  }

  const queueHoop = hoops[queueSid];

  if (!queueHoop) {
    return;
  }

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

  const weekday = formattedDateParts.find(d => d.type === 'weekday')?.value;;
  const month = formattedDateParts.find(d => d.type === 'month')?.value;
  const day = formattedDateParts.find(d => d.type === 'day')?.value;
  const monthDay = `${month} ${day}`;
  const hour = formattedDateParts.find(d => d.type === 'hour')?.value;
  const timezoneName = formattedDateParts.find(d => d.type === 'timeZoneName')?.value;

  const queueName = queueHoop.friendlyName;
  const matchedHoop = queueHoop.matchedHoop;
  const queueOpenHour = queueHoop[weekday].open;
  const queueCloseHour = queueHoop[weekday].close;
  const queueHolidays = queueHoop.holidays;

  const isTodayHoliday = Array.isArray(queueHolidays) && queueHolidays.includes(monthDay);

  const isQueueClosed = isTodayHoliday
    || hour < queueOpenHour
    || hour >= queueCloseHour

  const formatHour = (hourToFormat) => {
    return hourToFormat === 0
      ? 12
      : hourToFormat > 12
        ? hourToFormat - 12
        : hourToFormat;
  };

  const openHourDayPeriod = queueOpenHour < 12 ? 'AM' : 'PM';
  const closeHourDayPeriod = queueCloseHour < 12 ? 'AM' : 'PM';
  const formattedOpenHour = `${formatHour(queueOpenHour)}:00 ${openHourDayPeriod}`;
  const formattedCloseHour = `${formatHour(queueCloseHour)}:00 ${closeHourDayPeriod}`;
  const shortOpenHour = `${formatHour(queueOpenHour)} ${openHourDayPeriod}`;
  const shortCloseHour = `${formatHour(queueCloseHour)} ${closeHourDayPeriod}`;

  return {
    matchedHoop,
    queueName,
    queueSid,
    queueOpenHour: formattedOpenHour,
    queueCloseHour: formattedCloseHour,
    shortOpenHour,
    shortCloseHour,
    timezoneName,
    isQueueClosed,
    isTodayHoliday
  };
}
