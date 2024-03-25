export default class ProgressBar {
   // Radius circle
   #radius = 50
   // Central position
   #positionCircle = 50
   // Size svg
   #size = 100
   // Default options
   static defaultOptions = {
      min: 0,
      max: 100,
      current: 60,
      clockwise: true,
      angle: -90,
      animation: {
         duration: 2000,
         trigger: false,
         cb: (current) => { },
         timeFunc: (time, current, duration, min) => {
            current -= min
            time /= duration
            return current * time * time + min
         },
      },
      text: {
         formatText: (current) => `${current}`
      },
   }
   // Constructor
   constructor(renderElement, newOptions) {
      // If there is no element
      if (!renderElement)
         return

      // Render element
      this.renderElement = renderElement
      // this.options = Object.assign(ProgressBar.defaultOptions, newOptions)
      this.options = {
         ...ProgressBar.defaultOptions, ...newOptions,
         animation:
            newOptions?.animation === false ?
               newOptions?.animation :
               { ...ProgressBar.defaultOptions.animation, ...newOptions?.animation, },
         text:
            newOptions?.text === false ?
               newOptions?.text :
               { ...ProgressBar.defaultOptions.text, ...newOptions?.text, },
      }
      // Options [min value, max value, current value]
      this.min = +this.renderElement.dataset.min || this.options.min
      this.max = +this.renderElement.dataset.max || this.options.max
      this.current = +this.renderElement.dataset.current || this.options.current
      // Direction clockwise or counterclockwise (Bool)
      this.clockwise = this.renderElement.dataset.clockwise || this.options.clockwise
      // Angle progress
      this.angle = +this.renderElement.dataset.angle || this.options.angle
      // Text in circle
      this.generateText = !!this.options.text
      // Play animation immediately or by trigger
      this.trigger = this.options.animation?.trigger
      // Duration animation
      this.duration = this.renderElement.dataset.duration || this.options.animation?.duration
      // Timing function for animation
      this.timeFunc = this.options.animation?.timeFunc
      // Callback
      this.cb = this.options.animation?.cb
      // Function for format text in circle
      if (this.generateText)
         this.funcFormatText = this.options.text.formatText

      // Render
      this.render()
   }
   // Progressbar output in render element
   render() {
      // Create all svg
      this.#createSvg()
      // Paste svg element
      this.renderElement.append(this.svg)
      // Add attributes
      this.#setAttributes(this.svg, {
         width: this.#size,
         height: this.#size,
         viewBox: `0 0 ${this.#size} ${this.#size}`,
         class: 'progress-bar-svg',
      })
      this.#setAttributes(this.track, {
         cx: this.#positionCircle,
         cy: this.#positionCircle,
         r: this.getRadius(this.track),
      })
      if (this.text) {
         this.#setAttributes(this.text, {
            x: this.#positionCircle,
            y: this.#positionCircle,
            'text-anchor': 'middle',
            dy: '0.346em'
         })
      }
      // Start
      if (this.trigger)
         this.setText(this.min)
      else
         this.initProgress()
   }
   // Set progress
   initProgress(current = this.current, cb) {
      this.current = current

      if (this.options.animation) {
         // For animation
         this.animation({
            current,
            duration: this.duration,
            cb,
            timeFunc: this.timeFunc
         })
      } else
         // For static
         this.setProgress(this.current)
   }
   // Update progress value
   setProgress(current, cb) {
      // If current >= max || current <= min
      if (current >= this.max)
         current = this.max
      else if (current <= this.min)
         current = this.min

      // Set progress line
      this.#setAttributes(this.progress, {
         d: this.#createPath(
            this.getRadius(),
            this.angle,
            this.#getValidCurrentValue(current),
            JSON.parse(this.clockwise)
         ),
      })
      // Set text
      this.setText(Math.round(current))
      // // Calling a function CB
      if (cb)
         cb(current)
   }
   // Animation
   animation({ current = this.current, duration = this.duration, cb = this.cb, timeFunc = this.timeFunc }) {
      return new Promise((resolve) => {
         // Start of counting
         const start = new Date()
         // End of countdown
         const end = new Date().getTime() + duration
         // Update
         const update = () => {
            const time = Math.min(Date.now(), end) - start
            this.step = timeFunc(time, current, duration, this.min)

            this.setProgress(this.step, cb)
            if (time < duration) requestAnimationFrame(update)
            else resolve()
         }
         requestAnimationFrame(update)
      })
   }
   // Set text in tag text
   setText(current) {
      if (this.generateText)
         this.text.innerHTML = this.funcFormatText(current)
   }
   // Get radius
   getRadius() {
      return this.#radius - Math.max(parseFloat(this.#getStyle(this.track)), parseFloat(this.#getStyle(this.progress))) / 2;
   }
   // Get current value
   #getValidCurrentValue(value) {
      return Math.min(360, Math.max(0, (value - this.min) / (this.max - this.min) * 360));
   }
   // Create path
   #createPath(r, startAngle, angle, clockwise) {
      // Angle less than 0.3 deg create poor trajectories, 
      // Angle greater than 360 – rollback
      if (angle > 0 && angle < 0.3)
         angle = 0
      else if (angle > 359.999)
         angle = 359.999
      // Other settings
      const endAngle = startAngle + angle * (clockwise * 2 - 1)
      const startCoords = this.#polarToCartesian(r, startAngle)
      const endCoords = this.#polarToCartesian(r, endAngle)
      const x_1 = this.#positionCircle + startCoords.x
      const y_1 = this.#positionCircle + startCoords.y
      const x_2 = this.#positionCircle + endCoords.x
      const y_2 = this.#positionCircle + endCoords.y

      return `M ${x_1} ${y_1} A ${r} ${r} 0 ${+(angle > 180)} ${+clockwise} ${x_2} ${y_2}`
   }
   // Convert polar to cartesian
   #polarToCartesian(r, angle) {
      return {
         x: r * Math.cos(angle * Math.PI / 180),
         y: r * Math.sin(angle * Math.PI / 180)
      }
   }
   // Set attributes
   #setAttributes(element, attributesObject) {
      for (const attribute in attributesObject) {
         const value = attributesObject[attribute];
         element.setAttribute(attribute, value)
      }
   }
   // Create SVG element
   #createSvg() {
      // Create svg
      this.svg = document.createElementNS("http://www.w3.org/2000/svg", 'svg')
      // Create circle
      this.track = document.createElementNS("http://www.w3.org/2000/svg", 'circle')
      // Create path-element
      this.progress = document.createElementNS("http://www.w3.org/2000/svg", 'path')
      // Create text elemetn
      this.text = this.generateText ? document.createElementNS("http://www.w3.org/2000/svg", 'text') : ''
      // Paste
      this.svg.append(this.track, this.progress, this.text)
   }
   // # Get computed
   #getStyle(element) {
      return parseFloat(window.getComputedStyle(element)['stroke-width']) || 0
   }
}