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
  
  // Global Variables
  let currentPlayer = null;
  let playerNum = null;
  const players = { 1: null, 2: null };
  const choices = ["Rock", "Paper", "Scissors", "Lizard", "Spock"];
  
  // Helper Function: Get Current Timestamp
  function getDate() {
    return new Date().toISOString();
  }
  
  // Cleanup Old Data on Page Load
  function cleanupOldData() {
    const cutoffTime = Date.now() - 24 * 60 * 60 * 1000; // 24 hours ago
    dataRef.ref("/chat").once("value", function (snapshot) {
      snapshot.forEach(function (childSnapshot) {
        const message = childSnapshot.val();
        if (new Date(message.date).getTime() < cutoffTime) {
          dataRef.ref(`/chat/${childSnapshot.key}`).remove();
        }
      });
    });
  }
  cleanupOldData();
  
  // Initialize Presence Tracking
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
  
  // Update Player UI
  function updateUI() {
    if (players[1]) {
      $("#player1-name").text(players[1].name || "Waiting for Player 1...");
      $("#winCount").text(players[1].wins || 0);
      $("#lossCount").text(players[1].losses || 0);
    } else {
      $("#player1-name").text("Waiting for Player 1...");
      $("#winCount").text(0);
      $("#lossCount").text(0);
    }
  
    if (players[2]) {
      $("#player2-name").text(players[2].name || "Waiting for Player 2...");
    } else {
      $("#player2-name").text("Waiting for Player 2...");
    }
  }
  
  // Update Info Box for Each Player
  function updateInfoBox(playerNum, message) {
    if (playerNum === 1) {
      $("#player1-infoBox").val(message);
    } else if (playerNum === 2) {
      $("#player2-infoBox").val(message);
    }
  }
  
  // Handle Player Login
  $("#add-user").on("click", function (event) {
    event.preventDefault();
  
    const nameInput = $("#name-input").val().trim();
    if (!nameInput) {
      alert("Please enter a name.");
      return;
    }
  
    if (!players[1]) {
      playerNum = 1;
      currentPlayer = { name: nameInput, pick: "", wins: 0, losses: 0 };
      players[1] = currentPlayer;
    } else if (!players[2]) {
      playerNum = 2;
      currentPlayer = { name: nameInput, pick: "", wins: 0, losses: 0 };
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
  
    updateInfoBox(playerNum, "Pick an option to begin!");
  });
  
  // Handle Player Choice
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
  
      updateInfoBox(1, winnerMessage);
      updateInfoBox(2, winnerMessage);
  
      // Reset picks
      players[1].pick = "";
      players[2].pick = "";
      if (playerNum === 1) currentPlayer.pick = "";
      if (playerNum === 2) currentPlayer.pick = "";
  
      dataRef.ref("/players/1").update(players[1]);
      dataRef.ref("/players/2").update(players[2]);
    }
  }
  
  // Listen for Player Updates
  dataRef.ref("/players").on("value", function (snapshot) {
    const playersData = snapshot.val();
    players[1] = playersData ? playersData[1] || null : null;
    players[2] = playersData ? playersData[2] || null : null;
  
    updateUI();
    checkGameLogic();
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
  
  // Reset Button
  $("#resetButton").on("click", function () {
    dataRef.ref("/players").remove();
    dataRef.ref("/chat").remove();
  
    players[1] = null;
    players[2] = null;
    currentPlayer = null;
    playerNum = null;
  
    updateInfoBox(1, "Game reset! Log in to play again.");
    updateInfoBox(2, "Game reset! Log in to play again.");
    $("#chatDiv").empty();
    updateUI();
  });
  
