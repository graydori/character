import './App.css';
//import * as cocoSsd from '@tensorflow-models/coco-ssd';
import * as faceapi from 'face-api.js';
import Webcam from "react-webcam";
import React from 'react';

const MODEL_URL = '/models'

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.webcam = React.createRef();
    this.canvas = React.createRef();
    this.isLoading = true;
    this.detections = {};
  }

  drawCharacter(mouth, ctx) {
    //Draw a character

    // Draw the ellipse
    /*
    ctx.beginPath();
    ctx.ellipse(width / 2, height / 2, width / 4, height / 4, 0, 0, 0);
    ctx.fillStyle = 'green';
    ctx.fill();
*/
    ctx.fillStyle = 'red';
    ctx.beginPath();
    ctx.ellipse(60, 75, 50, 30, Math.PI * .25, 0, Math.PI * 1.5);
    ctx.fill();

    // Create path
    let region = new Path2D();

    //region.moveTo(30, 90);
    mouth.forEach(({ x, y }) => {
      region.lineTo(x, y);
    });
    /*
      region.lineTo(240, 130);
      region.lineTo(60, 130);
      region.lineTo(190, 20);
      region.lineTo(270, 90);*/
    region.closePath();
    ctx.fillStyle = 'pink';
    ctx.fill(region, 'evenodd');
  }

  async update() {
    //await faceapi.loadModels(MODEL_URL)
    //await faceapi.loadSsdMobilenetv1Model(MODEL_URL);

    await faceapi.loadFaceDetectionModel(MODEL_URL)
    await faceapi.loadFaceLandmarkModel(MODEL_URL)
    await faceapi.loadFaceRecognitionModel(MODEL_URL)
    await faceapi.loadAgeGenderModel(MODEL_URL);
    await faceapi.loadFaceExpressionModel(MODEL_URL);

    const displaySize = { width: this.webcam.current.video.width, height: this.webcam.current.video.height }
    faceapi.matchDimensions(this.canvas.current, displaySize)

    this.setState({ isLoading: false });

    setInterval(async () => {

      const detections =
        await faceapi.detectSingleFace(this.webcam.current.video)
          .withFaceLandmarks()
          .withAgeAndGender()
          .withFaceExpressions();
      this.setState((state, props) => {
        console.log(detections);
        return { detections };
      });

      const ctx = this.canvas.current.getContext('2d');
      const width = this.canvas.current.width;
      const height = this.canvas.current.height;
      ctx.clearRect(0, 0, width, height);

    if (detections) {
      this.drawCharacter(detections.landmarks.getMouth(), ctx)

      const resizedDetections = faceapi.resizeResults(detections, displaySize);

      faceapi.draw.drawFaceLandmarks(this.canvas.current, resizedDetections);
      faceapi.draw.drawFaceExpressions(this.canvas.current, resizedDetections);

    }
  }, 100);
}

render() {
  return (
    <div className="App">
      <header className="App-header">
        <canvas
          ref={this.canvas}
          width={567}
          height={320} />
        <Webcam
          hidden={true}
          audio={false}
          height={320}
          width={567}
          ref={this.webcam}
          onPlay={() => { this.update() }}
        />
        <div>
          {this.isLoading ? 'Loaded' : 'Not Loaded'}<br />
          {JSON.stringify(this.detections, null, 2)}
        </div>
      </header>
    </div>
  );
}
}