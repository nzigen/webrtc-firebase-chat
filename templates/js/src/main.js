var servers = null;
var pc1 = new RTCPeerConnection(servers);
var pc2 = new RTCPeerConnection(servers);

navigator.getUserMedia({video: true}, function(stream) {
  // Adding a local stream won't trigger the onaddstream callback,
  // so call it manually.
  var video = document.querySelector('#local-video');
  video.srcObject = stream;
  console.log(stream);
  pc1.addStream(stream);

  pc2.onaddstream = function (obj) {
    var video = document.querySelector('#remote-video');
    video.srcObject = obj.stream;
    console.log("pc2 onaddstream", obj);
  };

  pc1.onicecandidate = function(e) {
    onIceCandidate(pc1, e);
  };
  pc2.onicecandidate = function(e) {
    onIceCandidate(pc2, e);
  };

  pc1.createOffer(function (offer) {
    console.log("pc1 createOffer", offer);
    pc1.setLocalDescription(offer, function () {
      // send the offer to a server to be forwarded to the friend you're calling.
      console.log("pc1 setLocalDescription", offer);
    }, console.error);

    pc2.setRemoteDescription(offer, function() {

    }, console.error);

    pc2.createAnswer(function(offer) {
      pc2.setLocalDescription(offer, function () {
        // send the offer to a server to be forwarded to the friend you're calling.
        console.log("pc2 setLocalDescription", offer);
      }, console.error);

      pc1.setRemoteDescription(offer, function() {

      }, console.error);
    }, console.error);
  }, console.error);
}, console.error);

function onIceCandidate(pc, event) {
  if (event.candidate) {
    addCandidate(event.candidate);
    console.log('onIceCandidate', event.candidate);

    // getOtherPc(pc).addIceCandidate(
    //   new RTCIceCandidate(event.candidate)
    // ).then(
    //   function() {
    //
    //   },
    //   function(err) {
    //   }
    // );
  }
}

function addCandidate(candidate) {
  var user = firebase.auth().currentUser;
  var database = firebase.database();
  console.log(database.ref('candidates').child(user.uid));
  database.ref('candidates').child(user.uid).push(JSON.parse(JSON.stringify(candidate)));
}

firebase.auth().onAuthStateChanged(function(user) {
  if (user) {
    var database = firebase.database();
    database.ref('user').set({
      username: user.uid
    });
    console.log('onAuthStateChanged done', user);
  } else {
    firebase.auth().signInAnonymously().catch(function(error) {
      var errorCode = error.code;
      var errorMessage = error.message;
      console.log(errorCode, errorMessage);
    });
  }
});

document.querySelector('#room-name-form').addEventListener('submit', function (e) {
  e.preventDefault();
  e.stopPropagation();
  var roomNameField = document.querySelector('#room-name-field');
  var roomName = roomNameField.value.trim();
  if (roomName.length) {
    document.querySelector('#room-name-page').classList.remove("active");
    document.querySelector('#chat-page').classList.add("active");
  }
});