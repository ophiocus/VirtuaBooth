import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GroundedSkybox } from 'three/addons/objects/GroundedSkybox.js';
import { Water } from 'three/addons/objects/Water.js';
import { RectAreaLightHelper } from 'three/addons/helpers/RectAreaLightHelper.js';
import { RectAreaLightUniformsLib } from 'three/addons/lights/RectAreaLightUniformsLib.js';
import { Context } from '/js/src/context.js';
import { Handlers } from './handlers';

/**
 * The Project Module.
 * @module Project
 */
const Project = (() => {

  /**
   * The Context constant provides a neutral scope to use as part of the state handling tasks.
   * @name module:Project.context
   * @private
   */
  const context = Context;

  /**
   * The Stage set function prepares the three js environment that will run the scenes.
   * @alias module:Project.setStage
   * @returns {THREE.Scene} scene
   */
  const stage_set = () => {
    console.group("stage_set");
    // Scene
    const scene = new THREE.Scene();

    // Name the main scene
    scene.name = "Main scene";

    scene.background = new THREE.Color(0x443333);
    scene.fog = new THREE.Fog(0xcdcdcd, 0.3, 22);

    

    // Add props
    // const stage_add_props;
    // Ground
    // const plane = new THREE.Mesh(
    //   new THREE.PlaneGeometry(8, 8),
    //   new THREE.MeshPhongMaterial({ color: 0xcbcbcb, specular: 0x101010 })
    // );
    // plane.rotation.x = - Math.PI / 2;
    // plane.position.y = -0.0015;
    // plane.receiveShadow = true;
    //scene.add( plane );

    // Spotlight
    const spotLight = new THREE.SpotLight();
    spotLight.intensity = .7;
    spotLight.angle = Math.PI * 2;
    spotLight.penumbra = 0.5;
    spotLight.castShadow = true;
    spotLight.position.set(1, 2, 2);
    spotLight.lookAt(0, 0, 0);
    scene.add(spotLight);
    const spotLight2 = new THREE.SpotLight();
    spotLight2.intensity = .7;
    spotLight2.angle = Math.PI * 2;
    spotLight2.penumbra = 0.5;
    spotLight2.castShadow = true;
    spotLight2.position.set(-1, 2, -2);
    spotLight2.lookAt(0, 0, 0);
    scene.add(spotLight2);
    const spotLight3 = new THREE.SpotLight();
    spotLight3.intensity = .7;
    spotLight3.angle = Math.PI * 2;
    spotLight3.penumbra = 0.5;
    spotLight3.castShadow = true;
    spotLight3.position.set(2, 2, 1);
    spotLight3.lookAt(0, 0, 0);
    scene.add(spotLight3);
    const spotLight4 = new THREE.SpotLight();
    spotLight4.intensity = .7;
    spotLight4.angle = Math.PI * 2;
    spotLight4.penumbra = 0.5;
    spotLight4.castShadow = true;
    spotLight4.position.set(-1, 2, 2);
    spotLight4.lookAt(0, 0, 0);
    scene.add(spotLight4);

    // // Ambient light
    const AmgLight = new THREE.AmbientLight(0xffffff, 1);
    scene.add(AmgLight);

    // Rect Area Light
    const width = 10;
    const height = 10;
    const intensity = 1.5;
    const rectLight = new THREE.RectAreaLight(0xffffff, intensity, width, height);
    rectLight.position.set(5, 5, 0);
    rectLight.lookAt(0, 1.5, 0);
    scene.add(rectLight)
    // const rectLightHelper = new RectAreaLightHelper(rectLight);
    // rectLight.add(rectLightHelper);

    const EMLight = new THREE.HemisphereLight(0xffacac, 0xcdcdcd, 1);
    EMLight.position.set(2, 5, 2);
    EMLight.lookAt(0, 0, 0);
    scene.add(EMLight);

    // Directional Light(s)
    const dirLight1 = new THREE.DirectionalLight(0xffacac, 3);
    dirLight1.position.set(4, 4, 4);
    dirLight1.lookAt(0, 0.5, 0);
    dirLight1.castShadow = true;
    //Set up shadow properties for the light
    dirLight1.shadow.mapSize.width = 4096; // default
    dirLight1.shadow.mapSize.height = 4096; // default
    dirLight1.shadow.camera.near = 0.001; // default
    dirLight1.shadow.camera.far = 100000; // default
    dirLight1.shadow.radius = 15;
    dirLight1.shadow.blurSamples = 25;
    scene.add(dirLight1);
    // const helper = new THREE.DirectionalLightHelper(dirLight1,3);
    // scene.add(helper);

    // const dirLight2 = new THREE.DirectionalLight(0xcdcdcd, .7);
    // dirLight2.position.set(-1, 3, 1);
    // dirLight2.position.set(-1, 3, 1);
    // dirLight2.lookAt(0,0,0);
    // scene.add(dirLight2);

    // Add to context: scene
    context.add({ 'name': "scene", 'obj': scene });

    stage_set_skydome();

    stage_set_props();

    console.groupEnd();
    return scene;
  };

  /**
   * Set dynamic or otherwise procedural props meshes and  items used in scenes.
   * @private
   * @function
   */
  const stage_set_props = () => {
    console.group("stage_set_props");
    // Ocean prop
    const waterGeometry = new THREE.PlaneGeometry(100, 100);
    const water = new Water(
      waterGeometry,
      {
        textureWidth: 512,
        textureHeight: 512,
        waterNormals: new THREE.TextureLoader().load(`${context.get.config.genericTexturesDefaultDir}${context.get.config.props.sea_shadder.normals}`,
          texture => {
            texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
          }),
        sunDirection: new THREE.Vector3(),
        sunColor:0xffffff,
        waterColor:0x001e0f,
        distortionScale: .3,
        fog: context.get.scene.fog !== undefined
      }
    );

    // water is flat
    water.rotation.x = -Math.PI / 2;
    water.name='ocean_water';

    //water has ridges
    water.material.uniforms[ 'size' ].value = 32;

    context.get.scene.add(water);

    // Add custom render for water prop
    const waterCallback = () => {
      water.material.uniforms[ 'time' ].value += 0.273 / 60.0;
    };

    // Add custom render to render stack
    context.get.config.customRenderStack.push(waterCallback);
    context.get.config.customRender = true;
    
    console.groupEnd();
  };

  /**
   * Custom Render call that can get rules attached to execute as stored callbacks per render iteration.
   * 
   */
  const render = () =>{
    // if enabled
    if (context.get.config.customRender) {
      for (const renderItem of context.get.config.customRenderStack) {
        if (typeof renderItem === 'function'){
          renderItem();
        }
      }
    }
  };


  /**
   * In the early setup the change sky Handler is still not capable of adapting scene elements, we must use direct calls.
   * @private
   * @function
   */
  const stage_set_skydome = () => {
    console.group("stage_set_skydome");
    const tex_src = context.get.config.skydomeTexturesDefaultDir + context.get.config.skydome.textures[
      context.get.config.sceneDefaultStage
    ];

    console.log("stage_set_skydome started", tex_src);
    // EnvMap and skybox
    try {
      // Load an equirect and set
      new THREE.TextureLoader().load(tex_src,
        //'/hdri/kloofendal_48d_partly_cloudy_puresky_4k_web.jpg',
        texture => {
          texture.name = "Original skydome";
          console.log(`start ${texture.name}`);
          texture.wrapS = THREE.RepeatWrapping;
          texture.repeat.x = -1;
          texture.mapping = THREE.EquirectangularReflectionMapping;
          texture.colorSpace = THREE.SRGBColorSpace;
          texture.flipY = true;
          context.get.scene.background = texture;
          context.get.scene.environment = texture;

          // Use skybox addon (GroundedSkybox takes height + radius as constructor args)
          const skybox = new GroundedSkybox(texture, 20, 200);
          skybox.name = "Original Skybox";
          skybox.scale.setScalar(100);
          skybox.visible = false;
          context.get.scene.add(skybox);

          // Add to context: envMap
          context.add({ "name": "envMap", "obj": texture });

          // Add to context: skybox
          context.add({ "name": "skybox", "obj": skybox });
        }
      );
    } catch (e) {
      console.log(`Environment Map: ${e.message}`);
    }
    console.groupEnd();
  };

  /**
   * The camera is created from standarized defaults, See {@link module:Context}.
   * @alias module:Project.setCamera
   * @returns {THREE.Camera} camera
   */
  const camera_set = () => {
    console.group("camera_set");
    // Import from context: config
    const config = context.get.config;

    // Import from context: coords
    const coords = context.coords;

    // Camera
    const camera = new THREE.PerspectiveCamera(
      config.cameraFov,
      config.cameraRatio,
      config.cameraNearFrustum,
      config.cameraFarFrustum,
    );

    // Camera offset
    const camera_pos = new THREE.Vector3().addVectors(coords.cam_offset, coords.target);
    console.log("Camera POS:", camera_pos);

    // Camera Position
    const { x, y, z } = camera_pos;
    camera.position.set(x, y, z);

    // Export camera
    window.THREE_camera = camera;

    // Add to context: camera
    context.add({ 'name': "camera", 'obj': camera });

    console.groupEnd();
    return camera;
  };
  /**
     * The Orbit Control system is used and instantiated from default values, See {@link module:Context}.
     * @alias module:Project.setControls
     * @returns {OrbitControls} controls
     * @async
     */
  const controls_set = async () => {
    console.group("controls_set");
    const controls_promise = new Promise((resolve, reject) => {
      console.log("controls start");
      const controls = new OrbitControls(
        context.get.camera,
        context.get.renderer.domElement
      );
      controls.listenToKeyEvents(window); // Optional.
      controls.enableDamping = true;
      controls.enablePan = false;
      controls.dampingFactor = 0.05;
      controls.screenSpacePanning = false;
      controls.minDistance = context.get.config.controlsMinDistance;
      controls.maxDistance = context.get.config.controlsMaxDistance;
      controls.maxPolarAngle = context.get.config.controlsMaxPolarAngle;
      controls.target = context.coords.target;
      controls.autoRotateSpeed = 3;
      controls.autoRotate = false;

      console.log("controls promise");
      if (controls) {
        resolve(controls);
      } else {
        reject((error) => {
          console.log(error.message);
        });
      }
    });

    controls_promise.then(
      (controls) => {
        console.log(["Controls Set", controls]);

        // Add event listeners
        controls.addEventListener('change', (e) => { Handlers.onControlsChange(e) });
        controls.addEventListener('start', (e) => { Handlers.onControlsStart(e) });
        controls.addEventListener('end', (e) => { Handlers.onControlsEnd(e) });

        // Export controls
        window.gltf_controls = controls;

        // Add to context
        context.add({ 'name': "controls", 'obj': controls });

      }
    ).catch(e => console.log(e.message));

    console.groupEnd();
    // Return controls promise
    return controls_promise;
  };

  /**
   * The Rederer is built from default values, See {@link module:Context}.
   * @alias module:Project.setRenderer
   * @returns {THREE.Renderer} renderer
   * @async
   */
  const renderer_set = async () => {
    console.group("renderer_set");
    const renderer_promise = new Promise((resolve, reject) => {
      const renderer = new THREE.WebGLRenderer();
      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1;
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFShadowMap;


      const r_target = document.querySelector("#canvasroot");
      r_target.appendChild(renderer.domElement);
      console.log(`renderer domElement: ${renderer.domElement}`);


      if (renderer) {
        resolve(renderer);
      } else {
        reject((error) => {
          console.log(error.message);
        });
      }
    });

    renderer_promise
      .then(
        (renderer) => {
          // Export renderer
          window.gltf_renderer = renderer;
          context.add({ 'name': 'renderer', 'obj': renderer });

          // On window resize.
          console.log(`Adding onWindowResize to window listeners`);
          window.addEventListener('resize', Handlers.onWindowResize);

          // reference self class
          const self = Project;
          // Recurse into self promise for Controls.
          self.setControls();
        })
      .catch((e) => {
        console.log(e.message);
      });

    console.groupEnd();
    return renderer_promise;
  };

  /**
   * @typedef {Object} ret 
   * @property {THREE.gltf} gltf - The loaded instance of a gltf file.
   * @property {THREE.AnimationMixer} mixer - The animation clip mixer.
   * @property {THREE.GLTFLoader} loader - Instance that can load additional gltf files.
   */
  /**
   * The GLTF file holds props and animations for one or more scenes.  We wait for a promise of the gltf to apply the mixer.
   * @alias module:Project.loadGltfScene
   * @returns {ret} Items created in the promise response.
   * @async
   */
  const gltf_scene_load = async () => {
    console.group("gltf_scene_load");
    const gltf_load_promise = new Promise((resolve, reject) => {
      try {
        // GLTF Loader
        console.log("Loader Starts");
        const loader = new GLTFLoader();
        // // Optional: Provide a DRACOLoader instance to decode compressed mesh data
        // const dracoLoader = new DRACOLoader();
        // dracoLoader.setDecoderPath( '/examples/jsm/libs/draco/' );
        // loader.setDRACOLoader( dracoLoader );


        loader.load(
          '/gltf/animated/animated.gltf',
          gltf => {

            // GLTF Scene
            const model = gltf.scene;

            // Name the Model
            model.name = "Product Scene";

            // Mixer
            const mixer = new THREE.AnimationMixer(model);

            //Add shadow receive/cast to all meshes
            model.traverse(
              node => {
                if (node.isMesh) {
                  if (node.name == 'Sky') {
                    node.material.side = THREE.BackSide;
                  } else {
                    //Culling aware material
                    node.material.side = THREE.FrontSide;
                    node.doubleSided = true;
                  }
                  // Apply Shadows
                  node.castShadow = true;
                  node.receiveShadow = true;
                }
              }
            );

            // Make the model content
            context.get.scene.add(model);

            console.log(`Loader gltf ready for ${model.name}`);

            resolve({ loader, gltf, mixer });
          },
          // called while loading is progressing
          xhr => {

            console.log((xhr.loaded / xhr.total * 100) + '% loaded');

          },
          // called when loading has errors
          error => {
            console.log(`There was an Error Loading the GLTF: ${error.message}`, error);
          }

        );
      } catch (e) {
        console.log(e.message);
        reject(e);
      }
    });

    gltf_load_promise.then((ret) => {

      // Destruct promise resolve
      const { loader, gltf, mixer } = ret;

      // Add to context: mixer
      context.add({ 'name': "mixer", 'obj': mixer });
      // Add to context: gltf
      context.add({ 'name': "gltf", 'obj': gltf });
      // Add to context: loader
      context.add({ 'name': "loader", 'obj': loader });

      // Add Event Listteners for mixer.
      mixer.addEventListener('finished', (e) => { Handlers.onMixerFinished(e) });
      mixer.addEventListener('loop', (e) => { Handlers.onMixerLoop(e) });

      // Init props and stage to default scene
      Handlers.sceneStageAnim('icosphere');

    }).catch((e) => console.log(e.message));
    console.groupEnd();
  };

  // Project return
  return {
    setStage: () => stage_set(),
    setCamera: () => camera_set(),
    setRenderer: () => renderer_set(),
    setControls: () => controls_set(),
    loadGltfScene: () => gltf_scene_load(),
    render: () => render(),
  };
})();

export { Project };