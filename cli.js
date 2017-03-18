const EventEmitter = require('events').EventEmitter;
const util = require('util');
const { TwitterAddons } = require('./TwitterAddons/app.js');
const Weather = require('./WeatherAddons/Weather.js');

const RL = require('./ReadLineInterface.js');
const requestPromise = require('request-promise');
const fetch = requestPromise.defaults({jar: true});

const fetcher = (options) => {
    return fetch(options);
};


const memoryForProperty = 10;

let isStarted = false;
let isStopped = true;

const receiveQuetion = (questionMessage) => {
    return new Promise((resolve, reject)=>{
        RL.question(questionMessage, (answer) => {
            resolve(answer);
        })
    });
};

const sendQuestion = (questionMessage) => {
    return new Promise((resolve, reject) => {
        resolve(questionMessage);
    });
};

const commandTwit = () => {
    return receiveQuetion('Your message? ')
        .then(result => {
            if (result !== '') {
                const twitterObject = new TwitterAddons();

                twitterObject.tweetedTweet(result);
            }
        })
};

const commandTranslate = (sourceLang, targetLang) => {
    return receiveQuetion('Your word? ')
        .then(sourceText => {
            if (sourceText !== '') {
              const urlValue = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sourceLang}&tl=${targetLang}&dt=t&q=${sourceText}&cnt=1`;

              fetcher(urlValue)
                  .then(source => {
                    console.log('source Text Rus:', source);
                      const translatedText = /\[\[\[\"\W+\"\,/g.exec(source);
                      console.log('Text Rus:', translatedText);
                      const clearTranslatedText = translatedText[0].split("[").join("").split("\"").join("").split(",").join("");

                      console.log('Translate to : ', clearTranslatedText);
                  });
            }
        })
};

const whichLanguageTranslate = () => {
  return receiveQuetion('what language to translate? ')
    .then(sourceText => {
      switch (sourceText) {
        case 'en-ru': {
          return commandTranslate('en', 'ru');
        }

        default: {
          reject('HaveProblem');
        }

      }
    })
};

class CLI extends EventEmitter {
    constructor() {
        super();
    }

    commandUser () {
        RL.on("line", (cmd) => {
            this.sendQuestionToBrain(cmd);
        });
    }

    sendQuestionToBrain (cmd) {
        this.brainWork(cmd)
            .then(result => result)
            .catch(error => console.error(error));
    }

    brainWork (cmd) {
        const weather = new Weather(receiveQuetion);

        return new Promise((resolve, reject) => {
            switch (cmd) {
                case 'ping': {
                    return resolve(console.log("Pongue"));
                }
                case 'destroy': {
                    return resolve(process.exit(0));
                }
                case 'twit': {
                    return commandTwit();
                }
                case 'weather': {
                    return weather.commandCurrentWeather();
                }
                case 'forecast': {
                    return weather.commandForecastWeather();
                }
                case 'translate': {
                    return whichLanguageTranslate();
                }
                default: {
                    return reject('I don\'t understand you command... Please try again. ');
                }
            }
        });

    }

    startWork () {
        this.commandUser();
    }

}

module.exports = CLI;
