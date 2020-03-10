var modal = document.getElementById('saveModal')
var btn = document.getElementById('saveBtn')
var span = document.getElementsByClassName('close')[0]
var modalStyle = 'none'
btn.onclick = function() {
  modalStyle = 'block'
  modal.style.display = modalStyle
}
span.onclick = function() {
  modalStyle = 'none'
  modal.style.display = modalStyle
}
window.onclick = function(event) {
  if (event.target == modal) {
    modalStyle = 'none'
    modal.style.display = modalStyle
  }
}
document.onkeydown = function(event) {
  if (event.ctrlKey || event.metaKey) {
    if (String.fromCharCode(event.which).toLowerCase() == 's') {
      modal.style.display = 'none'
      btn.style.display = 'none'
    }
  }
}

function a() {
  modal.style.display = modalStyle
  btn.style.display = 'block'
}

window.addEventListener('focus', a)
