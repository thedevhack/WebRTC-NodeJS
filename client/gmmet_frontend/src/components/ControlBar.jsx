
import { Typography, Box, Button, Select, MenuItem } from '@mui/material'
import { useState, useEffect } from 'react';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';
import VideocamIcon from '@mui/icons-material/Videocam';
import VideocamOffIcon from '@mui/icons-material/VideocamOff';
import CallEndIcon from '@mui/icons-material/CallEnd';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';

export default function ControlBar({roomId, disconnectUser, videoDevices, audioDevices, setVideoDevice, setAudioDevice}){
    const [micstate, setmicState] = useState(true)
    const [videoOn, setVideoOn] = useState(true)
    const [currentTime, setCurrentTime] = useState("")
    // console.log(roomId, videoDevices, audioDevices, setVideoDevice, setAudioDevice)

    useEffect(() => {
        let now = new Date()
        let hours = now.getHours()
        let minutes = now.getMinutes()
        let seconds = now.getSeconds()
        let daynight = hours >= 12 ? "PM":"AM"
        let showHours = hours > 12 ? hours%12 : hours 
        setCurrentTime(showHours + ":" + minutes + " " + daynight)
        setInterval(() => {
            let update = false
            // console.log("before checking", update)
            if (seconds === 59){
                minutes += 1
                seconds = 0
                update = true
            }
            else if (minutes === 59){
                hours += 1
                minutes = 0
                daynight = hours >= 12 ? "PM":"AM"
                update = true
            }
            else if (hours === 23 && minutes === 59){
                hours = 0
                minutes = 0
                update = true
            }
            else{
                seconds += 1
            }
            // console.log("after checking", update)
            showHours = hours > 12 ? hours%12 : hours 
            if (update){
                showHours = hours > 12 ? hours%12 : hours 
                setCurrentTime(showHours + ":" + minutes + " " + daynight)
            }
        }, 1000)
    }, [])

    return (<Box
    sx={{
        minWidth:"90vw",
        backgroundColor:"#000",
        display:"flex",
        minHeight:"5vh",
        justifyContent:"space-between",
        p:2,
    
    }}><Box>
            <Typography sx={{color:"#fff"}}>{currentTime} | {roomId}</Typography>
        </Box>
        <Box>
            <Select
            autoWidth
            sx={{
                backgroundColor:"#fff"
            }}
            disabled={!micstate}
            onChange={(e) => {setAudioDevice(e.target.value)}}
            >
            {audioDevices.map((audioDevice) => {
                return <MenuItem value={audioDevice['deviceId']}>{audioDevice['label']}</MenuItem>
            })}
            </Select>
            <Button onClick={
                () => {
                    if (micstate) {
                        setAudioDevice("__off__")
                    }else{
                        setAudioDevice("__on__")
                    }
                    setmicState(!micstate)
                    }}>{!micstate ? <MicOffIcon sx={{ color: "#fff" }}/>:<MicIcon sx={{ color: "#fff" }}/>}</Button>
            <Select
            autoWidth
            sx={{
                backgroundColor:"#fff"
            }}
            onChange={(e) => {setVideoDevice(e.target.value)}}
            disabled={!videoOn}>
            {videoDevices.map((videoDevice) => {
                return <MenuItem value={videoDevice['deviceId']}>{videoDevice['label']}</MenuItem>
            })}
            </Select>
            <Button onClick={() => {
                if (videoOn){
                    setVideoDevice("__off__")
                } else{
                    setVideoDevice("__on__")
                }
                setVideoOn(!videoOn)
                
                }}>{videoOn ? <VideocamIcon sx={{ color: "#fff" }}/>:<VideocamOffIcon sx={{ color: "#fff" }}/>}</Button>
        </Box>
        <Box>
            <Button
            sx={{backgroundColor:"#f00"}}
            onClick={() => {
            disconnectUser();
            window.location.href="/meeting/"+roomId
            }}><CallEndIcon sx={{ color: "#fff", backgroundColor:"#f00" }}/></Button>
        </Box>

    </Box>)
}