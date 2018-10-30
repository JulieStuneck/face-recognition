import React, { Component } from 'react';
import Particles from 'react-particles-js';
import Clarifai from 'clarifai';
import Navigation from './components/Navigation/Navigation';//don't need .js
import Signin from './components/Signin/Signin';
import Register from './components/Register/Register';
import Logo from './components/Logo/Logo';
import Rank from './components/Rank/Rank';
import FaceRecognition from './components/FaceRecognition/FaceRecognition';
import ImageLinkForm from './components/ImageLinkForm/ImageLinkForm';
import './App.css';

const app = new Clarifai.App({
 apiKey: '6abbdaf0d2574bf6be1f9154c12a86e9'
});

const particlesOptions = {
  particles: {
    number: {
      value: 30,
      density: {
        enable: true,
        value_area: 800
      }      
    }    
  }
}

class App extends Component {
  constructor(){
    super();
    this.state = {
      input: '',
      imageUrl:'',
      box: {},
      route: 'signin', /*keeps track of where we are on the page*/
      isSignedIn: false
    }
  }

  calculateFaceLocation = (data) => {
    const clarifaiFace = data.outputs[0].data.regions[0].region_info.bounding_box
    const image = document.getElementById('inputimage');
    const width = Number(image.width);//change stting data from api into number for calculating
    const height = Number(image.height);
    //console.log(width, height);

    return {//creating an object that will figure out the box state
      leftCol: clarifaiFace.left_col * width, //multiply clarifai data (percentage) by 500 (the width of the photo set in  FaceRecognition.js)
      topRow: clarifaiFace.top_row * height,
      rightCol: width - (clarifaiFace.right_col * width),
      bottomRow: height - (clarifaiFace.bottom_row * height)
    }
  }

  displayFaceBox = (box) => {
    //console.log(box);
    this.setState({box: box})
  }

  onInputChange = (event) => {
    this.setState({input: event.target.value});
  }

/*simplified below*/
  /*onButtonSubmit = () => {
    this.setState({imageUrl: this.state.input});
    app.models
      .predict(
        Clarifai.FACE_DETECT_MODEL,
        this.state.input)
      .then(
      function(response) {
        //this data is pulled from the object returned in console.log(response); 
        //console.log(response.outputs[0].data.regions[0].region_info.bounding_box);
        this.calculateFaceLocation(response); //need this. because are working with classes
      },
      function(err) {
        // there was an error
      }
    );    
  }*/

  onButtonSubmit = () => {
    this.setState({imageUrl: this.state.input});
    app.models
      .predict(
        Clarifai.FACE_DETECT_MODEL,
        this.state.input)
      //below function evolved into the next line
      //.then(response => this.calculateFaceLocation(response))
      .then(response => this.displayFaceBox(this.calculateFaceLocation(response)))
      .catch(err => console.log(err));
  }

  onRouteChange = (route) => {
    if (route === 'signout') {
      this.setState({isSignedIn: false})
    } else if (route === 'home') {
      this.setState({isSignedIn: true})
    }
    this.setState({route: route});
  }

  render() {
    const { isSignedIn, /*imageUrl,*/ route, box } = this.state;
    return (
      <div className="App">
        <Particles className='particles'
              params={particlesOptions}
         />
        <Navigation isSignedIn={isSignedIn} onRouteChange={this.onRouteChange}/> {/*(Navigation is the sign-out button)*/}
        { route === 'home' 
          ? <div>
              <Logo />
              <Rank />
              <ImageLinkForm 
                onInputChange={this.onInputChange} 
                onButtonSubmit={this.onButtonSubmit}
              />
              <FaceRecognition box={box} imageUrl={this.state.imageUrl}/>
            </div>
          : (
              route === 'signin' 
              ? <Signin onRouteChange={this.onRouteChange}/>
              : <Register onRouteChange={this.onRouteChange}/>
            )          
        }
      </div>
    );
  }
}

export default App;
