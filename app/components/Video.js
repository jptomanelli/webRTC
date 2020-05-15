import { useEffect, useRef } from 'react';
import defaultStyle from './Video.module.css';

function Video({ className, style, stream }) {

  const videoRef = useRef();

  useEffect(() => {
    if (videoRef.current && stream) {
      console.log(stream);
      videoRef.current.srcObject = stream
    }
  }, [videoRef, stream]);

  return (
    <video
      className={`${defaultStyle.video} ${className || ''}`}
      style={style}
      ref={videoRef}
      autoPlay
      playsInline
      controls={false}
    ></video>
  );

}

export default Video;