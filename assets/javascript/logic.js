$(document).ready(function(){ // Opening JavaScript code with docuement ready function
//#region global config

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

// Define Database Variables
var dataRef = firebase.database();

// Global Variables For the Game
   var  playerName,
        marioLoggedIn = false,
        luigiLoggedIn = false,
        playerNum,
        currentPlayer,
        mario = {
            name: "",
            pick: "",
            wins: 0,
            losses: 0
            },
        luigi = {
            name: "",
            pick: "",
            wins: 0,
            losses: 0
            }

//Function to format date for game using native javascript
   function getDate(){
    var now = new Date();
    var dateString = now.toISOString();
    return dateString
    }

//-------------------------------------------------------------------------------------------
//#endregion

//#region login/logout/reset functions

   // function to push new users to firebase
   $("#add-user").on("click", function(event) {
    event.preventDefault();

        // Determine if current player will be assiged to "mario" or "luigi"
        if (!marioLoggedIn) {
            playerNumber = "1";
            currentPlayer = mario;
            marioLoggedIn = true;
        }
        else if (!luigiLoggedIn) {
            playerNumber = "2";
            currentPlayer = luigi;
            luigiLoggedIn = true;
        } // handle scenario if more than 2 players are online
        else {
            playerNumber = null;
            currentPlayer = null;
            alert("Too many are players online now, please try again later")
        }

        // Once player is assigned a role, send info to database
        if (playerNumber) {
            playerName = $("#name-input").val().trim();
            currentPlayer.name = playerName;
            $("#name-input").val("");
            $("#disabledInput").val(playerName);
            dataRef.ref("/players/" + playerNumber).set(currentPlayer);
            dataRef.ref("/players/" + playerNumber).onDisconnect().remove();
            }
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
//#endregion

//#region Game Play logic 

// when an optoin is picked, send it to the database
$(".icon").click(function () {
    currentPlayer.pick = this.id;
    dataRef.ref("/players/" + playerNumber).set(currentPlayer);
});

// Define Base Game Logic around Player Guesses 
function gameLogic(marioPick, luigiPick) {
    // If guesses match each other, the players tie
    if (marioPick == luigiPick) { ties++ } 
        // The following scenarios result in a win for player one
        else if ((marioPick == "Scissors") && (luigiPick == "Paper")) if (playerNumber == "1") { currentPlayer.wins++;} else {currentPlayer.losses++;}  // Scissors cuts Paper
        else if ((marioPick == "Paper") && (luigiPick == "Rock")) if (playerNumber == "1") { currentPlayer.wins++;} else {currentPlayer.losses++;}   // Paper covers Rock
        else if ((marioPick == "Rock") && (luigiPick == "Lizard")) if (playerNumber == "1") { currentPlayer.wins++;} else {currentPlayer.losses++;}   // Rock crushes Lizard
        else if ((marioPick == "Lizard") && (luigiPick == "Spock")) if (playerNumber == "1") { currentPlayer.wins++;} else {currentPlayer.losses++;}   // Lizard poisons Spock
        else if ((marioPick == "Spock") && (luigiPick == "Scissors")) if (playerNumber == "1") { currentPlayer.wins++;} else {currentPlayer.losses++;}  // Spock smashes Scissors
        else if ((marioPick == "Scissors") && (luigiPick == "Lizard")) if (playerNumber == "1") { currentPlayer.wins++;} else {currentPlayer.losses++;}   // Scissors decapitates Lizard
        else if ((marioPick == "Lizard") && (luigiPick == "Paper")) if (playerNumber == "1") { currentPlayer.wins++;} else {currentPlayer.losses++;}  // Lizard eats Paper
        else if ((marioPick == "Paper") && (luigiPick == "Spock")) if (playerNumber == "1") { currentPlayer.wins++;} else {currentPlayer.losses++;}   // Paper disproves Spock
        else if ((marioPick == "Spock") && (luigiPick == "Rock")) if (playerNumber == "1") { currentPlayer.wins++;} else {currentPlayer.losses++;}   // Spock vaporizes Rock
        else if ((marioPick == "Rock") && (luigiPick == "Scissors")) if (playerNumber == "1") { currentPlayer.wins++;} else {currentPlayer.losses++;}   // Rock crushes Scissors
        // All other scenarios will result in a loss for player one
        else { if (playerNumber == "1") { currentPlayer.losses++;} else {currentPlayer.wins++;}} 
  };




//Log Player Guesses 
//



//----------------------------------------------------------------------------------------------
//#endregion

//#region Chat Box Functionality

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
  $('<div/>').text(text).prepend($('<em/>').text('['+ date + '] ' + name +': ')).appendTo($('#chatDiv'));
  $('#chatDiv')[0].scrollTop = $('#chatDiv')[0].scrollHeight;
};

//-----------------------------------------------------------------------------------------------------------
//#endregion

}); // End of all JavaScript 