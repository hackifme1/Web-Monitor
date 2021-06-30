'use strict';

var tabsFromBackground;
var storage = new LocalStorage();
var ui = new UI();
var totalTime, averageTime;
var tabsFromStorage;
var targetTabs;
var currentTypeOfList;
var today = new Date().toLocaleDateString("en-US");
var setting_range_days;
var setting_dark_mode;
var restrictionList;
var stat = {
    set firstDay(value) {
        document.getElementById('statFirstDay').innerHTML = value;
    },
    set averageTime(value) {
        document.getElementById('statAverageTime').innerHTML = '';
        ui.createElementsForTotalTime(value, TypeListEnum.ToDay, document.getElementById('statAverageTime'));
    },
};

document.addEventListener('DOMContentLoaded', function () {
    ui.setPreloader();

    storage.getValue(SETTINGS_INTERVAL_RANGE, function (item) { setting_range_days = item; });
    document.getElementById('btnToday').addEventListener('click', function () {
        currentTypeOfList = TypeListEnum.ToDay;
        ui.setUIForToday();
        getDataFromStorage();
    });
    document.getElementById('closeHintBtn').addEventListener('click', function () {
        document.getElementById('hintForUsers').classList.add('hide');
        storage.saveValue(SETTINGS_SHOW_HINT, false);
    });
    document.getElementById('settings').addEventListener('click', function () {
        if (chrome.runtime.openOptionsPage) {
            chrome.runtime.openOptionsPage();
        } else {
            window.open(chrome.runtime.getURL('options.html'));
        }
    });
});

firstInitPage();

function firstInitPage() {
    chrome.runtime.getBackgroundPage(function (bg) {
        setting_dark_mode = bg.setting_dark_mode;
        ui.setMode();
        tabsFromBackground = bg.tabs;
        currentTypeOfList = TypeListEnum.ToDay;
        getLimitsListFromStorage();
        getDataFromStorage();
        storage.getValue(SETTINGS_SHOW_HINT, function (item) {
            if (item)
                document.getElementById('hintForUsers').classList.remove('hide');
        });
    });
}

function getLimitsListFromStorage() {
    storage.loadTabs(STORAGE_RESTRICTION_LIST, getLimitsListFromStorageCallback);
}

function getDataFromStorage() {
    if (tabsFromBackground != undefined && tabsFromBackground != null && tabsFromBackground.length > 0)
        getTabsFromStorage(tabsFromBackground);
    else fillEmptyBlock();
}

function getDataFromStorageByDays() {
    if (tabsFromBackground != undefined && tabsFromBackground != null && tabsFromBackground.length > 0)
        getTabsByDays(tabsFromBackground);
}

function getLimitsListFromStorageCallback(items) {
    if (items !== undefined)
        restrictionList = items;
    else restrictionList = [];
}

function fillEmptyBlock() {
    ui.removePreloader();
}

function getTabsFromStorage(tabs) {
    tabsFromStorage = tabs;
    targetTabs = [];

    ui.clearUI();
    if (tabs === null) {
        ui.fillEmptyBlock('chart');
        return;
    }

    var counterOfSite;
    if (currentTypeOfList === TypeListEnum.All) {
        targetTabs = tabs.sort(function (a, b) {
            return b.summaryTime - a.summaryTime;
        });

        if (targetTabs.length > 0) {
            totalTime = getTotalTime(targetTabs);
            stat.allDaysTime = totalTime;

        } else {
            ui.fillEmptyBlock('chart');
            return;
        }

        counterOfSite = tabs.length;
    }
    if (currentTypeOfList === TypeListEnum.ToDay) {
        targetTabs = tabs.filter(x => x.days.find(s => s.date === today));
        counterOfSite = targetTabs.length;
        if (targetTabs.length > 0) {
            targetTabs = targetTabs.sort(function (a, b) {
                return b.days.find(s => s.date === today).summary - a.days.find(s => s.date === today).summary;
            });

            totalTime = getTotalTime(targetTabs);
            stat.todayTime = totalTime;
        } 
        else {
            return;
        }
    }

    if (currentTypeOfList === TypeListEnum.ToDay)
        ui.addTableHeader(currentTypeOfList, counterOfSite);

    var currentTab = getCurrentTab();

    var summaryCounter = 0;
    for (var i = 0; i < targetTabs.length; i++) {
        var summaryTime;
        var counter;
        if (currentTypeOfList === TypeListEnum.ToDay) {
            summaryTime = targetTabs[i].days.find(x => x.date == today).summary;
            if (targetTabs[i].days.find(x => x.date == today))
                counter = targetTabs[i].days.find(x => x.date == today).counter;
        }
        if (currentTypeOfList === TypeListEnum.All) {
            summaryTime = targetTabs[i].summaryTime;
            counter = targetTabs[i].counter;
        }

        summaryCounter += counter;

        if (currentTypeOfList === TypeListEnum.ToDay || (currentTypeOfList === TypeListEnum.All && i <= 30))
            ui.addLineToTableOfSite(targetTabs[i], currentTab, summaryTime, currentTypeOfList, counter);
        else{}
    }

    ui.addHrAfterTableOfSite();
    ui.createTotalBlock(totalTime, currentTypeOfList, summaryCounter);
    ui.setActiveTooltipe(currentTab);

    ui.removePreloader();
}

function getTimeIntervalList() {
    storage.getValue(STORAGE_TIMEINTERVAL_LIST, drawTimeChart);
}

function getTotalTime(tabs) {
    var total;
    if (currentTypeOfList === TypeListEnum.ToDay) {
        var summaryTimeList = tabs.map(function (a) { return a.days.find(s => s.date === today).summary; });
        total = summaryTimeList.reduce(function (a, b) { return a + b; })
    }
    if (currentTypeOfList === TypeListEnum.All) {
        var summaryTimeList = tabs.map(function (a) { return a.summaryTime; });
        total = summaryTimeList.reduce(function (a, b) { return a + b; })
    }
    return total;
}

function getTotalTimeForDay(day, tabs) {
    var total;
    var summaryTimeList = tabs.map(function (a) { return a.days.find(s => s.date === day).summary; });
    total = summaryTimeList.reduce(function (a, b) { return a + b; })
    return total;
}

function getPercentage(time) {
    return ((time / totalTime) * 100).toFixed(2) + ' %';
}

function getCurrentTab() {
    return chrome.extension.getBackgroundPage().currentTab;
}
