/**
 * This plugin was written to include functionality, such as:
 * - selecting multiple choice test questions (radio buttons)
 * - writing in custom textarea answers (w/ row and col specificity)
 * - display PNGs
 */

jsPsych.plugins['jspsych-survey-custom'] = (function() {
  var plugin = {};

  plugin.info = {
    name: 'jspsych-survey-custom',
    description: '',
    parameters: {
    } // close parameters
  } // close plugin.info variable

  plugin.trial = function(display_element, trial) {
    var plugin_id_name = "jspsych-survey-custom";
    
    // grab stim variables
    trial.promptTitle = trial[0]['promptTitle'];
    trial.graph_image = 'phase_0/' + trial[0]['graphFilename'];
    trial.prompt = trial[0]['prompt'];
    trial.questionType = trial[0]['questionType'];
    trial.options = trial[0]['options'];
    trial.corrAns = trial[0]['corrAns']; 
    
    console.log(trial.corrAns)

    /////////////////////////////////////
    // build html for stimuli display
    var html = "";
    // add container for text and columns
    html += '<div id="container">'

    // add 1st row for the preamble
    html += '<div class="row">'
    html += '<div id="promptTitle" class="instructions">'
    html += trial.promptTitle
    html += '</div>' // close preambleText
    html += '</div>' // close 1st row

    // add 2nd row for graph image
    html += '<div class="row">'
    html += '<div id="graph">'
    html += "<img src='" + trial.graph_image + "' class='graph_images' style='margin: 1em;'></img>"
    html += '</div>' // close graph
    html += '</div>' // close 2ns row

    // add 3rd row for the prompt
    html += '<div class="row">'
    html += '<div id="promptText" class="instructions">'
    html += trial.prompt
    html += '</div>' // close promptText
    html += '</div>' // close 3rd row

    // add 4th row for either: multiple choice (radio buttons) OR written response (textarea)
    html += '<div class="row">' 
    html += '<div id="testResponse" >'

    // depending on question type, add text question functionality
    if (trial.questionType == 'fill_in_blank') {

    html+= '<div id="textarea">'
    html+= '<form id="myForm">'
    html+= 'Please write an answer:'
    html+= '<input type="text" id="custom_label" name="custom_label">'
    html+= '<input id="submit_text" type="button" value="submit">'
    html+= '<span id="show"></span>'
    html+= '</form>' // close myForm
    html+= '</div>' // close textarea

    } else if (trial.questionType == 'multiple_choice') {

      // $.each(trial.options, function(index, value) {
      //   html += '<div>'
      //   html += '<label><input type="radio" name="radio_group" id="myRadio" value="' + value + '"> ' + value + '</label><br>';
      //   html += '</div>'
      // });

      html += '<div>'
      html += '<input id="submit_multi" type="button" value="submit">'
      // html += '<input id="submit_multi" value="submit">'
      html += '</div>'
      
    } // close else if statement

    html += '</div>' // close testResponse
    html += '</div>' // close 4th row
    html += '</div>' // close container

    /////////////////////////////////////
    // now assign html to display_element.innerHTML and show content container
    display_element.innerHTML = html;

    // set timeStamp params
    timeStamp_1= Date.now(); 
    console.log(timeStamp_1);
    console.log('trial', trial);

    // define data object to send to mongo  
    testData = _.extend({}, trial, {
      dbname: trial.dbname,
      colname: trial.colname,
      iterationName: trial.iterationName,
      eventType: 'test',
    });

    $("#submit_text").on("click", submitText);

    // prevent people from accidentally hitting the 'enter' key and restarting the entire experiment
    // @HL — we learned that this is a free floating function
    $('#myForm').on('keyup keypress', function(e) {
      var keyCode = e.keyCode || e.which;
      if (keyCode === 13) { 
        e.preventDefault();
        console.log('enter');
        return false;
      } // close if statement
    }); // close eventListener (on myForm)

    // functionality for submitting custom written text
    function submitText() {
      var customText = document.getElementById("custom_label").value;
      console.log(customText, 'customText');
      
      if (customText.length == 0) {
        console.log('whoops');
        // @HL let's either write an "alert" or custom write in an error message
      } else if (customText.length > 0) { 
        timeStamp_3 = Date.now(); 
        console.log(timeStamp_3)
        testData = _.extend({}, trial, {
          dbname: trial.dbname,
          colname: trial.colname,
          iterationName: trial.iterationName,
          eventType: 'test',
          survey_text: customText,
          survey_multi: 'NA',
          rt_1: timeStamp_1,
          rt_3: timeStamp_3,
          corrAns: trial.corrAns
        });

        // send data to mongoDB
        console.log('currentData',testData);
        socket.emit('currentData',testData);

        // move onto next trial
        endTrial()

        // clear form after submitting custom text
        $('#myForm')[0].reset();
      } // close else statement
    }; // close submitText

    // functionality for submitting multi choice 
      // make an array of options in this trial
      let $buttonGallery = $("#testResponse");
      let myList = trial.options;

      // console.log(trial.options.length, 'hey');

      // collect selected buttons
      // let clicked = [];

      // make as many radio buttons as there are in the array (myList)
      myList.map(function(option, index) {       
          let $button = $("<div></div>")
            .addClass("buttons")
            .attr("id", + option)
            .html('<label><input type="radio" name="radio_group" id="myRadio" value="' + option + '"> ' + option + '</label>' )
            .on("click", function() {
              // //upon clicking a button, give it the class 'selected'
              $(this).toggleClass('selected');

              // // grab all buttons that have the class 'selected' — remember to use the period (.) to call that class
              let selected_button = document.querySelectorAll('.selected');

              console.log(selected_button, 'hey');

              // // make an empty list
              // let clicked = [] 

              // // add clicked buttons to this list as they are clicked
              // for (let n = 0; n < trial.options.length; n++) {
              //   // if (!clicked.includes(selected_button[n].textContent)) {
              //     clicked.push(selected_button);
              //     console.log('clicked', clicked);
              //   // }
              // };

              // set timeStamp params
              timeStamp_2 = Date.now(); 
              console.log(timeStamp_2);

              // collect test data
              testData = _.extend({}, trial, {
                dbname: trial.dbname,
                colname: trial.colname,
                iterationName: trial.iterationName,
                eventType: 'test',
                // survey_multi: clicked,
                survey_text: 'NA',
                timeStamp_1, 
                timeStamp_2,
                corrAns: trial.corrAns
              });

              // https://stackoverflow.com/questions/16334265/form-gets-submitted-twice-on-button-click
              // https://stackoverflow.com/questions/15767083/why-does-preventdefault-on-a-parent-elements-click-disable-a-checkbox/15767580#15767580
              $('input').on('click', function(e){
                e.stopPropagation();
              });

              // send data to mongoDB
              console.log('currentData',testData);
              socket.emit('currentData',testData);

              // move onto next trial - submit immediately upon clicking a radio button
              // endTrial() // move this outstide of this function
            }); // close on.click function

          $("#submit_multi").before($button); 
      }); // close map function

      // $("#submit_multi").on("click", submitMulti);

      // function submitMulti() {
      //   // create object to hold responses
      //   var question_data = {};

      //   for(var i = 0; i < trial.options.length; i++){
      //     var match = document.querySelector('radio');          
      //     var id = "Q" + i;
      //     if(match.querySelector("input[type=radio]:checked") !== null){
      //       var val = match.querySelector("input[type=radio]:checked").value;
      //     } else {
      //       var val = "";
      //     }
      //     var obje = {};
      //     var name = id;
      //     if(match.attributes['data-name'].value !== ''){
      //       name = match.attributes['data-name'].value;
      //     }
      //     obje[name] = val;
      //     Object.assign(question_data, obje);
      //   }
      // }

    function endTrial() {
    // move onto next trial 
    //add in send data to mongo and endtrial stuff
    jsPsych.finishTrial();
    }
  }; // close plugin.trial function

  return plugin;
})(); // close jsPsych.plugins
