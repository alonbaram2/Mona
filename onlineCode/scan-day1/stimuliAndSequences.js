/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

//Experiment information
var settings = {
    version:                    "scan",
    day:                        1,
    nobj:                       17, 
    noOfTasks:                  [],
    perfCriterion:              400,
    trialsMemory:               100,
    trialsPassiveExposure:      100, 
    trialsPassiveNavigation:    100,
    trialsGoalNavigation:       30,
    trialsObjectDifference:     30,
    fullscreen:                 true,
    hideSkipButton:             true,
    numberOfMaps:               2,
    graphStructure:             "asymmetric",
    displayFeedback:            true,
    scan:                       true
};
settings.noOfTasks = [5,4]; // day 1 and day 2;

var data = {    
    subject_id:         [],
    stimuli:            [],
    graph:              [],
    dist:               [],
    learnPairs:         [],
    findPartner:        [],
    passiveExposure:    [],
    passiveNavigation:  [],
    memory:             [],
    goalNavigation:     [],
    objectDifference:   [],
    timeLine:           [],
    startTime:          [],
    experimentDuration: [],
    feedback:           [],
    totalReward:        0,
    prolificPart:       false,
    prolificTick:       [],
    settings:           settings
};

// Time before moving on to a next stimulus
var timelag = 750;

//Store data
var writeFile;

// Randomize left versus right orientation
data.mirror = [];
for (var i = 0; i<settings.nobj; i++) {
    data.mirror.push(Math.floor(Math.random() * 2));
};

for(var i=0; i<settings.nobj; i++) {
    data.graph[i] = new Array(settings.nobj);
}


//Hexagonal Structure
//data.graph[0][1] = 1;  data.graph[0][2] = 1;  data.graph[0][3] = 1;
//data.graph[1][0] = 1;  data.graph[1][3] = 1;  data.graph[1][4] = 1;
//data.graph[2][0] = 1;  data.graph[2][3] = 1;  data.graph[2][5] = 1;  data.graph[2][6] = 1;
//data.graph[3][0] = 1;  data.graph[3][1] = 1;  data.graph[3][2] = 1;  data.graph[3][4] = 1; data.graph[3][6] = 1;  data.graph[3][7] = 1;
//data.graph[4][1] = 1;  data.graph[4][3] = 1;  data.graph[4][7] = 1;  data.graph[4][8] = 1;
//data.graph[5][2] = 1;  data.graph[5][6] = 1;  data.graph[5][9] = 1;
//data.graph[6][2] = 1;  data.graph[6][3] = 1;  data.graph[6][5] = 1;  data.graph[6][7] = 1; data.graph[6][9] = 1;  data.graph[6][10] = 1;
//data.graph[7][3] = 1;  data.graph[7][4] = 1;  data.graph[7][6] = 1;  data.graph[7][8] = 1; data.graph[7][10] = 1; data.graph[7][11] = 1;
//data.graph[8][4] = 1;  data.graph[8][7] = 1;  data.graph[8][11] = 1;
//data.graph[9][5] = 1;  data.graph[9][6] = 1;  data.graph[9][10] = 1;
//data.graph[10][6] = 1; data.graph[10][7] = 1; data.graph[10][9] = 1; data.graph[10][11] = 1;
//data.graph[11][7] = 1; data.graph[11][8] = 1; data.graph[11][10] = 1;

//
////Quadratic Structure
//data.graph[0][1] = 1;  data.graph[0][4] = 1; 
//data.graph[1][0] = 1;  data.graph[1][5] = 1;  data.graph[1][2] = 1;
//data.graph[2][1] = 1;  data.graph[2][6] = 1;  data.graph[2][3] = 1;
//data.graph[3][2] = 1;  data.graph[3][7] = 1;
//data.graph[4][0] = 1;  data.graph[4][5] = 1;  data.graph[4][8] = 1;
//data.graph[5][1] = 1;  data.graph[5][4] = 1;  data.graph[5][6] = 1;  data.graph[5][9] = 1;
//data.graph[6][2] = 1;  data.graph[6][5] = 1;  data.graph[6][7] = 1;  data.graph[6][10] = 1;
//data.graph[7][3] = 1;  data.graph[7][6] = 1;  data.graph[7][11] = 1;
//data.graph[8][4] = 1;  data.graph[8][9] = 1;  data.graph[8][12] = 1;
//data.graph[9][5] = 1;  data.graph[9][8] = 1;  data.graph[9][10] = 1; data.graph[9][13] = 1;
//data.graph[10][6] = 1; data.graph[10][9] = 1; data.graph[10][11] = 1; data.graph[10][14] = 1;
//data.graph[11][7] = 1; data.graph[11][10] = 1; data.graph[11][15] = 1;
//data.graph[12][8] = 1; data.graph[12][13] = 1;
//data.graph[13][9] = 1; data.graph[13][12] = 1; data.graph[13][14] = 1;
//data.graph[14][10] = 1; data.graph[14][13] = 1; data.graph[14][15] = 1;
//data.graph[15][11] = 1; data.graph[15][14] = 1;


