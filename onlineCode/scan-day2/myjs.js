/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
// Definition of variables
//
//"use strict";
var d = new Date();
var d_pres = new Date();
var d_button = new Date();
var canvas, ctx1, ctx2;
var peImg1 = new Image();
var peImg2 = new Image();
var peCh = new Image();
var assocTestTrial = [];
var imgFill, imgWorld;
var obj = {totalRew:0};
var object, map, stimuli, contextOrder;

// initialize random number generator
var mn = Math.floor(mn/2);
var i, t, nr, o, ix = [], nonix = [];
for (nr === 0; nr < mn; nr++){
   Math.random();
}
var backGroundImage0 = new Image();
var backGroundImage1 = new Image();

// Is this participant recruited from prolific?
var canvas1, canvas2, ctx1, ctx2, imPE2, imPE1;
var imgEx0 = new Image(); var imgEx1 = new Image(); var imgEx2 = new Image();

// Display collected coins
var imRew1 = document.getElementById("collectedReward1");
var imRew2 = document.getElementById("collectedReward2");
var imRew3 = document.getElementById("collectedReward3");
var feedbackImg = document.getElementById("feedbackAtButtonPress");
var feedbackImg2 = document.getElementById("feedbackAtButtonPress2");
var progressCoins = document.getElementById("progressCoins");

//%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
// General functions

function shuffle(array) {
  var currentIndex = array.length, temporaryValue, randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }
  return array;
}

function add(a, b) {return a + b;}

function randomIntFromInterval(min,max){return Math.floor(Math.random()*(max-min+1)+min);}

function saveData() {
    var loc = window.location.pathname;
    var dir = loc.substring(0, loc.lastIndexOf('/'));

    var uploadPath = dir + "/data/Subj"+ data.participantId + "_day" + settings.day + settings.version + ".JSON";
    var JSONstring = JSON.stringify(data);

    $.ajax({
        type: "PUT",
        url: uploadPath,
        dataType: 'JSON',
        async: false,
        data: JSONstring
    });

    var timeLinePath = dir + "/data/Subj"+ data.participantId + "_day" + settings.day + settings.version + "_timeLine.JSON";
    var timeLineString = JSON.stringify(exptTimeLine);

    $.ajax({
        type: "PUT",
        url: timeLinePath,
        dataType: 'JSON',
        async: false,
        data: timeLineString
    });
}

// Ask subjects for prolific ID if they say they have one
function enterProlific(){
    var rad = document.myForm.prolificParticipant;
    for(var i = 0; i < rad.length; i++) {
        rad[i].onclick = function() {
            if (this.value === "yes"){
                $('#enterProlificIDDay1').show();
                data.prolificPart = true;
                data.prolificTick = true;
            } else {
                $('#enterProlificIDDay1').hide();
                data.prolificPart = false;
                data.prolificTick = false;
            };

        };
    }
}

// Preload background images
function preloader() {
    backGroundImage0.src = "../images/background/bg0.jpg";
    backGroundImage1.src = "../images/background/bg1.jpg";

     // counter
     var ex_obj = 0;

     // create object
     imageObj = new Image();

     // start preloading
     for(ex_obj=0; ex_obj<=settings.nobj; ex_obj++)
     {
        imageObj.src= '../images/'+data.stimuli[map][ex_obj]+'.png';
     }
}

// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
// Experimental time line
function startExperiment(){
    data.startTime = d.getTime();

    if(settings.fullscreen){
        var element = document.documentElement;
        if (element.requestFullscreen) {
          element.requestFullscreen();
        } else if (element.mozRequestFullScreen) {
          element.mozRequestFullScreen();
        } else if (element.webkitRequestFullscreen) {
          element.webkitRequestFullscreen();
        } else if (element.msRequestFullscreen) {
          element.msRequestFullscreen();
        }
    };
    proceedInExpt();
    document.getElementById("noOfTasks" + settings.day).innerHTML = settings.noOfTasks[settings.day-1];
}

function TimeLine(toShow, toHide, toRun, maxCoins){
    this.toShow     = toShow;
    this.toHide     = toHide;
    this.toRun      = toRun;
    this.maxCoins   = maxCoins;
    this.toStart;
    this.toEnd;
}

var exptTimeLine = [];
var runThrough  = -1;

// Start
window.onload = function () {
    $("startN").show();
    $("#proceed").hide();
    $("startButton").show();
    if (settings.fullscreen) {
        $("#yesFullScreen").show();
    }
};

var consent         = new TimeLine(["consent"], [], [],0);
var subjectDetails  = new TimeLine(["detailsDay" + settings.day, "ProlificID","proceed"], [], [],0);
var generalInstr    = new TimeLine(["generalIntroDay" + settings.day,"proceed"], [], [loadSubjectData],0);
var instrMemory     = new TimeLine(["instrPairwiseAssociations","proceed"], [], [setPairwiseSequence],0);
var trainMemory     = new TimeLine(["pairwiseAssociations","moveThroughObjectPairs"], ["memoryTestInstructions", "moveThroughMemoryTest","memoryReminder"], [presentTwoObjects],0);
var instrMemoryTest = new TimeLine(["instrMemoryTest","proceed"], [], [setPairwiseSequence],0);
var testMemory      = new TimeLine(["pairwiseAssociations","moveThroughMemoryTest"], ["learnPairsInstructions", "moveThroughObjectPairs","memoryReminder"], [provideFeedback,generateMemorySequence, presentTwoObjects],2*pairsA.length);
var endMemory       = new TimeLine(["pairwiseAssociationEnd","displayRewards","proceed"],[],[],0);
var instrPassiveExp = new TimeLine(["passiveExposureInstr","proceed"],[],[instructPassiveExposure],0);
var startPassiveExp = new TimeLine(["passiveExposure"],[],[provideFeedback,passiveExposurePresentNewObj,saveData],settings.trialsPassiveExposure);
var endPassiveExp   = new TimeLine(["passiveExposureEndBlock","displayRewards","proceed"],[],[],0);
var instrPassiveNav = new TimeLine(["instrPassiveNavigation","proceed"], [], [],0);
var startPassiveNav = new TimeLine(["passiveNavigation","ChooseBetweenTwoOptions"], [], [provideFeedback,passiveNavigationPresentNewObj,saveData],0);
var endPassiveNav   = new TimeLine(["endOfBlock","displayRewards","proceed"], [], [],pairsA.length);
var instrFindParter = new TimeLine(["instrFindPartner","proceed"], [], [],0);
var startFindParter = new TimeLine(["startFindPartner"], [], [provideFeedback,findPartner,saveData],pairsA.length);
var endFindParter   = new TimeLine(["findPartnerEnd","displayRewards","proceed"], [], [],0);
var instrGoalNav    = new TimeLine(["instrGoalNavigation" + settings.day,"proceed"], [], [],0);
var startGoalNav    = new TimeLine(["goalNavigation"], [], [initializeTaskGoalNavigation,saveData],settings.trialsGoalNavigation*3);
var endGoalNav      = new TimeLine(["endOfBlock","displayRewards","proceed"], [], [],0);
var instrObjDiff    = new TimeLine(["instrObjDiff","proceed"], [], [visualiseObjectDifferenceTask],0);
var startObjDiff    = new TimeLine(["objectDifference","ChooseBetweenTwoOptions"],[],[provideFeedback,objectDifferencePresentNewObj,saveData],settings.trialsObjectDifference);
var endObjDiff      = new TimeLine(["endOfBlock","displayRewards","proceed"], [], [],0);
var participantFeedback   = new TimeLine(["participantFeedbackDay" + settings.day,"proceed"], [], [],0);
var endExperimentDay1   = new TimeLine(["endExperiment"],["inviteForFollowUp","inviteForFollowUp2"],[endExp],0);       // The script subjectFeedback calls endExp()
var endExperimentDay2   = new TimeLine(["endExperiment"],[],[endExp],0);
var memoryReminder  = new TimeLine(["pairwiseAssociations", "memoryReminder","moveThroughObjectPairs"],["memoryTestInstructions", "moveThroughMemoryTest"],[setPairwiseSequence,presentTwoObjects],0);

///*Experiment Timeline for Day1 - either 1 or 2 maps
//exptTimeLine.push(subjectDetails);
//exptTimeLine.push(generalInstr);
//exptTimeLine.push(instrMemory);
//exptTimeLine.push(trainMemory);
//exptTimeLine.push(instrMemoryTest);
//exptTimeLine.push(testMemory);
//exptTimeLine.push(endMemory);
//exptTimeLine.push(memoryReminder);
//exptTimeLine.push(instrPassiveExp);
//exptTimeLine.push(startPassiveExp);
//exptTimeLine.push(endPassiveExp);
//exptTimeLine.push(memoryReminder);
//exptTimeLine.push(instrFindParter);
//exptTimeLine.push(startFindParter);
//exptTimeLine.push(endFindParter);
////exptTimeLine.push(instrPassiveNav);
////exptTimeLine.push(startPassiveNav);
////exptTimeLine.push(endPassiveNav);
//exptTimeLine.push(instrGoalNav);
//exptTimeLine.push(startGoalNav);
//exptTimeLine.push(endGoalNav);
//exptTimeLine.push(instrObjDiff);
//exptTimeLine.push(startObjDiff);
//exptTimeLine.push(endObjDiff);
//exptTimeLine.push(instrGoalNav);
//exptTimeLine.push(startGoalNav);
//exptTimeLine.push(endGoalNav);
//exptTimeLine.push(instrObjDiff);
//exptTimeLine.push(startObjDiff);
//exptTimeLine.push(endObjDiff);
//exptTimeLine.push(instrGoalNav);
//exptTimeLine.push(startGoalNav);
//exptTimeLine.push(endGoalNav);
//exptTimeLine.push(instrObjDiff);
//exptTimeLine.push(startObjDiff);
//exptTimeLine.push(endObjDiff);
////exptTimeLine.push(testMemory);
//exptTimeLine.push(instrFindParter);
//exptTimeLine.push(startFindParter);
//exptTimeLine.push(endFindParter);
////exptTimeLine.push(endMemory);
////exptTimeLine.push(participantFeedback);
//exptTimeLine.push(endExperimentDay1);

