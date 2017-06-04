#!/usr/bin/env node

'use strict';

// The necesities
var fs = require('fs');
var path = require('path');
var moment = require('moment');
var prompt = require('cli-prompt');

// Fun colors :-)
var red = '\x1b[31m';
var green = '\x1b[32m';
var yellow = '\x1b[33m';
var reset = '\x1b[0m';

// Our current vacation time.
var timeObject = require(path.resolve(__dirname, 'vacation.json'));

/*
 * Show the Data.
 */
var showInfo = function() {
  // Total Days Left.
  var totalLeft = timeObject.totalAllotted - timeObject.daysTakenOff;
  var currentWeek = moment().week();
  var weeksInYear = moment().isoWeeksInYear();

  // The current week multiplied by how much time accrued per week.
  var accruedDays = currentWeek * (timeObject.totalAllotted / weeksInYear);

  console.log(green + 'Total Vacation Days: ', timeObject.totalAllotted);
  console.log(red + 'Days Taken Off: ', timeObject.daysTakenOff);
  if(timeObject.accrued) {
    console.log(green + 'Total days you\'ve accrued so far: ', accruedDays.toFixed(2));
    console.log(yellow + 'Total days left (Taken vs Accrued): ', (accruedDays - timeObject.daysTakenOff).toFixed(2));
  }
  console.log(yellow + 'Days left from your year\'s total.', totalLeft);
  console.log(reset);
}

/*
 * Add or Subtract Data.
 * @param {Object} change
 * @param {String} prompt
 * @return {Null}
 */
var addSubtract = function(change, prompt) {
  var state = timeObject;
  if (!isNaN(prompt)) {
    var newTime = Number(state[change]) + Number(prompt);
    state[change] = newTime;
    fs.writeFile(path.resolve(__dirname, 'vacation.json'), JSON.stringify(state));
  } else {
    console.log('I didn\'t know how many days to add.');
  }
}

/*
 * Set up our vaction object if we haven't done so!
 */
if (!timeObject.setup) {
  prompt.multi(
    [
      {
        'label': 'Let\'s setup your tracker. Does your vacation accrue over time?',
        key: 'accrued',
        type: 'boolean',
      },
      {
        label: 'How many days do you receive a year?',
        key: 'totalAllotted',
        type: 'number',
      },
      {
        label: 'How many days have you taken off yet?',
        key: 'daysTakenOff',
        type: 'number',
      }
    ],
    function(data) {
      timeObject.accrued = data.accrued;
      timeObject.totalAllotted = data.totalAllotted;
      timeObject.daysTakenOff = data.daysTakenOff;
      timeObject.setup = true;
      console.log('Great! You\'re ready to go!');
      fs.writeFile(path.resolve(__dirname, 'vacation.json'), JSON.stringify(timeObject));
      showInfo();
    },
    console.error
  );
}

// Add / Subtract to total days Off Given.
if(process.argv.indexOf("-addTimeOff") != -1){ // Does our flag exist?
  var addTimeOff = process.argv[process.argv.indexOf("-addTimeOff") + 1];
  addSubtract('totalAllotted',addTimeOff);
}

// Add / Subtract to days you've taken off.
if(process.argv.indexOf("-takeTime") != -1){ // Does our flag exist?
  var timeOff = process.argv[process.argv.indexOf("-takeTime") + 1];
  addSubtract('daysTakenOff', timeOff);
}

// Change whether time is accrued.
if(process.argv.indexOf("-accrued") != -1){ // Does our flag exist?
  var verbiage = (timeObject.accrued) ? 'Your time no longer is accrued' : 'Your time is now accrued';
  timeObject.accrued = ! timeObject.accrued;
  console.log(verbiage);
  fs.writeFile(path.resolve(__dirname, 'vacation.json'), JSON.stringify(timeObject));
}

// Show the help
if(process.argv.indexOf("-h") != -1){
  console.log(green + '   FLAGS.....' + reset);
  console.log('   -addTimeOff:    Add (positive number) or subtract (negative number) from your total days given this year.');
  console.log('   -takeTime:      Add (positive number) or subtract (negative number) from the days you\'ve taken off this year.');
  console.log('   -accrued:       Toggle whether your time is accrued throught the year.');
}

if (process.argv.indexOf("-h") === -1 && timeObject.setup) {
  showInfo();
}
