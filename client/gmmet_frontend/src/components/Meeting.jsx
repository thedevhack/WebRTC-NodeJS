
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import socketIO  from 'socket.io-client'

let pc = new RTCPeerConnection({
        iceServers:{
            "urls":"stun:stun.1.google.com:19302"
        }
    })

export default function Meeting(){
    const params = useParams()
    const roomId = params.roomId

    const [meetingJoined, setMeetingJoined] = useState()
    const [socket, setSocket] = useState()
    const [localStream, setLocalStream] = useState()
    const [remoteStream, setRemoteStream] = useState()

    useEffect(() => {
        const s = new socketIO.connect("http://localhost:5173")
        s.on("connect", () => {
            setSocket(s)
            s.emit("join", {
                roomId
            })

            window.navigator.mediaDevices.getUserMedia(
                {audio:true, video:true}
            ).then(async (stream) => {
                setLocalStream(stream)
            })

            // receiving sdp
            s.on("localFescription", async ({description}) => {
                pc.setRemoteDescription(description)

                pc.ontrack = (e) => {setRemoteStream(e.track)}

                s.on('iceCandiate', ({candidate}) => {
                    pc.addIceCandidate(candidate)
                })

                pc.onicecandidate = ({candidate}) => {
                    s.emit("iceCandidateReply", {candidate})
                }

                await pc.setLocalDescription(await pc.createAnswer())

                s.emit("remoteDescription", {description:pc.localDescription})

            })

            s.on("remoteDescription", async ({description}) => {
                pc.setRemoteDescription(description)
                pc.ontrack = (e) => {
                    setRemoteStream(e.track)
                }

                s.on("iceCandidate", ({candidate}) => {
                    pc.addIceCandidate(candidate)
                })

                pc.onicecandidate = (candidate) => {
                    s.emit("iceCandidateReply", {candidate})
                }
            })


        })

    }, [])

    if (!socket){
        <div>Loading...Please Wait...</div>
    }

}