//exptTimeLine.push(subjectDetails);
//exptTimeLine.push(generalInstr);
//exptTimeLine.push(instrMemory);
//exptTimeLine.push(trainMemory);
//exptTimeLine.push(instrMemoryTest);
//exptTimeLine.push(testMemory);
//exptTimeLine.push(endMemory);
//exptTimeLine.push(memoryReminder);
//exptTimeLine.push(instrPassiveExp);
//exptTimeLine.push(startPassiveExp);
//exptTimeLine.push(endPassiveExp);
//exptTimeLine.push(memoryReminder);
//exptTimeLine.push(instrFindParter);
//exptTimeLine.push(startFindParter);
//exptTimeLine.push(endFindParter);
//exptTimeLine.push(instrPassiveNav);
//exptTimeLine.push(startPassiveNav);
//exptTimeLine.push(endPassiveNav);
//exptTimeLine.push(instrGoalNav);
//exptTimeLine.push(startGoalNav);
//exptTimeLine.push(endGoalNav);
//exptTimeLine.push(instrObjDiff);
//exptTimeLine.push(startObjDiff);
//exptTimeLine.push(endObjDiff);
//exptTimeLine.push(instrGoalNav);
//exptTimeLine.push(startGoalNav);
//exptTimeLine.push(endGoalNav);
//exptTimeLine.push(instrObjDiff);
//exptTimeLine.push(startObjDiff);
//exptTimeLine.push(endObjDiff);
//exptTimeLine.push(instrGoalNav);
//exptTimeLine.push(startGoalNav);
//exptTimeLine.push(endGoalNav);
//exptTimeLine.push(instrObjDiff);
//exptTimeLine.push(startObjDiff);
//exptTimeLine.push(endObjDiff);
//exptTimeLine.push(testMemory);
//exptTimeLine.push(endMemory);
////exptTimeLine.push(participantFeedback);
//exptTimeLine.push(endExperimentDay1);

//exptTimeLine.push(endExperimentDay1);

//exptTimeLine.push(subjectDetails);
//exptTimeLine.push(generalInstr);
//exptTimeLine.push(instrMemory);
//exptTimeLine.push(trainMemory);
//exptTimeLine.push(instrMemoryTest);
//exptTimeLine.push(testMemory);
//exptTimeLine.push(endMemory);
//exptTimeLine.push(memoryReminder);
//exptTimeLine.push(instrPassiveExp);
//exptTimeLine.push(startPassiveExp);
//exptTimeLine.push(endPassiveExp);
//exptTimeLine.push(memoryReminder);
//exptTimeLine.push(instrFindParter);
//exptTimeLine.push(startFindParter);
//exptTimeLine.push(endFindParter);
//exptTimeLine.push(instrPassiveNav);
//exptTimeLine.push(startPassiveNav);
//exptTimeLine.push(endPassiveNav);
//exptTimeLine.push(instrGoalNav);
//exptTimeLine.push(startGoalNav);
//exptTimeLine.push(endGoalNav);
//exptTimeLine.push(instrObjDiff);
//exptTimeLine.push(startObjDiff);
//exptTimeLine.push(endObjDiff);
//exptTimeLine.push(instrGoalNav);
//exptTimeLine.push(startGoalNav);
//exptTimeLine.push(endGoalNav);
//exptTimeLine.push(instrObjDiff);
//exptTimeLine.push(startObjDiff);
//exptTimeLine.push(endObjDiff);
//exptTimeLine.push(instrGoalNav);
//exptTimeLine.push(startGoalNav);
//exptTimeLine.push(endGoalNav);
//exptTimeLine.push(instrObjDiff);
//exptTimeLine.push(startObjDiff);
//exptTimeLine.push(endObjDiff);
//exptTimeLine.push(testMemory);
//exptTimeLine.push(endMemory);
//exptTimeLine.push(participantFeedback);
//exptTimeLine.push(endExperimentDay1); */

/*Experiment Timeline for Day2, 1 map
exptTimeLine.push(subjectDetails);
exptTimeLine.push(generalInstr);
exptTimeLine.push(instrMemory);
exptTimeLine.push(trainMemory);
exptTimeLine.push(instrMemoryTest);
exptTimeLine.push(testMemory);
exptTimeLine.push(endMemory);
exptTimeLine.push(instrFindParter);
exptTimeLine.push(startFindParter);
exptTimeLine.push(endFindParter);
exptTimeLine.push(instrGoalNav);
exptTimeLine.push(startGoalNav);
exptTimeLine.push(endGoalNav);
exptTimeLine.push(instrObjDiff);
exptTimeLine.push(startObjDiff);
exptTimeLine.push(endObjDiff);
exptTimeLine.push(instrGoalNav);
exptTimeLine.push(startGoalNav);
exptTimeLine.push(endGoalNav);
exptTimeLine.push(instrObjDiff);
exptTimeLine.push(startObjDiff);
exptTimeLine.push(endObjDiff);
exptTimeLine.push(testMemory);
exptTimeLine.push(endMemory);
exptTimeLine.push(participantFeedback);
exptTimeLine.push(endExperimentDay2);
*/

///*Experiment Timeline for Day 2 - 2 maps
exptTimeLine.push(subjectDetails);
exptTimeLine.push(generalInstr);
exptTimeLine.push(instrMemory);
exptTimeLine.push(trainMemory);
exptTimeLine.push(instrMemoryTest);
exptTimeLine.push(testMemory);
exptTimeLine.push(endMemory);
exptTimeLine.push(memoryReminder);
exptTimeLine.push(instrPassiveExp);
exptTimeLine.push(startPassiveExp);
exptTimeLine.push(endPassiveExp);
exptTimeLine.push(memoryReminder);
exptTimeLine.push(instrFindParter);
exptTimeLine.push(startFindParter);
exptTimeLine.push(endFindParter);
exptTimeLine.push(instrGoalNav);
exptTimeLine.push(startGoalNav);
exptTimeLine.push(endGoalNav);
exptTimeLine.push(instrObjDiff);
exptTimeLine.push(startObjDiff);
exptTimeLine.push(endObjDiff);
exptTimeLine.push(instrGoalNav);
exptTimeLine.push(startGoalNav);
exptTimeLine.push(endGoalNav);
exptTimeLine.push(instrObjDiff);
exptTimeLine.push(startObjDiff);
exptTimeLine.push(endObjDiff);
exptTimeLine.push(instrGoalNav);
exptTimeLine.push(startGoalNav);
exptTimeLine.push(endGoalNav);
exptTimeLine.push(instrObjDiff);
exptTimeLine.push(startObjDiff);
exptTimeLine.push(endObjDiff);
exptTimeLine.push(testMemory);
exptTimeLine.push(endMemory);
exptTimeLine.push(instrFindParter);
exptTimeLine.push(startFindParter);
exptTimeLine.push(endFindParter);
exptTimeLine.push(endExperimentDay1);
/*/

//*Experiment Timeline for Day3, 2 maps
//exptTimeLine.push(subjectDetails);
//exptTimeLine.push(generalInstr);
//exptTimeLine.push(instrMemory);
//exptTimeLine.push(trainMemory);
//exptTimeLine.push(instrMemoryTest);
//exptTimeLine.push(testMemory);
//exptTimeLine.push(endMemory);
//exptTimeLine.push(instrFindParter);
//exptTimeLine.push(startFindParter);
//exptTimeLine.push(endFindParter);
//exptTimeLine.push(instrPassiveNav);
//exptTimeLine.push(startPassiveNav);
//exptTimeLine.push(endPassiveNav);
//exptTimeLine.push(instrFindParter);
//exptTimeLine.push(startFindParter);
//exptTimeLine.push(endFindParter);
//exptTimeLine.push(instrGoalNav);
//exptTimeLine.push(startGoalNav);
//exptTimeLine.push(endGoalNav);
//exptTimeLine.push(instrObjDiff);
//exptTimeLine.push(startObjDiff);
//exptTimeLine.push(endObjDiff);
//exptTimeLine.push(instrGoalNav);
//exptTimeLine.push(startGoalNav);
//exptTimeLine.push(endGoalNav);
//exptTimeLine.push(instrObjDiff);
//exptTimeLine.push(startObjDiff);
//exptTimeLine.push(endObjDiff);
//exptTimeLine.push(instrGoalNav);
//exptTimeLine.push(startGoalNav);
//exptTimeLine.push(endGoalNav);
//exptTimeLine.push(instrObjDiff);
//exptTimeLine.push(startObjDiff);
//exptTimeLine.push(endObjDiff);
//exptTimeLine.push(instrFindParter);
//exptTimeLine.push(startFindParter);
//exptTimeLine.push(endFindParter);
//exptTimeLine.push(endExperimentDay2);
//*/

function provideFeedback(){
    if (settings.displayFeedback){
        $("#displayRewards").show().children().show();
    }
}

var h;
var maxCoins = 0;
for (h = 0; h < exptTimeLine.length; h++){
    maxCoins += exptTimeLine[h].maxCoins;
}
console.log("Maximum number of coins: " + maxCoins);

function doNothing(){}

function recordTime(){
    d = new Date();
    return d.getTime() - data.startTime;
}

