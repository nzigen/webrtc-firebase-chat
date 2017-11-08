var peerConfiguration = {
  'iceServers': [
    {
      'url': 'stun:stun.l.google.com:19302'
    }
  ]
};
var otherUids = [];
var sendingPeer = null;
var receivingPeer = null;

function setUpPeers(roomName) {
  sendingPeer = new RTCPeerConnection(peerConfiguration);
  receivingPeer = new RTCPeerConnection(peerConfiguration);
  navigator.getUserMedia({video: true, audio: false}, function(stream) {
    console.log('getUserMedia done', stream);
    var video = document.querySelector('#video-local');
    video.srcObject = stream;
    sendingPeer.addStream(stream);

    receivingPeer.onaddstream = function (object) {
      document.querySelector('#chat-page').classList.remove('disconnected');
      var video = document.querySelector('#video-remote');
      video.srcObject = object.stream;
      console.log("receivingPeer onaddstream", object);
    };

    sendingPeer.onicecandidate = function(e) {
      if (e.candidate) {
        console.log('onicecandidate sendingPeer', e.candidate);
        addCandidateToRoom(e.candidate, roomName, 'sending');
      }
    };
    receivingPeer.onicecandidate = function(e) {
      if (e.candidate) {
        console.log('onicecandidate receivingPeer', e.candidate);
        addCandidateToRoom(e.candidate, roomName, 'receiving');
      }
    };
    sendingPeer.oniceconnectionstatechange = function (e) {
      console.log('oniceconnectionstatechange', e);
    }
    receivingPeer.oniceconnectionstatechange = function (e) {
      if (receivingPeer.iceConnectionState === "failed" ||
          receivingPeer.iceConnectionState === "disconnected" ||
          receivingPeer.iceConnectionState === "closed") {
        if (otherUids.length) {
          otherUids = [];
          document.querySelector('#chat-page').classList.add('disconnected');
        }
      }
    }
  }, console.error);
}

function addCandidateToRoom(candidate, roomName, kind) {
  var user = firebase.auth().currentUser;
  var database = firebase.database();
  var roomRef = database.ref('rooms').child(roomName);
  roomRef.child(kind + '-candidates').child(user.uid).push(JSON.parse(JSON.stringify(candidate)));
}

function addOtherUidToRoom(uid, roomName) {
  if (otherUids.indexOf(uid) !== -1) {
    return;
  }
  otherUids.push(uid);
  var currentUser = firebase.auth().currentUser;
  var database = firebase.database();
  var roomRef = database.ref('rooms').child(roomName);
  roomRef.child('offers').child(uid).on('child_added', function (snapshot) {
    var key = snapshot.key;
    roomRef.child('offers').child(uid).child(key).remove();
    var values = snapshot.val();
    console.log('offer incoming', values);
    var offer = new RTCSessionDescription();
    offer.sdp = values.sdp;
    offer.type = values.type;
    receivingPeer.setRemoteDescription(offer, function() {}, console.error);

    receivingPeer.createAnswer(function(answer) {
      receivingPeer.setLocalDescription(answer, function () {}, console.error);
      roomRef.child('answers').child(currentUser.uid).push(answer.toJSON());
    }, console.error);
  });

  roomRef.child('answers').child(uid).on('child_added', function (snapshot) {
    var key = snapshot.key;
    roomRef.child('answers').child(uid).child(key).remove();
    var values = snapshot.val();
    console.log('answer incoming', values);
    var answer = new RTCSessionDescription();
    answer.sdp = values.sdp;
    answer.type = values.type;
    sendingPeer.setRemoteDescription(answer, function() {

    }, console.error);
  });

  roomRef.child('receiving-candidates').child(uid).on('value', function (snapshot) {
    snapshot.forEach(function (child) {
      var values = child.val();
      var candidate = new RTCIceCandidate(values);
      console.log('receiving-candidate incoming', candidate);
      sendingPeer.addIceCandidate(candidate).then(
        function() {

        }, function (err) {}
      );
    });
  });

  roomRef.child('sending-candidates').child(uid).on('value', function (snapshot) {
    snapshot.forEach(function (child) {
      var values = child.val();
      var candidate = new RTCIceCandidate(values);
      console.log('sending-candidate incoming', candidate);
      receivingPeer.addIceCandidate(candidate).then(
          function() {

          }, function (err) {}
      );
    });
  });

  sendingPeer.createOffer(function (offer) {
    console.log("peer createOffer", offer);
    sendingPeer.setLocalDescription(offer, function () {
      // send the offer to a server to be forwarded to the friend you're calling.
      console.log("peer setLocalDescription", offer);
    }, console.error);
    roomRef.child('offers').child(currentUser.uid).push(offer.toJSON());
  }, console.error);
}

function joinRoom(roomName) {
  firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
      console.log('onAuthStateChanged done', user);
      var database = firebase.database();
      var roomRef = database.ref('rooms').child(roomName);
      roomRef.child('users').child(user.uid).set(new Date().getTime());
      setUpPeers(roomName);
      roomRef.child('users').on('value', function (snapshot) {
        snapshot.forEach(function(child) {
          var uid = child.key;
          console.log('User ' + uid + ' joined to Room "' + roomName + '"');
          if (user.uid !== uid) {
            addOtherUidToRoom(uid, roomName);
          }
        });
      });

    } else {
      firebase.auth().signInAnonymously().catch(function(error) {
        var errorCode = error.code;
        var errorMessage = error.message;
        console.error(errorCode, errorMessage);
      });
    }
  });
}

document.querySelector('#room-name-form').addEventListener('submit', function (e) {
  e.preventDefault();
  e.stopPropagation();
  var roomNameField = document.querySelector('#room-name-field');
  var roomName = roomNameField.value.trim();
  if (roomName.length) {
    document.querySelector('#room-name-page').classList.remove("active");
    document.querySelector('#chat-page').classList.add("active");
    joinRoom(roomName);
  }
});
