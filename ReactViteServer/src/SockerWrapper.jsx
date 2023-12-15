/* eslint-disable react-hooks/exhaustive-deps */
import { useLocation } from "react-router-dom";
import { socket } from './socket';
import bg_w from '/src/bg_w.png';
import bg_b from '/src/bg_b.png';
import Lobby from "./Lobby";
import { useEffect, useState } from "react";
import Game from "./Game";
import Endgame from "./Endgame";


const SockerWrapper = () => {
    const userId = localStorage.getItem('userId')
    const userName = localStorage.getItem('userName')
    const {state} = useLocation();
    const { quiz } = state;

    let result_placeholder = []
    for (let i = 0; i < quiz.questions.length; i++) {
        result_placeholder.push({correct: quiz.questions[i].validIndex, answers: []})
    }
    const [answerLog, setAnswerLog] = useState(result_placeholder)

    const [start, setStart] = useState(false)
    const getStartFlag = (bool) => {
        setStart(bool)
        socket.emit('start', {roomId: userId})
        setCurrIndex(0)
    }
    const [end, setEnd] = useState(false)

    const [connected, setConnect] = useState([{userId: userId, userName: "ВЫ"}])
    const [currIndex, setCurrIndex] = useState(0)
    const next = (bool) => {
        if (bool && currIndex < quiz.questions.length - 1) {
            setRevealed(false)
            setCurrIndex(currIndex + 1)
        } else if (currIndex == quiz.questions.length - 1) {
            setRevealed(false)
            setEnd(true)
            socket.emit('end', {roomId: userId})
        }
    }

    const [revealed, setRevealed] = useState(false)
    const reveal = (bool) => {
      if (bool) {
        setRevealed(true)
        socket.emit('reveal', {roomId: userId, choiceInd:  quiz.questions[currIndex].validIndex})
      }
    }

    const black_bg = {
        backgroundImage: `url(${bg_b})`,
        backgroundPosition: 'center',
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        width: '100vw',
        height: '100vh'
      }
      const white_bg = {
        backgroundImage: `url(${bg_w})`,
        backgroundPosition: 'center',
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        width: '100vw',
        height: '100vh'
      }


      useEffect(() => {
        if (currIndex !== -1) {
          let tempobj = {
            text: quiz.questions[currIndex].text,
            choices: quiz.questions[currIndex].answers
          }
          console.log(tempobj)
            socket.emit('next', {roomId: userId, question: tempobj}) 
        }
      }, [currIndex])
      


    useEffect(() => {
        socket.connect();
        socket.emit('create', {id: userId, userName: userName})

        function onJoin(obj) {
            console.log(obj)
            setConnect(oldArray => [...oldArray,obj]);
          }
        socket.on('join', onJoin);

        function onLeave(left) {
          setConnect(oldArray => [...oldArray.filter(obj => obj.userId !== left.userId)]);
        }
      socket.on('leave', onLeave);


        function onChoice(obj) {
          if (!revealed) {
            console.log(obj)
            console.log("Current index:", currIndex)
            setAnswerLog(log => log[currIndex].answers.push({userId: obj.userId, choice: obj.choiceInd}))
          }
        }
        socket.on('choice', onChoice);


        socket.on('bark', (obj) => {console.log(obj)});

    
        return () => {
          socket.off();
          socket.disconnect();
        };
      }, []);




  return (
    <div style={start ? end ? {} : white_bg : black_bg} className="flex_center">
        <div className={ start ? end ? "timer_b" : "timer_w space_top_timer":"timer_b"}>ВИКТОРИНА {quiz.title.toUpperCase()}</div>
        {start ?  end ? <Endgame /> : <Game answers={quiz.questions[currIndex]} passNext={next} passReveal={reveal}/> : <Lobby users={connected} passStartFlag={getStartFlag}/>}
        <h1 className="debug_string">{JSON.stringify(answerLog)}{currIndex}</h1>
    </div>
  )
}

export default SockerWrapper