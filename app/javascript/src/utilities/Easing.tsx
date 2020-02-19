type Callback = (progress: number) => void

let Easing = {
  queueEasing: function(callback: Callback) {
    let now = new Date().valueOf()

    Easing.subqueue(now, now + 150, callback)
  },

  subqueue: function(start: number, end: number, callback: Callback) {
    let now = new Date().valueOf()

    if (now >= end) return

    let percentage = (now - start) / (end - start)
    let progress = Easing.easeInOutQuad(percentage)

    callback(progress)

    setTimeout(() => Easing.subqueue(start, end, callback), 10)
  },

  easeOutCubic: function(t: number) {
    return --t * t * t + 1
  },

  easeInCubic: function(t: number) {
    return t * t * t
  },

  easeInQuad: function(t: number) {
    return t * t
  },

  easeOutQuad: function(t: number) {
    return t * (2 - t)
  },

  easeInOutQuad: function(t: number) {
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t
  },

  linear: function(t: number) {
    return t
  }
}

export default Easing