// Run through experimental timeline
function proceedInExpt(){
    runThrough++;
    i = -1;
    exptTimeLine[runThrough].toStart = d.getTime();

    imRew1.src = "../images/coins/0coins.png";
    imRew2.src = "../images/coins/0coins.png";
    imRew3.src = "../images/coins/0coins.png";

    feedbackImg.src = "../images/empty.png";

    document.onkeydown = doNothing; // if a key is pressed

    $("div").hide(); $("button").hide();
    if (!settings.hideSkipButton){
        $("#skip-button").show();
    }

    for (var c = 0; c<exptTimeLine[runThrough].toShow.length; c++){
        $("#" + exptTimeLine[runThrough].toShow[c]).show().children().show();
    }
    for (var c = 0; c<exptTimeLine[runThrough].toHide.length; c++){
        $("#" + exptTimeLine[runThrough].toHide[c]).hide();
    }
    for (var c = 0; c<exptTimeLine[runThrough].toRun.length; c++){
        exptTimeLine[runThrough].toRun[c]();
    }

    if (settings.day === 3){
        $(".textDay3").show();
    }else {
        $(".textDay3").hide();
    }
    // Display reward
    imRew1.src = "../images/coins/" + Math.max(Math.min(obj.totalRew,50),0) + "coins.png";
    imRew2.src = "../images/coins/" + Math.max(Math.min(obj.totalRew-50,50),0) + "coins.png";
    imRew3.src = "../images/coins/" + Math.max(Math.min(obj.totalRew-100,50),0) + "coins.png";

    document.getElementById("displayRewardsBlock").innerHTML = obj.totalRew;

    data.timeLine[runThrough]   = exptTimeLine[runThrough].toShow[0];
}

function endExp() {
    subjectFeedback();
    d = new Date();

    data.experimentDuration = d.getTime() - data.startTime;
    saveData();
    document.getElementById("totalCollectedReward").innerHTML   = data.totalReward;
    document.getElementById("bonus").innerHTML                  = (data.totalReward/50).toFixed(2);

    if (data.prolificPart === false){
        $("#submitToProlific").text("You can now close the browser to exit the experiment.");
    };

//    if (data.totalReward > settings.perfCriterion && data.prolificPart === true && settings.day !== 3){
//        $("#inviteForFollowUp").show();
//        $("#inviteForFollowUp2").show();
//    }
    data.exptTimeLine = exptTimeLine;
}

function loadStimuli(mapID){
    //  Load subject-specific stimuli
    var xhttp;
    if (window.XMLHttpRequest) {
      // code for modern browsers
      xhttp = new XMLHttpRequest();
      } else {
      // code for IE6, IE5
      xhttp = new ActiveXObject("Microsoft.XMLHTTP");
    }
    xhttp.onreadystatechange = function() {
        // readyState === 4: response from server
      if (this.readyState === 4 && this.status === 200) {
        data.stimuli[mapID] = this.responseText.split(' ').map(Number);
        if (data.stimuli[mapID].length > settings.nobj){
            data.stimuli[mapID].pop();
            preloader();
        }
      }
    };

    if (mapID === 0){
        console.log(mapID);
        if (settings.scan){
            xhttp.open("GET", "stimuli/scan/Subj_" + data.subject_id + "/Subj_" + data.subject_id + "_map" + (mapID + 1) + "_stimuli.txt", true);
        }
        else {
            xhttp.open("GET", "stimuli/map" + mapID + "/" + settings.graphStructure + "/" + (data.subject_id % 25 + 1) + "/r_" + (''+data.subject_id)[0] + ".txt", true);
        }
    } else {
        console.log(mapID);
        if (settings.scan){
            xhttp.open("GET", "stimuli/scan/Subj_" + data.subject_id + "/Subj_" + data.subject_id + "_map" + (mapID + 1) + "_stimuli.txt", true);
        }
        else {
            xhttp.open("GET", "stimuli/map" + mapID + "/" + settings.graphStructure + "/" + (data.subject_id % 25 + 1) + "/r_" + (''+data.subject_id)[0] + "_var_" + (''+data.subject_id)[1]+".txt", true);
        }
    }
    xhttp.send();
}

function setContext(context){
    if (context === 0){
        imgFill = "#70ADC9";
        imgWorld = "blue";
        $(".edit-button").css("background-color", "#0095dd");
        $("html").css("background-image", 'url(../images/background/bg0.jpg)');
    } else if (context === 1){
        imgFill = "#CA7270";
        imgWorld = "red";
        $(".edit-button").css("background-color", "#990000");
        $("html").css("background-image", 'url(../images/background/bg1.jpg)');
    } else if (context === 100){
        imgWorld = "";
        $(".edit-button").css("background-color", "#545454");
        $("html").css("background-image", 'url(../images/empty.png)');
    }
}


function loadSubjectData(){

    if (settings.day ===2) {
        $("#Introday2_noMaps" + settings.numberOfMaps).show();
    } else if (settings.day ===3){
        $("#Introday3").show();
    }

    // Convert to numerical ID
    data.participantId = document.getElementById("prolificId").value;
    data.subject_id = data.participantId[0];
//    data.subject_id = [];
//    for (var i = 0; i<data.participantId.length; i++){
//        if (!isNaN(Number(data.participantId[i]))){
//            data.subject_id = data.subject_id + data.participantId[i];
//        }
//    }
    if (data.subject_id.length < 1 || isNaN(data.subject_id) || data.subject_id === 0){
        data.subject_id = Math.floor(Math.random()*100000000);
    } else {
        //data.subject_id = Number(data.subject_id.substring(0,Math.min(10,data.subject_id.length)));
        if (Number(data.participantId[1])){
            data.subject_id=Number(data.participantId[0])*10+Number(data.participantId[1]);
        } else {
            data.subject_id=Number(data.participantId[0]);
        }
    }

    if (data.participantId.length === 0){
        data.participantId = data.subject_id;
    }

    if (settings.day === 1){
        map = 0;
    } else if (settings.day === 2 && settings.numberOfMaps === 1){
        map = 0;
    } else if (settings.day === 2 && settings.numberOfMaps > 1){
        map = 1;
    } else if (settings.day === 3 && settings.numberOfMaps > 1){
        map = 0;
        loadStimuli(map);
        map = 1;
    }
    loadStimuli(map);

    if (settings.day === 2 && settings.numberOfMaps > 1){
        document.getElementById("newDay").innerHTML = "Please note:<br>These associations are not the same as the ones you learned yesterday, so don't get confused!<br><br>";
    }

    data.option = [];
    data.option[0] = ((data.subject_id % 2) === 0) ? "70" : "74";
    data.option[1] = ((data.subject_id % 2) === 0) ? "74" : "70";

    data.age        = document.getElementById("myNumber").value;
    data.gender     = $("input:radio[name=gender]:checked").val();


    // make sure that half the subject get red on day 1 and blue on day 2 and the other way around
    if (data.subject_id%2 === 0){
        contextOrder = [0, 1];
    } else {
        contextOrder = [1, 0];
    }

    if (settings.day !== 3){
        setContext(contextOrder[map]);
        document.getElementById("whichWorld").innerHTML = "Today you are in the " + imgWorld + " world";
    } else {
        setContext(100);
        document.getElementById("whichWorld").innerHTML = "Today you will switch between being in the blue and the red worlds.";
    }
}

//Function to store Subject's feedback
function subjectFeedback() {
    data.feedback.objPairsDifficulty = $("input:radio[name=objpairs_difficulty]:checked").val();
    data.feedback.mostEnjoyableTask = $("input:radio[name=mostEnjoyableTask]:checked").val();
    data.feedback.lessEnjoyableTask = $("input:radio[name=lessEnjoyableTask]:checked").val();
    data.feedback.easiestTask = $("input:radio[name=EasiestTask]:checked").val();
    data.feedback.hardestTask = $("input:radio[name=HardestTask]:checked").val();
    data.feedback.feedbackComments = document.getElementById("feedbackComments").value;
    saveData();
}

// fill canvas
function fillCanvs(canvasContext,size,callback){
    canvasContext.fillStyle = imgFill;
    canvasContext.fillRect(0,0,size[0],size[1]);
    callback();
}

// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
// Passive exposure task
var imPENew = document.getElementById("PicNewPE");
var imPEOld = document.getElementById("PicOldPE");

// Passive Exposure
function PassiveExposure(){
    this.objSeq     = [Math.floor(Math.random()*settings.nobj)]; // random start object
    this.objOrient  = [];
    this.cr         = [];
    this.crBlock    = [];
    this.key_corr   = [];
    this.key_incorr = [];
    this.key        = [];
    this.RT         = [];
    this.RTBlock    = [];
    this.stim_on    = [];
    this.responseT  = [];
    this.totalRew   = 0;
    this.trials     = settings.trialsPassiveExposure;
    this.context    = [];
}

function instructPassiveExposure() {
    // New data structure
    data.passiveExposure[data.passiveExposure.length] = new PassiveExposure();

    var ex_obj = randomIntFromInterval(0,settings.nobj-1);

    canvas1 = document.getElementById("Pic1PE_instr");
    ctx1 = canvas1.getContext("2d");

    canvas2 = document.getElementById("Pic2PE_instr");
    ctx2 = canvas2.getContext("2d");

    if (data.option[data.mirror[ex_obj]] === "70"){
        peImg1.src = '../images/'+data.stimuli[map][ex_obj]+'.png';
        peImg2.src = '../images/'+data.stimuli[map][ex_obj]+'_mirr.png';
    } else {
        peImg1.src = '../images/'+data.stimuli[map][ex_obj]+'_mirr.png';
        peImg2.src = '../images/'+data.stimuli[map][ex_obj]+'.png';
    }

    $(document).ready(function(){
        fillCanvs(ctx1,[200,200],function(){
            peImg1.onload = function() {
                ctx1.drawImage(peImg1, 0,0);
            };
        });

        fillCanvs(ctx2,[200,200],function(){
            peImg2.onload = function() {
                ctx2.drawImage(peImg2, 0,0);
            };
        });
    });
}

