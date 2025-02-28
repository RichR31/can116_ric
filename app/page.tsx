'use client';

import { useEffect, useState } from 'react';

const ESP32_IP = 'http://172.20.50.58';
const CANVAS_SIZE = 600;
const MULTIPLIER = 2; // Pixels per cm
const SENSOR_ANGLE = 17; // Degrees for left and right sensor legs

export default function Home() {
  const [angle, setAngle] = useState(0);
  const [distances, setDistances] = useState({ left: 0, front: 0, right: 0 });
  const [dataAvailable, setDataAvailable] = useState(true);
  const [locations, setLocations] = useState({ left: 50, top: 50});

  const fetchData = async () => {
    try {
      const response = await fetch(`${ESP32_IP}/data`);
      
      const data = await response.text();
      const [angleStr, rightStr, frontStr, leftStr] = data.trim().split(',');

      setAngle(parseFloat(angleStr));
      setLocations({
        top: 50+ (10*Math.sin((Math.PI * parseFloat(angleStr))/180)),
        left: 50+ (10*Math.cos((Math.PI * parseFloat(angleStr))/180))
      });
      setDistances({
        front: parseFloat(frontStr) / 10 || 10,
        left: parseFloat(leftStr) / 10 || 10,
        right: parseFloat(rightStr) / 10 || 10,
      });
      setDataAvailable(true);
    } catch (error) {
      console.error('Error fetching data:', error);
      setDataAvailable(false);
    }
  };

  useEffect(() => {
    fetchData(); // Fetch data initially
    const interval = setInterval(fetchData, 40); // Fetch every 1 second
    return () => clearInterval(interval);
  }, []);

  if (!dataAvailable) {
    return (
      <div className="text-center p-5 border">
        <h1 className="text-2xl font-bold mb-4 border">Cane116 not detected</h1>
      </div>
    );
  }

  return (
    <div className="text-center p-5 flex flex-col gap-4 items-center">
      <div>
        <h1 className="text-2xl font-bold mb-4 border">Cane 116 (Degrees, cm)</h1>
        <p>Angle: {Math.round(angle)}</p>
        <p>Left Distance: {distances.left.toFixed(3)} cm</p>
        <p>Front Distance: {distances.front.toFixed(3)} cm</p>
        <p>Right Distance: {distances.right.toFixed(3)} cm</p>
      </div>
      
      <div className="relative flex justify-center w-full overflow-hidden border rounded-full" style={{ height: CANVAS_SIZE, width: CANVAS_SIZE }}>
        <div
          className="absolute bg-red-500 rounded-full"
          style={{
            width: '10%',
            height: 3,
            top: '50%',
            left: '50%',
            transform: `rotate(${angle}deg)`,
            transformOrigin: '0% 0%',
          }}
        ></div>
        
        <div
          className="absolute bg-yellow-500"
          style={{
            width: distances.left * MULTIPLIER,
            height: 3,
            top: `${locations.top}%`,
            left: `${locations.left}%`,
            transform: `rotate(${angle - SENSOR_ANGLE}deg)`,
            transformOrigin: '0% 0%',
          }}
        ></div>
        <div
          className="absolute bg-yellow-500"
          style={{
            width: distances.front * MULTIPLIER,
            height: 3,
            top: `${locations.top}%`,
            left: `${locations.left}%`,
            transform: `rotate(${angle}deg)`,
            transformOrigin: '0% 0%',
          }}
        ></div>
        <div
          className="absolute bg-yellow-500 rounded-full"
          style={{
            width: distances.right * MULTIPLIER,
            height: 3,
            top: `${locations.top}%`,
            left: `${locations.left}%`,
            transform: `rotate(${angle + SENSOR_ANGLE}deg)`,
            transformOrigin: '0% 0%',
          }}
        ></div>
      </div>
    </div>
  );
}
