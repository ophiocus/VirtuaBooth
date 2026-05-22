import * as THREE from 'three';
console.group('Context');
/**
 * The Context Module acts as a configuration and state manager and core file
 * @module Context
 */
const Context = (() => {
  // private
  const refs = [];

  /**
   * @member {object} get - get object is read writeable, but by convention we only use setter methods or static declarations.
   * @property {object} config - Assorted configuration values.
   * @property {float} config.controlsMinDistance - Minimum distance from control's interest.
   * @property {float} config.controlsMaxDistance - Maximum distance from control's interest.
   * @property {float} config.controlsMaxPolarAngle - Maximum relative angle to target.
   * @property {float} config.controlsOrbitScalar - A value used to amplify the camera position as a distance to target.
   * @property {number} config.cameraFov - Amplitude of the camera's viewing angle.
   * @property {number} config.cameraRatio - Calculated value of window height over window width.
   * @property {float} config.cameraNearFrustum - Camera near clipping
   * @property {float} config.cameraFarFrustum - Camera far clipping
   * @property {array} config.scenesAllowed - List of 'sea', 'grassland', 'snow','icosphere'
   * @property {string} config.sceneDefaultStage - The stage that will be presented on load.
   * @property {string} config.sceneCurrentStage - The current stage, used to prevent stacking animations for the same scene.
   * @property {string} config.sceneCurrentCase - The current case, used to prevent stacking animations for the case.
   * @property {array} config.animStack - The animations stack/queue array.
   * @property {array} config.tweenStack - The animations stack/queue array.
   * @property {string} config.currentAnimation - The animations stack/queue array.
   * @property {string} config.tweenCurrentAnimation - The current running animation.
   * @property {string} config.sceneCurrentAnimation - The current running scene transition.
   * @property {string} config.subject - The known center of atention of the scene.
   * @property {string} config.transitionTarget - A location in space used to place the subject and control targets during scene transitions.
   * @property {string} config.skydomeTexturesDefaultDir - The default dir to look for skydome textures.
   * @property {string} config.skydome - A collection of equirectangular textures that can be used for sky and environment maps.
   * @property {object} config.setTarget - A configuration object for the setTarget animation stacks.
   * @property {object} config.sceneStageAnim - A configuration object for the sceneStageAnim animation stacks.
   * @public
   *
   */
  const get = {};

  get.config = {
    // controls config
    controlsMinDistance: 0.01,
    controlsMaxDistance: 2,
    controlsMaxPolarAngle: Math.PI / 2 + 0.013, // Addition to PI/2 gives "underbelly" range.
    controlsOrbitScalar: 0.5,

    // camera config
    cameraFov: 75,
    cameraRatio: window.innerWidth / window.innerHeight,
    cameraNearFrustum: 0.001,
    cameraFarFrustum: 1000,

    //scene config
    scenesAllowed: ['sea', 'grassland', 'snow', 'icosphere'],
    sceneDefaultStage: 'icosphere',

    // scene state
    sceneCurrentStage: '',
    sceneCurrentCase: '',

    // animation state
    animStack: [],
    tweenStack: [],
    currentAnimation: '',
    tweenCurrentAnimation: '',
    sceneCurrentAnimation: '',

    // animation defaults
    setTarget: { concurrent: false },
    sceneStageAnim: { concurrent: true },

    // vars
    subject: 'Raspberry-pi_char',
    secToIddle: 30,
    transitionTarget: new THREE.Vector3(0.3, 1.5, -0.3),
    skydomeTexturesDefaultDir: '/hdri/',
    genericTexturesDefaultDir: '/textures/',

    // custom renders
    customRender: false,
    customRenderStack: [],

    // props
    props: {
      sea_shadder: {
        normals: 'waternormals.jpg',
      },
    },

    // Skydome
    skydome: {
      textures: {
        sea: 'kloofendal_48d_partly_cloudy_puresky_4k_web_high.jpg',
        grassland: 'resting_place_4k_web_high.jpg',
        snow: 'snowy_park_01_4k_web_high.jpg',
        icosphere: 'blender_1.jpg',
      },
    },
  };

  // Resources for co-ordinate based tasks
  /**
   * @member {object} coords - A repository of coordinates.
   * @property {Vector3} target - Initial position of the subject used as target for orbit controls.
   * @property {Vector3} cam_offset - Initial camera position.
   * @property {Vector3} sbc_offset_jump - "Jump" height for case animations.
   * @property {Vector3} mainmenuitem_the_rspb5 - Menu item target: the raspberry pi 5 section.
   * @property {Vector3} mainmenuitem_choose_a_case - Menu item target: choose a case section.
   * @property {Vector3} mainmenuitem_choose_a_setting - Menu item target: choose a setting section.
   * @property {Vector3} mainmenuitem_get_the_dash - Menu item target: get the dashboard section.
   * @property {Vector3} OrbitControls - Default main menu "all items off" position.
   * @public
   */
  const coords = {};

  // Target: the focus of active camera.
  coords.target = new THREE.Vector3(0, 0, 0);

  // Starter Camera Offset
  coords.cam_offset = new THREE.Vector3(-0.1, 0.12, 0.12);

  // Coords Case Jump
  coords.sbc_offset_jump = new THREE.Vector3(0, 0.05, 0);

  // Coords Iddle Anim
  coords.cam_iddle = new THREE.Vector3(0.35, 0.25, 0.35);

  // Declare constants for mainmenu items
  coords.mainmenuitem_the_rspb5 = new THREE.Vector3(
    -0.0006180860454328842,
    0.04624939079260929,
    0.028250765102542912
  );

  coords.mainmenuitem_choose_a_case = new THREE.Vector3(
    -0.04724561874697898,
    0.0433032177274813,
    0.09595054126085471
  );

  coords.mainmenuitem_choose_a_setting = new THREE.Vector3(
    0.15714604911339644,
    0.08720484760575102,
    0.14537740635671037
  );

  coords.mainmenuitem_get_the_dash = new THREE.Vector3(
    -0.00004109996207336898,
    0.054751816313224164,
    0.004975448153516626
  );

  coords.OrbitControls = new THREE.Vector3(
    0.00024953532007209,
    0.1523489105197233,
    0.0466039008184625
  );

  // Retrieve context item by name lookup.
  /**
   * @deprecated causes loss of linkage in deep objects.
   * @alias module:Context.getByName
   * @param {string} name The name of a stored Object.
   * @returns {Object|false}
   * @method
   */
  const getByName = (name) => {
    const namelookup = (item) => {
      return function (item) {
        return item.name == name;
      };
    };
    let objs = [];
    console.log(`Looking up ${name}:`);
    objs = refs.filter(namelookup(name));
    console.log(`Results for ${name}: ${objs.length}`);

    return objs ? objs : false;
  };

  /**
   * @typedef {Object} namedReference
   * @property {string} name - The object's desired name for storage.
   * @property {Object} obj - Link by reference to an instanced object.
   */

  /**
   * Add a properly formated object to the get context Object state
   * @alias module:Context.add
   * @param {namedReference} refObj
   */
  const add = (refObj) => {
    refs.push(refObj);
    get[refObj.name] = refObj.obj;
    console.log(`Added to context: ${refObj.name}`);
  };

  // Context return
  return {
    add: (refObj) => add(refObj),
    getByName: (name) => getByName(name),
    get: get,
    coords: coords,
  };
})();
// Export Context
window.gltf_context = Context;
export { Context };
console.groupEnd();
