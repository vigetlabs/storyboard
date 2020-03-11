(function() {
  var modal = document.getElementById('saveModal')
  var btn = document.getElementById('saveBtn')
  var span = document.getElementsByClassName('close')[0]
  btn.onclick = function() {
    modal.style.display = 'block'
  }
  span.onclick = function() {
    modal.style.display = 'none'
  }
  window.onclick = function(event) {
    if (event.target == modal) {
      modal.style.display = 'none'
    }
  }
  window.addEventListener('load', event => {
    if (!window.location.protocol.startsWith('http')) {
      // Offline version
      modal.style.display = 'none'
      btn.style.display = 'none'
    }
  })
})()
