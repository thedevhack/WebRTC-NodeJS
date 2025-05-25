
import { Typography, Box, Container, Button, Grid } from "@mui/material"
import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { Video } from "./Video"
import socketIO  from 'socket.io-client'

let pc = new RTCPeerConnection({
    iceServers:[{
        "urls":"stun:stun.1.google.com:19302"
    },
],
})


export default function MeetingPage(){
    const [localVideo, setLocalVideo] = useState()

    const params = useParams()
    const roomId = params.roomId

    const [meetingJoined, setMeetingJoined] = useState(false)
    const [socket, setSocket] = useState(null)
    const [localStream, setLocalStream] = useState()
    const [remoteStream, setRemoteStream] = useState()


    useEffect(() => {

        const s = new socketIO.connect("http://localhost:3001")
        s.on("connect", () => {
            setSocket(s)
            s.emit("join", {
                roomId
            })

            window.navigator.mediaDevices.getUserMedia(
                {audio:true, video:true}
            ).then(async (stream) => {
                setLocalVideo(stream)
                setLocalStream(stream)
            })

            // receiving sdp
            s.on("localDescription", async ({description}) => {
                console.log("Already Recieved Local Description ->",description)
                pc.setRemoteDescription(description)
                console.log("1")

                // pc.ontrack = (e) => {setRemoteStream(new MediaStream([e.track]))}
                
                const remoteMediaStream = new MediaStream()
                setRemoteStream(remoteMediaStream)

                pc.ontrack = (event) => {
                    event.streams[0].getTracks().forEach((track) => {
                        remoteMediaStream.addTrack(track)
                    })
                }

                s.on('iceCandidate', ({candidate}) => {
                    pc.addIceCandidate(candidate)
                })
                pc.onicecandidate = ({candidate}) => {
                    s.emit("iceCandidateReply", {candidate})
                }
                await pc.setLocalDescription(await pc.createAnswer())
                s.emit("remoteDescription", ({description:pc.localDescription}))
            })

            s.on("remoteDescription", ({description}) => {
                console.log("Already Recieved Remote Description ->",description)
                pc.setRemoteDescription(description)

                const remoteMediaStream = new MediaStream()
                setRemoteStream(remoteMediaStream)

                pc.ontrack = (event) => {
                    event.streams[0].getTracks().forEach((track) => {
                        remoteMediaStream.addTrack(track)
                    })
                }

                s.on("iceCandidate", ({candidate}) => {
                    pc.addIceCandidate(candidate)
                })

                pc.onicecandidate = ({candidate}) => {
                    s.emit("iceCandidateReply", {candidate})
                }
            })
        })
    }, [])

    if (!socket){
        <Box sx={{
            minWidth:"100vw",
            minHeight:"100vh",
            display:"flex",
            justifyContent:"center",
            alignItems:"center",
            backgroundColor:"primary.main"
        }}><Typography sx={{color:"text.primary"}}>Loading...Please Wait...</Typography></Box>
    }
    
    if (!meetingJoined){
        return <Box sx={{
            minHeight:"100vh",
            minWidth:"100vw",
            display:"flex",
            justifyContent:"center",
            alignItems:"center",
            backgroundColor:"primary.main",
            }}>
            <Container sx={{
                width:"40vw",
                display:"flex",
                justifyContent:"center",
                alignItems:"center",
                flexDirection:"column",
                backgroundColor:"secondary.main",
                p:2
                }}>
                <Typography sx={{mb:2}} variant="h5">Check Settings</Typography>
                <Video stream={localVideo} />
                <Button sx={{mt:2}} variant="contained"
                onClick={async () => {
                    pc.onicecandidate = ({candidate}) => {
                        socket.emit("iceCandidate", {candidate})
                    }

                    localStream.getTracks().forEach((track) => {
                        pc.addTrack(track, localStream)
                    })


                    try{
                        await pc.setLocalDescription(await pc.createOffer())
                        socket.emit("localDescription", {description:pc.localDescription})
                    }catch (err){
                        console.log({msg:err?.message});
                        console.error(err)
                    }
                    setMeetingJoined(true)
                }}
                >JOIN</Button>
            </Container>
        </Box>
    }
    console.log(localStream, remoteStream, pc)
    return <Grid container spacing={2} alignContent={"center"} justifyContent={"center"}>
        <Grid item xs={12} md={6} lg={4}>
            <Video stream={localStream}></Video>
        </Grid>
        <Grid item xs={12} md={6} lg={4}>
            <Video stream={remoteStream}></Video>
        </Grid>
    </Grid>
}