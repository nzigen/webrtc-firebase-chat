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

function getOtherPc(pc) {
  return (pc === pc1) ? pc2 : pc1;
}

function onIceCandidate(pc, event) {
  if (event.candidate) {
    getOtherPc(pc).addIceCandidate(
      new RTCIceCandidate(event.candidate)
    ).then(
      function() {

      },
      function(err) {
      }
    );
  }
}