function passiveExposurePresentNewObj(){
    obj = data.passiveExposure[data.passiveExposure.length-1];
    obj.startTime = recordTime();
    if (settings.day === 1 || settings.day === 2){
        obj.context = Array.apply(null, Array(settings.trialsPassiveExposure)).map(Number.prototype.valueOf,map);
    } else {
        obj.context =(Array.apply(null, Array(settings.trialsPassiveExposure/2)).map(Number.prototype.valueOf,0));
        obj.context = shuffle(obj.context.concat(Array.apply(null, Array(settings.trialsPassiveExposure/2)).map(Number.prototype.valueOf,1)));
    }

    imRew1.src = "../images/coins/" + Math.max(Math.min(obj.totalRew,50),0) + "coins.png";
    imRew2.src = "../images/coins/" + Math.max(Math.min(obj.totalRew-50,50),0) + "coins.png";
    imRew3.src = "../images/coins/" + Math.max(Math.min(obj.totalRew-100,50),0) + "coins.png";

    i = Math.max(i,0);
    // Present old object
    imPEOld = document.getElementById("PicOldPE");
    imPE2 = imPEOld.getContext("2d");

    fillCanvs(imPE2,[100,100],function(){
        // Draw preceding object in small box
        if (i !== 0){   // not on first trial - no preceding object
            peImg2.src = peImg1.src;
            peImg2.onload = function() {
                imPE2.drawImage(peImg2, 0,0, 100, 100);
            };
        }
    });

    // Present object 'obj' in given orientation, determine correct button press
    if (Math.random() < 0.5){
        obj.objOrient[i] = ("");
        // Determine which button is the correct one to press
        obj.key_corr[i] = data.option[data.mirror[obj.objSeq[i]]];
        obj.key_incorr[i] = data.option[(data.mirror[obj.objSeq[i]]+1)%2];// which orientation is associated with the left button?
    } else {
        obj.objOrient[i] = "_mirr";
        obj.key_corr[i] = data.option[(data.mirror[obj.objSeq[i]]+1)%2];        // which orientation is associated with the left button?
        obj.key_incorr[i] = data.option[data.mirror[obj.objSeq[i]]];
    }

    // Draw object
    peImg1.src = "../images/" + data.stimuli[map][obj.objSeq[i]] + obj.objOrient[i] + ".png";

    // Present new object
    imPENew = document.getElementById("PicNewPE");
    imPE1 = imPENew.getContext("2d");

    fillCanvs(imPE1,[200,200],function(){
        peImg1.onload = function() {
            imPE1.drawImage(peImg1, 0,0);
        };
        imPENew.style.border= "5px solid #ffffff";
        feedbackImg.src = "../images/empty.png";
    });

    // Stimulus onset time
    d = new Date();
    obj.stim_on[i] = d.getTime();

    // Wait for button press
    document.onkeydown = checkKey;
}

var r;
function checkKey(e) {
    if (i < obj.trials){
        if (e.keyCode == obj.key_corr[i] || e.keyCode == obj.key_incorr[i]) {
            obj.key[i] = e.keyCode;

            // Record response times
            d = new Date();
            obj.responseT[i] = d.getTime();
            obj.RT[i] = obj.responseT[i] - obj.stim_on[i];

            // Was this the correct button?
            if (obj.key[i] == obj.key_corr[i]) {
                obj.cr[i] = 1;
                // Feedback in passive Exposure Task
                imPENew.style.border= "5px solid #8CC641";
                feedbackImg.src = "../images/correct.png";
                obj.totalRew++;
                data.totalReward++;
            } else if (obj.key[i] == obj.key_incorr[i]) {
                obj.cr[i] = -1;
                imPENew.style.border= "5px solid #EC2028";
                feedbackImg.src = "../images/incorrect.png";
                if (obj.totalRew > 0){
                    data.totalReward--;
                }
                obj.totalRew = Math.max(0,obj.totalRew-1);
            }
            imRew1.src = "../images/coins/" + Math.max(Math.min(obj.totalRew,50),0) + "coins.png";
            imRew2.src = "../images/coins/" + Math.max(Math.min(obj.totalRew-50,50),0) + "coins.png";
            imRew3.src = "../images/coins/" + Math.max(Math.min(obj.totalRew-100,50),0) + "coins.png";

            // Move on to next object
            i++;

            // Choose next object. Make sure it is not a neighbour of the preceding object on the data.graph!
            r = Math.ceil(Math.random()*settings.nobj);
            while (data.graph[obj.objSeq[i-1]][r]!==1) {
                r = Math.ceil(Math.random()*settings.nobj);
            }
            obj.objSeq[i] = r;

            setTimeout(function() {
                passiveExposurePresentNewObj(obj.objSeq[i]);
            },timelag);

            obj.RTBlock = obj.RT.reduce(add, 0);
            obj.RTBlock = Math.round(obj.RTBlock/obj.RT.length);
            obj.crBlock = Math.ceil((obj.RT.length/2 + obj.cr.reduce(add, 0)/2)/obj.RT.length * 100);

            document.getElementById("displayCrBlock").innerHTML=obj.crBlock + "%";
            document.getElementById("displayRTBlock").innerHTML=obj.RTBlock + " ms";
        }
    } else {
        obj.endTime = recordTime();
        proceedInExpt();

    }
}


//// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
// Passive navigation task

var imPNOption = [];
var chosenObjPN;
var imPNChosen = document.getElementById("chosenPicPN");
for (o = 0; o<2; o++){
    imPNOption[o] = document.getElementById("Pic"+o+"PN");
}

function PassiveNavigation(){
    this.chosenSeq  = [randomIntFromInterval(0,settings.nobj-1)]; // random start object
    this.objOrient  = [];
    this.options    = [];
    this.cr         = Array.apply(null, Array(settings.trialsPassiveNavigation)).map(Number.prototype.valueOf,0);
    this.stim_on    = [];
    this.responseT  = [];
    this.RT         = [];
    this.totalRew   = 0;
    this.earlyResponse = [];
}

function passiveNavigationPresentNewObj() {
    feedbackImg.src = "../images/empty.png";
    i = Math.max(0,i);
    if (i > settings.trialsPassiveNavigation){
        obj.endTime = recordTime();
        proceedInExpt();
    } else {
        if (i===0){

            // Set this to the background colour
            imPNChosen.src = "../images/" + imgWorld + ".png";

            // New passive navigation object
            data.passiveNavigation[data.passiveNavigation.length] = new PassiveNavigation();
            obj = data.passiveNavigation[data.passiveNavigation.length-1];
            obj.startTime = recordTime();
            if (settings.day === 1 || settings.day === 2){
                obj.context = Array.apply(null, Array(settings.trialsPassiveNavigation)).map(Number.prototype.valueOf,map);
            } else {
                obj.context =(Array.apply(null, Array(settings.trialsPassiveNavigation/2)).map(Number.prototype.valueOf,0));
                obj.context = shuffle(obj.context.concat(Array.apply(null, Array(settings.trialsPassiveNavigation/2)).map(Number.prototype.valueOf,1)));
            }

        }
        obj.objOrient[i] = [];
        obj.options[i] = [];

        object     = obj.chosenSeq[i];

        document.getElementById("moveToNext").disabled = true;
        document.getElementById("moveToNext").className = "edit-button disabled";

        neighbour = [];
        for(j = 0; j < settings.nobj; j++){
            if (data.dist[object][j] === 1 && j !== next){
                neighbour.push(j);
            }
        }
        neighbour = shuffle(neighbour);

        // Choose two options for object 1 and 2 that are neighbours on the data.graph
        obj.options[i][0] = neighbour[0];
        obj.options[i][1] = neighbour[1];

        drawObject(0);
        drawObject(1);

        d = new Date();
        obj.stim_on[i] = d.getTime();

        imPNOption[0].onclick = function(){chosenObjPN = 0; choosePassiveNavigation();};
        imPNOption[1].onclick = function(){chosenObjPN = 1; choosePassiveNavigation();};
    }
}

function choosePassiveNavigation(){
    if (chosenObjPN !== 0 && chosenObjPN !== 1){
        // If subjects pressed a button early make sure the experiment proceeds
        chosenObjPN = randomIntFromInterval(0,1);
        obj.earlyResponse[i] = 1;
    } else {
        obj.earlyResponse[i] = 0;
    }

    //     record RT
    d = new Date();
    obj.responseT[i] = d.getTime();
    obj.RT[i]        = obj.responseT[i] - obj.stim_on[i];

    // Mark chosen object and remove other object
    imPNOption[chosenObjPN].style.border= "5px solid #545454";

    setTimeout(function() {
        i++;
        // Record chosen object
        obj.chosenSeq[i] = obj.options[i-1][chosenObjPN];

        //    Counts transitions chosen by subject & rewards with 50% probability if not rewarded before
        if (Math.random()<0.5 && rewardTransitions[obj.chosenSeq[i-1]][obj.chosenSeq[i]] === 0){
            obj.cr[i] = 1;
            obj.totalRew++;
            data.totalReward++;

            rewardTransitions[obj.chosenSeq[i-1]][obj.chosenSeq[i]] = 1;
            imRew1.src = "../images/coins/" + Math.max(Math.min(obj.totalRew,50),0) + "coins.png";
            imRew2.src = "../images/coins/" + Math.max(Math.min(obj.totalRew-50,50),0) + "coins.png";
            imRew3.src = "../images/coins/" + Math.max(Math.min(obj.totalRew-100,50),0) + "coins.png";
        }

        if (i > 0){
            transitions[obj.chosenSeq[i-1]][obj.chosenSeq[i]]++;
        }

        // Mark old object as chosen object
        // This is now the previously chosen object
        imPNChosen.src = imPNOption[chosenObjPN].src;

        for(o = 0; o < 2; o++){
            imPNOption[o].src = "../images/" + imgWorld + ".png";
            document.getElementById("Pic0PN").style.border = "5px solid white";
        }

        // Enable 'next card' button
        document.getElementById("moveToNext").disabled = false;

        // Disable onclick
        imPNOption[0].onclick = null;
        imPNOption[1].onclick = null;
    },timelag);
}

