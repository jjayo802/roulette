import { useEffect, useRef, useState } from 'react'
import './App.css'
import Rainbow from 'rainbowvis.js';

function App() {

  const canvas = useRef();
  const ctxRef = useRef(null);
  
  const [currentAngle, setCurrentAngle] = useState(0);
  const [rouletteCount, setRouletteCount] = useState(8);
  const [isRotating, setIsRotating] = useState(false);

  useEffect(() => {
    const canvasEle = canvas.current;
    const ctx = canvasEle.getContext("2d");
    ctxRef.current = ctx;

    document.fonts.load('50px Aggro-M').then(() => {
      draw();
    });
  }, []);

  useEffect(() => {
    draw();
  }, [currentAngle, rouletteCount]);

  const draw = () => {
    const centerX = canvas.current.width / 2;
    const centerY = canvas.current.height / 2;

    ctxRef.current.clearRect(0, 0, canvas.current.width, canvas.current.height);

    drawRotated(currentAngle, () => {
      drawRoulette(centerX, centerY, 400, rouletteCount);
      drawFillCircle(centerX, centerY, 100);
      drawText(centerX, centerY, "룰렛");
    });

    drawFillTriangle(centerX - 30, centerY - 450, centerX + 30, centerY - 450, centerX, centerY - 375, "#ff6b6b");
  }

  const drawCircle = (x, y, r) => {
    const ctx = ctxRef.current;
    ctx.lineJoin = 'round';
    ctx.lineWidth = 5;
    ctx.strokeStyle = 'black';
    ctx.beginPath();
    ctx.arc(x, y, r, 0, 2 * Math.PI);
    ctx.stroke();
  }

  const drawFillCircle = (x, y, r) => {
    const ctx = ctxRef.current;
    ctx.lineJoin = 'round';
    ctx.lineWidth = 5;
    ctx.strokeStyle = 'black';
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.arc(x, y, r, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();
  }

  const drawFillArc = (x, y, r, startAngle, endAngle, color) => {
    const ctx = ctxRef.current;

    const cos1 = Math.cos(startAngle) * r;
    const sin1 = Math.sin(startAngle) * r;

    ctx.fillStyle = color;
    ctx.lineJoin = 'round';
    ctx.lineWidth = 2;
    ctx.strokeStyle = 'black';
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + cos1, y + sin1);
    ctx.arc(x, y, r, startAngle, endAngle);
    ctx.lineTo(x, y);
    ctx.fill();
    ctx.stroke();
  }

  const drawFillTriangle = (x1, y1, x2, y2, x3, y3, color) => {
    const ctx = ctxRef.current;
    ctx.lineJoin = 'round';
    ctx.lineWidth = 5;
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.lineTo(x3, y3);
    ctx.lineTo(x1, y1);
    ctx.fill();
    ctx.stroke();
  }

  const drawText = (x, y, text) => {
    const ctx = ctxRef.current;
    ctx.font = "50px Aggro-M";
    ctx.fillStyle = 'black';
    ctx.textBaseline = "middle";
    ctx.textAlign = "center";
    ctx.fillText(text, x, y);
  }

  const drawRoulette = (x, y, r, count) => {
    drawCircle(x, y, r);
    const angleOfOne = (2*Math.PI) / count;
    var rainbow = new Rainbow();
    rainbow.setNumberRange(0, count);
    rainbow.setSpectrum('#ffd1fd', '#d1faff', '#ffd1fd');

    for (let i = 0; i < count; i++) {
      const angle = (-Math.PI/2) + (angleOfOne*i);
      const cos = Math.cos(angle) * r;
      const sin = Math.sin(angle) * r;

      drawFillArc(x, y, r, angle, angle + angleOfOne, "#" + rainbow.colourAt(i));

      const cos2 = Math.cos(angle + (angleOfOne/2)) * r * (9/10);
      const sin2 = Math.sin(angle + (angleOfOne/2)) * r * (9/10);
      drawTextRotated(x+cos2, y+sin2, i+1, angleOfOne*(i+0.5));
    }
  }

  const drawRotated = (angleInRadians, drawFn) => {
    const ctx = ctxRef.current;
    const centerX = canvas.current.width / 2;
    const centerY = canvas.current.height / 2;

    const originalTransform = ctx.getTransform(); // 현재 상태 저장
    ctx.translate(centerX, centerY); // 중앙으로 이동
    ctx.rotate(angleInRadians); // 회전
    ctx.translate(-centerX, -centerY); // 다시 원래 좌표계로 이동

    drawFn(); // 원하는 그림 그리기

    ctx.setTransform(originalTransform); // 이전 상태 복원
  };

  const drawTextRotated = (x, y, text, angle) => {
    const ctx = ctxRef.current;

    ctx.save(); // 이건 이 함수 내부에서만 상태 저장
    ctx.translate(x, y); // 텍스트 중심으로 이동
    ctx.rotate(angle); // 텍스트 회전
    ctx.font = "30px Aggro-M";
    ctx.fillStyle = 'black';
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, 0, 0); // (0,0)은 translate로 이동된 좌표
    ctx.restore();
  };

  function sleep(sec) {
    return new Promise(resolve => setTimeout(resolve, sec * 1000));
  }

  const rotate = async() => {
    if(isRotating) return;
    let speed = 0.3;
    let currentAngle2 = currentAngle;
    setIsRotating(true);
    while (speed >= 0) {
      speed -= (speed * 0.01) + (Math.random() * 0.00005);
      currentAngle2 += speed;
      setCurrentAngle(currentAngle2);
      await sleep(0.01);
    }
    setIsRotating(false);
  }

  const resetAngle = () => {
    if(isRotating) return;
    setCurrentAngle(0);
  }

  const getRotateCount = () => {
    var i = 0;
    const angleOfOne = (2*Math.PI) / rouletteCount;
    while (true) {
      if(currentAngle >= angleOfOne * i && currentAngle < angleOfOne * (i+1)) break;
      i++;
    }
    while (true) {
      if(i - rouletteCount >= 0) i -= rouletteCount;
      else break;
    }
    return rouletteCount - i;
  }

  return (
    <div id='App'>
      <div className='flex-container'>
        <canvas className="canvas" ref={canvas} width="1920" height="1080"></canvas>
      </div>
      <div className='flex-container'>
        <span className='result-number'>[ {getRotateCount()} ]</span>
      </div>
      <div className='flex-container'>
        <span className='count-input-text'>개수 : </span>
        <input type="number" min="2" max="50" className='count-input' onChange={(e) => {
          if(e.target.value && e.target.value >= 2 && e.target.value <= 50) setRouletteCount(e.target.value)
        }}></input>
      </div>
      <div className='flex-container'>
        <button className='spin-button' onClick={() => resetAngle()}>초기화</button>
        <button className='spin-button' onClick={() => rotate()}>돌리기!</button>
      </div>
    </div>
  );
}

export default App;
