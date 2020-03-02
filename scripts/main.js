// SIAF, to avoid polluting the global scope
(function(){
    // MODELS
    /**
     * Models a question answer pair
     *
     * @member {String} question The question to be asked
     * @member {String} answer The answer to check against
     */
    class QuestionAnswer {
        /**
         * QuestionAnswer constructor
         * @param {String} question The question to be asked
         * @param {String} answer   The answer to check against
         */
        constructor(question, answer){
            this.question = question;
            this.answer = answer;
        }
    }

    /**
     * A list of QuestionAnswer objects
     * @extends Array
     */
    class QuestionsList extends Array {
        /**
         * QuestionList constructor
         * @param {Rest} args Optional: a list of two value arrays where the first value represents a question and the second value represents an answer
         */
        constructor(...args){
            // 0 Spread the built in arguments object into an array, for conveniently working with array methods
            let questionAnswers = args
                // 1 Filter out any non array arguments
                .filter(Array.isArray)
                // 2 Map each argument into a new QuestionAnswer by spreading the array pair into constructor arguments
                .map(argument => new QuestionAnswer(...argument));

            // Apply super class prototype on current object by spreading out the questionAnswers array
            super(...questionAnswers);
        }
    }

    // VIEW
    /**
     * A class to handle all view operations and abstract dom manipulation
     *
     * @member {HTMLElement} app The element to contain the app's views
     */
    class QuizzardsView {
        /**
         * view constructor
         * @param {String} containerSelector A css selector for a container to initialize the app in.
         */
        constructor(containerSelector){
            this.app = document.querySelector(containerSelector);
        }

        /**
         * Replaces a screen in the app container
         * @param  {String} templateString A string to replace the app's inner html with
         */
        printTemplate(templateString){
            this.app.innerHTML = templateString;
        }

        /**
         * Prints the first page template
         * @param  {Number} amount The total number of quiestions to display
         */
        printFirstPage(amount){
            this.printTemplate(`
            <h1 class="display-1 text-center">Quizzards</h1>
            <p class="lead">Do you know the answers to those ${amount} questions?</p>
            <div class="button-row text-center">
              <button class="btn btn-success btn-lg" id="play">Play!</button>
            </div>
          `);
        }

        /**
         * Prints a question screen
         * @param  {String} question The question to print out
         */
        printQuestion(question){
            this.printTemplate(`
            <p class="display-4"><span class="text-muted">Q: </span>${question}</p>
            <form class="mt-4" id="answer-form">
              <div class="form-row">
                <div class="col">
                    <input type="text" class="form-control" name="answer" id="answer" placeholder="Your answer goes here..." required />
                </div>
                <button type="submit" class="btn btn-primary" id="check-answer">Answer</button>
              </div>
            </form>
          `);
        }

        /**
         * Prinst a question's result
         * @param  {String} result The result to display to the user
         */
        printResult(result){
            this.printTemplate(`
            <p class="display-4">${result}</p>
            <div class="button-row text-center">
              <button class="btn btn-success btn-lg" id="next">Next Question</button>
            </div>
          `);
        }

        /**
         * Prints the final score
         * @param  {Number} score The final score to print out
         */
        printScore(score){
            this.printTemplate(`
              <p class="display-4">Pffft! I guess your final score is ${score}, if you even care about those things.</p>
              <div class="button-row text-center">
                <button class="btn btn-success btn-lg" id="play">Play Again</button>
              </div>
            `);
        }

        /**
         * delegates an event listener from the app root to a selected element
         * @param  {String}   eventName      The event name to add a listener to
         * @param  {String}   targetSelector The target selector to check for
         * @param  {Function} callback       A function to call if the target of the event matches the target selector
         */
        delegateListener(eventName, targetSelector, callback){
            this.app.addEventListener(eventName, event => {
                event.preventDefault();
                event.stopPropagation();
                let targetsList = [...this.app.querySelectorAll(targetSelector)];

                if(targetsList.includes(event.target)){
                    callback(event);
                }
            });
        }
    }

    // CONTROLLER
    /**
     * A class to handle our application logic and bring together our model and view
     * @member {QuizzardsView} view      An instance of the view class
     * @member {QuestionsList} questions An instance of a questions list
     * @member {Object}        state     An object to contain the current state of the app (score, current question)
     */
    class QuizzardsApp {

        /**
         * QuizzardsApp constructor
         * @param {QuizzardsView} view  An instance of our view class
         * @param {QuestionsList} model An instance of a questions list
         */
        constructor(view, model){
            this.view = view;
            this.questions = model;
            this.state = {
                current: 0,
                score: 0
            };
        }

        /**
         * Initializes the quiz application
         */
        init() {
            // Prints the first page of the app wuth the total mount of questions
            this.view.printFirstPage(this.questions.length);

            // Add all the necessary event listener and ties them with the app logic
            this.view.delegateListener('click', '#play', () => this.startGame());
            this.view.delegateListener('click', '#check-answer', event => this.checkAnswer(event));
            this.view.delegateListener('click', '#next', () => this.nextQuestion());
        }

        /**
         * Starts the game by reseting the state
         */
        startGame(){
            this.state.current = 0;
            this.state.score = 0;

            // Prints a question page with
            this.view.printQuestion(this.questions[this.state.current].question);
        }

        /**
         * Checks the current users answer against the correct answer
         * @param  {Event} event The event which called the function
         */
        checkAnswer(event) {
            let questions = this.questions;
            let current = this.state.current;
            let score = this.state.score;

            // Get the current answer from the app element
            let userAnswer = event.currentTarget.querySelector('#answer').value.trim();

            if (current >= questions.length - 1){
                this.view.printScore(score);
            } else if(userAnswer.toLowerCase() === questions[current].answer.toLowerCase()){
                this.state.score++;
                this.view.printResult('Correct! You might not be as dumb as I thought you were.');
//             } else if (userAnswer.value.length == 0){
//                 alert('This field is requierd, try again!');
            } else (userAnswer.value.length >= 1) {
                this.view.printResult('Wrong human, try again!');
            }
        }

        /**
         * Increases the question count by one and prints the next question
         */
        nextQuestion(){
            this.state.current++;
            this.view.printQuestion(this.questions[this.state.current].question);
        }
    }

    /**
     * The list of questions to ask
     * @type {QuestionsList}
     */
    const questions = new QuestionsList(
        ['What is the capital of Syria?', 'Damascus'],
        ['Can fish fly?', 'yes'],
        ['Can chickens swim?', 'no'],
        ['Which city is the biggest in Germany?', 'Berlin'],
        ['Is Pablo Escobar still alive?', 'No'],
        ['Are JavaScript and Java the same programming language?', 'No']
    );

    /**
     * The view driver instance
     * @type {QuizzardsView}
     */
    const view = new QuizzardsView('#app');

    /**
     * The quizzards app
     * @type {QuizzardsApp}
     */
    const app = new QuizzardsApp(view, questions);

    // Start the app
    app.init();
})();
