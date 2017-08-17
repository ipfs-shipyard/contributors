var shuffle = require('./array').shuffle
var eachSeriesThrottle = require('async-each-series-throttle')
var loadingDelayMs = 100

function tesselate (container) {
  var elements = container.querySelectorAll('.hex')
  var hexStyle = window.getComputedStyle(elements[0])
  var hexSpacing = parseInt(hexStyle.marginTop, 10) * 2
  var hexWidth = parseInt(hexStyle.width, 10) + hexSpacing
  var hexHeight = parseInt(hexStyle.height, 10) + hexSpacing

  var rows = container.querySelectorAll('.row')
  var rowWidth = Math.ceil(elements.length / rows.length) * hexWidth

  var hoverPaddingTop = (hexHeight * 0.2) / 2

  ;[].forEach.call(rows, function (row, i) {
    row.style.height = hexHeight + 'px'
    row.style.width = rowWidth + 'px'
    row.style.top = (hoverPaddingTop + (i * hexHeight * 0.75)) + 'px'
    if ((i % 2) === 1) {
      row.style.left = hexWidth / 2 + 'px'
    }
  })

  var slider = container.querySelector('.slide')
  slider.style.width = rowWidth + 'px'
  // No slide if content is < window width
  slider.className = rowWidth < window.innerWidth ? 'slide' : 'slide running'
}

function initContributorsSlider (container) {
  var elements = container.querySelectorAll('.hex')
  elements = shuffle([].slice.call(elements))

  window.requestAnimationFrame(function () {
    tesselate(container)
    window.addEventListener('resize', tesselate.bind(null, container))

    var rows = container.querySelectorAll('.row')
    var nextRow = 0

    for (var i = 0; i < elements.length; i++) {
      rows[nextRow].appendChild(elements[i])
      nextRow = (nextRow + 1) % rows.length
    }

    // Wait for the elements get added to the rows
    window.requestAnimationFrame(function () {
      for (var i = 0; i < elements.length; i++) {
        elements[i].className = 'hex loading'
      }

      eachSeriesThrottle(elements, initContributor, loadingDelayMs)
    })
  })
}

function initContributor (el, cb) {
  var img = el.querySelector('img')
  var show = function () { el.className = 'hex show' }

  if (img.complete) {
    window.requestAnimationFrame(function () {
      // Loaded successfully?
      if (img.naturalHeight === 0) {
        console.error('Failed to load ' + img.src)
        return cb()
      }
      show()
      cb()
    })
  } else {
    img.onload = function () {
      window.requestAnimationFrame(function () {
        show()
        cb()
      })
    }

    img.onerror = cb
  }
}

module.exports.initContributorsSlider = initContributorsSlider
