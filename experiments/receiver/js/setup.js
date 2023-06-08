const iterationName = 'debugging_exp2'
const version = 'receiver'

function sendData(data) {
  console.log('sending data');
  jsPsych.turk.submitToTurk({
    'score': 0 //this is a dummy placeholder
  });
}

// define trial object with boilerplate using global variables from above
// note that we make constructTrialParams later on...
function Trial() {
  this.dbname = 'davinci_exp2_receiver'; // davinci_cogsci_receiver
  this.colname = 'davinci_exp2_receiver'; // davinci_cogsci_receiver
  this.iterationName = iterationName;
  this.version = 'receiver'
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
    const includeIntro = false;
    const includeQuiz = false;
    const includePractice = true;
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
      dbname: 'davinci_cogsci_receiver',
      colname: 'davinci_cogsci_receiver',
      version: version,
      iterationName: iterationName,
    }

    // count all stimuli trials
    var numTrials = meta[0].length;

    /////////////////////////////////////
    // SET INDIVIDUAL PLUGIN PARAMS
    let constructTrialParams = function(trial) {
      let trialParams;
        trialParams = {
          type: jsPsychSurveyTextEdited, //jsPsychSurveyTextCustom
            questions: [{
            prompt: trial.prompt,
            placeholder: "write number here",
            rows: 1,
            columns: 60,
            required: true
          }],
          graph_image: 'images_2/' + trial.graphID, //'images/' + trial.corrFilename,
        };
      return trialParams
    }; // close socket.on

    var practice_trial_possible = {
      type: jsPsychSurveyTextEdited,
      questions: [{
        promptTitle: 'Flowers',
        prompt: 'How long is the petal length of virginica flowers that are planted outdoors?',
        description: 'This data visualization is intended to show information about: \
                      <b>petal length of different flowers across different species of \
                      flowers that sometimes planted inside or outside</b>. \
                      In this dataset, there are 3 species of flowers called \
                      “Virginica”, “Veriscolor”, and “Setosa”.',
        placeholder: "write number here",
        rows: 1,
        columns: 60,
        required: true, 
      }],
      graphID: 'iris_x1Location_facetSpecies_reorderlarge_to_small_colorgrey20.png',
      practice: 'practice',
      gameID: gameid, 
      iterationName: iterationName,   
      version: version,
      recruitmentPlatform: recruitmentPlatform,
      promptTitle: 'Flowers',
      prompt: 'How long is the petal length of virginica flowers that are planted outdoors?',
      description: 'This data visualization is intended to show information about: \
                  <b>petal length of different flowers across different species of \
                  flowers that sometimes planted inside or outside</b>. \
                  In this dataset, there are 3 species of flowers called \
                  “Virginica”, “Veriscolor”, and “Setosa”.',
      eventType: 'practice',
      survey: 'not_survey',     
      corrAns: 4.2, 
      taskCategory: 'practice', 
      questionType:'practice',
      graphType: 'practice',
      dataset: 'practice',
      trialNum: 'practice'
    }

    var practice_trial_NOTpossible = {
      type: jsPsychSurveyTextEdited,
      questions: [{
        promptTitle: 'Flowers',
        prompt: 'How long is the petal length of indoor flowers? \
                <i>In this example, notice how it is <u>not</u> possible \
                to answer a question about flowers that are indoors or outdoors. \
                You should still make your best guess!</i>',
        description: 'This data visualization is intended to show information about: \
                      <b>petal length of different flowers across different species of flowers</b>. \
                      In this dataset, there are 3 species of flowers called \
                      “Virginica”, “Veriscolor”, and “Setosa”.',
        placeholder: "write number here",
        rows: 1,
        columns: 60,
        required: true, 
      }],
      graphID: 'iris_x1Species_facetnone_reorderlarge_to_small_colorgrey20.png',
      practice: 'practice',
      gameID: gameid, 
      iterationName: iterationName,   
      version: version,
      recruitmentPlatform: recruitmentPlatform,
      promptTitle: 'Flowers',
      prompt: 'How long is the petal length of indoor flowers?',
      description: 'This data visualization is intended to show information about: \
                  <b>petal length of different flowers across different species of flowers</b>. \
                  In this dataset, there are 3 species of flowers called \
                  “Virginica”, “Veriscolor”, and “Setosa”.',
      eventType: 'practice',      
      survey: 'not_survey',      
      corrAns: 'impossible',
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
    // <p>The total time commitment for this study is expected to be ~10 minutes, \
    // including the time it takes to read these instructions. \
    // For your participation in this study, you will earn $2.50.</p>\

    instructionsHTML = {
      'str1': "<p> Welcome! We are interested in what makes some data visualizations more effective than others. \
       In this study, you will be presented with a series of data visualizations and \
       asked some questions about them.</p> \
       <p>The total time commitment for this study is expected to be ~10 minutes, \
       including the time it takes to read these instructions. \
       For your participation in this study, you will receive 0.5 credits on SONA.</p>\
       <p>When you are finished, the study will be automatically submitted for approval.</p>\
       <p><i>We recommend using Chrome. This study has not been tested in other browsers. \
       Please also ensure that you complete this study on a desktop computer or laptop.</i></p>",
      'str2': "<b><u><p id='legal'> Instructions</p></u></b>\
      <p> You will be presented with a series of data visualizations, each accompanied by a question. Some important notes:</p> \
      <p>• Once you start the study, we ask that you please <b>do not leave this browser window</b>.</p> \
      <p>• It is common for people to not be fully sure when answering these questions, \
      but please <b>do your best on each question, <i>even if you have to make a guess</i></b>.</p> \
      <p>• Your goal is to answer each question as <b>accurately</b> and as <b>quickly</b> as you are able.</p> \
      <p>• We respectfully ask you to please <b>complete this study in one sitting and \
      without switching to other tabs or applications</b>. \
      We carefully monitor when study sessions contain these interruptions, \
      and each interruption reduces the quality and usability of your data for our research. \
      Thank you for your understanding!</p>\
      <p>• Take a moment (now) to <b>silence your phone</b>.</p> \
      <p>• Take a moment (now) to <b>turn off notifications on your computer</b>. \
      (MAC: Do Not Disturb, WINDOWS: Focus Assist) </p> \
      <b>Please make your best effort on each question without consulting other people or other resources, including the internet.</b> \
      We understand your time is valuable. Thank you for contributing to our research with your earnest effort! </p>",
      'str3': "<p>Great! Before starting the study, it is important to know how data visualizations are created:</p> \
      <p><b>A dataset can be used to make several different data visualizations. \
      Each data visualization shows how parts of the dataset relate to each other.</b> \
      For example, you might have a dataset with information about length of flower petals of different flower species. \
      Using this dataset, you might make a data visualization to show how some species might have petals that are \
      on average longer or shorter than other species.</p> \
      <p>Because data visualizations can be complicated to look at, you\'ll first be shown a description about the data visualization. \
      Then when you are ready to see the data visualization, you\'ll be able to click a 'Ready to see graph' button that will show both \
      a data visualiation and an accompanying question about it. </p>\
      <p><b>Imporant note:</b> there may be more information in a dataset than you may see in a particular data visualization, so sometimes \
      it is genuinely not possible to answer a question based on the data visualization alone, \
      even though that information is contained in the dataset. \
      <b>You should still make your very best guess about what you believe the correct answer to be.</b></p> \
      <p>Click the next button to complete two example trials.</p>",
      'str4': "<p>Good job! When you're ready, click 'Continue' to start the study. \
      In the following trials, you will not be told which data visualizations are possible or not to answer questions about.</p>",
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
      message: '<p>To help minimize distractions, we ask that you complete this \
                study with your browser in fullscreen mode. Please click the button \
                below to proceed in fullscreen mode.</p>',
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
            "To understand what makes some data visualizations more effective than others.",
            "To understand how people think about data."
          ],
          required: true
        },
        {
          prompt: "<b>Question 2</b> - How quickly should you answer the questions?",
          name: "quizGoal",
          horizontal: false,
          options: [
            "As quickly as you can without reading the question",
            "As slowly as you may need",
            "As quickly as you can while also trying to be accurate in your response"
          ],
          required: true
        },
        {
          prompt: "<b>Question 3</b> - What is the predicted time commitment of this study?",
          name: "quizHowLong",
          horizontal: false,
          options: ["5min",
            "10min",
            "20min",
            "30min"
          ],
          required: true
        }, 
        {
          prompt: "<b>Question 4</b> - What should you do if you aren't sure about your answer \
          or don't think the question is answerable?",
          name: "quizImpossible",
          horizontal: false,
          options: ["Make your very best guess",
            "Don't answer",
            "Write '0000' so that the researchers know that you don't know the answer", 
            "Quit the study",
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
        if (
          (resp['quizPurpose'] == "To understand what makes some data visualizations more effective than others.") &&
          (resp['quizGoal'] == "As quickly as you can while also trying to be accurate in your response") &&
          (resp['quizHowLong'] == "10min") &&
          (resp['quizImpossible'] == "Make your very best guess")
          ) {
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
            prompt: "What is your gender?", 
            options: ["Male",
                    "Female",
                    "Other",
                    "Do Not Wish To Say"],
            name: 'participant_sex', 
            required: true,
          }, 
          {
            type: 'text',
            prompt: "How many years of formal schooling have you completed? \
            (If you completed a 4-year undergraduate university program in \
              the United States, you would indicate 16 years.)", 
            name: 'participant_ed', 
            textbox_columns: 5,
            required: true,
          },
          {
            type: 'text',
            prompt: "How many years of formal math education have you completed? \
            Please estimate to the best of your ability.", 
            name: 'participant_math', 
            textbox_columns: 5,
            required: true,
          },
          // {
          //   type: 'drop-down',
          //   prompt: "What is your highest level of education (current or completed)?",
          //   options: ["Did not graduate high school",
          //   "High school graduate, diploma or equivalent",
          //   "Associate degree",
          //   "Bachelor's degree",
          //   "Master's degree",
          //   "Professional degree (e.g. M.D., J.D.)",
          //   "Doctoral degree (e.g., Ph.D.)"
          // ],
          //   name: 'participant_ed', 
          //   required: true,
          // }, 
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
          // {
          //   type: 'multi-select',
          //   prompt: "Which of the following mathematics topics have you taken a course in? Select all that apply.", 
          //   options: [" Algebra", " Calculus", " Statistics", " None"],
          //   name: 'participantEd_math', 
          //   required: true,
          // }, 
          {
            type: 'multi-select',
            prompt: "Which of the following math courses have you taken? \
            The below courses are those typically offered at the highschool \
            and college-level, but may not be a comprehensive list. \
            Please estimate which you have taken to the best of your ability. \
            Select all that apply.", 
            options: [
            " Algebra 1", 
            " Geometry", 
            " Algebra 2", 
            " Trigonometry",
            " Precalculus",
            " Calculus 1",
            " Calculus 2",
            " Calculus 3 (Multivariable Calculus)",
            " Differential Equations",
            " Linear Algebra",
            " Probability and Statistics",
            " Number Theory",
            " Real Analysis",
            " Abstract Algebra",
            " None"
          ],
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
            // name: 'TechnicalDifficultiesFreeResp', 
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
            // name: 'participantComments', 
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
        window.open("https://app.prolific.co/submissions/complete?cc=C1A3S1Q1", "_self");
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
    // generate practice trials
    let practice = [practice_trial_possible, practice_trial_NOTpossible]
    // randomize presentation of graphs
    let practice_shuff = practice
    .map(value => ({ value, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ value }) => value)
    // add practice trials
    if (includePractice) setup.push(practice_shuff[0]);
    if (includePractice) setup.push(practice_shuff[1]);
    if (includeIntro) setup.push(introMsg3);
    // add test trials
    var experiment = setup.concat(trials);
    if (includeExitSurvey) experiment.push(exitSurveyChoice);
    if (includeGoodbye) experiment.push(exit_fullscreen);
    if (includeGoodbye) experiment.push(goodbye);

    console.log('experiment', experiment);

    // run study
    jsPsych.run(experiment);

  }); // close socket onConnected
} // close setupGame