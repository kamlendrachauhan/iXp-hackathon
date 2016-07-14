/**
 * Created by i854911 on 7/13/16.
 */
var express = require('express');
var router = express.Router();

// Loading Wit module
var Wit = require('node-wit').Wit;
var log = require('node-wit').log;

const WIT_TOKEN = "J6XN5MMXRQXBDAQW7MF4F3ZCZDU2FQY6";

const firstEntityValue = (entities, entity) => {
    const val = entities && entities[entity] &&
            Array.isArray(entities[entity]) &&
            entities[entity].length > 0 &&
            entities[entity][0].value
        ;
    if (!val) {
        return null;
    }
    return typeof val === 'object' ? val.value : val;
};

// ----------------------------------------------------------------------------
// Wit.ai bot specific code

// This will contain all user sessions.
// Each session has an entry:
// sessionId -> {socket: socket, context: sessionState}
const sessions = {};

const findOrCreateSession = (socket) => {
    let sessionId;
    // Let's see if we already have a session for the user user_id
    Object.keys(sessions).forEach(k => {
        if (sessions[k].socket === socket) {
            // Yep, got it!
            sessionId = k;
        }
    });
    if (!sessionId) {
        // No session found for user user_id, let's create a new one
        sessionId = new Date().toISOString();
        sessions[sessionId] = {socket: socket, context: {}};
    }
    return sessionId;
};

const actions = {
    send(request, response) {
        const {sessionId, context, entities} = request;
        const {text, quickreplies} = response;
        return new Promise(function(resolve, reject) {
            console.log('sending...', JSON.stringify(response));
            sessions[sessionId].socket.emit("response", JSON.stringify(response));
            return resolve(response);
        });
    },

    getForecast({context, entities}) {
        return new Promise(function(resolve, reject) {
            var location = firstEntityValue(entities, 'location')
            if (location) {
                context.forecast = 'sunny in ' + location; // we should call a weather API here
                delete context.missingLocation;
            } else {
                context.missingLocation = true;
                delete context.forecast;
            }
            return resolve(context);
        });
    },
};

// Setting up our bot
const wit = new Wit({
    accessToken: WIT_TOKEN,
    actions,
    logger: new log.Logger(log.INFO)
});

exports.handleMessage = function (socket, data) {
    const sessionId = findOrCreateSession(socket);

    wit.runActions(sessionId,
        data,
        sessions[sessionId].context).then((context) => {
        console.log("Waiting for next messages");
        sessions[sessionId].context = context;
    });
}

/* GET users listing. */
router.post('/', function(req, res, next) {
    console.log("Request to Process Message");

    const sessionId = findOrCreateSession(req.body.user_id);

    wit.runActions(sessionId,
    req.body.text,
    sessions[sessionId].context).then((context) => {
        console.log("Waiting for next messages");
        sessions[req.body.user_id].context = context;
    });

    wit.converse(sessionId, req.body.text, sessions[sessionId].context).then((data) => {
        console.log(data);
        const request = {
            sessionId,
            context: clone(sessions[sessionId].context),
            text: message,
            entities: json.entities,
        };
        if(data.type == "action")   {
            actions[data.action](request).then((cxt) => {
                //res.send('respond with a resource');
            });
        }
    })
});

//module.exports = handleMessage;
