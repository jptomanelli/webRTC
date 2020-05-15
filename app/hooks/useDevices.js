import { useState, useEffect } from 'react';

function useDevices() {

  const [stream, setStream] = useState(null);
  const [streamStatus, setStreamStatus] = useState("disconnected");

  const startStream = () => {

    navigator.mediaDevices.getUserMedia({
      'audio': { 'echoCancellation': true },
      'video': {
        cursor: 'always' | 'motion' | 'never',
        displaySurface: 'application' | 'browser' | 'monitor' | 'window',
        'width': { 'max': window.innerWidth },
        'height': { 'max': window.innerHeight }
      }
    })
      .then(stream => {
        setStream(stream);
        setStreamStatus("connected");
      })
      .catch(err => {
        console.log(err);
        setStreamStatus("disconnected");
      });
  };

  const endStream = () => {
    setStreamStatus("disconnected");
    stream.getTracks().forEach(function(track) {
      track.stop();
    });
    setStream(null);
  }

  return {
    stream,
    startStream,
    endStream,
    streamStatus
  };

}

export default useDevices;