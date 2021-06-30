// 'use strict';

class UI {
    getTableOfSite() {
        return document.getElementById('resultTable');
    }

    setUIForToday() {
        document.getElementById('btnToday').classList.add('active');
        document.getElementById('btnAll').classList.remove('active');
        document.getElementById('stats').classList.add('hide');
        document.getElementById('labelForTimeInterval').classList.add('hide');
        this.setUIForDonutChart();

        this.clearUI();
    }

    clearUI() {
        document.getElementById('resultTable').innerHTML = null;
        document.getElementById('total').innerHTML = null;
    }

    createTotalBlock(totalTime, currentTypeOfList, counter) {
        var totalElement = document.getElementById('total');

        var spanVisits = this.createElement('span', ['span-visits', 'tooltip', 'visits'], counter !== undefined ? counter : 0);
        var visitsTooltip = this.createElement('span', ['tooltiptext'], 'Count of visits');
        spanVisits.appendChild(visitsTooltip);

        var spanPercentage = this.createElement('span', ['span-percentage', 'tooltip', 'visits'], '100 %');
	    var visitsTooltip_per = this.createElement('span', ['tooltiptext'], 'Percentage share of time spent');
        spanPercentage.appendChild(visitsTooltip_per);
		
        var div = this.createElement('div', ['margin-left-5', 'total-block'], 'Total');
        var span = this.createElement('span', ['span-time']);
        this.createElementsForTotalTime(totalTime, currentTypeOfList, span);

        this.appendChild(totalElement, [div, spanVisits, spanPercentage, span]);
    }
	fillEmptyBlock(elementName) {
        document.getElementById(elementName).innerHTML = '<p class="no-data">No data</p>';
    }
    fillEmptyBlockForDaysIfInvalid() {
        document.getElementById('tableForDaysBlock').innerHTML = '<p class="no-data">Invalid date</p>';
    }

    fillEmptyBlockForDays() {
        document.getElementById('tableForDaysBlock').innerHTML = '<p class="no-data">No data</p>';
    }

    addHrAfterTableOfSite() {
        this.getTableOfSite().appendChild(document.createElement('hr'));
    }

    setActiveTooltipe(currentTab) {
    }

    addTableHeader(currentTypeOfList, counterOfSite, totalDays) {
        var p = document.createElement('p');
        p.classList.add('table-header');
        if (currentTypeOfList === TypeListEnum.ToDay)
            p.innerHTML = 'Today (' + counterOfSite + ' sites)';
        if (currentTypeOfList === TypeListEnum.All && totalDays !== undefined) {
            if (totalDays.countOfDays > 0) {
                p.innerHTML = 'Aggregate data since ' + new Date(totalDays.minDate).toLocaleDateString() + ' (' + totalDays.countOfDays + ' days) (' + counterOfSite + ' sites)';
            } else {
                p.innerHTML = 'Aggregate data since ' + new Date().toLocaleDateString() + ' (' + counterOfSite + ' sites)';
            }
        }

        this.getTableOfSite().appendChild(p);
    }

