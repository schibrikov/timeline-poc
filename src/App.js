import React, { useState, useCallback, useRef, useEffect } from 'react';
import styled from 'styled-components';
import './App.css';

const Container = styled.div`
  height: 50px;
  width: 100%;
  background: #E8EAF6;
  position: relative;
  margin: 200px 0 3px;
`;

const TimeBlock = styled.div`
  background: #5C6BC0;
  height: 100%;
  width: ${(props) => `${(props.to - props.from) * 50}px`};
  border: 3px solid #2736c3;
  position: absolute;
  border-radius: 5px;
  left: ${(props) => `${props.from * 50}px`};
  top: 0;
  bottom: 0;
  transition: all ease 0.3s;
`;

const Handle = styled.div`
  position: absolute;
  top: 0;
  bottom: 0;
  height: 100%;
  width: 10px;
  ${(props) => props.left ? 'left: 0' : ''}
  ${(props) => props.right ? 'right: 0' : ''}
  background: #feac2d;
  cursor: ew-resize;
`;

function App() {
  const [from, setFrom] = useState(1);
  const [to, setTo] = useState(15);

  useEffect(() => {
    console.log('from: ', from, ' to: ', to);
  }, [to]);

  const blockRef = useRef(null);
  const initialX = useRef(null);

  const timePeriod = to - from;
  const pixelStep = blockRef.current && (blockRef.current.clientWidth / timePeriod);

  const handleRightDragStart = useCallback((e) => {
    initialX.current = e.clientX;
  }, [from, to]);

  const lastUpdated = new Date().getTime();

  const handleDragContinue = useCallback((e) => {
    console.log('drag continue');
    if (new Date().getTime() - lastUpdated > 300) {
      handleRightDragEnd(e);
      handleRightDragStart(e);
    }
  }, [from ,to]);

  const handleRightDragEnd = useCallback((e) => {
    const xDiff = e.clientX - initialX.current;
    const pixelStep = blockRef.current && (blockRef.current.clientWidth / timePeriod);
    const increase = Math.floor(xDiff / pixelStep);

    console.log(blockRef.current.clientWidth, timePeriod, pixelStep, xDiff, increase);

    // const increaseProportion = normalizeResizeProportion(xDiff / timelineWidth, 0.20);

    // console.log('width: ', timelineWidth);
    // console.log('xdiff: ', xDiff);
    //
    // console.log(`Changed by ${Math.floor(increaseProportion * 100)}%`);

    if (to + increase - from > 24) {
      console.error("can't be longer than 24 hours")
    } else if (to + increase - from < 1) {
      console.error("can't be less than 1 hour")
    } else {
      setTo(to + increase);
    }
  }, [from, to, pixelStep]);

  return (
    <div className="App">
      <Container>
        <TimeBlock from={from} to={to} ref={blockRef}>
          <Handle draggable left />
          <Handle draggable right onDragStart={handleRightDragStart} onDragEnd={handleRightDragEnd} />
        </TimeBlock>
      </Container>
    </div>
  );
}

export default App;
