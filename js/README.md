# VirtuaBooth — Raspberry Pi 5 Three.js showroom.
Using three js to explore product showroom capabilities.<br>

## Features
This project functions as a virtual product showroom, so the following features were implemented<br>
  1. Aggregated configuration:<br>
      As the user progresses selecting the different sections (top level menu), they are given relevant choices to alter the overal configuration of the PI.
  2. Interactivity:<br>
      The user can change camera position, zoom, at will, as well as change the color of the outer casing.<br>
      Animation and movement are used as part of the user experience, pairing each separate section with a particular view point, while leaving configurations acquired across other sections active.
  3. Animation styles:<br>
      In order to control the behavior of the animation parts, the project differentiates between Tween, Actionstrip, and hybrid animation trails, which all can be controlled individually.<br>

      1. Tween: in order to simplify coordinate based animations, the tween.js library is imported, we then abstract a simplified variant of its "to" call and provide the functionality over the Handlers.simpleTween method.<br>
      The simpleTween method has the ability to target properties of actual three.js objects within a scene, like position.<br>
      We pass an object instance reference, an amount expressed as a vector, a timing amount in mil, and a callback to be triggered within the teewn's own "on complete" handler.<br>

      2. Actions: A clear dichotomy that has been learnt from this arrangement is that complex animations are best served as part of standarized animation capabilities in GLTF.<br>
      This animation type is defined in the 3D software providing the file, for this particular case Blender 3D was used.<br>
      In this project only very simple actions are used, although it is knows that GLTF can handle more complex NLA animation patterns.<br>

      3. Hybrid: Using logic patterns and naming conventions we can group sequences of both animation types to satisfy natural language requests like "add the active cooler" or "swap scene to grasslands".<br>
      We consider preferencial to have Tween animation relating to placement of camera, target and subject under Orbit Controls, and rely on the baked animation clips provided by the GLTF file for more complex movement, like the "spawn" animation of props between scenes.
      
  4. Scenery manager:<br>
      The scenery manager provides a base template for handling scenes as props, states, and environment configurations.<br>
      We use the interpolation of animation styles and user events to coordinate a scene transfer sequence.<br>

  5. State Management:<br>
      With simple timeout and context enabled flags we can give some simple state management, as shown with the iddle animation feature.<br>

  6. Advanced materials rendering:<br>
      From the "an attempt was made" department; PBR materials and shadder shadow/light tricks were attempted.<br>
      Special mention is the using of the traverse method available from THREE collections, which was used to set shadow settings to all materials on the scene.<br>

## Modules.
This project's code is broken up into functional chuncks we will be calling Modules.
  1. Context
  2. Handlers
  3. Project
  4. Raspberry
  5. Main

### Context
The context file contains a series of declarations stored as direct attribute references.<br>
It functions as a central state that modules can access as a bridge to cross module feature access.<br>

### Handlers
Contains the main logic that responds to all trigerred events related to the 3D canvas.<br>
Is a heavy user of the context instance and uses references to it to gather information for processing user events.<br>

### Project
Contains the commands required to trigger the THREE 3D engine and original state.<br>
This includes creating scene, camera, importing gltf file with props and related animations, creating a mixer and adding orbit controls.<br>

### Raspberry
The project file follows the project's namesake and contains the main animate loop, and the project supplied calls that start creating the environmentand loading the initial file.<br>

### Main
Not really a module, just the portion of javascript that runs in common sites, handles mouse clicks and interface events.<br>
Main will eventually call either Handler or Project module if it needs anything done directly in Three.js<br>
