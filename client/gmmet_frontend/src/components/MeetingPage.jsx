
import { Typography, Box, Container, Button, Grid, Select, MenuItem } from "@mui/material"
import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { Video } from "./Video"
import socketIO  from 'socket.io-client'
import ControlBar from "./ControlBar"

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
    const [videoDevices, setVideoDevices] = useState([])
    const [audioDevices, setaudioDevices] = useState([])
    const [selectedvideoDeviceId, setselectedvideoDeviceId] = useState("")
    const [selectedaudioDeviceId, setselectedaudioDeviceId] = useState("")
    const [localVideoTrack, setlocalVideoTrack] = useState(null);
    const [localAudioTrack, setlocalAudioTrack] = useState(null);
    const remoteMediaStream = null


    const userDisconnectProcess = () => {
        console.log("Bye Bye Everyone")
        if (localStream){
            localStream.getTracks().forEach(track => {
                track.stop()
            })
        }

        if (pc && pc.connectionState !== 'closed'){
            pc.getSenders().forEach(sender => {
                if (sender.track) sender.track.stop()
            })
            // pc.close()
        }

        if (socket){
            socket.disconnect();
        }
        setRemoteStream(null);
        setLocalStream(null);
        setSocket(null);
        setMeetingJoined(false);
    }
    
    useEffect(() => {
        const handleBeforeUnload = () => {
            userDisconnectProcess();
        };

        window.addEventListener("beforeunload", handleBeforeUnload);

        return () => {
            window.removeEventListener("beforeunload", handleBeforeUnload);
        };
    }, []);

    useEffect(() => {

        const s = new socketIO.connect("http://localhost:3001")
        s.on("connect", () => {

            // setting socket 
            setSocket(s)
            
            // connecting to the room on websocket
            s.emit("join", {
                roomId
            })
            
            // setting default mic and camera and also loading different camera and mic options
            try{
                window.navigator.mediaDevices.getUserMedia(
                    {
                        audio:true,
                        video:true
                    }
                ).then(async (stream) => {
                    setLocalVideo(stream)
                    setLocalStream(stream)
                    return navigator.mediaDevices.enumerateDevices()}).
                    then((devices) => {
                        console.log(devices)
                        let extractedvideoDevices = []
                        let extractedmicDevices = []
                        for (let device in devices){
                            if (devices[device]['kind'] == 'videoinput'){
                                extractedvideoDevices.push(devices[device])
                            }
                            else if (devices[device]['kind'] == 'audioinput'){
                                extractedmicDevices.push(devices[device])
                            }
                        }
                        setVideoDevices(extractedvideoDevices)
                        setaudioDevices(extractedmicDevices)
                    })
            }
            catch(err)
            {
                console.error("error while fetching media devices is -> ", err.message)
            }

            // receiving sdp
            s.on("localDescription", async ({description}) => {
                console.log("Recieved Remote Stream and i am 1st User ->", description)
                pc.setRemoteDescription(description)

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
                try{
                    await pc.setLocalDescription(await pc.createAnswer())
                    s.emit("remoteDescription", ({description:pc.localDescription}))
                }catch(err){
                    console.error(err.message)
                }
            })

            // receiving sdp
            s.on("remoteDescription", ({description}) => {
                console.log("Recieved Remote Stream and i am 2nd User ->", description)
                pc.setRemoteDescription(description)

                const remoteMediaStream = new MediaStream()
                setRemoteStream(remoteMediaStream)

                pc.ontrack = (event) => {
                    console.log("ontrack event keys",event)
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


    // handling camera management
    useEffect(() => {
        const switchVideo = async () => {
            if (selectedvideoDeviceId) {

                if (selectedvideoDeviceId === "__off__"){
                    console.log("switching camera off")
                    let videoTrack1 = localStream.getVideoTracks()[0];
                    videoTrack1.enabled=false
                }

                else if (selectedvideoDeviceId === "__on__"){
                    console.log("switching camera on")
                    let videoTrack1 = localStream.getVideoTracks()[0];
                    videoTrack1.enabled=true
                }

                else{
                    console.log("switching camera device")
                    let oldtrack = localStream.getVideoTracks()[0];
                    if (oldtrack) {
                        localStream.removeTrack(oldtrack);
                        oldtrack.stop();
                    }

                    let newStream = await navigator.mediaDevices.getUserMedia({
                        video: { deviceId: { exact: selectedvideoDeviceId } }
                    });
                    let newVideoTrack = newStream.getVideoTracks()[0];
                    localStream.addTrack(newVideoTrack) ;

                    const sender = pc.getSenders().find(s => s.track.kind === 'video');
                    if (sender) {
                        sender.replaceTrack(newVideoTrack);
                    }
                }
            }
        }
        switchVideo();
    }, [selectedvideoDeviceId]);


    // handling mic management
    useEffect(() => {
        const switchAudio = async () => {
            if (selectedaudioDeviceId){

                if (selectedaudioDeviceId === "__off__"){
                    console.log("switching mic off")
                    let audioTrack = localStream.getAudioTracks()[0];
                    audioTrack.enabled=false;
                }

                else if (selectedaudioDeviceId === "__on__"){
                    console.log("switching mic on")
                    let audioTrack = localStream.getAudioTracks()[0];
                    audioTrack.enabled=false;
                }

                else {
                    let oldtrack = localStream.getAudioTracks()[0];
                    if (oldtrack){
                        localStream.removeTrack(oldtrack)
                        oldtrack.stop();
                    }

                    let newStream = await navigator.mediaDevices.getUserMedia({
                        audio:{deviceId:selectedaudioDeviceId}
                    })
                    let newAudioTrack = newStream.getAudioTracks()[0];
                    localStream.addTrack(newAudioTrack)
                    let sender = pc.getSenders().find(s => s.track.kind === 'audio');
                    if (sender) {
                            sender.replaceTrack(newAudioTrack);
                    }
                }
            }
        }
        switchAudio();
    }, [selectedaudioDeviceId])

    // socket is not connected
    if (!socket){
        return <Box sx={{
            minWidth:"100vw",
            minHeight:"100vh",
            display:"flex",
            justifyContent:"center",
            alignItems:"center",
            backgroundColor:"primary.main"
        }}><Typography sx={{color:"text.primary"}}>Loading...Please Wait...</Typography></Box>
    }
    
    // when not joined meeting
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
                <Box sx={{
                    display:"flex",
                    flexDirection:"column",
                    gap:2,
                    p:2
                }}>
                <Select
                autoWidth
                value={selectedvideoDeviceId}
                onChange={(e) => {
                    setselectedvideoDeviceId(e.target.value)
                }}
                >
                {
                videoDevices.map((videoDevice) =>{
                    return <MenuItem value={videoDevice['deviceId']}>{videoDevice['label']}</MenuItem>
                })}
                </Select>
                <Select
                autoWidth
                value={selectedaudioDeviceId}
                onChange={(e) => {
                    setselectedaudioDeviceId(e.target.value)
                }}
                >
                {
                audioDevices.map((audioDevice) =>{
                    return <MenuItem value={audioDevice['deviceId']}>{audioDevice['label']}</MenuItem>
                })}
                </Select>
                </Box>
                <Button sx={{mt:2}} variant="contained"
                onClick={async () => {

                    // initiating a peer-connection
                    pc.onicecandidate = ({candidate}) => {
                        socket.emit("iceCandidate", {candidate})
                    }
                    localStream.getTracks().forEach((track) => {
                        if (track.kind === "video"){
                            pc.addTrack(track, localStream)
                        }
                        else{
                            pc.addTrack(track, localStream)
                        }
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

    // meeting joined but no other user
    if (!remoteStream){
        return <Box
        sx={{
            backgroundColor:"#000",
            minWidth:"90vw",
            minHeight:"100vh",
            justifyContent:"center",
            alignItems:"center",
            p:3
        }}
        >
        <Box variant="div" sx={{maxHeight:"90vh", minHeight:"90vh"}}>
            <Box variant="dic" sx={{maxHeight:"80vh", minHeight:"80vh"}}>
                <Video stream={localStream} userName={"You"}/>
            </Box>
            <Box variant="dic" sx={{maxHeight:"10vh", minHeight:"10vh"}}>
                <ControlBar roomId={roomId} videoDevices={videoDevices} audioDevices={audioDevices} disconnectUser={userDisconnectProcess} setVideoDevice={setselectedvideoDeviceId} setAudioDevice={setselectedaudioDeviceId}/>
            </Box>
        </Box>
        </Box>
    }

    // when other user have joined
    return <Box
        sx={{
            backgroundColor:"#000",
            minWidth:"90vw",
            justifyContent:"center",
            alignItems:"center",
            flexDirection:"row",
            height:"100vh",
            width:"100vw",
            p:3
        }}
        >
            <Box
            sx = {{
                display:"flex",
                flex:1,
                justifyContent:"space-evenly",
                flexDirection:"row"
            }}>
                <Box sx={{flex: 1, border: "1px solid #000"}}>
                    <Video stream={localStream} userName={"You"}></Video>
                </Box>
                <Box sx={{flex: 1, border: "1px solid #000"}}>
                    <Video stream={remoteStream} userName={"Other User"}></Video>
                </Box>
            </Box>
            <Box variant="div">
                <ControlBar roomId={roomId} audioDevices={audioDevices} videoDevices={videoDevices} disconnectUser={userDisconnectProcess} setVideoDevice={setselectedvideoDeviceId} setAudioDevice={setselectedaudioDeviceId} />
            </Box>  
    </Box>
}