//Asymmetric Structure
data.graph[0][1] = 1;  data.graph[0][3] = 1;  
data.graph[1][0] = 1;  data.graph[1][4] = 1;  
data.graph[2][3] = 1;  data.graph[2][6] = 1; 
data.graph[3][0] = 1;  data.graph[3][2] = 1; data.graph[3][4] = 1; data.graph[3][7] = 1; 
data.graph[4][1] = 1;  data.graph[4][3] = 1; data.graph[4][5] = 1; data.graph[4][8] = 1; 
data.graph[5][4] = 1;  data.graph[5][9] = 1; 
data.graph[6][2] = 1;  data.graph[6][7] = 1;  data.graph[6][10] = 1; 
data.graph[7][3] = 1;  data.graph[7][6] = 1;  data.graph[7][8] = 1;  data.graph[7][11] = 1; 
data.graph[8][4] = 1;  data.graph[8][7] = 1;  data.graph[8][9] = 1;  data.graph[8][12] = 1; 
data.graph[9][5] = 1;  data.graph[9][8] = 1;
data.graph[10][6] = 1;  data.graph[10][11] = 1;
data.graph[11][7] = 1;  data.graph[11][10] = 1; data.graph[11][12] = 1; data.graph[11][14] = 1;
data.graph[12][8] = 1;  data.graph[12][11] = 1; data.graph[12][13] = 1;  data.graph[12][15] = 1; 
data.graph[13][12] = 1;  data.graph[13][16] = 1;
data.graph[14][11] = 1;  data.graph[14][15] = 1; 
data.graph[15][12] = 1; data.graph[15][14] = 1; data.graph[15][16] = 1; 
data.graph[16][13] = 1; data.graph[16][15] = 1; 


for(var i=0; i<settings.nobj; i++) {
    data.dist[i] = new Array(settings.nobj);
}

//Hexagonal Structure
//data.dist[0] = [0,1,1,1,2,2,2,2,3,3,3,3];
//data.dist[1] = [1,0,2,1,1,3,2,2,2,3,3,3];
//data.dist[2] = [1,2,0,1,2,1,1,2,3,2,2,3];
//data.dist[3] = [1,1,1,0,1,2,1,1,2,2,2,2];
//data.dist[4] = [2,1,2,1,0,3,2,1,1,3,2,2];
//data.dist[5] = [2,3,1,2,3,0,1,2,3,1,2,3];
//data.dist[6] = [2,2,1,1,2,1,0,1,2,1,1,2];
//data.dist[7] = [2,2,2,1,1,2,1,0,1,2,1,1];
//data.dist[8] = [3,2,3,2,1,3,2,1,0,3,2,1];
//data.dist[9] = [3,3,2,2,3,1,1,2,3,0,1,2];
//data.dist[10] = [3,3,2,2,2,2,1,1,2,1,0,1];
//data.dist[11] = [3,3,3,2,2,3,2,1,1,2,1,0];

//Quadratic Structure
//data.dist[0] = [0,1,2,3,1,2,3,4,2,3,4,5,3,4,5,6];
//data.dist[1] = [1,0,1,2,2,1,2,3,3,2,3,4,4,3,4,5];
//data.dist[2] = [2,1,0,1,3,2,1,2,4,3,2,3,5,4,3,4];
//data.dist[3] = [3,2,1,0,4,3,2,1,5,4,3,2,6,5,4,3];
//data.dist[4] = [1,2,3,4,0,1,2,3,1,2,3,4,2,3,4,5];
//data.dist[5] = [2,1,2,3,1,0,1,2,2,1,2,3,3,2,3,4];
//data.dist[6] = [3,2,1,2,2,1,0,1,3,2,1,2,4,3,2,3];
//data.dist[7] = [4,3,2,1,3,2,1,0,4,3,2,1,5,4,3,2];
//data.dist[8] = [2,3,4,5,1,2,3,4,0,1,2,3,1,2,3,4];
//data.dist[9] = [3,2,3,4,2,1,2,3,1,0,1,2,2,1,2,3];
//data.dist[10] = [4,3,2,3,3,2,1,2,2,1,0,1,3,2,1,2];
//data.dist[11] = [5,4,3,2,4,3,2,1,3,2,1,0,4,3,2,1];
//data.dist[12] = [3,4,5,6,2,3,4,5,1,2,3,4,0,1,2,3];
//data.dist[13] = [4,3,4,5,3,2,3,4,2,1,2,3,1,0,1,2];
//data.dist[14] = [5,4,3,4,4,3,2,3,3,2,1,2,2,1,0,1];
//data.dist[15] = [6,5,4,3,5,4,3,2,4,3,2,1,3,2,1,0];

