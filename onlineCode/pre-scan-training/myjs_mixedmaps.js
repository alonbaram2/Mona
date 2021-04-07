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
var object;

// initialize random number generator
var mn = Math.floor(mn/2);
var i, t, nr, o, ix, nonix;
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

    var uploadPath = dir + "/data/v" + data.version + '_day' + data.day + "_"+ data.subject_id + ".JSON";
    var JSONstring = JSON.stringify(data);

    $.ajax({
        type: "PUT",
        url: uploadPath,
        dataType: 'JSON',
        async: false,
        data: JSONstring
    });

    var timeLinePath = dir + "/data/v" + data.version + '_day' + data.day + "_"+ data.subject_id + "_timeLine.JSON";
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
            if (data.day === 1) {
                if (this.value === "yes"){
                    $('#enterProlificIDDay1').show();
                    data.prolificPart = true;
                    data.prolificTick = true;
                } else {
                    $('#enterProlificIDDay1').hide();
                    data.prolificPart = false;
                    data.prolificTick = false;
                };
            } else {
                if (this.value === "yes"){
                    $('#detailsDay2_2').show();
                    data.prolificPart = true;
                    data.prolificTick = true;
                } else {
                    $('#detailsDay2_2').show();
                    data.prolificPart = false;
                    data.prolificTick = false;
                };
            };
        };
    }
}

// Preload background images
function preloader() {
    backGroundImage0.src = "../images/background/bg0.jpg";
    backGroundImage1.src = "../images/background/bg1.jpg";
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
    document.getElementById("noOfTasks" + data.day).innerHTML = settings.noOfTasks[data.day-1];
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
var subjectDetails  = new TimeLine(["detailsDay" + data.day, "ProlificID","proceed"], ["enterProlificIDDay1"], [enterProlific],0);
var generalInstr    = new TimeLine(["generalIntroDay" + data.day,"proceed"], [], [loadSubjectData],0);
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
var instrGoalNav    = new TimeLine(["instrGoalNavigation","proceed"], [], [],0);
var startGoalNav    = new TimeLine(["goalNavigation"], [], [initializeTaskGoalNavigation,saveData],settings.trialsGoalNavigation*3);
var endGoalNav      = new TimeLine(["endOfBlock","displayRewards","proceed"], [], [],0);
var instrObjDiff    = new TimeLine(["instrObjDiff","proceed"], [], [],0);
var startObjDiff    = new TimeLine(["objectDifference","ChooseBetweenTwoOptions"],[],[provideFeedback,objectDifferencePresentNewObj,saveData],settings.trialsObjectDifference);
var endObjDiff      = new TimeLine(["endOfBlock","displayRewards","proceed"], [], [],0);
var participantFeedbackDay1   = new TimeLine(["participantFeedbackDay1","proceed"], [], [],0);
var participantFeedbackDay2   = new TimeLine(["participantFeedbackDay2","proceed"], [], [],0);
var endExperimentDay1   = new TimeLine(["endExperiment"],["inviteForFollowUp","inviteForFollowUp2"],[subjectFeedback],0);       // The script subjectFeedback calls endExp()
var endExperimentDay2   = new TimeLine(["endExperiment"],[],[subjectFeedback],0);
var memoryReminder  = new TimeLine(["pairwiseAssociations", "memoryReminder","moveThroughObjectPairs"],["memoryTestInstructions", "moveThroughMemoryTest"],[setPairwiseSequence,presentTwoObjects],0);

//*Experiment Timeline for Day1 - either 1 or 2 maps
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
//exptTimeLine.push(instrPassiveNav);
//exptTimeLine.push(startPassiveNav);
//exptTimeLine.push(endPassiveNav);
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
//exptTimeLine.push(participantFeedback);
exptTimeLine.push(endExperimentDay1);
//*//

/*Experiment Timeline for Day2
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
exptTimeLine.push(instrPassiveNav);
exptTimeLine.push(startPassiveNav);
exptTimeLine.push(endPassiveNav);
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
exptTimeLine.push(memoryReminder);
exptTimeLine.push(participantFeedbackDay1);
exptTimeLine.push(endExperimentDay1);
*/


/*Experiment Timeline for Day3, 2 maps
exptTimeLine.push(subjectDetails);
exptTimeLine.push(generalInstr);
//exptTimeLine.push(instrMemory);
//exptTimeLine.push(trainMemory);
exptTimeLine.push(instrMemoryTest);
exptTimeLine.push(testMemory);
exptTimeLine.push(endMemory);
//exptTimeLine.push(instrFindParter);
//exptTimeLine.push(startFindParter);
//exptTimeLine.push(endFindParter);
//exptTimeLine.push(instrPassiveNav);
//exptTimeLine.push(startPassiveNav);
//exptTimeLine.push(endPassiveNav);
//exptTimeLine.push(instrGoalNav);
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
//exptTimeLine.push(participantFeedback);
exptTimeLine.push(endExperimentDay2);
*/

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

function doNothing(){
}

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

    // Display reward
    imRew1.src = "../images/coins/" + Math.max(Math.min(obj.totalRew,50),0) + "coins.png";
    imRew2.src = "../images/coins/" + Math.max(Math.min(obj.totalRew-50,50),0) + "coins.png";
    imRew3.src = "../images/coins/" + Math.max(Math.min(obj.totalRew-100,50),0) + "coins.png";

    data.totalReward += Math.max(0,obj.totalRew);
    document.getElementById("displayRewardsBlock").innerHTML = obj.totalRew;

    data.timeLine[runThrough]   = exptTimeLine[runThrough].toShow[0];
}

