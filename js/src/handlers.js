import * as THREE from 'three';
import { Context } from '/js/src/context.js';
import * as TWEEN from '@tweenjs/tween.js';

/**
 * Handlers is the core event router for interactivity.<br>
 * The handlers module implements the manners in which we want to resposnd to user and system events.
 * @module Handlers
 * @exports Handlers
 *
 * @todo Confirm naming convention of object definitions and scopes.
 */
const Handlers = (() => {
  /**
   * The Context constant provides a neutral scope to use as part of the state handling tasks. see {@link module:Context}
   * @name module:Handlers.context
   * @private
   *
   */
  const context = Context;

  /**
   * Animations Anim is the central action strip manager.<br>
   * It's behavior is polymorphic and dictated by the type of argument<br>
   * obj - string: obj represents a single animation contained in the current scene, it gets added to the tweenStack and play is invoked. <br>
   * obj - array: obj contains a list of animation names to play, it can also contain callback functions as array items. <br>
   * obj - object: obj contains configuration parameters as properties, eg 'concurrent':true
   *
   * @class
   * @name Handlers#animationAnim
   * @param {string|array|object} obj - A container of animation and callback instructions.
   * @alias module:Handlers.animationAnim
   *
   */
  const animationAnim = (obj = null) => {
    console.group('animationAnim');
    /**
     * Declaration of context.get.config
     * @name Handlers#animationAnim.context
     * @private
     */
    const config = context.get.config;

    /**
     * The current animation stack from config.animStack
     * @name Handlers#animationAnim.animStack
     * @private
     */
    const animStack = config.animStack;

    /**
     * add animation to animation stack.
     * @method
     * @name Handlers#animationAnim#add
     * @private
     * @param {string} animationName the name of an animation already existing within the scene.
     */
    const add = (animationName) => {
      animStack.push(animationName);
    };
    /**
     * play an animation from the animation stack
     * @method
     * @name Handlers#animationAnim#play
     * @private
     */
    const play = () => {
      if (context.get.config.animStack.length) {
        context.get.config.currentAnimation = context.get.config.animStack.shift();

        // triage current animation
        if (typeof context.get.config.currentAnimation === 'function') {
          // function request
          context.get.config.currentAnimation();
          context.get.config.currentAnimation = '';
          animationAnim();
        } else if (
          typeof context.get.config.currentAnimation === 'object' &&
          context.get.config.currentAnimation !== null &&
          context.get.config.currentAnimation.hasOwnProperty('concurrent')
        ) {
          console.log('CONCURRENT TWEEN', context.get.config.currentAnimation.concurrent);
          if (context.get.config.currentAnimation.concurrent === true) {
            while (context.get.config.animStack.length) {
              const animStack_item = context.get.config.animStack.shift();
              typeof animStack_item === 'string' ? simpleAnim(animStack_item) : animStack_item();
            }
          } else {
            animationAnim();
          }
        } else {
          console.log('GOING SIMPLE', context.get.config.currentAnimation);
          simpleAnim(context.get.config.currentAnimation);
        }
      }
    };

    // runtime logic
    if (Array.isArray(obj)) {
      // An array of animation names
      obj.map((animItem) => {
        add(animItem);
      });
      play();
    } else if (obj !== null && typeof obj === 'string') {
      // A single animation
      add(obj);
      play();
    } else {
      play();
    }
    console.groupEnd();
  };

  /**
   * Tweening Tween is the central Tween manager.<br>
   * It has a polymorphic behaviour that is trigerred by the type of the param content:<br>
   * obj - array: obj represents a sequence of tweens, each an array in itself.<br>
   * obj - object: obj is an configuration object whose attributes are parsed for values, eg.- concurrent.<br>
   *
   * @class
   * @name Handlers#tweeningTween
   * @param {array|object|null} obj - A container of Tween and callback instructions.
   * @alias module:Handlers.tweeningTween
   */
  const tweeningTween = (obj = null) => {
    console.group('tweeningTween');
    const tweenStack = context.get.config.tweenStack;

    /**
     * The add method takes a tween animation array or a configuration object and adds it to the context tweenStack. see {@link module:Context}
     * @method
     * @name Handlers#tweeningTween#add
     * @param {array} obj An array that contains instructions for a TWEEN animation.
     * @private
     */
    const add = (obj) => {
      tweenStack.push(obj);
    };

    /**
     * The play method relies on the Context instance, gathering information from the tweenStack. See {@link module:Context#}
     *
     * @method
     * @name Handlers#tweeningTween#play
     * @private
     */
    const play = () => {
      if (context.get.config.tweenStack.length) {
        if (
          typeof context.get.config.tweenStack[0] === 'object' &&
          context.get.config.tweenStack[0].concurrent
        ) {
          // purge config
          const purge = context.get.config.tweenStack.shift();
          console.log('CONCURRENT PLAY', purge);
          playConcurrent();
        } else {
          context.get.config.tweenCurrentAnimation = context.get.config.tweenStack.shift();
          simpleTween(
            context.get.config.tweenCurrentAnimation[0],
            context.get.config.tweenCurrentAnimation[1],
            context.get.config.tweenCurrentAnimation[2]
              ? context.get.config.tweenCurrentAnimation[2]
              : 700,
            context.get.config.tweenCurrentAnimation[3]
              ? context.get.config.tweenCurrentAnimation[3]
              : null
          );
        }
      }
    };

    /**
     * The play concurrent method consumes the tweenStack in a single iteration and doesnt wait for event loops to complete
     *
     * @method
     * @name Handlers#tweeningTween#playConcurrent
     * @private
     */
    const playConcurrent = () => {
      for (const anim of tweenStack) {
        simpleTween(anim[0], anim[1], anim[2] ? anim[2] : 700, anim[3] ? anim[3] : null);
        context.get.config.tweenStack = [];
      }
    };

    // runtime logic
    if (Array.isArray(obj)) {
      // An array of animation names
      obj.map((tweenItem) => {
        add(tweenItem);
      });
      play();
    } else {
      // obj is null or malformed
      play();
    }
    console.groupEnd();
  };

  /**
   * Change Sky manipulates the texture of the skybox mesh.
   * @alias module:Handlers.changeSky
   * @param {string} tex_ - A texture file name available in the default textures folder.
   */
  const changeSky = (tex_ = 'blender_1.jpg') => {
    console.group('changeSky');
    try {
      const tex = `/hdri/${tex_}`;

      // Import from context: scene
      const scene = context.get.scene;

      // Import from context: gltf
      const gltf = context.get.gltf;
      const obj = gltf.scene.getObjectByName('Sky');

      // Import from context: renderer
      const renderer = context.get.renderer;

      // Import writeable from context: skybox
      const skybox = context.get.skybox;

      // Legacy emissive 'Sky' mesh retired — the sky renders via scene.background
      // (SOTA equirect background + IBL). Hide the GLTF Sky mesh if present.
      if (obj) {
        obj.visible = false;
      }

      // Texture loader for the Sky Dome and Ground Projected Sky Box
      new THREE.TextureLoader().load(
        tex,
        (texture) => {
          try {
            //Update Texture for the SkyDome.
            texture.flipY = false;
            texture.wrapS = THREE.RepeatWrapping;
            texture.repeat.x = -1;
            texture.mapping = THREE.EquirectangularReflectionMapping;
            texture.colorSpace = THREE.SRGBColorSpace;

            // (Sky mesh hidden; the equirect drives scene.background + environment.)

            // // Reflog skybox
            const bgtex = texture.clone();
            bgtex.flipY = true;
            // const rebox = new GroundProjectedSkybox(bgtex);
            // rebox.name = `Rebox for ${tex_}`;
            // rebox.scale.setScalar(100);
            // rebox.height = 20;
            // rebox.radius = 200;
            // console.log(`Rebox tex ${tex_}`);

            // Swap Skybox
            // scene.add(rebox);
            // scene.remove(skybox);

            // Update texture for the background
            // Background and environmnet
            scene.background = bgtex;
            scene.environment = bgtex;

            // Exposure is configured once in renderer_set (no per-sky override).
          } catch (e) {
            console.error(e.message);
          }
        },
        // called while loading is progressing
        (xhr) => {
          console.log((xhr.loaded / xhr.total) * 100 + '% loaded');
        },
        // called when loading has errors
        (error) => {
          console.log(`There was an Error Loading the GLTF: ${error.message}`, 'error');
        }
      );
    } catch (e) {
      console.log(`changeSky ${e.message}`);
    }
    console.groupEnd();
  };

  /**
   * Simple Anim executes parametrized animation strips or the content of a callback.
   * @alias module:Handlers.simpleAnim
   * @param {string|function} anim - An animation clip string to play, or a callback function.
   */
  const simpleAnim = (anim = false) => {
    console.group('simpleAnim');
    console.log('anim:', anim);
    try {
      !anim
        ? () => {
            throw new Error('simpleAnim error: anim param not provided');
          }
        : '';

      // Import from context: mixer
      const mixer = context.get.mixer;

      // Import from context: gltf
      const gltf = context.get.gltf;

      // Get clip
      const clips = gltf.animations;
      const clip = THREE.AnimationClip.findByName(clips, anim);

      // Build animation action
      const action = mixer.clipAction(clip);
      action.repetitions = 1;
      action.clampWhenFinished = true;

      // Play reversed if extended
      if (action.paused) {
        action.reset();
        action.timeScale *= -1;
      }
      action.play();
    } catch (e) {
      console.log(`e.message: ${e.message}`);
    }
    console.groupEnd();
  };

  /**
   * Simple Tween takes the movement, timing, and objective parameters to create TWEEN slerped animations, it can implement a callback as part of the tween on complete event.
   * @alias module:Handlers.simpleTween
   * @param {object} target - Reference to a Scene instantiated 3D object tweenable property
   * @param {THREE.Vector3 | THREE.color} vector - The amount to tween, expressed in either color or Vector3
   * @param {number} speed - Time in milliseconds to spend animating
   * @param {function} callback - Callback code to be executed on completion.
   */
  const simpleTween = (target, vector, speed = 700, callback = null) => {
    console.group('simpleTween');
    console.log(target);
    // A tween stack can carry a leading config marker (e.g. { concurrent: false });
    // when that marker reaches here the target is not a tweenable object. Skip the
    // tween but keep draining the queue so the chain and its callbacks still run.
    if (!target || typeof target !== 'object') {
      if (callback) callback();
      tweeningTween();
      console.groupEnd();
      return;
    }
    try {
      new TWEEN.Tween(target, context.get.tweenGroup)
        .to(vector, speed)
        // .onUpdate() lerp maybe
        .easing(TWEEN.Easing.Cubic.InOut)
        .start()
        .onStart((e) => {
          context.get.config.tweenCurrentAnimation = 'SimpleTween';
        })
        .onComplete((e) => {
          context.get.config.tweenCurrentAnimation = '';
          if (callback) {
            callback();
          }
          tweeningTween();
        });
    } catch (e) {
      console.log(e);
    }
    console.groupEnd();
  };

  /**
   * Feature Anim received a desired animation set to follow which is defined in its switch.
   * This feature is then built up of tweens and animations.
   * @alias module:Handlers.featureAnim
   * @param {string} feature - A convention of a given feature.
   * @returns void
   */
  const featureAnim = (feature) => {
    console.group('featureAnim');
    // prevent stacking animations
    if (context.get.config.currentAnimation !== '') {
      return;
    }

    // Place the camera
    simpleTween(
      // Target
      context.get.camera.position,
      // Vector
      new THREE.Vector3().addVectors(
        new THREE.Vector3(-0.0712, 0.112, 0.101),
        context.get.stageProps.bootProps[context.get.config.sceneCurrentStage].target.positionTo
      ),
      // Speed
      700,
      // Callback
      () => console.log(`${feature} Camera Tween`)
    );

    // feature animation sequences
    switch (feature) {
      case 'activeCooler':
        console.log('ACTIVE COOLER TRIGGER', context.get.config.sceneCurrentCase);
        context.get.config.sceneCurrentCase !== '' // Terniary is the question asked
          ? animationAnim([
              context.get.config.sceneCurrentCase,
              'Active-CoolerAction',
              context.get.config.sceneCurrentCase,
            ]) // Terniary replaces if else
          : animationAnim(['Active-CoolerAction']); // Terniary is the statement
        break;

      case 'sdCard':
        animationAnim('SD_CARD_Action');
        break;
      default:
      // Wonder about the new normal.
    }
    iddleAnim();
    console.groupEnd();
  };

  /**
   * The Section Tween generates camera movement that does not interfere with the scene.<br>
   * Section tweens
   * @alias module:Handlers.SectionTween
   * @param {string} target_id - A convention of a given coordinates entry, see {@link module:Context}.
   * @returns void
   */
  const SectionTween = (target_id) => {
    console.group('SectionTween');
    const tweenStack = [
      [
        context.get.controls.object.position,
        new THREE.Vector3().addVectors(context.coords.target, context.coords[target_id]),
      ],
      [context.get.controls.target, context.coords.target],
    ];

    tweeningTween(tweenStack);
    iddleAnim();
    console.groupEnd();
  };

  /**
   * Response to the color-picker event. The function destructs the color and transfors it from 0-255 to 0-1 range per channel.
   * @alias module:Handlers.onColorTweenColor
   * @param {object} color - A convention of a given color coordinate.
   * @param {number} color.r - Red Channel
   * @param {number} color.g - Green Channel
   * @param {number} color.b - Blue Channel
   * @returns void
   */
  const onColorTweenColor = (color) => {
    console.group('onColorTweenColor');
    const { r, g, b } = color;
    simpleTween(context.get.scene.getObjectByName('Cases_char').children[0].material.color, {
      r: r / 255,
      g: g / 255,
      b: b / 255,
    });
    console.groupEnd();
  };

  /**
   * The case Char(acter) Anim(ation) handles an individual object state within context parameters,
   * using them to process logic for the animation requirement.
   * @alias module:Handlers.caseCharAnim
   * @param {string} anim - A pre-established case animation.
   * @returns void
   */
  const caseCharAnim = (anim) => {
    console.group('char');

    // import from context, current animation
    const anim_check = context.get.config.currentAnimation;
    const case_check = context.get.config.sceneCurrentCase;
    let caseTweenStack = [];
    context.get.config.currentAnimation = anim;

    console.log(anim_check, anim, case_check);
    // Case animations (from Blender Action to GLTF Animation, converted)
    // Bottom Animation
    const anim_bottom = 'CaseBottomAction';

    // Top Animations
    const anims_top = [
      'CaseTopAction',
      'CaseTopGpioAccessAction',
      'CaseTopHexagonsAction',
      'CaseTopPortAccessAction',
    ];

    // prevent overlapping animations.
    if ([...[anim_bottom], ...anims_top].includes(anim_check)) return;

    const bottomAction = context.get.mixer.clipAction(
      THREE.AnimationClip.findByName(context.get.gltf.animations, anim_bottom)
    );

    const anims_Stack = [];
    // Treat overlapping Animations to the active menu pattern
    // get all animations of top
    for (const anim_item of anims_top) {
      console.log('FOR: ', anim_item, anim, anim_check);
      const anim_runner = THREE.AnimationClip.findByName(context.get.gltf.animations, anim_item);
      const topAction = context.get.mixer.clipAction(anim_runner);
      const caseIsActive = bottomAction.time > 0 && topAction.time > 0 ? true : false;
      const caseIsStoped = bottomAction.time === 0 && topAction.time === 0 ? true : false;

      if (anim_item != anim) {
        console.log('anim_item != anim');
        if (caseIsActive) {
          console.log('anim_item != anim::caseIsActive', caseIsActive);
          anims_Stack.unshift(anim_item);
        } else {
          console.log('anim_item != anim::caseIsStoped', caseIsStoped);
        }
      } else {
        // Toggle current Bottom
        if (caseIsActive || caseIsStoped) {
          // Play or reverse Bottom into full loop.
          // caseTween does a little tweem-animation-tween sequence to try to prevent box from clipping with environment.
          caseTweenStack = [
            [
              context.get.scene.getObjectByName(context.get.config.subject).position,
              new THREE.Vector3().addVectors(
                context.get.stageProps.bootProps[context.get.config.sceneCurrentStage].target
                  .positionTo,
                context.coords.sbc_offset_jump
              ),
              caseIsActive ? 1400 : 300,
              simpleAnim(anim_bottom),
            ],
            [
              context.get.scene.getObjectByName(context.get.config.subject).position,
              context.get.stageProps.bootProps[context.get.config.sceneCurrentStage].target
                .positionTo,
              caseIsStoped ? 1400 : 300,
              () => {
                // Set context: sceneCurrentCase, currentAnimation
                context.get.config.sceneCurrentCase = caseIsActive ? '' : anim;
                context.get.config.currentAnimation = '';
              },
            ],
          ];

          if (caseIsActive) {
            anims_Stack.push(anim_item);
          }
        }
        context.get.config.sceneCurrentCase = caseIsActive ? '' : anim;
      }
    }

    // Toggle top
    anims_Stack.push(anim);

    // run animation and tween stacks
    animationAnim(anims_Stack);
    tweeningTween(caseTweenStack);
    iddleAnim();

    console.groupEnd();
  };

  /**
   * The Scene Stage Anim(ation) function takes care of orchestrating the transition between scenes.
   * Scenes are described as Context entries that are scanned for "props".
   * @alias module:Handlers.sceneStageAnim
   * @param {string} stage - The name of a scene already existing as a record in the context environment.
   * @returns void
   */
  const sceneStageAnim = (stage) => {
    console.group('sceneStageAnim');
    console.log(
      stage,
      context.get.config.sceneCurrentStage,
      context.get.config.sceneCurrentAnimation
    );
    // prevent running stage animation if stage is self
    if (context.get.config.sceneCurrentStage == stage) return;

    // prevent stacking stage transitions out of sync.
    if (context.get.config.sceneCurrentAnimation !== '') return;
    context.get.config.sceneCurrentAnimation = stage;
    // Object Target
    // in this project; the raspberry, mostly
    // The target exists because we want to have an objective for the purpose of the  Orbit Controls
    // Otherwise the Object Target represents the initial point of reference for other controls.

    // All the meshes that comprise a stage to put on scene
    // A Stage can be defined as all props that are active and visible within the skydome at any one given point.
    const stageProps = {
      // lights{}
      lights: {
        // sea[]
        sea: {
          // proplist
        },
        // grassland[]
        grassland: {
          // proplist
        },
        // snow[]
        snow: {
          // proplist
        },
      },
      // anim into place
      bootProps: {
        sea: {
          canoe: {
            spawnAnim: 'KenuAction',
          },
          paddle: {
            spawnAnim: 'woodenRowAction',
          },
          fishingRod: {},
          target: {
            positionTo: new THREE.Vector3(0, 0.47375, -2.652),
          },
        },
        grassland: {
          bench: {
            spawnAnim: 'BenchAction',
          },
          beer: {
            spawnAnim: 'BeerAction',
          },
          target: {
            positionTo: new THREE.Vector3(0, 0.71684, 0),
          },
        },
        snow: {
          sled: {
            spawnAnim: 'DogSledAction',
          },
          goggles: {
            spawnAnim: 'gogglesAction',
          },
          target: {
            positionTo: new THREE.Vector3(0.057598, 0.855723, -1.05209),
          },
        },
        icosphere: {
          icosphere: {
            spawnAnim: 'IcosphereAction',
          },
          target: {
            positionTo: new THREE.Vector3(0, 1.55, 0),
          },
        },
      },
      // external
      external: {
        sea: {},
        grassland: {},
        snow: {},
      },
      // scene, controls, renderer settings.
      settings: {
        sea: {},
        grassland: {},
        snow: {},
      },
      scenesAllowed: ['sea', 'grassland', 'snow', 'icosphere'],
      stageCurrentName: false,
    };

    // flog context for stageProps
    if (undefined === context.get.stageProps) {
      context.add({ name: 'stageProps', obj: stageProps });
    }

    // Start Scene animation
    // Lock controls
    context.get.controls.enabled = false;
    iddleAnim();
    const animQueue = [];

    try {
      animQueue.push({ concurrent: context.get.config.sceneStageAnim.concurrent });
      animQueue.push(() => {
        // animate target to safe height
        sceneStageAnim_setTarget(context.get.config.transitionTarget);
      });
      // get current stage, clear its props, if no stage set, clear all props
      const current_stage_spawn_anim = sceneStageAnim_getCurrentStage(
        context.get.stageProps.stageCurrentName
      ).filter(checkAnimationIsExtended);

      for (const stage_prop_anim_current of current_stage_spawn_anim) {
        console.log('WTF CURRENTS', stage_prop_anim_current);
        animQueue.push(stage_prop_anim_current);
      }

      // get listing of new props and iterate spawn animation for new stage
      const { Iteratable, target } = sceneStageAnim_getNextStage(stage);
      for (const stage_prop_anim_next of Iteratable) {
        console.log('WTF NEXT', stage_prop_anim_next);
        animQueue.push(stage_prop_anim_next);
      }

      animQueue.push(() => {
        if (
          undefined !== context.get.config.skydome.textures[context.get.config.sceneCurrentStage]
        ) {
          changeSky(context.get.config.skydome.textures[stage]);
        } else {
          changeSky(context.get.config.skydome.textures[context.get.config.sceneDefaultStage]);
        }

        context.get.config.sceneCurrentStage = stage;
        sceneStageAnim_setTarget(
          context.get.stageProps.bootProps[context.get.config.sceneCurrentStage].target.positionTo
        );
        context.get.controls.enabled = true;
        context.get.controls.MaxDistance = context.get.config.controlsMaxDistance;
      });
      // run the animation set
      animationAnim(animQueue);
    } catch (e) {
      // unLock controls
      context.get.controls.enabled = true;
    }
    console.groupEnd();
  };

  /**
   * Set Target is a private sub routine meant to place the camera rig and controls center of action along with the subject to a new position.
   * @alias module:Handlers.sceneStageAnim_setTarget
   * @private
   * @param {THREE.Vector3} coords A final destination for the target  and subject.
   */
  const sceneStageAnim_setTarget = (coords) => {
    console.group('sceneStageAnim_setTarget');
    const tweenstack = [
      // Make animation concurrent
      { concurrent: context.get.config.setTarget.concurrent },

      // Orbit Controls Target
      [context.get.controls.target, coords],

      // Camera
      [
        context.get.camera.position,
        new THREE.Vector3().addVectors(coords, context.coords.mainmenuitem_choose_a_setting),
      ],

      // Subject
      [
        context.get.gltf.scene.getObjectByName(context.get.config.subject).position,
        coords,
        700,
        () => {
          context.get.config.sceneCurrentAnimation = '';
        },
      ],
    ];
    tweeningTween(tweenstack);
    console.groupEnd();
  };

  /**
   * Fetches all props from all stages if no stage is defined
   * @alias module:Handlers.sceneStageAnim_getCurrentStage
   * @private
   * @param {string} stage The currently enabled stage.
   * @returns {array} an array of prop pointers.
   */
  const sceneStageAnim_getCurrentStage = (stage) => {
    console.group('sceneStageAnim_getCurrentStage');
    const sp = context.get.stageProps;
    let Iterated = [];
    if (!stage) {
      for (const allStages of sp.scenesAllowed) {
        const { Iteratable, target } = sceneStageAnim_getNextStage(allStages);
        if (Iteratable) {
          Iterated = [...Iterated, ...Iteratable];
        }
      }
    } else {
      const { Iteratable, target } = sceneStageAnim_getNextStage(stage);
      Iterated = Iteratable;
    }
    console.groupEnd();
    return Iterated;
  };

  /**
   * Looks up the required props to instantiate the scene by the provided stage string.
   * @alias module:Handlers.sceneStageAnim_getNextStage
   * @private
   * @param {string} stage The name of a pre existing stage from the context config object.
   * @returns {object} An object containing an array of prop names and a vector of the subject target for this scene.
   */
  const sceneStageAnim_getNextStage = (stage) => {
    console.group('sceneStageAnim_getNextStage');
    const sp = context.get.stageProps;
    const Iteratable = [];
    let target;

    for (const propType in sp) {
      if (sp[propType].hasOwnProperty(stage) && Object.keys(sp[propType][stage]).length > 0) {
        for (const prop in sp[propType][stage]) {
          console.log(prop);
          if (sp[propType][stage][prop].hasOwnProperty('spawnAnim')) {
            Iteratable.push(sp[propType][stage][prop]['spawnAnim']);
            target = sp[propType][stage]['target'];
          }
        }
      }
    }
    console.log('sceneStageAnim_getNextStage', stage, Iteratable, target);
    console.groupEnd();
    return { Iteratable, target };
  };

  /**
   * Simple timeout manager, articulates the camera and starts auto rotate mode after a set period of time.
   *
   * @alias module:Handlers.iddleAnim
   */
  const iddleAnim = () => {
    console.group('iddleAnim');

    const timeToIddle = context.get.config.secToIddle;

    if (context.get.config.timeoutToIddle) {
      context.get.controls.autoRotate = false;
      window.clearTimeout(context.get.config.timeoutToIddle);
    }

    context.get.config.timeoutToIddle = window.setTimeout((e) => {
      simpleTween(
        context.get.camera.position,
        new THREE.Vector3().addVectors(context.get.controls.target, context.coords.cam_iddle)
      );
      context.get.controls.autoRotate = true;
      console.log('ahem');
    }, timeToIddle * 1000);
    console.groupEnd();
  };

  /**
   * Check if an animation has been rolled out to its extended position for a given prop.
   * @alias module:Handlers.checkAnimationIsExtended
   * @private
   * @param {string} spawnAnim String that contains the name of a prop animation.
   * @returns void
   */
  const checkAnimationIsExtended = (spawnAnim) => {
    console.group('checkAnimationIsExtended');
    const saAction = context.get.mixer.clipAction(
      THREE.AnimationClip.findByName(context.get.gltf.animations, spawnAnim)
    );
    console.groupEnd();
    return saAction.time > 0 && saAction.paused === true ? true : false;
  };

  /**
   * Console based tool that gives out re usable local coordinates for posing the camera.
   *
   * @alias module:Handlers.getStarterView
   */
  const getStarterView = () => {
    console.group('getStarterView');
    const anim_start = {};
    // Import from context
    const camera = context.get.camera;

    // Import from context
    const controls = context.get.controls;

    // Define anim points used
    anim_start.camera_position = camera.position;

    // calculate relative camera position
    console.log(camera.position, controls.target);
    anim_start.relative_camera_position = camera.position.addScaledVector(controls.target, -1);
    anim_start.target = controls.target;
    anim_start.camera_rotation = camera.rotation;
    anim_start.object_rotation = controls.object.rotation;
    anim_start.azimuthal = controls.getAzimuthalAngle();
    anim_start.q = controls.object.quaternion;

    console.log(anim_start);
    console.groupEnd();
  };

  // Event Listensers

  /**
   * Handler renderer reflog on window resize.
   * @listens resize
   * @alias module:Handlers.onWindowResize
   */
  const on_window_resize = () => {
    try {
      // Import from context: camera
      const camera = context.get.camera;
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();

      // Import from context: renderer
      const renderer = context.get.renderer;
      renderer.setSize(window.innerWidth, window.innerHeight);

      //animate();
    } catch (e) {
      console.log(`onWindowResize: ${e.message}`);
    }
  };

  /**
   * Handler Animation clip loop event
   * @listens loop
   * @alias module:Handlers.onMixerLoop
   * @param {object} e Event object.
   */
  const on_AnimationClip_loop = (e) => {
    console.log('LOOP!', e);
  };

  /**
   * Handler Animation clip finished event
   * @alias module:Handlers.onMixerFinished
   * @param {object} e Event object
   */
  const on_AnimationClip_finished = (e) => {
    console.log('Animation clip finished: ', e.action._clip.name, e);
    context.get.config.currentAnimation = '';
    // Attempt next animation in queue if any.
    animationAnim();
  };

  /**
   * Receive the event from Orbit Controls activated by the user.
   * @alias module.Handlers.onControlsChange
   * @listens change
   * @param {object} e Event Object.
   */
  const on_controls_change = (e) => {};

  /**
   * Receive the event from Orbit Controls when user starts interaction.
   * @alias module:Handlers.onControlsStart
   * @param {object} e
   * @listens start
   *
   */
  const on_controls_start = (e) => {
    context.get.controls.autoRotate = false;
  };

  /**
   * Receive the event from Orbit Controls when user starts interaction.
   *
   * @alias module:Handlers.onControlsEnd
   * @param {object} e Event object.
   * @listens end
   */
  const on_controls_end = (e) => {
    iddleAnim();
  };

  // Handlers return
  return {
    animationAnim: (anim) => animationAnim(anim),
    changeSky: (tex_) => changeSky(tex_),
    simpleAnim: (anim) => simpleAnim(anim),
    getStarterView: () => getStarterView(),
    SectionTween: (tid) => SectionTween(tid),
    onMixerFinished: (e) => on_AnimationClip_finished(e),
    onMixerLoop: (e) => on_AnimationClip_loop(e),
    onWindowResize: () => on_window_resize(),
    caseCharAnim: (anim) => caseCharAnim(anim),
    sceneStageAnim: (anim) => sceneStageAnim(anim),
    featureAnim: (feature) => featureAnim(feature),
    onColorTweenColor: (color) => onColorTweenColor(color),
    onControlsChange: (e) => on_controls_change(e),
    onControlsStart: (e) => on_controls_start(e),
    onControlsEnd: (e) => on_controls_end(e),
  };
})();

// Handler exports
window.Handlers = Handlers;

export { Handlers };
