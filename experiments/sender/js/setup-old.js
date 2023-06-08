/////////////////////////////////////
// graph-comprehension-benchmarking
const iterationName = 'debugging'
const exp_version = 'VLAT_GGR'

function sendData(data) {
  console.log('sending data');
  jsPsych.turk.submitToTurk({
    'score': 0 //this is a dummy placeholder
  });
}

// define trial object with boilerplate using global variables from above
// note that we make constructTrialParams later on... 
function Trial() {
  this.dbname = 'graph_comprehension_benchmarking';
  this.colname = 'graph_comprehension_benchmarking';
  this.exp_version = exp_version;
  this.iterationName = iterationName;
};

/////////////////////////////////////
function setupGame() {
  socket.on('onConnected', function(d) {

    /////////////////////////////////////
    // SET EXPERIMENT PARAMS
    // grab stims for mongoDB
    var metadata = d.meta;
    var gameid = d.gameid;
    // console.log('meta', meta);

    // get PROLIFIC participantID
    var queryString = window.location.search;
    var urlParams = new URLSearchParams(queryString);
    var prolificID = urlParams.get('PROLIFIC_PID') // ID unique to the participant
    var studyID = urlParams.get('STUDY_ID') // ID unique to the study
    var sessionID = urlParams.get('SESSION_ID') // ID unique to the particular submission

    // these are flags to control which trial types are included in the experiment
    const includeIntro = true;
    const includeQuiz = true;
    const includeExitSurvey = true;
    const includeGoodbye = true;

    // which recruitment platform are we running our study on?
    const sona = true;
    if (sona) {
      var recruitmentPlatform = 'sona'
    } else {
      var recruitmentPlatform = 'prolific'
    };

    /////////////////////////////////////
    // block and counterbalance stimuli
    // https://stackoverflow.com/questions/14446511/most-efficient-method-to-groupby-on-an-array-of-objects
    function groupBy(list, keyGetter) {
      const map = new Map();
      list.forEach((item) => {
        const key = keyGetter(item);
        const collection = map.get(key);
        if (!collection) {
          map.set(key, [item]);
        } else {
          collection.push(item);
        }
      });
      return map;
    }

    // groupby the PNG name of the stimuli
    const graphBlock = groupBy(metadata, met => met[0].graphFilename);
    
    // note: this is not good code :(
    // subset into separate blocks by PNG
    var b0 = graphBlock.get("ggr_g1.png"),
    b1 = graphBlock.get("ggr_g2.png"),
    b2 = graphBlock.get("ggr_g3.png"),
    b3 = graphBlock.get("ggr_g4.png"),
    b4 = graphBlock.get("ggr_g5.png"), 
    b5 = graphBlock.get("ggr_g6.png"),
    b6 = graphBlock.get("ggr_g7.png"),
    b7 = graphBlock.get("ggr_g8.png"),
    b8 = graphBlock.get("vlat_g1.png"),
    b9 = graphBlock.get("vlat_g2.png"),
    b10 = graphBlock.get("vlat_g3.png"),
    b11 = graphBlock.get("vlat_g4.png"),
    b12 = graphBlock.get("vlat_g5.png"),
    b13 = graphBlock.get("vlat_g6.png"),
    b14 = graphBlock.get("vlat_g7.png"),
    b15 = graphBlock.get("vlat_g8.png"),
    b16 = graphBlock.get("vlat_g9.png"),
    b17 = graphBlock.get("vlat_g10.png"),
    b18 = graphBlock.get("vlat_g11.png"),
    b19 = graphBlock.get("vlat_g12.png")

    // shuffle VLAT questions *within* blocks
    var blockNum8 = _.shuffle(b8), // @HL - the underscore is a lodash library
    blockNum9 = _.shuffle(b9),
    blockNum10 = _.shuffle(b10),
    blockNum11 = _.shuffle(b11),
    blockNum12 = _.shuffle(b12),
    blockNum13 = _.shuffle(b13),
    blockNum14 = _.shuffle(b14),
    blockNum15 = _.shuffle(b15),
    blockNum16 = _.shuffle(b16),
    blockNum17 = _.shuffle(b17),
    blockNum18 = _.shuffle(b18),
    blockNum19 = _.shuffle(b19)

    // put all VLAT blocks in an array
    // var VLAT = [
    //   blockNum8, 
    //   blockNum9, 
    //   blockNum10, 
    //   blockNum11, 
    //   blockNum12, 
    //   blockNum13,
    //   blockNum14, 
    //   blockNum15, 
    //   blockNum16, 
    //   blockNum17, 
    //   blockNum18, 
    //   blockNum19
    // ];

    // now shuffle *across* VLAT blocks
    // VLAT_shuff = _.shuffle(VLAT);

    // assemble and counterbalance GGR and VLAT blocks
    if (exp_version == 'GGR_VLAT') {
      var meta = b0.concat(b1, b2, b3, b4, b5, b6, b7, 
        blockNum8, blockNum9, blockNum10,
        blockNum11, blockNum12, blockNum13,
        blockNum14, blockNum15, blockNum16,
        blockNum17, blockNum18, blockNum19)
    } else if (exp_version == 'VLAT_GGR') {
      var meta = blockNum8.concat(blockNum9, blockNum10,
        blockNum11, blockNum12, blockNum13,
        blockNum14, blockNum15, blockNum16,
        blockNum17, blockNum18, blockNum19,
        b0, b1, b2, b3, b4, b5, b6, b7)
    }

    /////////////////////////////////////
    // function to save data locally and send data to server
    var main_on_finish = function(data) {
      socket.emit('currentData', data);
      console.log('emitting data');
    }

    // add additional boilerplate info
    var additionalInfo = {
      // add prolific info
      prolificID: prolificID,
      studyID: studyID,
      sessionID: sessionID,
      // add usual info
      gameID: gameid,
      recruitmentPlatform: recruitmentPlatform,
      // db stuff
      dbname: 'graph_comprehension_benchmarking',
      colname: 'graph_comprehension_benchmarking',
      iterationName: iterationName,
      version: exp_version
      // on_finish: main_on_finish
    }

    // count all stimuli trials
    var numTrials = meta.length;

/////////////////////////////////////
    // SET INDIVIDUAL PLUGIN PARAMS
    let constructTrialParams = function(trial){
      let trialParams;
      if(trial.pluginType == 'survey-text-custom'){
        trialParams = 
        {
          type: trial.pluginType,
          questions: [{
                  prompt: trial.prompt,
                  placeholder: "write number here",
                  rows: 1,
                  columns: 60,
                  required: true
                }
              ],
          graph_image: 'phase_0/' + trial.graphFilename,
        };
      } else if (trial.pluginType == 'survey-multi-choice-custom'){
        trialParams = 
        {
          type: trial.pluginType,
          questions: [{
                  prompt: trial.prompt,
                  horizontal: false,
                  options: trial.options,
                  required: true
                }],
          preamble: trial.promptTitle,
          graph_image: 'phase_0/' + trial.graphFilename,
        };
      }
      return trialParams
    };

    // add plugin params and assemble all trial objects
    var trials = _.map(meta, function(trial, i) {
      return _.extend({}, trial[0], additionalInfo, {
        trialNum: i,
        numTrials: numTrials,
      }, constructTrialParams(trial[0]))
    });

    // // DEVICE REQUIREMENTS
    // var devices = {
    //   type: jsPsychImageKeyboardResponse,
    //   stimulus : '../media/devices.png',
    //   choices: ['Enter'],
    //   stimulus_height :  window.innerHeight,
    //   maintain_aspect_ratio : true,
    //   data: {block:"devices"}
    // };

    // BROWSER CHECK
    // var browsercheck = {
    //   type: jsPsychBrowserCheck,
    //   minimum_width: 1000,
    //   minimum_height: 650,
    //   inclusion_function: (data) => {
    //     return data.mobile === false
    //     // data.browser == 'chrome' && 
    //   },
    //   exclusion_message: (data) => {
    //     if(data.mobile){
    //       return '<p>You must use a desktop or laptop computer to participate in this experiment.</p>';
    //     } 
    //     else { //size violation
    //       return '<p>You have indicated that you cannot increase the size of your browser window.</p> <p> If you <i>can</i> maximize your window, please do so now, and press the REFRESH button.</p> <p>Otherwise, you can close this tab.</p>';
    //     }
    //   },
    //   data:{block:"browser_check"},
    // };

    //collect PID info from SONA participants
    var PIDinfo = _.omit(_.extend({}, new Trial, additionalInfo));
    var collectPID = _.extend({}, PIDinfo, {
      type: 'survey-text',
      questions: [{
        prompt: "Please enter your UCSD email address below. \
          This will only be used to verify that you completed this study, so that you can be given credit on SONA. \
          <i>Your UCSD email address will not be used for any other purpose.</i> \
          Click 'Continue' to participate in this study.",
        placeholder: "your UCSD email address",
        rows: 1,
        columns: 30,
        required: true
      }],
      on_finish: main_on_finish
    });
    
    // add instruction pages
    instructionsHTML = {
      'str1': "<h1 style='text-align:left'>Welcome!</h1> \
       <p> We are interested in what makes some data visualizations more effective than others. \
       In this study, you will be presented with a series of data visualizations and \
       asked some questions about them.</p> \
       <p>The total time commitment for this study is expected to be approximately 50 - 60 minutes, \
       including the time it takes to read these instructions. \
       For your participation in this study, you will earn 1 SONA credit.</p>\
       <p>When you are finished, the study will be automatically submitted for approval.</p>\
       <p><i>We recommend using Chrome. This study has not been tested in other browsers.</i></p>", 
      'str2': "<u><p id='legal'> Instructions</p></u>\
      <p> For each question, you will be presented with a \
      data visualization followed by a question. Please do your best to answer the question.\</p>\
      There will be two types of questions on this survey: multiple-choice and fill-in-the-blank questions.\
      On some questions, you will be given the option to skip. \
      If you are really unsure, feel free to skip these questions instead of guessing.</p> \
      <p>Click the next button to start.</p>"
  };

    // add consent pages
    consentHTML = {
      'str1': ["<u><p id='legal'>Consent to Participate</p></u>",
        "<p id='legal'>By completing this study, you are participating in a \
        study being performed by cognitive scientists in the UC San Diego \
        Department of Psychology. The purpose of this research is to find out \
        how people understand visual information. \
        You must be at least 18 years old to participate. There are neither \
        specific benefits nor anticipated risks associated with participation \
        in this study. Your participation in this study is completely voluntary\
        and you can withdraw at any time by simply exiting the study. You may \
        decline to answer any or all of the following questions. Choosing not \
        to participate or withdrawing will result in no penalty. Your anonymity \
        is assured; the researchers who have requested your participation will \
        not receive any personal information about you, and any information you \
        provide will not be shared in association with any personally identifying \
        information.</p>"
      ].join(' '),
      'str2': ["<u><p id='legal'>Consent to Participate</p></u>",
        "<p> If you have questions about this research, please contact the \
        researchers by sending an email to \
        <b><a href='mailto://cogtoolslab.requester@gmail.com'>cogtoolslab.requester@gmail.com</a></b>. \
        These researchers will do their best to communicate with you in a timely, \
        professional, and courteous manner. If you have questions regarding your \
        rights as a research subject, or if problems arise which you do not feel \
        you can discuss with the researchers, please contact the UC San Diego \
        Institutional Review Board.</p><p>Click 'Next' to continue \
        participating in this study.</p>"
      ].join(' ')
    };

    //  //ENTER FULLSCREEN
    // var enter_fullscreen = {
    //   type: jsPsychFullscreen,
    //   message: '<p>You will now enter fullscreen mode.</p>',
    //   fullscreen_mode: true,
    //   data: {block:"fullscreen"}
    // }

    // //EXIT FULLSCREEN
    // var exit_fullscreen = {
    //   type: jsPsychFullscreen,
    //   fullscreen_mode: false,
    //   data: {block:"fullscreen"}
    // }

    /////////////////////////////////////
    // combine instructions and consent pages into one variable
    var introMsg0 = {
      type: 'instructions',
      pages: [
        instructionsHTML.str1,
        consentHTML.str1,
        consentHTML.str2,
        instructionsHTML.str2,
      ],
      button_label_next:'Continue',
      show_clickable_nav: true,
      allow_backward: false,
      // delay: true,
      // delayTime: introButtonTiming,
    };

    // add comprehension check
    var quizTrial = {
      type: 'survey-multi-choice',
      preamble: "<b><u>Quiz</u></b><p>Before we begin, please answer the following questions to \
      be sure you understand what you need to do in this study.</p>",
      questions: [{
        prompt: "<b>Question 1</b> - What is the purpose of this study?",
        name: "quizPurpose",
        horizontal: false,
        options: ["To understand what makes some data visualizations are more effective than others.", 
        "To understand why many data visualizations are often misleading.", 
        "To understand how people think about data."],
        required: true
      },
      {prompt: "<b>Question 2</b> - What is the predicted time commitment of this study?",
      name: "quizHowLong",
      horizontal: false,
      options: ["20-30min", 
                "30-40min",
                "40-50min", 
                "50-60min"],
      required: true
     }]
    };

    // check whether comprehension check responses are correct
    var loopNode = {
      timeline: [quizTrial],
      loop_function: function(data) {
        resp = JSON.parse(data.values()[0]['responses']);
        // console.log('data.values',resp);
        if ((resp['quizPurpose'] == "To understand what makes some data visualizations are more effective than others.") &&
           (resp['quizHowLong'] == "50-60min")) {
          return false;
        } else {
          alert('Try again! One or more of your responses was incorrect.');
          return true;
        }
      }
    };
    // exit survey trials
    var surveyChoiceInfo = _.omit(_.extend({}, new Trial, additionalInfo));
    var exitSurveyChoice = _.extend({}, surveyChoiceInfo, {
      type: 'survey-multi-choice',
      preamble: "<h1> Exit Survey</h1>",
      questions: [{
          prompt: "What is your biological sex?",
          name: "participantSex",
          horizontal: true,
          options: ["Male", 
          "Female", 
          "Other", 
          "Do Not Wish To Say"],
          required: false
        },
        {
          prompt: "What is your highest level of education (current or completed)?",
          name: "participantEd",
          horizontal: true,
          options: ["Have not graduated high school", 
          "High school graduate, diploma or equivalent", 
          "Associate degree", 
          "Bachelor's degree", 
          "Master's degree", 
          "Professional degree (e.g. M.D., J.D.)", 
          "Doctoral degree (e.g., Ph.D.)"],
          required: false
        },
        {
          prompt: "How difficult did you find this study? (1: very easy, 7: very hard)",
          name: "judgedDifficulty",
          horizontal: true,
          options: ["1", "2", "3", "4", "5", "6", "7"],
          required: true
        },
        {
          prompt: "Which of the following best describes the amount of effort you put into the task ",
          name: "participantEffort",
          horizontal: true,
          options: ["I tried my best on each question", 
          "I tried my best on most questions", 
          "I started out trying hard, but gave up at some point",
          "I didn't try very hard, or rushed through the questions"],
          required: true
        },
        {
          prompt: "Did you encounter any technical difficulties while completing \
            this study? This could include: images were glitchy (e.g., did not load) \
            or sections of the study did not load properly.",
          name: "technicalDifficultiesBinary",
          horizontal: true,
          options: ["Yes", "No"],
          required: true
        }
      ],
      on_finish: main_on_finish
    });

      // select all that apply questions 
      var surveyMultiInfo = _.omit(_.extend({}, new Trial, additionalInfo));
      var exitSurveyMultiSelect = _.extend({}, surveyMultiInfo, {
        type: 'survey-multi-select',
        preamble: "<h1>Exit Survey</h1>",
        questions: [{
          prompt: "Which of the following mathematics topics have you taken a course in? Select all that apply.",
          name: "participantEd_math",
          horizontal: true,
          options: [" Algebra", " Calculus", " Statistics", " None"],
          required: true
        }
      ],
      on_finish: main_on_finish 
    });

    // Add survey page after trials are done
  var surveyTextInfo = _.omit(_.extend({}, new Trial, additionalInfo));
  var exitSurveyText = _.extend({}, surveyTextInfo, {
      type: 'survey-text',
      preamble: "<h1>Exit Survey </h1>",
      questions: [{
          name: "TechnicalDifficultiesFreeResp",
          prompt: "If you encountered any technical difficulties, please briefly \
            describe the issue.",
          placeholder: "I did not encounter any technical difficulities.",
          rows: 5,
          columns: 50,
          required: false
        },
        {
          name: 'participantAge',
          prompt: "What is your year of birth?",
          placeholder: "2022",
          require: true
        },
        {
          name: 'participantYears',
          prompt: "How many years old are you?",
          placeholder: "18",
          require: true
        }, 
        {
          name: 'participantEd_field',
          prompt: "If you pursued higher education, what is your field of study or major?",
          placeholder: "ology",
          require: false
        }, 

        {
          name: 'participantComments',
          prompt: "Thank you for participating in our study! Do you have any \
            other comments or feedback \
            to share with us about your experience?",
          placeholder: "I had a lot of fun!",
          rows: 5,
          columns: 50,
          require: false
        }
      ],
      on_finish: main_on_finish
    });

    // add goodbye page
    var goodbye = {
      type: 'instructions',
      pages: [
        'Congrats! You are all done. Thanks for participating in our study! \
          Click NEXT to submit this study.'
      ],
      show_clickable_nav: true,
      allow_backward: false,
      // delay: false,
      on_finish: function() {
        sendData();
        // on prolific, you can copy-paste the below completion url
        // window.open("https://app.prolific.co/submissions/complete?cc=5D68F97E", "_self");
        window.open('https://ucsd.sona-systems.com/webstudy_credit.aspx?experiment_id=2062&credit_token=1162d120a5c94af09a8e4e250bcc7ec0&survey_code=' + jsPsych.data.getURLVariable('survey_code'))
      }
    };

    /////////////////////////////////////
    // add all experiment variables to trials array
    // initialize array
    var setup = [];
    
    // add instructions and consent
    if (includeIntro) setup.push(introMsg0)
    if (includeIntro) setup.push(collectPID);
    // if (includeIntro) setup.push(devices)
    // if (includeIntro) setup.push(browsercheck)
    // if (includeIntro) setup.push(enter_fullscreen)
    // add comprehension check
    if (includeQuiz) setup.push(loopNode)
    // add test trials
    var experiment = setup.concat(trials);
    if (includeExitSurvey) experiment.push(exitSurveyChoice);
    if (includeExitSurvey) experiment.push(exitSurveyMultiSelect); 
    if (includeExitSurvey) experiment.push(exitSurveyText);
    // if (includeGoodbye) experiment.push(exit_fullscreen);
    if (includeGoodbye) experiment.push(goodbye);

    console.log('experiment', experiment);

    jsPsych.init({
      timeline: experiment,
      default_iti: 1000,
      show_progress_bar: true
    });
  }) // close socket onConnected
} // close setupGame