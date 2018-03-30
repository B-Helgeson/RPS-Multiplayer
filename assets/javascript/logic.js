$(document).ready(function(){
// Initialize Firebase
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

// dbroot
// dbchat


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

      // Retrieve the users name from local storage if present and adds to chat box. 
        userName = localStorage.getItem('username');
      if (userName != "undefined" || userName != "null") {
          $("#disabledInput").val(localStorage.getItem("username"))
      } else {
          $("#disabledInput").val("Login to chat")
      }

//----------------------------------------------------------------------------------
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






// Define Base Game Logic around Player Guesses




//Log Player Guesses 




// Define chatbox functionality

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

dataRef.ref("/chat").on('child_added', function(snapshot) {
  var message = snapshot.val();
  displayChatMessage(message.date, message.name, message.text);
});

function displayChatMessage(date, name, text) {
  $('<div/>').text(text).prepend($('<em/>').text('['+ date + '] ' + name +': ')).appendTo($('#messagesDiv'));
  $('#messagesDiv')[0].scrollTop = $('#messagesDiv')[0].scrollHeight;
};






// Basic Rock Paper Scissors LOGIC below for reference: 

//   var computerChoices = ["r", "p", "s"];

//   var wins = 0;
//   var losses = 0;
//   var ties = 0;

//   document.onkeyup = function(event) {

//     var userGuess = event.key;

//     var computerGuess = computerChoices[Math.floor(Math.random() * computerChoices.length)];

//     if ((userGuess === "r") || (userGuess === "p") || (userGuess === "s")) {
//       if ((userGuess === "r") && (computerGuess === "s")) {
//         wins++;
//      } else if ((userGuess === "r") && (computerGuess === "p")) {
//         losses++;
//       } else if ((userGuess === "s") && (computerGuess === "r")) {
//         losses++;
//       } else if ((userGuess === "s") && (computerGuess === "p")) {
//         wins++;
//       } else if ((userGuess === "p") && (computerGuess === "r")) {
//         wins++;
//       } else if ((userGuess === "p") && (computerGuess === "s")) {
//         losses++;
//       } else if (userGuess === computerGuess) {
//         ties++;
//       }

//       var html =
//         "<p>You chose: " + userGuess + "</p>" +
//         "<p>The computer chose: " + computerGuess + "</p>" +
//         "<p>wins: " + wins + "</p>" +
//         "<p>losses: " + losses + "</p>" +
//         "<p>ties: " + ties + "</p>";

//       document.querySelector("#game").innerHTML = html;
//     }
//   };



});