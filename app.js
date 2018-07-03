/*-----------------------------------------------------------------------------
A simple echo bot for the Microsoft Bot Framework. 
-----------------------------------------------------------------------------*/

var restify = require('restify');
var builder = require('botbuilder');
var botbuilder_azure = require("botbuilder-azure");

//13937d2d-ff25-4f9e-9138-ae439d5c64c3
//avnjgldKO177%-=PSFPK64?

process.env.MicrosoftAppId = "13937d2d-ff25-4f9e-9138-ae439d5c64c3";
process.env.MicrosoftAppPassword = "avnjgldKO177%-=PSFPK64?";
// Setup Restify Server
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
   console.log('%s listening to %s', server.name, server.url); 
});
  
// Create chat connector for communicating with the Bot Framework Service
var connector = new builder.ChatConnector({
    appId: process.env.MicrosoftAppId,
    appPassword: process.env.MicrosoftAppPassword,
    openIdMetadata: process.env.BotOpenIdMetadata
});

// Listen for messages from users 
server.post('/api/messages', connector.listen());

/*----------------------------------------------------------------------------------------
* Bot Storage: This is a great spot to register the private state storage for your bot. 
* We provide adapters for Azure Table, CosmosDb, SQL Azure, or you can implement your own!
* For samples and documentation, see: https://github.com/Microsoft/BotBuilder-Azure
* ---------------------------------------------------------------------------------------- */

var tableName = 'botdata';
var azureTableClient = new botbuilder_azure.AzureTableClient(tableName, process.env['AzureWebJobsStorage']);
var tableStorage = new botbuilder_azure.AzureBotStorage({ gzipData: false }, azureTableClient);

// Create your bot with a function to receive messages from the user
var bot = new builder.UniversalBot(connector);
//bot.set('storage', tableStorage);
bot.set('storage', new builder.MemoryBotStorage());

bot.on('conversationUpdate', function (message) {
    console.log(message.membersAdded[0].id);
    console.log(message.address.bot.id);
    if (message.membersAdded[0].id === message.address.bot.id) {
        var reply = new builder.Message()
                .address(message.address)
                .text("Hello, I'm FirstChatBot! How's your day going?");
        bot.send(reply);
    }
});

bot.dialog('/', [
    function (session, results, next) {
        var text = session.message.text.toLowerCase();
        //session.send("You typed: " + text);
        if(text.includes("hi") || text.includes("hello") || text.includes("hey")) {
            //builder.Prompts.text(session, "Hey! Looks like you are very happy today!");
            if(session.userData.profile)
                session.send(`Hello ${session.userData.profile.name}!!`);
            else 
                session.send("Hello !!");
            session.send("Looks like you are very happy today!");
            builder.Prompts.text(session, "Lets rate your happiness today (1-10) ??");
            //session.beginDialog('/happy');
        }
        else
        {
            //next();
        }
    },
    function(session, results) {
        //session.send('You said (results) ' + results.response);
        var score = parseFloat(results.response);
        if(score >= 8) {                    // happy
            session.beginDialog("/happy");
        } else if(score > 5) {             // stressed
            session.beginDialog("/stressed");
        }
        else {
            session.endDialog("Ok Bye for now!! Have a great rest of your day!!!");
        }
        // } else {                             // crisis
        //     session.beginDialog("/crisis");
        // }
    }
]);

bot.dialog("/happy", [
    function(session) {
        builder.Prompts.text(session, "That's awesome! What would make you even happier?");
    },
    function(session, results) {
        var resp = results.response.toLowerCase();
        if(resp.includes("bye") || resp.includes("brb")) {
            session.endDialog("Ok Bye for now!! Have a great rest of your day!!!");
        }
        else if(resp.includes("?")) {
            //builder.Prompts.text(session, "I know you are asking some question.");
            //builder.Prompts.text(session, "But I am not in a position to respond to it now.");
            session.send("I know you are asking some question.\nBut I am not in a position to respond to it now.");
            builder.Prompts.text(session, "May be next time :)");
        }
        else if(resp.includes("hmm")) {
            //builder.Prompts.text(session, "Anyway you must be busy right now!! Talk to you later.");
            session.send("Anyway you must be busy right now!! Talk to you later.");
            session.endDialog("Ok Bye for now!! Have a great rest of your day!!!");
        } 
        else {
            session.send("That is Awesome!! Keep up the good work! :)");
            session.send("Anyway you must be busy right now!! Talk to you later.");
            session.endDialog("Ok Bye for now!! Have a great day ahead!! :)");
        }
    }
]);

bot.dialog("/stressed", [
    function(session) {
        builder.Prompts.text(session, "Yes, I can understand it is a tough situation for you.");
        builder.Prompts.text(session, "But you take my words, this won't last long. I am sure you will overcome it very soon");
    },
    function(session, results) {
        var resp = results.response.toLowerCase();
        if(resp.includes("bye") || resp.includes("brb")) {
            session.endDialog("Ok Bye for now!! Have a great rest of your day!!!");
        }
        else if(resp.includes("thanks") || resp.includes("thank you") || resp.includes("thnx")) {
            builder.Prompts.text(session, "Hey! no need to say thanks");
        }
        else if(resp.includes("?")) {
            builder.Prompts.text(session, "I know you are asking some question.");
            builder.Prompts.text(session, "But I am not in a position to respond to it now.");
            builder.Prompts.text(session, "May be next time :)");
        }
        else {
            builder.Prompts.text(session, "Anyway you must be busy right now!! Talk to you later.\nPlease take very good care of yourself.");
            session.endDialog("Ok Bye for now!! Have a great rest of your day!!!");
        }
    }
]);