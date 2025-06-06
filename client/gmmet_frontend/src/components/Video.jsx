
import { useEffect, useRef } from "react"
import '../App.css'


export const Video = ({stream, userName}) => {
    const videoRef = useRef()

    useEffect(() => {
        if (videoRef && videoRef.current){
            videoRef.current.srcObject = stream
        }
    }, [videoRef, stream])
    return (<div>
        <div
    style={{
        position: "relative",
        borderRadius: 10,
        overflow: "hidden",
    }}
>
    <video
        style={{borderRadius:10}} muted ref={videoRef} width="100%" autoPlay={true} playsInline={true}
    ></video>
    <div
        style={{
            position: "absolute",
            bottom: 8,
            left: 8,
            backgroundColor: "rgba(0, 0, 0, 0.6)",
            color: "white",
            padding: "4px 8px",
            borderRadius: 6,
            fontSize: "0.875rem",
            fontWeight: 500,
        }}
    >
        {userName}
    </div>
</div>

    </div>)
}