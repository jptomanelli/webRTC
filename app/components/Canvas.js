import { useState, useEffect, useRef } from 'react';

export default function Canvas({ localStream, remoteStream }) {

  const [ctx, setCtx] = useState(null);
  const canvas = useRef(null);

  useEffect(() => {
    if (canvas && canvas.current) {
      setCtx(canvas.current.getContext('2d'))
    }
  }, [canvas]);

  return (
    <canvas 
      width="100%"
      ref={canvas}
    />
  );

}