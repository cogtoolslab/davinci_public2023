const iterationName = 'debugging'
const version = 'sender'

function sendData(data) {
  console.log('sending data');
  jsPsych.turk.submitToTurk({
    'score': 0 //this is a dummy placeholder
  });
}

// define trial object with boilerplate using global variables from above
// note that we make constructTrialParams later on...
function Trial() {
  this.dbname = 'davinci_cogsci_sender';
  this.colname = 'davinci_cogsci_sender';
  this.iterationName = iterationName;
  this.version = version;
};

/////////////////////////////////////
function setupGame() {
  socket.on('onConnected', function(d) {

    // begin jsPsych
    jsPsych = initJsPsych({
      show_progress_bar: true
    });

    /////////////////////////////////////
    // SET EXPERIMENT PARAMS
    // grab stims for mongoDB
    var meta = d.meta;
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
    const includePractice = true;
    const includeExitSurvey = true;
    const includeGoodbye = true;

    // which recruitment platform are we running our study on?
    const sona = false;
    if (sona) {
      var recruitmentPlatform = 'sona'
    } else {
      var recruitmentPlatform = 'prolific'
    };


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
      dbname: 'davinci_cogsci_sender',
      colname: 'davinci_cogsci_sender',
      version: version,
      iterationName: iterationName,
      // on_finish: main_on_finish
    }

    // count all stimuli trials
    var numTrials = meta[0].length;
    
    /////////////////////////////////////
    // SET INDIVIDUAL PLUGIN PARAMS
    let constructTrialParams = function(trial) {
      let trialParams;
        trialParams = {
          type: jsPsychImageGallery,
          questions: [{
            prompt: trial.prompt, 
            placeholder: "write number here",
            rows: 1,
            columns: 60,
            required: true
          }],
          graph_image: 'images/' + trial.corrFilename,
      }
      return trialParams
    }; // close socket.on

    var practice_trial = {
      type: jsPsychImageGallery,
      questions: [{
        promptTitle: 'Flowers',
        prompt: 'How long is the petal length of setosa flowers?',
        description: 'This data visualization is intended to show information about: \
                      <b>petal length of different flowers across different species of flowers \
                      that are sometimes planted inside or outside</b>. \
                      In this dataset, there are 3 species of flowers called \
                      “Virginica”, “Veriscolor”, and “Setosa”.',
        rows: 1,
        columns: 60,
        required: true, 
      }],
      graphID: 'iris_x1Species_facetnone_reorderlarge_to_small_colorgrey20.png',
      filenameArray: ['iris_x1Species_facetnone_reorderlarge_to_small_colorgrey20.png', 
                      'iris_x1Species_facetnone_reorderalph_colorgrey20.png', 
                      'iris_x1Species_facetLocation_reorderlarge_to_small_colorgrey20.png', 
                      'iris_x1Species_facetLocation_reorderalph_colorgrey20.png',
                      'iris_x1Location_facetSpecies_reorderlarge_to_small_colorgrey20.png', 
                      'iris_x1Location_facetSpecies_reorderalph_colorgrey20.png', 
                      'iris_x1Location_facetnone_reorderlarge_to_small_colorgrey20.png', 
                      'iris_x1Location_facetnone_reorderalph_colorgrey20.png'],
      practice: 'practice',
      dbname: 'davinci_cogsci_sender',
      colname: 'davinci_cogsci_sender',
      gameID: gameid, 
      iterationName: iterationName,   
      version: version,
      recruitmentPlatform: recruitmentPlatform,
      promptTitle: 'Flowers',
      prompt: 'How long is the petal length of setosa flowers?',
      description: 'This data visualization is intended to show information about: \
                  <b>petal length of different flowers across different species of flowers \
                  that are sometimes planted inside or outside</b>. \
                  In this dataset, there are 3 species of flowers called \
                  “Virginica”, “Veriscolor”, and “Setosa”.',
      eventType: 'practice',      
      taskCategory: 'practice', 
      questionType:'practice',
      graphType: 'practice',
      dataset: 'practice',
      trialNum: 'practice'
    }

    // shuffle trials within batches
    meta_shuff = _.shuffle(meta[0])

    // add plugin params and assemble all trial objects
    var trials = _.map(meta_shuff, function(trial, i) {
      return _.extend({}, trial, additionalInfo, {
        trialNum: i,
        numTrials: numTrials,
      }, constructTrialParams(trial))
    });

    // BROWSER CHECK
    var browsercheck = {
      type: jsPsychBrowserCheck,
      minimum_width: 1000,
      minimum_height: 650,
      inclusion_function: (data) => {
        return data.mobile === false
        // data.browser == 'chrome' &&
      },
      exclusion_message: (data) => {
        if (data.mobile) {
          return '<p>You must use a desktop or laptop computer to participate in this experiment.</p>';
        } else { //size violation
          return '<p>You have indicated that you cannot increase the size of your browser window.</p> \
          <p> If you <i>can</i> maximize your window, please do so now, and press the REFRESH button.</p> \
          <p>Otherwise, you can close this tab.</p>';
        }
      },
      data: {
        block: "browser_check"
      },
    };


    //collect PID info from SONA participants
    var PIDinfo = _.omit(_.extend({}, new Trial, additionalInfo));
    var collectPID = _.extend({}, PIDinfo, {
      type: jsPsychSurveyText,
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
      'str1': "<p> Welcome! We are interested in what makes some data visualizations more effective than others. \
       In this study, you will be presented with a series of data visualizations and \
       asked to pick which of them would best help another person answer questions.</p> \
       <p>The total time commitment for this study is expected to be ~12 minutes, \
       including the time it takes to read these instructions. \
       For your participation in this study, you will earn $3.00.</p>\
       <p>When you are finished, the study will be automatically submitted for approval.</p>\
       <p><i>We recommend using Chrome. This study has not been tested in other browsers. \
       Please also ensure that you complete this study on a desktop computer or laptop.</i></p>",
      'str2': "<u><p id='legal'> Instructions</p></u>\
      <p> On each page, you will be presented a description of a data visualization and the dataset that it was generated from. \
      Once you have read this description, you can click a button that says 'Ready to see question and graphs'. \
      You will then see a question about the dataset and a gallery of data visualizations. \
      Your task is to pick the data visualization that would best help another person answer \
      that question as <b>quickly and accurately</b> as possible.<br><br> \
      Before making your answer, you will be asked to carefully inspect <i>each</i> data visualization by hovering over each one with your cursor. \
      After you hover over each one, it will turn green to denote that you have inspected it. \
      Once each data visualization is marked with green, then you will be allowed to make your selection. \
      Please do your best when selecting the most helpful data visualization. </p>\
      <p>Some important notes:</p> \
      <p>• Once you start the study, we ask that you please <b>do not leave this browser window</b>.</p> \
      <p>• It is common for people to not be fully sure when answering these questions, \
      but please <b>do your best on each question, even if you have to make a guess</b>.</p> \
      <p>• We respectfully ask you to please <b>complete this study in one sitting and \
      without switching to other tabs or applications</b> if possible. \
      We carefully monitor when study sessions contain these interruptions, \
      and each interruption reduces the quality and usability of your data for our research. \
      Thank you for your understanding!</p>\
      <p>• Take a moment (now) to <b>silence your phone</b>.</p> \
      <p>• Take a moment (now) to <b>turn off notifications on your computer</b>. \
      (MAC: Do Not Disturb, WINDOWS: Focus Assist) </p> \
      <b>Please make your best effort on each question without consulting other people or other resources, including the internet.</b> \
      We understand your time is valuable. Thank you for contributing to our research with your earnest effort! </p>",
      'str3': "<p>Great! Click the next button to complete an example trial. \
      Remember that to inspect each data visualization, you need to hover over each one.</p>", 
      'str4': "<p>Good job! When you're ready, click 'Continue' to start the study.</p>",
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

    //ENTER FULLSCREEN
    var enter_fullscreen = {
      type: jsPsychFullscreen,
      message: '<p>Please complete the duration of this study with your browser in fullscreen. \
                   Click the button below to enter fullscreen mode.</p>',
      fullscreen_mode: true,
      data: {
        block: "fullscreen"
      }
    }

    //EXIT FULLSCREEN
    var exit_fullscreen = {
      type: jsPsychFullscreen,
      fullscreen_mode: false,
      data: {
        block: "fullscreen"
      }
    }

    /////////////////////////////////////
    // combine instructions and consent pages into one variable
    var introMsg0 = {
      type: jsPsychInstructions,
      pages: [
        instructionsHTML.str1,
        consentHTML.str1,
        consentHTML.str2,
      ],
      button_label_next: 'Continue',
      show_clickable_nav: true,
      allow_backward: false,
    };

    // combine instructions and consent pages into one variable
    var introMsg1 = {
      type: jsPsychInstructions,
      pages: [
        instructionsHTML.str2,
      ],
      button_label_next: 'Continue',
      show_clickable_nav: true,
      allow_backward: false,
    };

    var introMsg2 = {
      type: jsPsychInstructions,
      pages: [
        instructionsHTML.str3,
      ],
      button_label_next: 'Continue',
      show_clickable_nav: true,
      allow_backward: false,
    };

    var introMsg3 = {
      type: jsPsychInstructions,
      pages: [
        instructionsHTML.str4,
      ],
      button_label_next: 'Continue',
      show_clickable_nav: true,
      allow_backward: false,
    };

    // add comprehension check
    var quizTrial = {
      type: jsPsychSurveyMultiChoice,
      preamble: "<b><u>Quiz</u></b><p>Before we begin, please answer the following questions to \
      be sure you understand what you need to do in this study.</p>",
      questions: [{
          prompt: "<b>Question 1</b> - What is the purpose of this study?",
          name: "quizPurpose",
          horizontal: false,
          options: [
            "To understand why many data visualizations are often misleading.",
            "To understand what makes some data visualizations are more effective than others.",
            "To understand how people think about data."
          ],
          required: true
        },
        {
          prompt: "<b>Question 2</b> - What is the predicted time commitment of this study?",
          name: "quizHowLong",
          horizontal: false,
          options: ["10-20min",
            "20-30min",
            "30-40min",
            "40-50min"
          ],
          required: true
        }, 
        {
          prompt: "<b>Question 3</b> - Before answering each question, what do you need to do?",
          name: "quizHover",
          horizontal: false,
          options: ["Quickly look at each data visualization",
            "Hover over and inspect one or two data visualizations",
            "Click the first data visualization that looks right",
            "Hover over and carefully inspect <i>each</i> data visualization"
          ],
          required: true
        }
      ]
    };

    // check whether comprehension check responses are correct
    var loopNode = {
      timeline: [quizTrial],
      loop_function: function(data) {
        resp = JSON.parse(data.values()[0]['responses']);
        // console.log('data.values',resp);
        if ((resp['quizPurpose'] == "To understand what makes some data visualizations are more effective than others.") &&
          (resp['quizHowLong'] == "10-20min") &&
          (resp['quizHover'] == 'Hover over and carefully inspect <i>each</i> data visualization')) {
          return false;
        } else {
          alert('Try again! One or more of your responses was incorrect.');
          return true;
        }
      }
    };

     // demographic survey trials
    var surveyChoiceInfo = _.omit(_.extend({}, new Trial, additionalInfo));
    var exitSurveyChoice = _.extend({}, surveyChoiceInfo, {
      type: jsPsychSurvey,
      pages: [
        [
          {
            type: 'drop-down',
            prompt: "What is your biological sex?", 
            options: ["Male",
                    "Female",
                    "Other",
                    "Do Not Wish To Say"],
            name: 'participant_sex', 
            required: true,
          }, 
          {
            type: 'drop-down',
            prompt: "What is your highest level of education (current or completed)?",
            options: ["Did not graduate high school",
            "High school graduate, diploma or equivalent",
            "Associate degree",
            "Bachelor's degree",
            "Master's degree",
            "Professional degree (e.g. M.D., J.D.)",
            "Doctoral degree (e.g., Ph.D.)"
          ],
            name: 'participant_ed', 
            required: true,
          }, 
          {
            type: 'drop-down',
            prompt: "If you pursued/are pursuing higher education, what is your major? If your major is not listed, please choose the major that is the most similar.",
            options: ['Not applicable', 'Other', 
            'Anthropology', 'Bioengineering', 'Biological Sciences', 
            'Black Diaspora & African American Studies', 'Chemistry/Biochemistry', 
            'Chinese Studies', 'Classical Studies', 'Cognitive Science', 'Communication', 
            'Computer Science & Engineering', 'Critical Gender Studies', 'Dance', 
            'Data Science', 'Economics', 'Education Studies', 'Electrical & Computer Engineering', 
            'Engineering', 'English', 'Environmental Systems Program', 'Ethnic Studies', 'German Studies', 
            'Global Health', 'Global South Studies', 
            'History', 'Human Developmental Sciences', 'International Studies', 'Italian Studies', 
            'Japanese Studies', 'Jewish Studies', 'Latin American Studies', 'Linguistics', 'Literature', 
            'Mathematics', 'Mechanical & Aerospace Engineering', 'Music', 'NanoEngineering', 'Oceanography', 'Philosophy', 
            'Physics', 'Political Science', 'Psychology', 'Public Health', 'Religion', 'Russian & Soviet Studies', 
            'Sociology', 'Structural Engineering', 'Theatre & Dance', 'Urban Studies & Planning', 'Visual Arts', 'Undeclared',
          ],
            name: 'participant_major', 
            required: true,
          }, 
          {
            type: 'drop-down',
            prompt: "What is the general category of your occupation? If your occupation is not listed, please choose the occupation that is the most similar.",
            options: ['Not applicable', 'Other',
            'Management', 'Business & Financial Operations', 'Computer & Mathematical', 'Architecture & Engineering',
            'Life, Physical, & Social Science', 'Community & Social Service', 'Legal', 'Educational Instruction', 
            'Arts, Design, Entertainment, Sports, & Media', 'Healthcare Practioners & Technical', 'Healthcare Support', 
            'Protective Service', 'Food Preparation & Service', 'Building & Grounds Cleaning/Maintenance', 
            'Personal Care & Service', 'Sales', 'Office & Administration Support', 'Farming, Fishing, & Forestry',
            'Construction & Extraction', 'Installation, Maintenance, & Repair', 'Production', 'Transportation & Material Moving'
          ],
            name: 'participant_occ', 
            required: true,
          }, 
          {
            type: 'text',
            prompt: "How old are you?", 
            name: 'participant_age', 
            textbox_columns: 5,
            required: true,
          }, 
          {
            type: 'text',
            prompt: "What year were you born", 
            name: 'participant_birthyear', 
            textbox_columns: 5,
            required: true,
          }
        ],
        [
          {
            type: 'multi-select',
            prompt: "Which of the following mathematics topics have you taken a course in? Select all that apply.", 
            options: [" Algebra", " Calculus", " Statistics", " None"],
            name: 'participantEd_math', 
            required: true,
          }, 
          {
            type: 'likert',
            prompt: 'How often do you INTERPRET graphs in your work/academic life?',
            likert_scale_min_label: 'Never',
            likert_scale_max_label: 'Everyday',
            likert_scale_values: [
              {value: 0},
              {value: 1},
              {value: 2},
              {value: 3},
              {value: 4},
              {value: 5}, 
              {value: 6}, 
              {value: 7}
            ], 
            name: 'participant_interpret', 
            required: true,
          }, 
          {
            type: 'likert',
            prompt: 'How often do you MAKE graphs in your work/academic life?',
            likert_scale_min_label: 'Never',
            likert_scale_max_label: 'Everyday',
            likert_scale_values: [
              {value: 0},
              {value: 1},
              {value: 2},
              {value: 3},
              {value: 4},
              {value: 5}, 
              {value: 6}, 
              {value: 7}
            ], 
            name: 'participant_make', 
            required: true,
          }, 
          {
            type: 'likert',
            prompt: 'How difficult did you find this study?',
            likert_scale_min_label: 'Very Easy',
            likert_scale_max_label: 'Very Hard',
            likert_scale_values: [
              {value: 1},
              {value: 2},
              {value: 3},
              {value: 4},
              {value: 5}
            ], 
            name: 'participant_difficulty', 
            required: true,
          }, 
          {
            type: 'likert',
            prompt: 'Which of the following best describes the amount of effort you put into the task?',
            likert_scale_min_label: "I did not try at all",
            likert_scale_max_label: 'I did my very best',
            likert_scale_values: [
              {value: 0},
              {value: 1},
              {value: 2},
              {value: 3},
              {value: 4},
              {value: 5}
            ], 
            name: 'participant_effort', 
            required: true,
          }
        ], 
        [
          {
            type: 'multi-choice',
            prompt: "Did you encounter any technical difficulties while completing \
                     this study? This could include: images were glitchy (e.g., did not load) \
                     or sections of the study did not load properly.", 
          options: ["Yes", "No"],
          name: 'participant_technical', 
          required: true,
          }, 
          {
            type: 'text',
            prompt: "If you encountered any technical difficulties, please briefly \
                     describe the issue.", 
            name: 'TechnicalDifficultiesFreeResp', 
            textbox_columns: 10,
            textbox_rows: 5,
            name: 'participant_technical_freeresponse', 
            required: false,
          },
          {
            type: 'text',
            prompt: "Thank you for participating in our study! Do you have any \
                     other comments or feedback \
                     to share with us about your experience?", 
            name: 'participantComments', 
            textbox_columns: 10,
            textbox_rows: 5,
            name: 'participant_freeresponse', 
            required: false,
          }
        ]
      ],
      title: 'Exit Survey',
      button_label_next: 'Continue',
      button_label_finish: 'Submit',
      show_question_numbers: 'onPage'
    }
    );

    // add goodbye page
    var goodbye = {
      type: jsPsychInstructions,
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
        window.open("https://app.prolific.co/submissions/complete?cc=CL9H5NRE", "_self");
        // window.open('https://ucsd.sona-systems.com/webstudy_credit.aspx?experiment_id=2062&credit_token=1162d120a5c94af09a8e4e250bcc7ec0&survey_code=' + jsPsych.data.getURLVariable('survey_code'))
      }
    };

    /////////////////////////////////////
    // add all experiment variables to trials array
    // initialize array
    var setup = [];

    // add instructions and consent
    if (includeIntro) setup.push(introMsg0);
    // if (includeIntro) setup.push(collectPID);
    if (includeIntro) setup.push(browsercheck);
    if (includeIntro) setup.push(enter_fullscreen);
    if (includeIntro) setup.push(introMsg1);
    // add comprehension check
    if (includeQuiz) setup.push(loopNode);
    if (includeIntro) setup.push(introMsg2);
    if (includePractice) setup.push(practice_trial);
    if (includeIntro) setup.push(introMsg3);
    // add test trials
    var experiment = setup.concat(trials);
    if (includeExitSurvey) experiment.push(exitSurveyChoice);
    if (includeGoodbye) experiment.push(exit_fullscreen);
    if (includeGoodbye) experiment.push(goodbye);

    console.log('experiment', experiment);

    // to manually preload media files, create an array of file paths for each 
    // media type
  //   var images = [
  //   'images/accidents_x1decade_facetnone_reorderalph_colorgrey20.png',
  //   'images/accidents_x1decade_facetnone_reorderlarge_to_small_colorgrey20.png',
  //   'images/accidents_x1decade_facetoccRole_reorderalph_colorgrey20.png',
  //   'images/accidents_x1decade_facetoccRole_reorderlarge_to_small_colorgrey20.png',
  //   'images/accidents_x1occRole_facetdecade_reorderalph_colorgrey20.png',
  //   'images/accidents_x1occRole_facetdecade_reorderlarge_to_small_colorgrey20.png',
  //   'images/accidents_x1occRole_facetnone_reorderalph_colorgrey20.png',
  //   'images/accidents_x1occRole_facetnone_reorderlarge_to_small_colorgrey20.png',
  //   'images/flights_x1carrier_facetnone_reorderalph_colorgrey20.png',
  //   'images/flights_x1carrier_facetnone_reorderlarge_to_small_colorgrey20.png',
  //   'images/flights_x1carrier_facetorigin_reorderalph_colorgrey20.png',
  //   'images/flights_x1carrier_facetorigin_reorderlarge_to_small_colorgrey20.png',
  //   'images/flights_x1origin_facetcarrier_reorderalph_colorgrey20.png',
  //   'images/flights_x1origin_facetcarrier_reorderlarge_to_small_colorgrey20.png',
  //   'images/flights_x1origin_facetnone_reorderalph_colorgrey20.png',
  //   'images/flights_x1origin_facetnone_reorderlarge_to_small_colorgrey20.png',
  //   'images/happiness_x1happy_facetnone_reorderalph_colorgrey20.png',
  //   'images/happiness_x1happy_facetnone_reorderlarge_to_small_colorgrey20.png',
  //   'images/happiness_x1happy_facetregion_reorderalph_colorgrey20.png',
  //   'images/happiness_x1happy_facetregion_reorderlarge_to_small_colorgrey20.png',
  //   'images/happiness_x1region_facethappy_reorderalph_colorgrey20.png',
  //   'images/happiness_x1region_facethappy_reorderlarge_to_small_colorgrey20.png',
  //   'images/happiness_x1region_facetnone_reorderalph_colorgrey20.png',
  //   'images/happiness_x1region_facetnone_reorderlarge_to_small_colorgrey20.png',
  //   'images/iris_x1Location_facetnone_reorderalph_colorgrey20.png',
  //   'images/iris_x1Location_facetnone_reorderlarge_to_small_colorgrey20.png',
  //   'images/iris_x1Location_facetSpecies_reorderalph_colorgrey20.png',
  //   'images/iris_x1Location_facetSpecies_reorderlarge_to_small_colorgrey20.png',
  //   'images/iris_x1Species_facetLocation_reorderalph_colorgrey20.png',
  //   'images/iris_x1Species_facetLocation_reorderlarge_to_small_colorgrey20.png',
  //   'images/iris_x1Species_facetnone_reorderalph_colorgrey20.png',
  //   'images/iris_x1Species_facetnone_reorderlarge_to_small_colorgrey20.png',
  //   'images/movies_x1decade_facetgenre_reorderalph_colorgrey20.png',
  //   'images/movies_x1decade_facetgenre_reorderlarge_to_small_colorgrey20.png',
  //   'images/movies_x1decade_facetnone_reorderalph_colorgrey20.png',
  //   'images/movies_x1decade_facetnone_reorderlarge_to_small_colorgrey20.png',
  //   'images/movies_x1genre_facetdecade_reorderalph_colorgrey20.png',
  //   'images/movies_x1genre_facetdecade_reorderlarge_to_small_colorgrey20.png',
  //   'images/movies_x1genre_facetnone_reorderalph_colorgrey20.png',
  //   'images/movies_x1genre_facetnone_reorderlarge_to_small_colorgrey20.png',
  //   'images/pizza_x1name_facetnone_reorderalph_colorgrey20.png',
  //   'images/pizza_x1name_facetnone_reorderlarge_to_small_colorgrey20.png',
  //   'images/pizza_x1name_facetsize_reorderalph_colorgrey20.png',
  //   'images/pizza_x1name_facetsize_reorderlarge_to_small_colorgrey20.png',
  //   'images/pizza_x1size_facetname_reorderalph_colorgrey20.png',
  //   'images/pizza_x1size_facetname_reorderlarge_to_small_colorgrey20.png',
  //   'images/pizza_x1size_facetnone_reorderalph_colorgrey20.png',
  //   'images/pizza_x1size_facetnone_reorderlarge_to_small_colorgrey20.png',
  //   'images/race_x1sex_facetnone_reorderalph_colorgrey20.png',
  //   'images/race_x1sex_facetnone_reorderlarge_to_small_colorgrey20.png',
  //   'images/race_x1sex_facetstate_reorderalph_colorgrey20.png',
  //   'images/race_x1sex_facetstate_reorderlarge_to_small_colorgrey20.png',
  //   'images/race_x1state_facetnone_reorderalph_colorgrey20.png',
  //   'images/race_x1state_facetnone_reorderlarge_to_small_colorgrey20.png',
  //   'images/race_x1state_facetsex_reorderalph_colorgrey20.png',
  //   'images/race_x1state_facetsex_reorderlarge_to_small_colorgrey20.png',
  //   'images/star_x1class_type_facetgrade_reorderalph_colorgrey20.png',
  //   'images/star_x1class_type_facetgrade_reorderlarge_to_small_colorgrey20.png',
  //   'images/star_x1class_type_facetnone_reorderalph_colorgrey20.png',
  //   'images/star_x1class_type_facetnone_reorderlarge_to_small_colorgrey20.png',
  //   'images/star_x1grade_facetclass_type_reorderalph_colorgrey20.png',
  //   'images/star_x1grade_facetclass_type_reorderlarge_to_small_colorgrey20.png',
  //   'images/star_x1grade_facetnone_reorderalph_colorgrey20.png',
  //   'images/star_x1grade_facetnone_reorderlarge_to_small_colorgrey20.png',
  //   'images/storms_x1name_facetnone_reorderalph_colorgrey20.png',
  //   'images/storms_x1name_facetnone_reorderlarge_to_small_colorgrey20.png',
  //   'images/storms_x1name_facetstatus_reorderalph_colorgrey20.png',
  //   'images/storms_x1name_facetstatus_reorderlarge_to_small_colorgrey20.png',
  //   'images/storms_x1status_facetname_reorderalph_colorgrey20.png',
  //   'images/storms_x1status_facetname_reorderlarge_to_small_colorgrey20.png',
  //   'images/storms_x1status_facetnone_reorderalph_colorgrey20.png',
  //   'images/storms_x1status_facetnone_reorderlarge_to_small_colorgrey20.png',
  //   ];

  //   var preload = {
  //     type: jsPsychPreload,
  //     images: images
  // }

    // run study
    jsPsych.run(experiment);

  }); // close socket onConnected
} // close setupGame