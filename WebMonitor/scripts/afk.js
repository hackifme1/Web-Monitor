'use strict';

const l = console.log;

const DEFAULT_DETECTION_INTERVAL = 60; // seconds

let idleStartMoment=0;
var iAmGlobal = 0;
 
chrome.idle.onStateChanged.addListener(function(newState) {
  l('idle.onStateChanged()', Date(), newState);

  switch(newState) {
    case chrome.idle.IdleState.IDLE:
      idleStartMoment = Date.now() - DEFAULT_DETECTION_INTERVAL * 1_000;
    break;

    case chrome.idle.IdleState.LOCKED:
      idleStartMoment = Date.now();
    break;

    case chrome.idle.IdleState.ACTIVE:
      const idleTime = Date.now() - idleStartMoment;
	  iAmGlobal = iAmGlobal + idleTime;
	  const iAmGlobalFormatted = new Date(iAmGlobal).toJSON().slice(11, -5);
      const idleTimeFormatted = new Date(idleTime).toJSON().slice(11, -5);
      l(idleTime, idleTimeFormatted);
	  alert("Your recent AFK time :- " + idleTimeFormatted + "\nYour total AFK time since you have opened the browser :- " + iAmGlobalFormatted);
    break;
  };
});