    addLineToTableOfSite(tab, currentTab, summaryTime, typeOfList, counter, blockName) {
        var div = document.createElement('div');
        div.addEventListener('mouseenter', function() {
        });
        div.addEventListener('mouseout', function() {
        });
        div.classList.add('inline-flex');

        var divForImg = document.createElement('div');
        var img = document.createElement('img');
        img.setAttribute('height', 17);
        if (tab.favicon !== undefined || tab.favicon == null)
            img.setAttribute('src', tab.favicon);
        else img.setAttribute('src', '/icons/empty.png');
        divForImg.classList.add('block-img');
        divForImg.appendChild(img);

        var spanUrl = this.createElement('span', ['span-url'], tab.url);

        if (tab.url == currentTab) {
            var divForImage = document.createElement('div');
            div.classList.add('span-active-url');
            var imgCurrentDomain = document.createElement('img');
            imgCurrentDomain.setAttribute('src', '/icons/eye.png');
            imgCurrentDomain.setAttribute('height', 17);
            imgCurrentDomain.classList.add('margin-left-5');
            divForImage.appendChild(imgCurrentDomain);
            var currentDomainTooltip = this.createElement('span', ['tooltiptext'], 'Current domain');
            divForImage.classList.add('tooltip', 'current-url');
            divForImage.appendChild(currentDomainTooltip);
            spanUrl.appendChild(divForImage);
        }

        if (typeOfList !== undefined && typeOfList === TypeListEnum.ToDay) {
            if (restrictionList !== undefined && restrictionList.length > 0) {
                var item = restrictionList.find(x => isDomainEquals(x.domain, tab.url));
                if (item !== undefined) {
                    var divLimit = this.createElement('div', ['tooltip', 'inline-block']);
                    var limitIcon = this.createElement('img', ['margin-left-5', 'tooltip']);
                    limitIcon.height = 15;
                    limitIcon.src = '/icons/limit.png';
                    var tooltip = this.createElement('span', ['tooltiptext'], "Daily limit is " + convertShortSummaryTimeToLongString(item.time));
                    divLimit = this.appendChild(divLimit, [limitIcon, tooltip]);
                    spanUrl.appendChild(divLimit);
                }
            }
        }

        var spanVisits = this.createElement('span', ['span-visits', 'tooltip', 'visits'], counter !== undefined ? counter : 0);
        var visitsTooltip = this.createElement('span', ['tooltiptext'], 'Count of visits');
   
        spanVisits.appendChild(visitsTooltip);

        var spanPercentage = this.createElement('span', ['span-percentage', 'tooltip', 'visits'], getPercentage(summaryTime));
	    var visitsTooltip_per = this.createElement('span',['tooltiptext'], 'Percentage share of time spent');

        spanPercentage.appendChild(visitsTooltip_per);	
		
        var spanTime = this.createElement('span', ['span-time']);
        this.createElementsForTotalTime(summaryTime, typeOfList, spanTime);

        div = this.appendChild(div, [divForImg, spanUrl, spanVisits, spanPercentage, spanTime]);
        if (blockName !== undefined)
            document.getElementById(blockName).appendChild(div);
        else
            this.getTableOfSite().appendChild(div);
    }

    createElementsForTotalTime(summaryTime, typeOfList, parentElement) {
        var arr = getArrayTime(summaryTime);
        var isNextPartActiv = false;
        var getCssClass = function(item) {
            if (item > 0) {
                isNextPartActiv = true;
                return ['span-active-time'];
            } else {
                if (isNextPartActiv)
                    return ['span-active-time'];
                return null;
            }
        };
        if (typeOfList === TypeListEnum.All) {
            var spanForDays = this.createElement('span', getCssClass(arr.days), arr.days + 'd ');
            this.appendChild(parentElement, [spanForDays]);
        }
        var spanForHour = this.createElement('span', getCssClass(arr.hours), arr.hours + 'h ');
        var spanForMin = this.createElement('span', getCssClass(arr.mins), arr.mins + 'm ');
        var spanForSec = this.createElement('span', getCssClass(arr.seconds), arr.seconds + 's ');
        this.appendChild(parentElement, [spanForHour, spanForMin, spanForSec]);
    }    

    createElement(type, css, innerText) {
        var element = document.createElement(type);
        if (css !== undefined && css !== null) {
            for (let i = 0; i < css.length; i++)
                element.classList.add(css[i]);
        }
        if (innerText !== undefined)
            element.innerHTML = innerText;

        return element;
    }

    appendChild(element, children) {
        for (let i = 0; i < children.length; i++)
            element.appendChild(children[i]);

        return element;
    }

    setPreloader() {
        document.getElementById('preloader').classList.add('preloader');
    }

    setMode(){
        if (setting_dark_mode)
            document.body.classList.add('night-mode');
    }

    removePreloader() {
        document.getElementById('preloader').classList.remove('preloader');
        document.getElementById('preloader').classList.add('hide');
    }
}