function drawObject(o){
    // Present object 'obj' in given orientation, determine correct button press
    if (Math.random() < 0.5){
        obj.objOrient[i][o] = 0;
        imPNOption[o].src = "../images/" + data.stimuli[map][obj.options[i][o]] + "_" + imgWorld + ".png";
    } else{
        obj.objOrient[i][o] = 1;
        imPNOption[o].src = "../images/" + data.stimuli[map][obj.options[i][o]] + "_" + imgWorld + ".png";
    }
}

// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
// Learn pairs
var stimA = document.getElementById("Pic1A");
var stimB = document.getElementById("Pic2A");

// To randomize stimulus pair presentation during pairwise association task
var memCorr = document.getElementById("memCorr");
var totalPairs = document.getElementById("totalPairs");

function LearnPairs(){
    this.ix             = [];
    this.pairA          = [];
    this.pairA_orient   = [];
    this.pairB          = [];
    this.pairB_orient   = [];
    this.RT             = [];
    this.stim_on        = [];
    this.trialCounter   = 0;
    this.totalRew   = [];
    this.maxTrials      = [];
}

// Create random object sequences
function setPairwiseSequence(){
    data.learnPairs[data.learnPairs.length] = new LearnPairs();
    obj = data.learnPairs[data.learnPairs.length-1];
    obj.startTime = recordTime();
    ix = shuffle(Array.apply(null, {length: pairsA.length}).map(Number.call, Number));
    obj.context = Array.apply(null, Array(ix.length)).map(Number.prototype.valueOf,map);

    obj.maxTrials = ix.length;
    for (var i = 0; i<obj.maxTrials; i++){
        assocTestTrial = ix.pop();
        t = 0;
        // Make sure both objects are replaced
        while (t < 100 && (pairsA[assocTestTrial] === obj.pairA[obj.pairA.length-1] || pairsB[assocTestTrial] === obj.pairB[obj.pairB.length-1])){
            ix.push(assocTestTrial);        // Add index again
            ix = shuffle(ix);               // Shuffle data
            assocTestTrial = ix.pop();
            t++;
        }
        obj.ix.push(assocTestTrial);
        obj.pairA.push(pairsA[assocTestTrial]);
        obj.pairB.push(pairsB[assocTestTrial]);
    }
};

//Present object pair i from object obj
function presentTwoObjects(){
    feedbackImg.src = "../images/empty.png";
    i++;
    if (obj.trialCounter < obj.maxTrials){
        map = obj.context[i];
        setContext(setContext(contextOrder[map]));
        if (Math.random() < 0.5){
            obj.pairA_orient.push('');
        } else {
            obj.pairA_orient.push('_mirr');
        }

        if (Math.random() < 0.5){
            obj.pairB_orient.push('');
        } else {
            obj.pairB_orient.push('_mirr');
        }

        stimA.src = "../images/" + data.stimuli[map][obj.pairA[i]] + obj.pairA_orient[i] + ".png";
        stimB.src = "../images/" + data.stimuli[map][obj.pairB[i]] + obj.pairB_orient[i] + ".png";

        d = new Date();
        obj.stim_on.push(d.getTime());
        obj.RT[i-1] = obj.stim_on[i]-obj.stim_on[i-1];
        obj.trialCounter++;

        // add up values for output;
        var cr = obj.cr; cr = cr.map(cr => cr === 1 ? 1 : 0);
        document.getElementById("crMemories").innerHTML     = cr.reduce(add, 0);
        document.getElementById("totalMemories").innerHTML  = cr.length;

    } else {
        proceedInExpt();
        obj.endTime = recordTime();
    }
};

// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
// Memory test
function MemoryTest(){
    this.seq            = [];
    this.ix             = [];
    this.nonix          = [];
    this.pairA          = [];
    this.pairA_orient   = [];
    this.pairB          = [];
    this.pairB_orient   = [];
    this.paired         = [];
    this.RT             = [];
    this.stim_on        = [];
    this.choice         = [];
    this.cr             = [];
    this.trialCounter   = 0;
    this.maxTrials      = [];
    this.totalRew       = 0;
}

//Present object pair i from object obj
function generateMemorySequence(){
    stimA.src = "../images/empty.png";
    stimB.src = "../images/empty.png";
    data.memory[data.memory.length] = new MemoryTest();

    obj = data.memory[data.memory.length-1];
    obj.startTime = recordTime();

    ix[0] = shuffle(Array.apply(null, {length: pairsA.length}).map(Number.call, Number));
    nonix[0] = shuffle(Array.apply(null, {length: nonPairsA.length}).map(Number.call, Number));
    nonix[0] = nonix[0].slice(0, ix[0].length);

    ix[1] = shuffle(Array.apply(null, {length: pairsA.length}).map(Number.call, Number));
    nonix[1] = shuffle(Array.apply(null, {length: nonPairsA.length}).map(Number.call, Number));
    nonix[1] = nonix[1].slice(0, ix[1].length);


    if (settings.day === 1 || settings.day === 2){
        obj.context = Array.apply(null, Array(ix[map].length + nonix[map].length)).map(Number.prototype.valueOf,map);
    } else {
        obj.context =(Array.apply(null, Array(ix[0].length + nonix[0].length)).map(Number.prototype.valueOf,0));
        obj.context = shuffle(obj.context.concat(Array.apply(null, Array(ix[1].length + nonix[1].length)).map(Number.prototype.valueOf,1)));
    }

    for (var i = 0; i<obj.context.length; i++){
        map = obj.context[i];
        t = 0;
        if ((Math.random() < 0.5 && ix[map].length > 0) || nonix[map].length < 1){
            obj.paired.push(1);
            assocTestTrial = ix[map].pop();
             // Make sure both objects are replaced
            while (t < 100 && (pairsA[assocTestTrial] === obj.pairA[obj.pairA.length-1] || pairsB[assocTestTrial] === obj.pairB[obj.pairB.length-1])){
                ix[map].push(assocTestTrial);        // Add index again
                ix[map] = shuffle(ix[map]);               // Shuffle data
                assocTestTrial = ix[map].pop();
                t++;
            }
            obj.seq.push(assocTestTrial);
            obj.pairA.push(pairsA[assocTestTrial]);
            obj.pairB.push(pairsB[assocTestTrial]);

        } else {
            obj.paired.push(0);
            assocTestTrial = nonix[map].pop();
            while (t < 100 && (pairsA[assocTestTrial] === obj.pairA[obj.pairA.length-1] || pairsB[assocTestTrial] === obj.pairB[obj.pairB.length-1])){
                nonix[map].push(assocTestTrial);     // Add index again
                nonix[map] = shuffle(nonix[map]);         // Shuffle data
                assocTestTrial = nonix[map].pop();
                t++;
            }
            obj.seq.push(assocTestTrial);
            obj.pairA.push(nonPairsA[assocTestTrial]);
            obj.pairB.push(nonPairsB[assocTestTrial]);
        }
    }
    obj.maxTrials = Math.min(obj.context.length, settings.trialsMemory);
}

function recordMemoryResponse(response){
    $('button').prop('disabled', true);
    if (i > -1){
        d_button = new Date();
        obj.RT.push(d_button-d_pres);
        obj.choice.push(response);
        if (response === 0 && obj.paired[i] == 0 || response === 1 && obj.paired[i] == 1){
            obj.cr.push(1);
            data.totalReward++;
            obj.totalRew++;
            feedbackImg.src = "../images/correct.png";
        } else {
            obj.cr.push(-1);
            if (obj.totalRew > 0){
                data.totalReward--;
            }
            obj.totalRew = Math.max(0,obj.totalRew-1);
            feedbackImg.src = "../images/incorrect.png";
        }
    }
    imRew1.src = "../images/coins/" + Math.max(Math.min(obj.totalRew,50),0) + "coins.png";
    imRew2.src = "../images/coins/" + Math.max(Math.min(obj.totalRew-50,50),0) + "coins.png";
    imRew3.src = "../images/coins/" + Math.max(Math.min(obj.totalRew-100,50),0) + "coins.png";

    setTimeout(function() {
        // move on
        $('button').prop('disabled', false);
        presentTwoObjects();
    },timelag);
}

// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
// Shuffle object pairs
var targetObj = document.getElementById("targetFP");
var imgOption = [];
imgOption[0] = document.getElementById("Pic1FP");
imgOption[1] = document.getElementById("Pic2FP");
imgOption[2] = document.getElementById("Pic3FP");

// Define all variables to store in data matrix
function FindPartner(){
    this.ix             = [];
    this.target         = [];
    this.otherObj       = [];
    this.location       = [];
    this.stimPres       = [];
    this.maxTrials      = [];
    this.cr             = [];           // Is the subject's choice correct?
    this.chosenPos      = [];           // Chosen location
    this.chosenObj      = [];           // Which object does this correspond to?
    this.RT             = [];           // RT
    this.responseT      = [];           // Time of response
    this.totalRew       = [];
}

var objLoc = [0,1,2];