//// Hexagonal graph structure
//data.dist[0] = [0,1,1,1,2,2,2,2,3,3,3,3];
//data.dist[1] = [1,0,2,1,1,3,2,2,2,3,3,3];
//data.dist[2] = [1,2,0,1,2,1,1,2,3,2,2,3];
//data.dist[3] = [1,1,1,0,1,2,1,1,2,2,2,2];
//data.dist[4] = [2,1,2,1,0,3,2,1,1,3,2,2];
//data.dist[5] = [2,3,1,2,3,0,1,2,3,1,2,3];
//data.dist[6] = [2,2,1,1,2,1,0,1,2,1,1,2];
//data.dist[7] = [2,2,2,1,1,2,1,0,1,2,1,1];
//data.dist[8] = [3,2,3,2,1,3,2,1,0,3,2,1];
//data.dist[9] = [3,3,2,2,3,1,1,2,3,0,1,2];
//data.dist[10] = [3,3,2,2,2,2,1,1,2,1,0,1];
//data.dist[11] = [3,3,3,2,2,3,2,1,1,2,1,0];


//Asymmetric Structure
data.dist[0] = [0,1,2,1,2,3,3,2,3,4,4,3,4,5,4,5,6];
data.dist[1] = [1,0,3,2,1,2,4,3,2,3,5,4,3,4,5,4,5];
data.dist[2] = [2,3,0,1,2,3,1,2,3,4,2,3,4,5,4,5,6];
data.dist[3] = [1,2,1,0,1,2,2,1,2,3,3,2,3,4,3,4,5];
data.dist[4] = [2,1,2,1,0,1,3,2,1,2,4,3,2,3,4,3,4];
data.dist[5] = [3,2,3,2,1,0,4,3,2,1,5,4,3,4,5,4,5];
data.dist[6] = [3,4,1,2,3,4,0,1,2,3,1,2,3,4,3,4,5];
data.dist[7] = [2,3,2,1,2,3,1,0,1,2,2,1,2,3,2,3,4];
data.dist[8] = [3,2,3,2,1,2,2,1,0,1,3,2,1,2,3,2,3];
data.dist[9] = [4,3,4,3,2,1,3,2,1,0,4,3,2,3,4,3,4];
data.dist[10] = [4,5,2,3,4,5,1,2,3,4,0,1,2,3,2,3,4];
data.dist[11] = [3,4,3,2,3,4,2,1,2,3,1,0,1,2,1,2,3];
data.dist[12] = [4,3,4,3,2,3,3,2,1,2,2,1,0,1,2,1,2];
data.dist[13] = [5,4,5,4,3,4,4,3,2,3,3,2,1,0,3,2,1];
data.dist[14] = [4,5,4,3,4,5,3,2,3,4,2,1,2,3,0,1,2];
data.dist[15] = [5,4,5,4,3,4,4,3,2,3,3,2,1,2,1,0,1];
data.dist[16] = [6,5,6,5,4,5,5,4,3,4,4,3,2,1,2,1,0]; 
   
var transitions = [];
for(var i=0; i<settings.nobj; i++) {
    transitions[i] = new Array(settings.nobj);
}
for(var i=0; i<settings.nobj; i++) {
    for (var j=0; j<settings.nobj; j++){
    transitions[i][j] = 0;
    }
}

var rewardTransitions = [];
for(var i=0; i<settings.nobj; i++) {
    rewardTransitions[i] = new Array(settings.nobj);
}
for(var i=0; i<settings.nobj; i++) {
    for (var j=0; j<settings.nobj; j++){
    rewardTransitions[i][j] = 0;
    }
}

var pairsA = [], pairsB = [];
for (var i = 0; i<data.dist.length; i++){
    for (var j = 0; j<data.dist.length; j++){
        if (data.graph[i][j] === 1){
            pairsA.push(i);
            pairsB.push(j);
        }        
    }
}

var nonPairsA = [], nonPairsB = [];
for (var i = 0; i<data.dist.length; i++){
    for (var j = 0; j<data.dist.length; j++){
        if (data.graph[i][j] !== 1 && i !== j){
            nonPairsA.push(i);
            nonPairsB.push(j);
        }        
    }
}