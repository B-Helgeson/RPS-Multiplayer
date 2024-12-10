$(document).ready(function () {
    // Firebase Initialization
    const config = {
      apiKey: "AIzaSyAjMR0unuqCMbb8PZtQFNTiPBeolDLV6ao",
      authDomain: "rps-lizardspock.firebaseapp.com",
      databaseURL: "https://rps-lizardspock.firebaseio.com",
      projectId: "rps-lizardspock",
      storageBucket: "rps-lizardspock.appspot.com",
      messagingSenderId: "904612609218",
    };
    firebase.initializeApp(config);
  
    const dataRef = firebase.database();
  
    // Game Variables
    let currentPlayer = null;
    let playerNum = null;
    const players = { 1: null, 2: null };
    const choices = ["Rock", "Paper", "Scissors", "Lizard", "Spock"];
  
    // Helper Function: Get Current Timestamp
    function getDate() {
      return new Date().toISOString();
    }
  
    // Update Players Online
    const connectionsRef = dataRef.ref("/connections");
    const connectedRef = dataRef.ref(".info/connected");
  
    connectedRef.on("value", function (snap) {
      if (snap.val()) {
        const con = connectionsRef.push(true);
        con.onDisconnect().remove();
      }
    });
  
    connectionsRef.on("value", function (snap) {
      $("#connected-players").text(snap.numChildren());
    });
  
    // Player Login
    $("#add-user").on("click", function (event) {
      event.preventDefault();
  
      if (!players[1]) {
        playerNum = 1;
        currentPlayer = { name: $("#name-input").val().trim(), pick: "", wins: 0, losses: 0 };
        players[1] = currentPlayer;
      } else if (!players[2]) {
        playerNum = 2;
        currentPlayer = { name: $("#name-input").val().trim(), pick: "", wins: 0, losses: 0 };
        players[2] = currentPlayer;
      } else {
        alert("Game is full! Please wait for a player to leave.");
        return;
      }
  
      $("#name-input").val("");
      $("#disabledInput").val(currentPlayer.name);
  
      // Update Player in Firebase
      dataRef.ref(`/players/${playerNum}`).set(currentPlayer);
      dataRef.ref(`/players/${playerNum}`).onDisconnect().remove();
  
      $("#infoBox").val("Pick an option to begin!");
    });
  
    // Listen for Player Updates
    dataRef.ref("/players").on("value", function (snapshot) {
      const playersData = snapshot.val();
      if (playersData) {
        players[1] = playersData[1] || null;
        players[2] = playersData[2] || null;
        updateUI();
        checkGameLogic();
      }
    });
  
    function updateUI() {
      if (players[1]) {
        $("#player1-name").text(players[1].name || "Waiting for Player 1...");
        $("#winCount").text(players[1].wins || 0);
        $("#lossCount").text(players[1].losses || 0);
      }
  
      if (players[2]) {
        $("#player2-name").text(players[2].name || "Waiting for Player 2...");
      }
    }
  
    function updateInfoBox(playerNum, message) {
        if (playerNum === 1) {
          $("#player1-infoBox").val(message);
        } else if (playerNum === 2) {
          $("#player2-infoBox").val(message);
        }
      }
      
      // Handle Player's Choice
      $(".choice").on("click", function () {
        if (!currentPlayer || !playerNum) {
          alert("Please log in to play!");
          return;
        }
      
        if (currentPlayer.pick) {
          alert("You have already made your choice!");
          return;
        }
      
        currentPlayer.pick = $(this).attr("id");
        dataRef.ref(`/players/${playerNum}`).update({ pick: currentPlayer.pick });
      
        updateInfoBox(playerNum, `You selected ${currentPlayer.pick}`);
      });
      

      // Check Game Logic
      function checkGameLogic() {
        if (players[1] && players[2] && players[1].pick && players[2].pick) {
          const p1Choice = players[1].pick;
          const p2Choice = players[2].pick;
      
          let winnerMessage;
          if (p1Choice === p2Choice) {
            winnerMessage = "It's a tie!";
          } else if (
            (p1Choice === "Rock" && (p2Choice === "Scissors" || p2Choice === "Lizard")) ||
            (p1Choice === "Paper" && (p2Choice === "Rock" || p2Choice === "Spock")) ||
            (p1Choice === "Scissors" && (p2Choice === "Paper" || p2Choice === "Lizard")) ||
            (p1Choice === "Lizard" && (p2Choice === "Spock" || p2Choice === "Paper")) ||
            (p1Choice === "Spock" && (p2Choice === "Scissors" || p2Choice === "Rock"))
          ) {
            winnerMessage = `${players[1].name} wins!`;
            players[1].wins++;
            players[2].losses++;
          } else {
            winnerMessage = `${players[2].name} wins!`;
            players[2].wins++;
            players[1].losses++;
          }
      
          // Display result in each player's message box
          updateInfoBox(1, winnerMessage);
          updateInfoBox(2, winnerMessage);
      
          // Reset choices in both local variables and Firebase
          players[1].pick = "";
          players[2].pick = "";
          if (playerNum === 1) currentPlayer.pick = "";
          if (playerNum === 2) currentPlayer.pick = "";
      
          dataRef.ref("/players/1").update(players[1]);
          dataRef.ref("/players/2").update(players[2]);
        }
      }
      
  
    // Check Game Logic
    function checkGameLogic() {
        // Ensure both players exist and have made their selections
        if (players[1] && players[2] && players[1].pick && players[2].pick) {
          const p1Choice = players[1].pick;
          const p2Choice = players[2].pick;
      
          // Determine winner
          let winnerMessage;
          if (p1Choice === p2Choice) {
            winnerMessage = "It's a tie!";
          } else if (
            (p1Choice === "Rock" && (p2Choice === "Scissors" || p2Choice === "Lizard")) ||
            (p1Choice === "Paper" && (p2Choice === "Rock" || p2Choice === "Spock")) ||
            (p1Choice === "Scissors" && (p2Choice === "Paper" || p2Choice === "Lizard")) ||
            (p1Choice === "Lizard" && (p2Choice === "Spock" || p2Choice === "Paper")) ||
            (p1Choice === "Spock" && (p2Choice === "Scissors" || p2Choice === "Rock"))
          ) {
            winnerMessage = `${players[1].name} wins!`;
            players[1].wins++;
            players[2].losses++;
          } else {
            winnerMessage = `${players[2].name} wins!`;
            players[2].wins++;
            players[1].losses++;
          }
      
          // Display result
          $("#infoBox").val(winnerMessage);
      
          // Reset choices in both local variables and Firebase
          players[1].pick = "";
          players[2].pick = "";
          if (playerNum === 1) currentPlayer.pick = "";
          if (playerNum === 2) currentPlayer.pick = "";
      
          dataRef.ref("/players/1").update(players[1]);
          dataRef.ref("/players/2").update(players[2]);
        }
      }      
  
  // Listen for player updates
  dataRef.ref("/players").on("value", function (snapshot) {
    const playersData = snapshot.val();
    if (playersData) {
      players[1] = playersData[1] || null;
      players[2] = playersData[2] || null;
      updateUI();
      checkGameLogic(); // Trigger game logic after player update
    }
  });
  
  
    // Chat Functionality
    $("#messageInput").keypress(function (e) {
      if (e.keyCode === 13 && currentPlayer && currentPlayer.name) {
        const message = $("#messageInput").val();
        dataRef.ref("/chat").push({ name: currentPlayer.name, text: message, date: getDate() });
        $("#messageInput").val("");
      }
    });
  
    dataRef.ref("/chat").on("child_added", function (snapshot) {
      const message = snapshot.val();
      displayChatMessage(message.date, message.name, message.text);
    });
  
    function displayChatMessage(date, name, text) {
      $("<div/>")
        .text(text)
        .prepend($("<em/>").text(`[${date}] ${name}: `))
        .appendTo($("#chatDiv"));
  
      $("#chatDiv").scrollTop($("#chatDiv")[0].scrollHeight);
    }
  });
  
  //ResetButton
  $("#resetButton").on("click", function () {
    // Clear Firebase nodes
    dataRef.ref("/players").remove();
    dataRef.ref("/chat").remove();
  
    // Reset local variables
    players[1] = null;
    players[2] = null;
    currentPlayer = null;
    playerNum = null;
  
    // Reset UI elements for both players
    $("#player1-infoBox").val("Game reset! Log in to play again.");
    $("#player2-infoBox").val("Game reset! Log in to play again.");
    $("#chatDiv").empty();
    $("#winCount").text(0);
    $("#lossCount").text(0);
    $("#player1-name").text("Waiting for Player 1...");
    $("#player2-name").text("Waiting for Player 2...");
  });
  
  


  // Clear Old Data in FireBase
  function cleanupOldData() {
    const cutoffTime = Date.now() - 24 * 60 * 60 * 1000; // 24 hours ago
  
    // Clean old chat messages
    dataRef.ref("/chat").once("value", function (snapshot) {
      snapshot.forEach(function (childSnapshot) {
        const message = childSnapshot.val();
        if (new Date(message.date).getTime() < cutoffTime) {
          dataRef.ref(`/chat/${childSnapshot.key}`).remove();
        }
      });
    });
  }
  
  // Call cleanup on page load
  cleanupOldData();
  