// Present pairwise associations
function findPartner(){
    feedbackImg.src = "../images/empty.png";
    i = Math.max(i,0);
    if (i === 0) {
        data.findPartner[data.findPartner.length] = new FindPartner();
        obj = data.findPartner[data.findPartner.length-1];
        obj.startTime = recordTime();

        ix[0] = shuffle(Array.apply(null, {length: pairsA.length}).map(Number.call, Number));
        nonix[0] = shuffle(Array.apply(null, {length: nonPairsA.length}).map(Number.call, Number));
        nonix[0] = nonix[0].slice(0, ix[0].length);

        ix[1] = shuffle(Array.apply(null, {length: pairsA.length}).map(Number.call, Number));
        nonix[1] = shuffle(Array.apply(null, {length: nonPairsA.length}).map(Number.call, Number));
        nonix[1] = nonix[1].slice(0, ix[1].length);

        if (settings.day === 1 || settings.day === 2){
            obj.maxTrials = ix[map].length;
            obj.ix = ix[map];
            obj.context = Array.apply(null, Array(obj.maxTrials)).map(Number.prototype.valueOf,map);
        } else {
            obj.maxTrials = ix[map].length*2;
            obj.context =(Array.apply(null, Array(obj.maxTrials/2)).map(Number.prototype.valueOf,0));
            obj.context = shuffle(obj.context.concat(Array.apply(null, Array(obj.maxTrials/2)).map(Number.prototype.valueOf,1)));

            var c = []; c[0] = 0; c[1] = 0;
            for (o = 0; o < obj.context.length; o++){
                obj.ix[o] = ix[obj.context[o]][c[obj.context[o]]];
                c[obj.context[o]]++;
            }
        }
    }

    if (i < obj.maxTrials){
        map = obj.context[i];
        setContext(setContext(contextOrder[map]));

        // Randomize object locations
        obj.location[i]     = shuffle(objLoc);
        obj.otherObj[i]     = [];

        // Target object and partner object
        obj.target[i]       = pairsA[obj.ix[i]];
        obj.otherObj[i][0]  = pairsB[obj.ix[i]];        // The 0th object corresponds to the correct partner

        // Display target object
        targetObj.src       = (Math.random() < 0.5) ? "../images/" + data.stimuli[map][obj.target[i]] + ".png" : "../images/" + data.stimuli[map][obj.target[i]] + "_mirr.png";

        // Objects 1 and 2 are distractor objects
        obj.otherObj[i][1] = Math.floor(Math.random()*settings.nobj);
        while (data.dist[obj.target[i]][obj.otherObj[i][1]]===1 || obj.otherObj[i][1] === obj.target[i]
                || obj.otherObj[i][1] === obj.otherObj[i][0]  ) {
            obj.otherObj[i][1] = Math.floor(Math.random()*settings.nobj);
        }

        obj.otherObj[i][2] = Math.floor(Math.random()*settings.nobj);
        while (data.dist[obj.target[i]][obj.otherObj[i][2]]===1 || obj.otherObj[i][2] === obj.target[i]
                || obj.otherObj[i][2] === obj.otherObj[i][0] || obj.otherObj[i][2] === obj.otherObj[i][1]) {
            obj.otherObj[i][2] = Math.floor(Math.random()*settings.nobj);
        }

        // draw target image, make sure the object location is randomized
        for(var pos=0; pos<3; pos++){
//            Which object is in this position?
            var a = [0, 1, 2].indexOf(obj.location[i][pos]);
            imgOption[pos].src = (Math.random() < 0.5) ? "../images/" + data.stimuli[map][obj.otherObj[i][a]] + ".png" : "../images/" + data.stimuli[map][obj.otherObj[i][a]] + "_mirr.png";
        }
        d = new Date();
        obj.stimPres[i] = d.getTime();

    } else {
        proceedInExpt();
        obj.endTime = recordTime();
    }
}

function findPartnerChooseObj(findPartnerChoice){
// Which object did the subject choose?
    obj.chosenPos[i] = findPartnerChoice;
    obj.chosenObj[i] = obj.otherObj[i][findPartnerChoice];

    // Was this the correct object? (i.e. 0th position in terms of obj.location)?
    if (obj.location[i][findPartnerChoice] === 0){
        obj.cr[i] = 1;
        data.totalReward++;
        obj.totalRew++;
        feedbackImg.src = "../images/correct.png";
    } else {
        obj.cr[i] = -1;
        if (obj.totalRew > 0){
            data.totalReward--;
        }
        obj.totalRew = Math.max(0,obj.totalRew-1);
        feedbackImg.src = "../images/incorrect.png";
    }

    imRew1.src = "../images/coins/" + Math.max(Math.min(obj.totalRew ,50),0) + "coins.png";
    imRew2.src = "../images/coins/" + Math.max(Math.min(obj.totalRew -50,50),0) + "coins.png";
    imRew3.src = "../images/coins/" + Math.max(Math.min(obj.totalRew -100,50),0) + "coins.png";

//    Make the other two objects disappear
    for(var pos=0; pos<3; pos++){
        if (pos !== findPartnerChoice){
            imgOption[pos].src = "../images/empty.png";
        }
    }

    // Record RTs
    d = new Date();
    obj.responseT[i] = d.getTime();
    obj.RT[i] = obj.responseT[i] - obj.stimPres[i];

    i++;

    document.getElementById("crFindPartnerMemories").innerHTML      = obj.RT.length/2 + obj.cr.reduce(add, 0)/2;
    document.getElementById("totalFindPartnerMemories").innerHTML   = obj.cr.length;

    setTimeout(function() {
        // move on
        findPartner();
    },timelag);
}

//// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
// Goal navigation task

function GoalNavigation(){
    this.chosenSeq      = [[]];
    this.objOrient      = [];               // Chosen object orientation
    this.options        = [[[]]];               // Options
    this.RT             = [[]];               // RT
    this.stim_on        = [[]];               // Onset time
    this.responseT      = [];               // Time of button press
    this.target         = [];               // Target object on trial i
    this.totalRew       = 0;
    this.rewardSeq      = [];                           // Reward sequence
    this.maxTrials      = settings.trialsGoalNavigation;
    this.nonix          = [];
    this.toWinOnThisTrial = [[]];
    this.progressStepSize = [[]];
    this.currentProgress = [[]];
    this.sideChosen     = [[]];
};

var step = 0;

var targetPicGN     = document.getElementById("targetPicGN");
var chosenPicGN     = document.getElementById("chosenPicGN");
var imGNOption = [];
for (o = 0; o < 2; o++){
    imGNOption[o]   = document.getElementById("Pic"+o+"GN");
}

var imGNOptionCanvas, imGNOptionCtx;
var distFromTarget, next, thisO, distractorO;
var imgOptionGN = []; imgOptionGN[0] = new Image(); imgOptionGN[1] = new Image();

var leftOverNonix = [];
var currentProgress = 0;

// Add progressbar
$( "#progressbar" ).progressbar({
    value: 0
});

function initializeTaskGoalNavigation() {
    if (!settings.displayFeedback){
        $("#goalNavigationPerformance").hide();
    } else{
        $("#progressbar").show();
        $("#goalNavigationPerformance").show();
    }

    i = Math.max(0,i);
    step = 0;

    data.goalNavigation[data.goalNavigation.length] = new GoalNavigation;
    obj = data.goalNavigation[data.goalNavigation.length-1];
    obj.startTime = recordTime();
    if (settings.day === 1 || settings.day === 2){
        if(typeof map === 'undefined'){
            if (settings.day === 1){
                map = 0;
            } else if (settings.day === 2 && settings.numberOfMaps === 1){
                map = 0;
            } else if (settings.day === 2 && settings.numberOfMaps > 1){
                map = 1;
            }
        }
        obj.context = Array.apply(null, Array(settings.trialsGoalNavigation)).map(Number.prototype.valueOf,map);
    } else {
        obj.context =(Array.apply(null, Array(settings.trialsGoalNavigation/2)).map(Number.prototype.valueOf,0));
        obj.context = shuffle(obj.context.concat(Array.apply(null, Array(settings.trialsGoalNavigation/2)).map(Number.prototype.valueOf,1)));
    }

    if (leftOverNonix.length >= obj.maxTrials){
        obj.nonix = leftOverNonix;
    } else {
        obj.nonix = shuffle(Array.apply(null, {length: nonPairsA.length}).map(Number.call, Number));
    }
    for (var ix = 0; ix < obj.maxTrials; ix++ ) {
        obj.chosenSeq[ix]           = [];
        obj.objOrient[ix]           = [];
        obj.options[ix]             = [];
        obj.RT[ix]                  = [];
        obj.stim_on[ix]             = [];
        obj.responseT[ix]           = [];
        obj.rewardSeq[ix]           = [];
        obj.toWinOnThisTrial[ix]    = [];
        obj.currentProgress[ix]     = [];
        obj.progressStepSize[ix]    = [];
        obj.sideChosen[ix]          = [];
    }
    displayGoalNavigation();
}

