var jsPsychImageGallery = (function (jspsych) {
    'use strict';
  
    const info = {
        name: "survey-text",
        parameters: {
            questions: {
                type: jspsych.ParameterType.COMPLEX,
                array: true,
                pretty_name: "Questions",
                default: undefined,
                nested: {
                    /** Question prompt. */
                    prompt: {
                        type: jspsych.ParameterType.HTML_STRING,
                        pretty_name: "Prompt",
                        default: undefined,
                    },
                    /** Placeholder text in the response text box. */
                    placeholder: {
                        type: jspsych.ParameterType.INT,
                        pretty_name: "Placeholder",
                        default: "",
                    },
                    /** The number of rows for the response text box. */
                    rows: {
                        type: jspsych.ParameterType.INT,
                        pretty_name: "Rows",
                        default: 1,
                    },
                    /** The number of columns for the response text box. */
                    columns: {
                        type: jspsych.ParameterType.INT,
                        pretty_name: "Columns",
                        default: 40,
                    },
                    /** Whether or not a response to this question must be given in order to continue. */
                    required: {
                        type: jspsych.ParameterType.BOOL,
                        pretty_name: "Required",
                        default: false,
                    },
                    /** Name of the question in the trial data. If no name is given, the questions are named Q0, Q1, etc. */
                    name: {
                        type: jspsych.ParameterType.STRING,
                        pretty_name: "Question Name",
                        default: "",
                    },
                },
            },
            /** If true, the order of the questions in the 'questions' array will be randomized. */
            randomize_question_order: {
                type: jspsych.ParameterType.BOOL,
                pretty_name: "Randomize Question Order",
                default: false,
            },
            /** HTML-formatted string to display at top of the page above all of the questions. */
            promptTitle: {
                type: jspsych.ParameterType.HTML_STRING,
                pretty_name: "Preamble",
                default: null,
            },
            /** Label of the button to submit responses. */
            button_label: {
                type: jspsych.ParameterType.STRING,
                pretty_name: "Button label",
                default: "Continue",
            },
            /** Setting this to true will enable browser auto-complete or auto-fill for the form. */
            autocomplete: {
                type: jspsych.ParameterType.BOOL,
                pretty_name: "Allow autocomplete",
                default: false,
            },
        },
    };
    /**
     * **survey-text**
     *
     * jsPsych plugin for free text response survey questions
     *
     * @author Josh de Leeuw
     * @see {@link https://www.jspsych.org/plugins/jspsych-survey-text/ survey-text plugin documentation on jspsych.org}
     */
    class SurveyTextPlugin {
        constructor(jsPsych) {
            this.jsPsych = jsPsych;
        }

        trial(display_element, trial) {
  
            var html = "";
  
            if (trial.practice == 'practice') {
                html += '<div class="practice"> ' + "Question: " + (trial.trialNum + 1) + " / " + trial.numTrials + '</div>';
              } else if (trial.practice != 'practice') {
                html += '<div class="trialNum x"> ' + "Question: " + (trial.trialNum + 1) + " / " + trial.numTrials + '</div>';
              }
                
            html += '<div class="container">'

            // show preamble text
            if (trial.promptTitle !== null) {
                html +=
                    '<div id="jspsych-survey-text-preamble" class="promptTitle" style="text-align: center">' +
                        trial.promptTitle +
                        "</div>";
            }

            if (trial.description !== null) {
                html +=
                    '<div id="jspsych-survey-text-preamble" class="jspsych-survey-text-preamble" style="margin-bottom: 70px;">' +
                        trial.description +
                        "</div>";
            }

            html +=
            '<div id="jspsych-survey-text-preamble" class="jspsych-survey-text-preamble preamble" style="text-align: center">' +
                'After you click the button below, remember to carefully inspect <i>each</i> data visualization by hovering your cursor over each one. You will not be able to select your answer until you first have changed all the data visualizations to green. Then click the data visualization that would best help someone answer the presented question.' +
                "</div>";

                       
            html +='<button id="show_gallery" class="jspsych-btn jspsych-survey-text">Ready to see question and graphs</button>'

            html += '<div id="gallery_container">'
            html +=
            '<div id="prompt" class="jspsych-survey-text-preamble" style="text-align: center">' +
                '<b>' + trial.prompt + '</b>' +
                "</div>";
  
            // insert data visualization image (PNG)
            html += '<div class="row">'
            html += '<div id="imageGallery">'
            html += '</div>' // close data visualization
            html += '</div>' // close gallery-container
  
            html += '</div>' // close container
  
            setTimeout(() => {
            display_element.innerHTML = html;

            var startTime = performance.now();

            var startTime_show_gallery;

            display_element.querySelector("#show_gallery").addEventListener("click", function() {
                startTime_show_gallery = performance.now();
                $("#gallery_container").show()
                $("#prompt").show()
                $("#show_gallery").hide()
            });

            // grab filenames
            let graphList = trial.filenameArray;

            // randomize presentation of graphs
            let graphList_shuff = graphList
                .map(value => ({ value, sort: Math.random() }))
                .sort((a, b) => a.sort - b.sort)
                .map(({ value }) => value)
   
            // add nav paths for each graphs
            graphList_shuff.forEach((element, index) => {
            graphList_shuff[index] = 'images/' + element;
            });

            let $buttons = $('<div id="imageGallery" class="row">');

            // track hovered over imaged
            let tracker = [];

            // set mouse intentionality
            // https://stackoverflow.com/questions/15237641/how-to-use-hoverintent-plugin
            const customOptions = () => {
                sensitivity: 10;
                interval: 500;
                timeout: 1000;
            }

            // for every data visualization, add functionality for clicking
            graphList_shuff.map(function (graph) {
              let $button = $("<div></div>")
                .addClass("buttons")
                .attr("id", "button_" + graph)
                .html( "<img src='" + graph + "' class='graph_images'></img>")
                .css("border", "10px solid #CECECE")
                .css("margin", "10px")
                .hoverIntent(function whatToDoWhenHover() {
                    $(this).hasClass('tracker');
                    $(this).addClass('hovered_on');
                    $(this).css("border", "10px solid #529A84")   
                }, function whatToDoWhenOut () {
                    $(this).css("border", "10px solid #529A84")   
                    $(this).hasClass('hovered_on');        
                    $(this).hasClass('tracker');
                }, customOptions)
                .on("click", function () {
                
                tracker = []
                let hovered = document.querySelectorAll('.hovered_on');
                console.log('hovered_on', hovered);

                if (hovered.length == 0) {
                    return false
                } else if (hovered.length == 8) {

                // measure response time
                var endTime = performance.now();
                var response_time = Math.round(endTime - startTime_show_gallery);

        // save data
        if (trial.practice == 'practice') {
            var trialdata = {
                gameID: trial.gameID,
                dbname: trial.dbname,
                colname: trial.colname,
                iterationName: trial.iterationName,   
                version: trial.version,
                recruitmentPlatform: trial.recruitmentPlatform,
                eventType: 'practice',    
                survey: 'not_survey',    
                startTime: startTime,
                startTime_show_gallery: startTime_show_gallery,
                endTime: endTime, 
                rt: response_time,
                response: graph,
                corrFilename: trial.corrFilename,
                taskCategory: trial.taskCategory, 
                questionType: trial.questionType,
                graphType: trial.graphType,
                prompt: trial.prompt,
                promptTitle: trial.promptTitle,
                dataset: trial.dataset,
                trialNum: trial.trialNum,
                questionCategory: trial.questionCategory,
                x1_facetF: trial.x1_facetF,
                x1_facetT: trial.x1_facetT,
                x2_facetF: trial.x2_facetF,
                x2_facetT: trial.x2_facetT,
            };   
            } else if (trial.practice != 'practice') {
                var trialdata = {
                    gameID: trial.gameID,
                    dbname: trial.dbname,
                    colname: trial.colname,
                    iterationName: trial.iterationName,   
                    version: trial.version,
                    recruitmentPlatform: trial.recruitmentPlatform,
                    eventType: 'test',    
                    survey: 'not_survey',    
                    startTime: startTime,
                    startTime_show_gallery: startTime_show_gallery,
                    endTime: endTime, 
                    rt: response_time,
                    response: graph,
                    corrFilename: trial.corrFilename,
                    taskCategory: trial.taskCategory, 
                    questionType: trial.questionType,
                    graphType: trial.graphType,
                    prompt: trial.prompt,
                    promptTitle: trial.promptTitle,
                    dataset: trial.dataset,
                    trialNum: trial.trialNum,
                    questionCategory: trial.questionCategory,
                    x1_facetF: trial.x1_facetF,
                    x1_facetT: trial.x1_facetT,
                    x2_facetF: trial.x2_facetF,
                    x2_facetT: trial.x2_facetT,
                };
            }
                    // send data to server
                    console.log('currentData', trialdata);
                    socket.emit('currentData', trialdata);

                    // reset hovered on list
                    tracker = [];

                    display_element.innerHTML = "";

                    // next trial
                    jsPsych.finishTrial(trialdata); // @HH: not sure why this.jsPsych needed to be removed
                    }
                })

              $buttons.append($button);
            }); // close mapping function
            $("#imageGallery").append($buttons);
        }, 1000)
        } // close trial(display_element, trial)
        
    } // close class SurveyTextPlugin
    

    SurveyTextPlugin.info = info;
  
    return SurveyTextPlugin;
  
  })(jsPsychModule);
  