function endExp() {
    saveData();
    document.getElementById("subjID").innerHTML                 = data.subject_id;
    document.getElementById("totalCollectedReward").innerHTML   = data.totalReward;
    document.getElementById("bonus").innerHTML                  = data.totalReward/100;

    if (data.prolificPart === false){
        $("#submitToProlific").text("You can now close the browser to exit the experiment.");
    };

    if (data.totalReward > data.perfCriterion && data.prolificPart === true){
        $("#inviteForFollowUp").show();
        $("#inviteForFollowUp2").show();
    }
    data.exptTimeLine = exptTimeLine;
}

function loadSubjectData(){
    // Convert to numerical ID
    data.participantId = document.getElementById("prolificId").value;
    for (var i = 0; i<data.participantId.length; i++){
        if (!isNaN(Number(data.participantId[i]))){
            data.subject_id = data.subject_id + data.participantId[i];
        }
    }
    data.subject_id = Number(data.subject_id);

    if (data.subject_id.length < 1 || isNaN(data.subject_id)){
        data.subject_id = Math.floor(Math.random()*100000000);
    }

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
        data.stimuli = this.responseText.split(' ').map(Number);
        if (data.stimuli.length > settings.nobj){
            data.stimuli.pop();
        }
      }
    };
    if (data.day === 1){
        xhttp.open("GET", "stimuli/day" + data.day + "/" + settings.graphStructure + "/" + (data.subject_id % 25 + 1) + "/r_" + (''+data.subject_id)[0] + ".txt", true);
        document.getElementById("newDay").innerHTML.display = "none";
    } else if (data.day === 2 && settings.numberOfMaps > 1){
        xhttp.open("GET", "stimuli/day" + data.day + "/" + settings.graphStructure + "/" + (data.subject_id % 25 + 1) + "/r_" + (''+data.subject_id)[0] + "_var_" + (''+data.subject_id)[1]+".txt", true);
        document.getElementById("newDay").innerHTML = "Please note:<br>These associations are not the same as the ones you learned yesterday, so don't get confused!<br><br>";
    } else if (data.day === 2 && settings.numberOfMaps === 1){
        xhttp.open("GET", "stimuli/day1/" + settings.graphStructure + "/" + (data.subject_id % 25 + 1) + "/r_" + (''+data.subject_id)[0] + ".txt", true);
        document.getElementById("newDay").innerHTML.display = "none";
    }
    xhttp.send();

    data.option = [];
    data.option[0] = ((data.subject_id % 2) === 0) ? "70" : "74";
    data.option[1] = ((data.subject_id % 2) === 0) ? "74" : "70";

    data.age        = document.getElementById("myNumber").value;
    data.gender     = $("input:radio[name=gender]:checked").val();


    // If even and day 1 or odd and day 2
    if ((data.subject_id%2 === 0 && data.day === 1) || (data.subject_id%2 !== 0 && data.day === 2 )){
        setContext(0);
    } else {
        setContext(1);
    }
    document.getElementById("whichWorld").innerHTML = "Today you are in the " + imgWorld + " world";
}

