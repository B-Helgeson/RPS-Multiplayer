$(document).ready(function(){ // Opening JavaScript code with docuement ready function

// Initialize Firebase Setup
    var config = {
        apiKey: "AIzaSyAjMR0unuqCMbb8PZtQFNTiPBeolDLV6ao",
        authDomain: "rps-lizardspock.firebaseapp.com",
        databaseURL: "https://rps-lizardspock.firebaseio.com",
        projectId: "rps-lizardspock",
        storageBucket: "rps-lizardspock.appspot.com",
        messagingSenderId: "904612609218"
      };
      firebase.initializeApp(config);

// Define Variables
var dataRef = firebase.database();

// Add a user to firebase - 
   var name = "";
   var wins = 0;
   var losses = 0;

//Function to format date for game using native javascript
   function getDate(){
    var now = new Date();
    var dateString = now.toISOString();
    return dateString
    }


   // function to push new users to firebase
   $("#add-user").on("click", function(event) {
    event.preventDefault();
    name = $("#name-input").val().trim();
    dataRef.ref("/players").push({
        name: name,
        wins: wins,
        losses: losses,
        date: getDate()
        });
    localStorage.setItem("username", name); //also pushes name to local storage
    $("#disabledInput").val(localStorage.getItem("username")) //Pushes name to disabled input in chat box. 
    });


    // function to listen for new users added 
    dataRef.ref("/players").on("child_added", function(childSnapshot) {
        console.log(childSnapshot.val().name); //console log names
        }, function(errorObject) {
        console.log("Errors handled: " + errorObject.code); //console log errors
      });


//------------------------------------------------------------------------------------
// Use Presence to track active players
var connectionsRef = dataRef.ref("/connections");
var connectedRef = dataRef.ref(".info/connected");
    connectedRef.on("value", function(snap) {
        if (snap.val()) {
        var con = connectionsRef.push(true);
        con.onDisconnect().remove();
        }
    });

    connectionsRef.on("value", function(snap) {
    $("#connected-players").text(snap.numChildren());
    });



//----------------------------------------------------------------------------------------

// Define Base Game Logic around Player Guesses

  var computerChoices = ["r", "p", "s","l","k"];

  var wins = 0;
  var losses = 0;
  var ties = 0;

  document.onkeyup = function(event) {

    var playerGuess = event.key;

    var computerGuess = computerChoices[Math.floor(Math.random() * computerChoices.length)];

    if ((playerGuess === "r") || (playerGuess === "p") || (playerGuess === "s") || (playerGuess === "l") || (playerGuess === "k")) 
        { if (playerGuess === computerGuess) { // If guesses match each other, the players tie
            ties++; 
        } else if ((playerGuess === "s") && (computerGuess === "p")) { // Scissors cuts Paper
            wins++;
        } else if ((playerGuess === "p") && (computerGuess === "r")) { // Paper covers Rock
            wins++;
        } else if ((playerGuess === "r") && (computerGuess === "l")) { // Rock crushes Lizard
            wins++;
        } else if ((playerGuess === "l") && (computerGuess === "k")) { // Lizard poisons Spock
            wins++;
        } else if ((playerGuess === "k") && (computerGuess === "s")) { // Spock smashes Scissors
            wins++;
        } else if ((playerGuess === "s") && (computerGuess === "l")) { // Scissors decapitates Lizard
            wins++;
        } else if ((playerGuess === "l") && (computerGuess === "p")) { // Lizard eats Paper
            wins++;
        } else if ((playerGuess === "p") && (computerGuess === "k")) { // Paper disproves Spock
            wins++;
        } else if ((playerGuess === "k") && (computerGuess === "r")) { // Spock vaporizes Rock
            wins++;
        } else if ((playerGuess === "r") && (computerGuess === "s")) { // Rock crushes Scissors
            wins++;
        } else { // All other scenarios will result in a loss
            losses++ } 

      var html =
        "<p>You chose: " + playerGuess + "</p>" +
        "<p>The computer chose: " + playerGuess + "</p>" +
        "<p>wins: " + wins + "</p>" +
        "<p>losses: " + losses + "</p>" +
        "<p>ties: " + ties + "</p>";

      document.querySelector("#gameDiv").innerHTML = html;
    }
  };





//Log Player Guesses 
//






// Define chatbox functionality
//----------------------------------------------------------------------------------------------

// Retrieve the user's name from local storage if present and adds to chat box name field. 
      userName = localStorage.getItem('username');
      if (userName != "undefined" || userName != "null") {
          $("#disabledInput").val(localStorage.getItem("username"))
      } else {
          $("#disabledInput").val("Login to chat")
      }

//Store Message Inputs to FireBase (along with username)
$('#messageInput').keypress(function (e) {
  if (e.keyCode == 13) {
    var name = localStorage.getItem('username');
    var text = $('#messageInput').val();
    dataRef.ref("/chat").push({name: name, 
        text: text,
        date: getDate()
        });
    $('#messageInput').val('');
  }
});

//Listen for new chat messages and update the document
dataRef.ref("/chat").on('child_added', function(snapshot) {
  var message = snapshot.val();
  displayChatMessage(message.date, message.name, message.text);
});

function displayChatMessage(date, name, text) {
  $('<div/>').text(text).prepend($('<em/>').text('['+ date + '] ' + name +': ')).appendTo($('#messagesDiv'));
  $('#messagesDiv')[0].scrollTop = $('#messagesDiv')[0].scrollHeight;
};

//-----------------------------------------------------------------------------------------------------------

}); // End of all JavaScript Code