var neighbour;
function displayGoalNavigation() {
    $('#goalNavigation').show();
    $('#displayGoalNavigationSequence').hide();
    $('#goalNavigationShortestPathSelected').hide();

    if (i >= obj.maxTrials || i > obj.nonix.length-1){

        // Make sure that in a new block a new set of pairs is probed
        var counter = 0;
        for (o = i; o<obj.nonix.length; o++){
            leftOverNonix[counter] = obj.nonix[o];
            counter++;
        }
        obj.endTime = recordTime();
        saveData();
        proceedInExpt();
    } else if (i < obj.maxTrials && step === 0){
        obj.chosenSeq[i][step]  = [];
        obj.objOrient[i][step]  = [];
        obj.options[i][step]    = [];
        obj.RT[i][step]         = [];
        obj.stim_on[i][step]    = [];
        obj.responseT[i][step]  = [];
        for (var ox = 0; ox<1; ox++){
            obj.options[i][step][ox] = [];
        }
        obj.currentProgress[i][step] = 0;
        obj.progressStepSize[i][step] = [];

        progressCoins.src = "../images/coins/0coins.png";
        $("#progressbar").progressbar( "option", "value", obj.currentProgress[i][step]);

        setTimeout(function(){
            map = obj.context[i];
            setContext(contextOrder[map]);

            targetPicGN.src = "../images/" + imgWorld + ".png";
            chosenPicGN.src = "../images/" + imgWorld + ".png";
            for (o = 0; o < 2; o++){
                 imGNOption[o].src = "../images/" + imgWorld + ".png";
            }
        }, timelag);

        // Pick a new start and target object
        obj.chosenSeq[i][step]  = nonPairsA[obj.nonix[i]];
        obj.target[i]           = nonPairsB[obj.nonix[i]];

        setTimeout(function() {
            if (Math.random() < 0.5){
                chosenPicGN.src = "../images/" + data.stimuli[map][obj.chosenSeq[i][step]] + "_" + imgWorld + ".png";
            } else {
                chosenPicGN.src = "../images/" + data.stimuli[map][obj.chosenSeq[i][step]] + "_mirr_" + imgWorld + ".png";}
            if (Math.random() < 0.5){
                targetPicGN.src = "../images/" + data.stimuli[map][obj.target[i]] + "_" + imgWorld + ".png";
            } else {
                targetPicGN.src = "../images/" + data.stimuli[map][obj.target[i]] + "_mirr_" + imgWorld + ".png";}
        }, timelag);
    }

    if (step === 0){
        obj.toWinOnThisTrial[i][step] = data.dist[obj.target[i]][obj.chosenSeq[i][0]] ;
        obj.progressStepSize[i][step] = 100/data.dist[obj.target[i]][obj.chosenSeq[i][step]];
    }
    if (step !== 0 && settings.displayFeedback){
        progressCoins.src = '../images/coins/' + Math.max(0,obj.toWinOnThisTrial[i][step]) + "coins.png";
    }

    // Find one object that is on the way to the target and pick an additional distractor object
    data.distFromTarget = []; for (var j=0; j<6; j++){data.distFromTarget[j] = [];};
    for (j = 0; j < settings.nobj; j++){
        // One link away
        if ((data.dist[obj.target[i]][j] === 0) && (data.dist[j][obj.chosenSeq[i][step]] === 1)){
            data.distFromTarget[0].push(j);
            data.distFromTarget[0] = shuffle(data.distFromTarget[0]);
        } else if ((data.dist[obj.target[i]][j] === 1) && (data.dist[j][obj.chosenSeq[i][step]] === 1)){
            data.distFromTarget[1].push(j);
            data.distFromTarget[1] = shuffle(data.distFromTarget[1]);
        } // Two links away
        else if ((data.dist[obj.target[i]][j] === 2) && (data.dist[j][obj.chosenSeq[i][step]] === 1)){
            data.distFromTarget[2].push(j);
            data.distFromTarget[2] = shuffle(data.distFromTarget[2]);
        } // Three links away
        else if ((data.dist[obj.target[i]][j] === 3) && (data.dist[j][obj.chosenSeq[i][step]] === 1)){
            data.distFromTarget[3].push(j);
            data.distFromTarget[3] = shuffle(data.distFromTarget[3]);
        }
        else if ((data.dist[obj.target[i]][j] === 4) && (data.dist[j][obj.chosenSeq[i][step]] === 1)){
            data.distFromTarget[4].push(j);
            data.distFromTarget[4] = shuffle(data.distFromTarget[4]);
        }
        else if ((data.dist[obj.target[i]][j] === 5) && (data.dist[j][obj.chosenSeq[i][step]] === 1)){
            data.distFromTarget[5].push(j);
            data.distFromTarget[5] = shuffle(data.distFromTarget[5]);
        }
    }

    // Pick one of the closest objects
    next = [];
    j = 0;
    for (j = 5; j >= 0; j--){
        if (data.distFromTarget[j].length > 0){;
            next = data.distFromTarget[j][0];
        }
    }

    // Pick next object
    if (Math.random() < 0.5){
        obj.options[i][step][0] = next; thisO = 0; distractorO = 1;
    } else {
        obj.options[i][step][1] = next; thisO = 1; distractorO = 0;
    }

    neighbour = [];
    for(j = 0; j < settings.nobj; j++){
        if (data.dist[obj.chosenSeq[i][step]][j] === 1 && j !== next){
            neighbour.push(j);
        }
    }
    neighbour = shuffle(neighbour);

    // Pick a second distractor object
    obj.options[i][step][distractorO] = neighbour[0];
    if (obj.chosenSeq[i][step] === obj.target[i]){ // id rhw choice is correct
        data.totalReward += Math.max(0,obj.toWinOnThisTrial[i][step]);
        obj.totalRew += Math.max(0,obj.toWinOnThisTrial[i][step]);
        i++;
        step = 0;
        setTimeout(function(){
            targetPicGN.src = "../images/" + imgWorld + ".png";
            chosenPicGN.src = "../images/" + imgWorld + ".png";
            displayGoalNavigationSequence();
        }, timelag);
    } else {
        setTimeout(function() {
            drawOption(0);
            drawOption(1);
            if (settings.displayFeedback){
                progressCoins.src = '../images/coins/' + Math.max(0,obj.toWinOnThisTrial[i][step]) + "coins.png";
            } else {
                progressCoins.src = "../images/empty.png";
            }
            d = new Date();
            obj.stim_on[i][step] = d.getTime();
        }, timelag);
    }
}

function drawOption(ox){
        // Present object 'obj' in given orientation, determine correct button press
        if (Math.random() < 0.5){
            obj.objOrient[i][step][ox] = ("");
            imGNOption[ox].src = "../images/" + data.stimuli[map][obj.options[i][step][ox]] + "_" + imgWorld + ".png";
        } else{
            obj.objOrient[i][step][ox] = ("_mirr");
            imGNOption[ox].src = "../images/" + data.stimuli[map][obj.options[i][step][ox]] + "_mirr_" + imgWorld + ".png";
        }
        imGNOption[ox].onclick = function(){chooseGN(ox);};
}

function chooseGN(chosenObjGoalNavigation){
    // record RT
    d = new Date();
    obj.responseT[i][step] = d.getTime();
    obj.RT[i][step] = obj.responseT[i][step] - obj.stim_on[i][step];
    obj.sideChosen[i][step]     = chosenObjGoalNavigation;

    imGNOption[0].onclick = null;
    imGNOption[1].onclick = null;

    // Record response;
    step++;
    obj.chosenSeq[i][step]  = [];
    obj.objOrient[i][step]  = [];
    obj.options[i][step]    = [];
    obj.RT[i][step]         = [];
    obj.stim_on[i][step]    = [];
    obj.responseT[i][step]  = [];
    for (var ox = 0; ox<1; ox++){
        obj.options[i][step][ox] = [];
    }
    obj.chosenSeq[i][step] = obj.options[i][step-1][chosenObjGoalNavigation];

    // Make other object disappear
    imGNOption[(chosenObjGoalNavigation+1)%2].src = "../images/" + imgWorld + ".png";

    if (data.dist[obj.target[i]][obj.options[i][step-1][chosenObjGoalNavigation]] >
        data.dist[obj.target[i]][obj.options[i][step-1][(chosenObjGoalNavigation + 1)%2]]){
        obj.rewardSeq[i][step] = -1;
        obj.currentProgress[i][step] = Math.max(0,obj.currentProgress[i][step-1] - obj.progressStepSize[i][step-1]);
        obj.toWinOnThisTrial[i][step] = obj.toWinOnThisTrial[i][step-1]-1;
        if (obj.currentProgress[i][step] <= 0){
            obj.progressStepSize[i][step] = 100/data.dist[obj.target[i]][obj.chosenSeq[i][step]];
        } else {
            obj.progressStepSize[i][step] = obj.progressStepSize[i][step-1];
        }
    } else {
        obj.rewardSeq[i][step] = 1;
        obj.currentProgress[i][step] = Math.max(0,obj.currentProgress[i][step-1] + obj.progressStepSize[i][step-1]);
        obj.toWinOnThisTrial[i][step] = obj.toWinOnThisTrial[i][step-1];
        obj.progressStepSize[i][step] = obj.progressStepSize[i][step-1];
    }
    progressCoins.src = '../images/coins/' + Math.max(0,obj.toWinOnThisTrial[i][step]) + "coins.png";
    $("#progressbar").progressbar( "option", "value", obj.currentProgress[i][step]);

    setTimeout(function() {
        // Move chosen image to chosen image position
        chosenPicGN.src = imGNOption[chosenObjGoalNavigation].src;
        imGNOption[chosenObjGoalNavigation].src = "../images/" + imgWorld + ".png";

        feedbackImg2.src = "../images/empty.png";
        progressCoins.src = "../images/empty.png";
    }, timelag);

    setTimeout(function(){
        displayGoalNavigation();
    },timelag);
}

function displayGoalNavigationSequence(){
    // Only display the sequence during training. During test, move straight to the next trial.
    if (!settings.displayFeedback){
        displayGoalNavigation();
    } else {

        if (obj.chosenSeq[i-1].length-1 === data.dist[obj.target[i-1]][obj.chosenSeq[i-1][0]]){
            $('#goalNavigationShortestPathSelected').show();
        }

        $('#goalNavigation').hide();
        $('#displayGoalNavigationSequence').show();
        $("#goalNavSequence > tbody:last").children().remove();
        // Display sequence of selected objects
        for (addSeqEl = 0; addSeqEl < Math.min(7,obj.chosenSeq[i-1].length); addSeqEl++){
            $("#goalNavSequence").find('tbody')
            .append($('<th>')
                .append($('<td>')
                    .append($('<img>')
                        .attr({
                            src: '../images/' + data.stimuli[map][obj.chosenSeq[i-1][addSeqEl]] + '.png',
                            }).height(120).width(120)
                        .text('Image cell')
                    )
                )
            );
        };
        if (obj.chosenSeq[i-1].length>7){
            $("#goalNavSequence").find('tbody')
                .append($('<tr>'));
            for (addSeqEl = 7; addSeqEl < Math.min(14,obj.chosenSeq[i-1].length); addSeqEl++){
                $("#goalNavSequence").find('tbody')
                .append($('<th>')
                    .append($('<td>')
                        .append($('<img>')
                            .attr({
                                src: '../images/' + data.stimuli[map][obj.chosenSeq[i-1][addSeqEl]] + '.png',
                                }).height(120).width(120)
                            .text('Image cell')
                        )
                    )
                );
            };
        }
        if (obj.chosenSeq[i-1].length>14){
            $("#goalNavSequence").find('tbody')
                .append($('<tr>'));
            for (addSeqEl = 14; addSeqEl < Math.min(21,obj.chosenSeq[i-1].length); addSeqEl++){
                $("#goalNavSequence").find('tbody')
                .append($('<th>')
                    .append($('<td>')
                        .append($('<img>')
                            .attr({
                                src: '../images/' + data.stimuli[map][obj.chosenSeq[i-1][addSeqEl]] + '.png',
                                }).height(120).width(120)
                            .text('Image cell')
                        )
                    )
                );
            };
        }

        $('#nextGoalNavigationTrial').show();
    }
}

//// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
// Object difference task

// Visualise an example
var exImPNOption = [], exImPNContext = [];
var exImPNChosen = document.getElementById("exChosenPicPN");
var exImPNChContext = exImPNChosen.getContext("2d");
var exStart, exStartContext;
var exPnImg = []; exPnImg[0] = new Image(); exPnImg[1] = new Image(); var exPnImgCh = new Image();
var stepsOnTheWay = [];
var stepL = [];
stepsOnTheWay[0] = document.getElementById("exStep1r");
stepsOnTheWay[1] = document.getElementById("exStep1l");
stepsOnTheWay[2] = document.getElementById("exStep2l");
stepsOnTheWay[3] = document.getElementById("exStep3l");
stepsOnTheWay[0] = document.getElementById("exStep1r");

function visualiseObjectDifferenceTask(){
    for (o = 0; o < 2; o++){
        exImPNOption[o] = document.getElementById("exPic"+o+"PN");
        exImPNContext[o] = exImPNOption[o].getContext("2d");
        exImPNOption[o].style.border= "5px solid #FFFFFF";
        fillCanvs(exImPNContext[o],[150,150],function(){
        });
    }

    exStart = document.getElementById("exChosenPicPN");
    exStartContext = exStart.getContext("2d");
    exStart.style.border= "5px solid #FFFFFF";

    fillCanvs(exStartContext,[150,150],function(){

        // Fill these with example objects
        randomStartObject = randomIntFromInterval(0,settings.nobj-1);

        // find a first object that is two links away
        randomObj1        = randomIntFromInterval(0,settings.nobj-1);
        while (data.dist[randomStartObject][randomObj1] !== 4){
            randomObj1        = randomIntFromInterval(0,settings.nobj-1);
        }
        randomObj2      = randomIntFromInterval(0,settings.nobj-1);
        while (data.dist[randomStartObject][randomObj2] !== 2){
            randomObj2        = randomIntFromInterval(0,settings.nobj-1);
        }

        exPnImgCh.src = "../images/" + data.stimuli[map][randomStartObject] + ".png";
        exPnImg[0].src = "../images/" + data.stimuli[map][randomObj1] + ".png";
        exPnImg[1].src = "../images/" + data.stimuli[map][randomObj2] + ".png";

        exPnImgCh.onload = function() {
            exStartContext.drawImage(exPnImgCh, 0,0,100,100);
        };
        exPnImg[0].onload = function() {
            exImPNContext[0].drawImage(exPnImg[0], 0,0,150,150);
        };
        exPnImg[1].onload = function() {
            exImPNContext[1].drawImage(exPnImg[1], 0,0,150,150);
        };
    });

    var stepRight = randomIntFromInterval(0,settings.nobj-1);
    while (!(data.dist[randomStartObject][stepRight] === 1) && (data.dist[randomStartObject][randomObj2] === 1)){
        stepRight = randomIntFromInterval(0,settings.nobj-1);
    }
    stepsOnTheWay[0].src = "../images/"+data.stimuli[map][stepRight]+".png";

    stepL[0] = randomStartObject;
    for (o = 1; o < 4; o++){
        stepL[o]  = randomIntFromInterval(0,settings.nobj-1);
        while (!(data.dist[stepL[o-1]][stepL[o]] === 1 && data.dist[stepL[o]][randomObj1] === 4-o)){
            stepL[o] = randomIntFromInterval(0,settings.nobj-1);
        }
        stepsOnTheWay[o].src = "../images/" + data.stimuli[map][stepL[o]] + ".png";
    }
}

function ObjectDifference(){
    this.target     = []; // random start object
    this.target_orient = [];
    this.chosenObj  = [];
    this.objOrient  = [];
    this.options    = [];
    this.dist       = [[]];
    this.cr  = Array.apply(null, Array(settings.trialsPassiveNavigation)).map(Number.prototype.valueOf,0);
    this.stim_on    = [];
    this.responseT  = [];
    this.RT         = [];
    this.totalRew   = 0;
    this.earlyResponse = [];
    this.sideChosen = [];
}

function objectDifferencePresentNewObj() {
    feedbackImg.src = "../images/empty.png";
    i = Math.max(0,i);
    if (i >= settings.trialsObjectDifference){
        obj.endTime = recordTime();
        saveData();
        proceedInExpt();
    } else {

        if (i===0){
            // New passive navigation object
            data.objectDifference[data.objectDifference.length] = new ObjectDifference();
            obj = data.objectDifference[data.objectDifference.length-1];
            obj.startTime = recordTime();
            if (settings.day === 1 || settings.day === 2){
                obj.context = Array.apply(null, Array(settings.trialsObjectDifference)).map(Number.prototype.valueOf,map);
            } else {
                obj.context =(Array.apply(null, Array(settings.trialsObjectDifference/2)).map(Number.prototype.valueOf,0));
                obj.context = shuffle(obj.context.concat(Array.apply(null, Array(settings.trialsObjectDifference/2)).map(Number.prototype.valueOf,1)));
            }
        }
        map = obj.context[i];
        setContext(contextOrder[map]);

        obj.objOrient[i]    = [];
        obj.dist[i]         = [];
        obj.options[i]      = [];
        obj.target[i]       = randomIntFromInterval(0,settings.nobj-1);
        object              = obj.target[i];

        document.getElementById("moveToNext").style.display = "none";

        // Choose two options for object 1 and 2 that are neighbours on the data.graph
        obj.options[i][0] =  randomIntFromInterval(0,settings.nobj-1);
        while (obj.options[i][0] === object) {
            obj.options[i][0] = randomIntFromInterval(0,settings.nobj-1);
        }

        obj.options[i][1] = randomIntFromInterval(0,settings.nobj-1);
        while (obj.options[i][1] === object || obj.options[i][1] === obj.options[i][0] ||
                data.dist[obj.options[i][0]][object] === data.dist[obj.options[i][1]][object]) {
            obj.options[i][1] = randomIntFromInterval(0,settings.nobj-1);
        }

        obj.dist[i][0] = data.dist[obj.options[i][0]][object];
        obj.dist[i][1] = data.dist[obj.options[i][1]][object];
        obj.dist[i][2] = data.dist[obj.options[i][0]][obj.options[i][1]];

        // Mark old object as chosen object
        $(document).ready(function(){
                if (Math.random() < 0.5){
                    obj.target_orient[i] = 0;
                    imPNChosen.src = "../images/" + data.stimuli[map][obj.target[i]] + "_" + imgWorld + ".png";
                } else{
                    obj.target_orient[i] = 1;
                    imPNChosen.src = "../images/" + data.stimuli[map][obj.target[i]] + "_mirr_" + imgWorld + ".png";
                }

            for (o = 0; o<2; o++){
                    imPNOption[o].style.border= "5px solid #ffffff";
                    drawObject(o);
            }
        });

        imPNOption[0].onclick = function(){chosenObjPN = 0; chooseObjectDifference();};
        imPNOption[1].onclick = function(){chosenObjPN = 1; chooseObjectDifference();};
        d = new Date();
        obj.stim_on[i] = d.getTime();
    }
}

function chooseObjectDifference(){
    // Disable onclick
    imPNOption[0].onclick = null;
    imPNOption[1].onclick = null;

    // Record RT
    d = new Date();
    obj.responseT[i] = d.getTime();
    obj.RT[i]        = obj.responseT[i] - obj.stim_on[i];
    obj.chosenObj[i] = obj.options[i][chosenObjPN];
    obj.sideChosen[i] = chosenObjPN;

    if (obj.dist[i][chosenObjPN] < obj.dist[i][(chosenObjPN + 1)%2]){
        if (settings.displayFeedback){
            imPNOption[chosenObjPN].style.border= "5px solid green";
            feedbackImg.src = "../images/correct.png";
        } else {
            imPNOption[chosenObjPN].style.border= "5px solid black";
        }
        obj.cr[i] = 1;
        obj.totalRew++;
        data.totalReward ++;
    } else {
        if (settings.displayFeedback){
            imPNOption[chosenObjPN].style.border= "5px solid red";
            feedbackImg.src = "../images/incorrect.png";
        } else {
            imPNOption[chosenObjPN].style.border= "5px solid black";
        }
        obj.cr[i] = -1;
        if (obj.totalRew > 0){
            data.totalReward--;
        }
        obj.totalRew = Math.max(0,obj.totalRew-1);
    }
    imRew1.src = "../images/coins/" + Math.max(Math.min(obj.totalRew,50),0) + "coins.png";
    imRew2.src = "../images/coins/" + Math.max(Math.min(obj.totalRew-50,50),0) + "coins.png";
    imRew3.src = "../images/coins/" + Math.max(Math.min(obj.totalRew-100,50),0) + "coins.png";

    setTimeout(function() {
        i++;
        objectDifferencePresentNewObj();
    },timelag);
}