function setContext(context){
    if (context === 0){
        imgFill = "#70ADC9";
        imgWorld = "blue";
        $(".edit-button").css("background-color", "#0095dd");
        $("html").css("background-image", 'url(../images/background/bg'+data.subject_id %2+'.jpg)');
    } else if (context === 1){
        imgFill = "#CA7270";
        imgWorld = "red";
        $(".edit-button").css("background-color", "#990000");
        $("html").css("background-image", 'url(../images/background/bg'+(data.subject_id+1)%2+'.jpg)');
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
    endExp();
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
}

function instructPassiveExposure() {
    // New data structure
    data.passiveExposure[data.passiveExposure.length] = new PassiveExposure();

    canvas1 = document.getElementById("Pic1PE_instr");
    ctx1 = canvas1.getContext("2d");
    ctx1.fillStyle = imgFill;
    ctx1.fillRect(0,0,200,200);

    var ex_obj = randomIntFromInterval(0,settings.nobj-1);

    if (data.option[data.mirror[ex_obj]] === "70"){
        peImg1.src = '../images/'+data.stimuli[ex_obj]+'.png';
        peImg2.src = '../images/'+data.stimuli[ex_obj]+'_mirr.png';
    } else {
        peImg1.src = '../images/'+data.stimuli[ex_obj]+'_mirr.png';
        peImg2.src = '../images/'+data.stimuli[ex_obj]+'.png';
    }

    peImg1.onload = function() {
        ctx1.drawImage(peImg1, 0,0);
    };

    canvas2 = document.getElementById("Pic2PE_instr");
    ctx2 = canvas2.getContext("2d");
    ctx2.fillStyle = imgFill;
    ctx2.fillRect(0,0,200,200);

    peImg2.onload = function() {
        ctx2.drawImage(peImg2, 0,0);
    };
}

function passiveExposurePresentNewObj(){
    obj = data.passiveExposure[data.passiveExposure.length-1];
    obj.startTime = recordTime();

    imRew1.src = "../images/coins/" + Math.max(Math.min(obj.totalRew,50),0) + "coins.png";
    imRew2.src = "../images/coins/" + Math.max(Math.min(obj.totalRew-50,50),0) + "coins.png";
    imRew3.src = "../images/coins/" + Math.max(Math.min(obj.totalRew-100,50),0) + "coins.png";

    i = Math.max(i,0);
    // Present old object
    imPEOld = document.getElementById("PicOldPE");
    imPE2 = imPEOld.getContext("2d");
    imPE2.fillStyle = imgFill;
    imPE2.fillRect(0,0,100,100);

    // Draw preceding object in small box
    if (i !== 0){   // not on first trial - no preceding object
        peImg2.src = peImg1.src;
        peImg2.onload = function() {
            imPE2.drawImage(peImg2, 0,0, 100, 100);
        };
    }

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
    peImg1.src = "../images/" + data.stimuli[obj.objSeq[i]] + obj.objOrient[i] + ".png";

    // Present new object
    imPENew = document.getElementById("PicNewPE");
    imPE1 = imPENew.getContext("2d");
    imPE1.fillStyle = imgFill;
    imPE1.fillRect(0,0,200,200);

    peImg1.onload = function() {
        imPE1.drawImage(peImg1, 0,0);
    };

    imPENew.style.border= "5px solid #ffffff";
    feedbackImg.src = "../images/empty.png";

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
            } else if (obj.key[i] == obj.key_incorr[i]) {
                obj.cr[i] = -1;
                imPENew.style.border= "5px solid #EC2028";
                feedbackImg.src = "../images/incorrect.png";
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

var imPNOption = [], imPNContext = [];
var imPNChosen = document.getElementById("chosenPicPN");
var imPNChContext = imPNChosen.getContext("2d");
var pnImg = []; pnImg[0] = new Image(); pnImg[1] = new Image(); var pnImgCh = new Image();
var chosenObjPN;
for (o = 0; o<2; o++){
    imPNOption[o] = document.getElementById("Pic"+o+"PN");
    imPNContext[o] = imPNOption[o].getContext("2d");
}

function PassiveNavigation(){
    this.chosenSeq  = [randomIntFromInterval(0,settings.nobj-1)]; // random start object
    this.objOrient  = [];
    this.options    = [];
    this.rewardSeq  = Array.apply(null, Array(settings.trialsPassiveNavigation)).map(Number.prototype.valueOf,0);
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
        proceedInExpt();
        obj.endTime = recordTime();
    } else {
        if (i===0){
            imPNChContext.fillStyle = imgFill;
            imPNChContext.fillRect(0,0,100,100);

            // New passive navigation object
            data.passiveNavigation[data.passiveNavigation.length] = new PassiveNavigation();
            obj = data.passiveNavigation[data.passiveNavigation.length-1];
            obj.startTime = recordTime();
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
    imPNContext[chosenObjPN] = imPNOption[chosenObjPN].getContext("2d");
    imPNOption[chosenObjPN].style.border= "5px solid #545454";
    imPNContext[(chosenObjPN +1) % 2].fillRect(0,0,150,150);

    setTimeout(function() {
        i++;
        for (o = 0; o<2; o++){
            imPNContext[o].fillRect(0,0,150,150);
            imPNOption[o].style.border= "5px solid #ffffff";
        }

        // Record chosen object
        obj.chosenSeq[i] = obj.options[i-1][chosenObjPN];

        //    Counts transitions chosen by subject & rewards with 50% probability if not rewarded before
        if (Math.random()<0.5 && rewardTransitions[obj.chosenSeq[i-1]][obj.chosenSeq[i]] === 0){
            obj.rewardSeq[i] = 1;
            obj.totalRew++;
            feedbackImg.src = "../images/correct.png";

            rewardTransitions[obj.chosenSeq[i-1]][obj.chosenSeq[i]] = 1;
            imRew1.src = "../images/coins/" + Math.max(Math.min(obj.totalRew,50),0) + "coins.png";
            imRew2.src = "../images/coins/" + Math.max(Math.min(obj.totalRew-50,50),0) + "coins.png";
            imRew3.src = "../images/coins/" + Math.max(Math.min(obj.totalRew-100,50),0) + "coins.png";
        }

        if (i > 0){
            transitions[obj.chosenSeq[i-1]][obj.chosenSeq[i]]++;
        }

         // Mark old object as chosen object
        imPNChContext.fillStyle = imgFill;
        imPNChContext.fillRect(0,0,100,100);

        // This is now the previously chosen object
        pnImgCh = pnImg[chosenObjPN];
        imPNChContext.drawImage(pnImgCh, 0,0, 100, 100);

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
        pnImg[o].src = "../images/" + data.stimuli[obj.options[i][o]] + ".png";
    } else{
        obj.objOrient[i][o] = 1;
        pnImg[o].src = "../images/" + data.stimuli[obj.options[i][o]] + "_mirr.png";
    }
    imPNContext[o].fillStyle = imgFill;
    imPNContext[o].fillRect(0,0,200,200);

    pnImg[o].onload = function(){
        imPNContext[o].drawImage(pnImg[o], 0,0, 150, 150);
    };
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

        stimA.src = "../images/" + data.stimuli[obj.pairA[i]] + obj.pairA_orient[i] + ".png";
        stimB.src = "../images/" + data.stimuli[obj.pairB[i]] + obj.pairB_orient[i] + ".png";

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
    this.ix             = [];
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

    ix = shuffle(Array.apply(null, {length: pairsA.length}).map(Number.call, Number));
    nonix = shuffle(Array.apply(null, {length: nonPairsA.length}).map(Number.call, Number));
    nonix = nonix.slice(0, ix.length);
    var totIx = ix.length + nonix.length;

    t = 0;
    for (var i = 0; i<totIx; i++){
        if ((Math.random() < 0.5 && ix.length > 0) || nonix.length < 1){
            obj.paired.push(1);
            assocTestTrial = ix.pop();

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

        } else {
            obj.paired.push(0);
            assocTestTrial = nonix.pop();
            while (t < 100 && (pairsA[assocTestTrial] === obj.pairA[obj.pairA.length-1] || pairsB[assocTestTrial] === obj.pairB[obj.pairB.length-1])){
                nonix.push(assocTestTrial);     // Add index again
                nonix = shuffle(nonix);         // Shuffle data
                assocTestTrial = nonix.pop();
                t++;
            }
            obj.ix.push(assocTestTrial);
            obj.pairA.push(nonPairsA[assocTestTrial]);
            obj.pairB.push(nonPairsB[assocTestTrial]);
        }
    }
    obj.maxTrials = obj.ix.length;
}

function recordMemoryResponse(response){
    $('button').prop('disabled', true);
    if (i > -1){
        d_button = new Date();
        obj.RT.push(d_button-d_pres);
        obj.choice.push(response);
        if (response === 0 && obj.paired[i] == 0 || response === 1 && obj.paired[i] == 1){
            obj.cr.push(1);
            obj.totalRew++;
            feedbackImg.src = "../images/correct.png";
        } else {
            obj.cr.push(-1);
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
        obj.ix = shuffle(Array.apply(null, {length: pairsA.length}).map(Number.call, Number));
        obj.maxTrials = obj.ix.length;
    }

    if (i < obj.maxTrials){

        // Randomize object locations
        obj.location[i]     = shuffle(objLoc);
        obj.otherObj[i]     = [];

        // Target object and partner object
        obj.target[i]       = pairsA[obj.ix[i]];
        obj.otherObj[i][0]  = pairsB[obj.ix[i]];        // The 0th object corresponds to the correct partner

        // Display target object
        targetObj.src       = (Math.random() < 0.5) ? "../images/" + data.stimuli[obj.target[i]] + ".png" : "../images/" + data.stimuli[obj.target[i]] + "_mirr.png";

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
            imgOption[pos].src = (Math.random() < 0.5) ? "../images/" + data.stimuli[obj.otherObj[i][a]] + ".png" : "../images/" + data.stimuli[obj.otherObj[i][a]] + "_mirr.png";
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
        obj.totalRew++;
        feedbackImg.src = "../images/correct.png";
    } else {
        obj.cr[i] = -1;
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
};

var step = 0;

var imGNOptionCanvas  = [];
var targetImgGN = new Image(); var imgOldGN = new Image();
var imGNOptionCtx = [];

var targetPicGNCanvas = document.getElementById("targetPicGN");
var targetPicGNCtx  = targetPicGNCanvas.getContext("2d");
var chosenPicGNCanvas    = document.getElementById("chosenPicGN");
var chosenPicGNCtx  = chosenPicGNCanvas.getContext("2d");
for (o = 0; o < 2; o++){
    imGNOptionCanvas[o]   = document.getElementById("Pic"+o+"GN");
    imGNOptionCtx[o]   = imGNOptionCanvas[o].getContext("2d");
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
    i = Math.max(0,i);

    data.goalNavigation[data.goalNavigation.length] = new GoalNavigation;
    obj = data.goalNavigation[data.goalNavigation.length-1];
    obj.startTime = recordTime();
    if (leftOverNonix.length >= obj.maxTrials){
        obj.nonix = leftOverNonix;
    } else {
        obj.nonix = shuffle(Array.apply(null, {length: nonPairsA.length}).map(Number.call, Number));
    }
    for (var ix = 0; ix < obj.maxTrials; ix++ ) {
        obj.chosenSeq[ix]    = [];
        obj.objOrient[ix]    = [];
        obj.options[ix]      = [];
        obj.RT[ix]           = [];
        obj.stim_on[ix]      = [];
        obj.responseT[ix]    = [];
        obj.rewardSeq[ix]    = [];
        obj.toWinOnThisTrial[ix] = [];
    }
    displayGoalNavigation();
}

var neighbour;
function displayGoalNavigation() {
    if (i >= obj.maxTrials || i > obj.nonix.length-1){
        var counter = 0;
        for (o = i; o<obj.nonix.length; o++){
            leftOverNonix[counter] = obj.nonix[o];
            counter++;
        }
        proceedInExpt();
        obj.endTime = recordTime();
    } else if (i < obj.maxTrials && step === 0){
        currentProgress = 0;
        progressCoins.src = "../images/coins/0coins.png";
        $( "#progressbar" ).progressbar( "option", "value", currentProgress);

        obj.chosenSeq[i][step]  = [];
        obj.objOrient[i][step]  = [];
        obj.options[i][step]    = [];
        obj.RT[i][step]         = [];
        obj.stim_on[i][step]    = [];
        obj.responseT[i][step]  = [];
        for (var ox = 0; ox<1; ox++){
            obj.options[i][step][ox] = [];
        }
        targetPicGNCtx.fillStyle = imgFill;
        targetPicGNCtx.fillRect(0,0,100,100);

        chosenPicGNCtx.fillStyle = imgFill;
        chosenPicGNCtx.fillRect(0,0,100,100);

        for (o = 0; o < 2; o++){
            imGNOptionCtx[o].fillStyle = imgFill;
            imGNOptionCtx[o].fillRect(0,0,150,150);
        }

        // Pick a new start and target object
        obj.chosenSeq[i][step]  = nonPairsA[obj.nonix[i]];
        obj.target[i]           = nonPairsB[obj.nonix[i]];

        setTimeout(function() {
            if (Math.random() < 0.5){
                imgOldGN.src = "../images/" + data.stimuli[obj.chosenSeq[i][step]] + ".png";
            } else {
                imgOldGN.src = "../images/" + data.stimuli[obj.chosenSeq[i][step]] + "_mirr.png";}
            if (Math.random() < 0.5){
                targetImgGN.src = "../images/" + data.stimuli[obj.target[i]] + ".png";
            } else {
                targetImgGN.src = "../images/" + data.stimuli[obj.target[i]] + "_mirr.png";}
        }, timelag);
    }
    targetImgGN.onload = function(){
        targetPicGNCtx.drawImage(targetImgGN, 0,0, 100, 100);
    };

    imgOldGN.onload = function(){
        chosenPicGNCtx.drawImage(imgOldGN, 0,0, 100, 100);
    };

    if (step === 0){
        obj.toWinOnThisTrial[i][step] = data.dist[obj.target[i]][obj.chosenSeq[i][0]] ;
    }
    if (step !== 0){
        progressStepSize = 100/obj.toWinOnThisTrial[i][0];
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
    if (obj.chosenSeq[i][step] === obj.target[i]){
        data.totalReward += Math.max(0,obj.toWinOnThisTrial[i][step]);
        i++;
        step = 0;
        setTimeout(function(){
            displayGoalNavigation();
        }, timelag);
    } else {
        setTimeout(function() {
            drawOption(0);
            drawOption(1);
            progressStepSize = 100/obj.toWinOnThisTrial[i][0];
            progressCoins.src = '../images/coins/' + Math.max(0,obj.toWinOnThisTrial[i][step]) + "coins.png";

            d = new Date();
            obj.stim_on[i][step] = d.getTime();
        }, timelag);
    }
}

function drawOption(ox){
    imGNOptionCtx[ox].fillStyle = imgFill;
    imGNOptionCtx[ox].fillRect(0,0,150,150);

    // Present object 'obj' in given orientation, determine correct button press
    if (Math.random() < 0.5){
        imgOptionGN[ox].src = "../images/" + data.stimuli[obj.options[i][step][ox]] + ".png";
    } else{
        imgOptionGN[ox].src = "../images/" + data.stimuli[obj.options[i][step][ox]] + "_mirr.png";
    }
    imgOptionGN[ox].onload = function() {
        imGNOptionCtx[ox].drawImage(imgOptionGN[ox], 0,0, 150, 150);
    };
    imGNOptionCanvas[ox].onclick = function(){chooseGN(ox);};
}

function chooseGN(chosenObjGoalNavigation){
    // record RT
    d = new Date();
    obj.responseT[i][step] = d.getTime();
    obj.RT[i][step] = obj.responseT[i][step] - obj.stim_on[i][step];

    imGNOptionCanvas[0].onclick = null;
    imGNOptionCanvas[1].onclick = null;

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
    imGNOptionCtx[(chosenObjGoalNavigation+1)%2].fillRect(0,0,150,150);

    if (data.dist[obj.target[i]][obj.options[i][step-1][chosenObjGoalNavigation]] >
        data.dist[obj.target[i]][obj.options[i][step-1][(chosenObjGoalNavigation + 1)%2]]){
        obj.rewardSeq[i][step] = -1;
        if (settings.displayFeedback){
            currentProgress -= progressStepSize;
            obj.toWinOnThisTrial[i][step] = obj.toWinOnThisTrial[i][step-1]-1;
        }
    } else {
        obj.rewardSeq[i][step] = 1;
        if (settings.displayFeedback){
            currentProgress += progressStepSize;
            obj.toWinOnThisTrial[i][step] = obj.toWinOnThisTrial[i][step-1];
        }
    }
    progressCoins.src = '../images/coins/' + Math.max(0,obj.toWinOnThisTrial[i][step]) + "coins.png";
    $("#progressbar").progressbar( "option", "value", currentProgress);

    setTimeout(function() {
        imGNOptionCtx[chosenObjGoalNavigation].fillRect(0,0,150,150);
        chosenPicGNCtx.fillRect(0,0,100,100);

        // Move chosen image to chosen image position
        chosenPicGNCtx.drawImage(imgOptionGN[chosenObjGoalNavigation], 0,0, 100, 100);
        feedbackImg2.src = "../images/empty.png";
        progressCoins.src = "../images/empty.png";
    }, timelag);

    setTimeout(function(){
        displayGoalNavigation();
    },timelag);
}


//// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
// Object difference task

function ObjectDifference(){
    this.target     = []; // random start object
    this.target_orient = [];
    this.chosenObj  = [];
    this.objOrient  = [];
    this.options    = [];
    this.dist       = [[]];
    this.rewardSeq  = Array.apply(null, Array(settings.trialsPassiveNavigation)).map(Number.prototype.valueOf,0);
    this.stim_on    = [];
    this.responseT  = [];
    this.RT         = [];
    this.totalRew   = 0;
    this.earlyResponse = [];
}

function objectDifferencePresentNewObj() {
    feedbackImg.src = "../images/empty.png";
    i = Math.max(0,i);
    if (i > data.trialsObjectDifference){
        proceedInExpt();
        obj.endTime = recordTime();
    } else {
        // Mark old object as chosen object
        imPNChContext.fillStyle = imgFill;
        imPNChContext.fillRect(0,0,100,100);

        for (o = 0; o<2; o++){
            imPNContext[o].fillStyle = imgFill;
            imPNContext[o].fillRect(0,0,150,150);
            imPNOption[o].style.border= "5px solid #ffffff";
        }

        if (i===0){
            // New passive navigation object
            data.objectDifference[data.objectDifference.length] = new ObjectDifference();
            obj = data.objectDifference[data.objectDifference.length-1];
            obj.startTime = recordTime();
        }
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

        if (Math.random() < 0.5){
            obj.target_orient[i] = 0;
            pnImgCh.src = "../images/" + data.stimuli[obj.target[i]] + ".png";
        } else{
            obj.target_orient[i] = 1;
            pnImgCh.src = "../images/" + data.stimuli[obj.target[i]] + "_mirr.png";
        }

        pnImgCh.onload = function() {
            imPNChContext.drawImage(pnImgCh, 0,0,100,100);
        };

        drawObject(0);
        drawObject(1);

        d = new Date();
        obj.stim_on[i] = d.getTime();

        imPNOption[0].onclick = function(){chosenObjPN = 0; chooseObjectDifference();};
        imPNOption[1].onclick = function(){chosenObjPN = 1; chooseObjectDifference();};
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

    if (obj.dist[i][chosenObjPN] < obj.dist[i][(chosenObjPN + 1)%2]){
        if (settings.displayFeedback){
            imPNOption[chosenObjPN].style.border= "5px solid green";
            feedbackImg.src = "../images/correct.png";
        } else {
            imPNOption[chosenObjPN].style.border= "5px solid black";
        }
        obj.rewardSeq[i] = 1;
        obj.totalRew++;
    } else {
        if (settings.displayFeedback){
            imPNOption[chosenObjPN].style.border= "5px solid red";
            feedbackImg.src = "../images/incorrect.png";
        } else {
            imPNOption[chosenObjPN].style.border= "5px solid black";
        }
        obj.rewardSeq[i] = -1;
        obj.totalRew = Math.max(0,obj.totalRew-1);
    }
    imRew1.src = "../images/coins/" + Math.max(Math.min(obj.totalRew,50),0) + "coins.png";
    imRew2.src = "../images/coins/" + Math.max(Math.min(obj.totalRew-50,50),0) + "coins.png";
    imRew3.src = "../images/coins/" + Math.max(Math.min(obj.totalRew-100,50),0) + "coins.png";

    setTimeout(function() {
        i++;

        objectDifferencePresentNewObj();
    },timelag);
}/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
