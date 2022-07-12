import * as THREE from "three";
import fragment from "./shader/fragment.glsl";
import vertex from "./shader/vertexParticles.glsl";
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls';
import gsap from 'gsap';
import t from '../sakura.jpg';
import tt from '../sakura1.jpg';


export default class Sketch {
  constructor(options) {
    this.scene = new THREE.Scene();

    this.container = options.dom;
    this.width = this.container.offsetWidth;
    this.height = this.container.offsetHeight;
    this.renderer = new THREE.WebGLRenderer( { alpha: true, antialias: true } );
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(this.width, this.height);
    //this.renderer.outputEncoding = THREE.sRGBEncoding;
    this.renderer.physicallyCorrectLights = true;

    this.container.appendChild(this.renderer.domElement);

    this.camera = new THREE.PerspectiveCamera(
      70,
      window.innerWidth / window.innerHeight,
      0.001,
      5000
    );

    
    

    // var frustumSize = 10;
    // var aspect = window.innerWidth / window.innerHeight;
    // this.camera = new THREE.OrthographicCamera( frustumSize * aspect / - 2, frustumSize * aspect / 2, frustumSize / 2, frustumSize / - 2, -1000, 1000 );
    this.camera.position.set(0, 0, 1500);
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.time = 0;

    this.video = document.querySelector('video');

    this.isPlaying = true;
    
    this.addPost();

    this.addObjects();
    this.resize();
    this.render();
    this.setupResize();
    // this.settings();

    this.video.addEventListener('ended', () =>
    {
        gsap.to( '#video1',
        {
          duration: 0.1,
          opacity: 0,
        });
        gsap.to( this.material.uniforms.uDisplace, 
        {
            duration: 2,
            value: 3,
            ease: 'power2.inOut',
            onComplete: () =>
            {
              this.material.uniforms.uCurrent.value = 0.;
            }  
        });
        gsap.to( this.material.uniforms.progress, 
          {
            duration: 1,
            value: 1,
            delay: 1.5,    
          })
        gsap.to ( this.bloomPass,
        {
            duration: 2,
            strength: 10,
        });
        gsap.to( this.material.uniforms.uDisplace, 
        {
            duration: 2,
            value: 0,
            delay: 2,
            ease: 'power2.inOut',
            onComplete: () =>
            {
              this.material.uniforms.uCurrent.value = 1.;
            }  
        });
        gsap.to( this.bloomPass,
          {
              duration: 2,
              strength: 0,
              delay: 2,
              onComplete: () =>
              {
                this.video.currentTime = 0;
                this.video.play();
                gsap.to( this.video,
                  {
                    duration: 1,
                    opacity: 1,
                  });
              }
          });
    });

  }

  addPost()
  {

    this.composer = new EffectComposer( this.renderer );

    this.renderPass = new RenderPass( this.scene, this.camera );

    this.bloomPass = new UnrealBloomPass( 
      new THREE.Vector2( window.innerWidth, window.innerHeight ),
      0.001,
      0.4,
      0.85
      );

      this.composer.addPass( this.renderPass );
      this.composer.addPass( this.bloomPass );
  }

  settings() {
    let that = this;
    this.settings = {
      progress: 0,
    };
    this.gui = new dat.GUI();
    this.gui.add(this.settings, "progress", 0, 1, 0.01);
  }

  setupResize() {
    window.addEventListener("resize", this.resize.bind(this));
  }

  resize() {
    this.width = this.container.offsetWidth;
    this.height = this.container.offsetHeight;
    this.renderer.setSize(this.width, this.height);
    this.composer.setSize( this.width, this.height );
    this.camera.aspect = this.width / this.height;
    this.camera.updateProjectionMatrix();
  }

  addObjects() {
    let that = this;
    this.material = new THREE.ShaderMaterial({
      extensions: {
        derivatives: "#extension GL_OES_standard_derivatives : enable"
      },
      side: THREE.DoubleSide,
      uniforms: 
      {
        time: 
        { 
          value: 0 
        },
        resolution: 
        { 
          value: new THREE.Vector4() 
        },
        uvRate1: 
        {
          value: new THREE.Vector2(1, 1)
        },
        uTexture:
        {
          value: new THREE.TextureLoader().load(t)
        },
        uTexture2:
        {
          value: new THREE.TextureLoader().load(tt)
        },
        uDisplace:
        {
          value: 0.001
        },
        progress:
        {
          value: 0
        },
        uCurrent:
        {
          value: 1
        }
      },
      // wireframe: true,
      // transparent: true,
      vertexShader: vertex,
      fragmentShader: fragment
    });

    this.geometry = new THREE.PlaneBufferGeometry( 480 *1.742, 820 *1.74 , 480, 820);

    this.plane = new THREE.Points(this.geometry, this.material);
    this.scene.add(this.plane);
  }

  stop() {
    this.isPlaying = false;
  }

  play() {
    if(!this.isPlaying){
      this.render()
      this.isPlaying = true;
    }
  }

  render() {
    if (!this.isPlaying) return;
    this.time += 0.05;
    this.material.uniforms.time.value = this.time;
    requestAnimationFrame(this.render.bind(this));
    //this.renderer.render(this.scene, this.camera);
    this.composer.render();
  }
}

new Sketch({
  dom: document.getElementById("container")
});
