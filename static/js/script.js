(function () {
  var loadingDelayMs = 50

  function shuffle (a) {
    var j, x, i
    for (i = a.length; i; i--) {
      j = Math.floor(Math.random() * i)
      x = a[i - 1]
      a[i - 1] = a[j]
      a[j] = x
    }
    return a
  }

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
  }

  function initContributorsSlider (container) {
    container.querySelector('.slide').className = 'slide running'

    var elements = container.querySelectorAll('.hex')
    elements = shuffle([].slice.call(elements))

    tesselate(container)
    window.addEventListener('resize', tesselate.bind(null, container))

    var rows = container.querySelectorAll('.row')

    var nextRow = 0
    var lastRender = 0

    function initContributorWithPause (itemIndex) {
      if (itemIndex >= elements.length) return
      initContributor(elements[itemIndex], rows[nextRow], function (err) {
        var nextIndex = itemIndex + 1
        if (err) initContributorWithPause(nextIndex)
        var now = Date.now()
        var diff = now - lastRender
        var delay = loadingDelayMs - diff
        if (delay < 0) delay = 0
        lastRender = now
        nextRow = (nextRow + 1) % rows.length
        setTimeout(function () {
          initContributorWithPause(itemIndex + 1)
        }, delay)
      })
    }

    initContributorWithPause(0)
  }

  function initContributor (el, dest, cb) {
    var img = el.querySelector('img')
    var show = function () { el.className = 'hex show' }

    if (img.complete) {
      setTimeout(function () {
        // Loaded successfully?
        if (img.naturalHeight === 0) {
          return cb(new Error('Failed to load ' + el.src))
        }
        show()
        cb()
      }, 25)
    } else {
      img.onload = function () {
        setTimeout(function () {
          show()
          cb()
        }, 25)
      }

      img.onerror = cb
    }

    dest.appendChild(el)
  }

  window.initContributorsSlider = initContributorsSlider
})()
