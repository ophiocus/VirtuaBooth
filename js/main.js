console.group('main');
console.log('runtime');

/**
 * Main is not really a module, just 'main'
 * @module main
 */
/**
 * Provides event listeners for section checkboxes whenever they change.
 * @method
 *
 *
 */
const init_nav_checkboxes = () => {
  return document.querySelectorAll('nav.nav [type=checkbox]').forEach((box) => {
    console.log(`On change Handler: ${box.id}`);
    box.addEventListener('change', handle_checkbox_change);
  });
};

init_nav_checkboxes();

/**
 * Handle on checkbox change<br>
 * When all are false --> full Orbit Controls<br>
 * One is true --> controls lock animation, then full Orbit Control<br>
 * sub menu --> Model Action animation eg features, case or stage anim<br>
 * @function
 * @public
 */
function handle_checkbox_change() {
  document.querySelectorAll('nav.nav [type=checkbox]').forEach((box) => {
    if (box.id !== this.id)
      // Supress all boxes except this box.
      box.checked = false;
  });
  if (this.checked) {
    // Send actual tween to handlers
    Handlers.SectionTween(this.id);

    // Color picker selector
    if (this.id == 'mainmenuitem_choose_a_case') {
      document.getElementById('footer').classList.remove('hidden');
    } else {
      document.getElementById('footer').classList.add('hidden');
    }
  } else {
    // Orbit Control is starter position when all main tabs get closed
    Handlers.SectionTween('OrbitControls', true);
    document.getElementById('footer').classList.add('hidden');
  }
}

// event handler for gear
const on_gear = (e) => {
  document.getElementById('config_menu_items').classList.toggle('hidden');
  document.getElementById('config_menu_gear').classList.toggle('hidden');
};

// event listener for gear
document.getElementById('config_menu_gear').addEventListener('click', on_gear);

/**
 * Overly complex canvas based color picker.
 * @class Picker
 * @param {canvas} target - DOM canvas reference.
 * @param {number} width - Width.
 * @param {number} height - Height.
 */
class Picker {
  /**
   * The Color Picker constructor
   * @constructor
   * @param {canvas} target - DOM canvas reference.
   * @param {number} width - Width.
   * @param {number} height - Height.
   */
  constructor(target, width, height) {
    this.target = target;
    this.width = width;
    this.height = height;
    this.target.width = width;
    this.target.height = height;
    // Get context
    this.context = this.target.getContext('2d');

    // Circle
    this.pickerCircle = {
      x: 10,
      y: 10,
      width: 7,
      height: 7,
    };
    this.listenForEvents();
  }
  draw() {
    this.build();
  }

  build() {
    let gradient = this.context.createLinearGradient(0, 0, this.width, 0);
    gradient.addColorStop(0, 'rgb(255,0,0)');
    gradient.addColorStop(0.15, 'rgb(255,0,255)');
    gradient.addColorStop(0.33, 'rgb(0,0,255)');
    gradient.addColorStop(0.49, 'rgb(0,255,255)');
    gradient.addColorStop(0.67, 'rgb(0,255,0)');
    gradient.addColorStop(0.84, 'rgb(255,255,0)');
    gradient.addColorStop(1, 'rgb(255,0,0)');

    // fill it:
    this.context.fillStyle = gradient;
    this.context.fillRect(0, 0, this.width, this.height);

    // Apply black and white.
    gradient = this.context.createLinearGradient(0, 0, 0, this.height);
    gradient.addColorStop(0, 'rgba(255,255,255,1)');
    gradient.addColorStop(0.5, 'rgba(255,255,255,0)');
    gradient.addColorStop(0.5, 'rgba(0,0,0,0)');
    gradient.addColorStop(1, 'rgba(0,0,0,1)');
    this.context.fillStyle = gradient;
    this.context.fillRect(0, 0, this.width, this.height);

    // Circle
    this.context.beginPath();
    this.context.arc(
      this.pickerCircle.x,
      this.pickerCircle.y,
      this.pickerCircle.width,
      0,
      Math.PI * 2
    );
    this.context.strikeStyle = '3px';
    this.context.stroke();
    this.context.closePath();
  }

  listenForEvents() {
    let isMouseDown = false;

    const onMouseDown = (e) => {
      try {
        const clean_target = e.target.getBoundingClientRect();
        const currentX = e.clientX - clean_target.x;
        const currentY = e.clientY - clean_target.y;

        if (
          currentY > this.pickerCircle.y &&
          currentY < this.pickerCircle.y + this.pickerCircle.width &&
          currentX > this.pickerCircle.x &&
          currentX < this.pickerCircle.x + this.pickerCircle.width
        ) {
          isMouseDown = true;
          Handlers.onColorTweenColor(this.getPickedColor());
        } else {
          // It's a circle, think of width as diameter.
          this.pickerCircle.x = currentX - this.pickerCircle.width / 2;
          this.pickerCircle.y = currentY - this.pickerCircle.width / 2;
        }
        this.draw();
      } catch (e) {
        console.log(e.message);
      }
    };

    const onMouseMove = (e) => {
      if (isMouseDown) {
        const currentX = e.clientX - this.target.offsetLeft;
        const currentY = e.clientY - this.target.offsetTop;
        this.pickerCircle.x = currentX;
        this.pickerCircle.y = currentY;
      }
    };

    const onMouseUp = (e) => {
      isMouseDown = false;
      this.draw();
    };

    // Register
    this.target.addEventListener('mousedown', onMouseDown);
    this.target.addEventListener('mousemove', onMouseMove);
    this.target.addEventListener('mousemove', () => this.onChangecallback(this.getPickedColor()));
    document.addEventListener('mouseup', onMouseUp);
  }

  getPickedColor() {
    const imageData = this.context.getImageData(this.pickerCircle.x, this.pickerCircle.y, 1, 1);
    return { r: imageData.data[0], g: imageData.data[1], b: imageData.data[2] };
  }

  onChange(callback) {
    this.onChangecallback = callback;
  }
}

const picker = new Picker(document.getElementById('color-picker'), 250, 90);

picker.draw();

picker.onChange((color) => {
  const selected = document.getElementsByClassName('selected')[0];
  selected.style.background = `rgb(${color.r},${color.g},${color.b})`;
});

console.groupEnd();
