/**
 * jspsych-survey-multi-choice
 * a jspsych plugin for multiple choice survey questions
 *
 * Shane Martin
 * documentation: docs.jspsych.org
 *
 * this plugin was edited by Holly Huey to include functionality, such as:
 * - aligning the radio buttons to the left
 * - display PNGs of the graph stimuli
 **/ 


 jsPsych.plugins['survey-multi-choice-custom'] = (function() {
  var plugin = {};

  plugin.info = {
    name: 'survey-multi-choice',
    description: '',
    parameters: {
      questions: {
        type: jsPsych.plugins.parameterType.COMPLEX,
        array: true,
        pretty_name: 'Questions',
        nested: {
          prompt: {
            type: jsPsych.plugins.parameterType.STRING,
            pretty_name: 'Prompt',
            default: undefined,
            description: 'The strings that will be associated with a group of options.'
          },
          options: {
            type: jsPsych.plugins.parameterType.STRING,
            pretty_name: 'Options',
            array: true,
            default: undefined,
            description: 'Displays options for an individual question.'
          },
          required: {
            type: jsPsych.plugins.parameterType.BOOL,
            pretty_name: 'Required',
            default: false,
            description: 'Subject will be required to pick an option for each question.'
          },
          horizontal: {
            type: jsPsych.plugins.parameterType.BOOL,
            pretty_name: 'Horizontal',
            default: false,
            description: 'If true, then questions are centered and options are displayed horizontally.'
          },
          name: {
            type: jsPsych.plugins.parameterType.STRING,
            pretty_name: 'Question Name',
            default: '',
            description: 'Controls the name of data values associated with this question'
          }
        }
      },
      randomize_question_order: {
        type: jsPsych.plugins.parameterType.BOOL,
        pretty_name: 'Randomize Question Order',
        default: false,
        description: 'If true, the order of the questions will be randomized'
      },
      preamble: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Preamble',
        default: null,
        description: 'HTML formatted string to display at the top of the page above all the questions.'
      },
      button_label: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Button label',
        default:  'Continue',
        description: 'Label of the button.'
      },
      dbname: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'MongoDB dbname',
        default: 'causaldraw',
        description: 'name of database to insert survey data into'
      },
      colname: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'MongoDB collection name',
        default: 'machines',
        description: 'name of collection to insert survey data into'
      },      
      gameID: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'gameID',
        default: 'surveyData',
        description: 'participant ID'
      }, 
      graph_image: {
        type: jsPsych.plugins.parameterType.IMAGE,
        pretty_name: 'PNG of graph',
        default: 'graphFilename',
        description: 'Path to image file of graph stimulus'
      },
    }
  }
  plugin.trial = function(display_element, trial) {

    var plugin_id_name = "jspsych-survey-multi-choice-custom";

    var html = "";

    html += '<div class="trialNum"> ' + "Question: " + (trial.trialNum + 1) + " / " + trial.numTrials + '</div>';

    html += '<div class="container">'

    // inject CSS for trial
    html += '<style id="jspsych-survey-multi-choice-css">';
    html += ".jspsych-survey-multi-choice-question { margin-top: 2em; margin-bottom: 2em; text-align: left; }"+
      ".jspsych-survey-multi-choice-text span.required {color: darkred;}"+
      ".jspsych-survey-multi-choice-horizontal .jspsych-survey-multi-choice-text {  text-align: left;}"+
      ".jspsych-survey-multi-choice-option { line-height: 2; text-align: left;}"+
      ".jspsych-survey-multi-choice-horizontal .jspsych-survey-multi-choice-option {  display: inline-block;  margin-left: 1em;  margin-right: 1em;  vertical-align: top;}"+
      "label.jspsych-survey-multi-choice-text input[type='radio'] {margin-right: 2em; }";
    html += '</style>';

    // show preamble text
    if(trial.preamble !== null){
      html += '<div id="jspsych-survey-multi-choice-preamble" class="jspsych-survey-multi-choice-preamble" style="width: 600px;">'+trial.preamble+'</div>';
      html += '<br>'
    }

    // insert graph image (PNG)
    html += '<div id="graph">'
    html += "<img src='" + trial.graph_image + "' class='graph_images'></img>"
    html += '</div>' // close graph
    
    // form element
    html += '<form id="jspsych-survey-multi-choice-form">';
    
    // generate question order. this is randomized here as opposed to randomizing the order of trial.questions
    // so that the data are always associated with the same question regardless of order
    var question_order = [];
    for(var i=0; i<trial.questions.length; i++){
      question_order.push(i);
    }
    if(trial.randomize_question_order){
      question_order = jsPsych.randomization.shuffle(question_order);
    }
    
    // add multiple-choice questions
    for (var i = 0; i < trial.questions.length; i++) {
      
      // get question based on question_order
      var question = trial.questions[question_order[i]];
      var question_id = question_order[i];
      
      // create question container
      var question_classes = ['jspsych-survey-multi-choice-question'];
      if (question.horizontal) {
        question_classes.push('jspsych-survey-multi-choice-horizontal');
      }

      html += '<div id="jspsych-survey-multi-choice-'+question_id+'" class="'+question_classes.join(' ')+'"  data-name="'+question.name+'">';

      // add question text
      html += '<p class="jspsych-survey-multi-choice-text survey-multi-choice">' + question.prompt 
      if(question.required){
        html += "<span class='required'>*</span>";
      }
      html += '</p>';

      // create option radio buttons
      for (var j = 0; j < question.options.length; j++) {
        // add label and question text
        var option_id_name = "jspsych-survey-multi-choice-option-"+question_id+"-"+j;
        var input_name = 'jspsych-survey-multi-choice-response-'+question_id;
        var input_id = 'jspsych-survey-multi-choice-response-'+question_id+'-'+j;

        var required_attr = question.required ? 'required' : '';

        // add radio button container
        html += '<div id="'+option_id_name+'" class="jspsych-survey-multi-choice-option">';
        html += '<input type="radio" name="'+input_name+'" id="'+input_id+'" value="'+question.options[j]+'" '+required_attr+'></input>';
        html += '<label class= "radio-button" class="jspsych-survey-multi-choice-text" for="'+input_id+'"> ' + question.options[j]+'</label>';
        html += '</div>';
      }

      html += '</div>';
    }
    
    // add submit button
    html += '<input type="submit" id="'+plugin_id_name+'-next" class="'+plugin_id_name+' jspsych-btn"' + (trial.button_label ? ' value="'+trial.button_label + '"': '') + '></input>';
    html += '</form>';

    html += '</div>'

    // render
    display_element.innerHTML = html;

    document.querySelector('form').addEventListener('submit', function(event) {
      event.preventDefault();
      // measure response time
      var endTime = performance.now();
      var response_time = endTime - startTime;

      // create object to hold responses
      var question_data = {};
      for(var i=0; i<trial.questions.length; i++){
        var match = display_element.querySelector('#jspsych-survey-multi-choice-'+i);
        var id = "Q" + i;
        if(match.querySelector("input[type=radio]:checked") !== null){
          var val = match.querySelector("input[type=radio]:checked").value;
        } else {
          var val = "";
        }
        var obje = {};
        var name = id;
        if(match.attributes['data-name'].value !== ''){
          name = match.attributes['data-name'].value;
        }
        obje[name] = val;
        Object.assign(question_data, obje);
      }

      var turkInfo = jsPsych.turk.turkInfo();

      // save data
      var trial_data = _.extend({}, trial, {
        workerId: turkInfo.workerId,
        hitID: turkInfo.hitId,
        aID: turkInfo.assignmentId,
        gameID: trial.gameID,
        dbname: trial.dbname,
        colname: trial.colname,
        iterationName: trial.iterationName,
        eventType: 'test',
        startTime: startTime,
        endTime: endTime,
        rt: response_time,
        response_json: JSON.stringify(question_data),
        response: question_data['Q0'],
        question_order: JSON.stringify(question_order),
        corrAns: trial.corrAns,
      });

      // send data to mongoDB
      console.log('currentData', trial_data);
      socket.emit('currentData', trial_data);

      display_element.innerHTML = '';

      // next trial
      jsPsych.finishTrial(trial_data);
    });

    var startTime = performance.now();
  };

  return plugin;
})();