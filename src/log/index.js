var hg = require('hyperglue2')
var template = require('./message.html')

var outlet = document.querySelector('#log')

module.exports = function (html, className) {
  var message = hg(template, { _html: html })
  message.classList.add(className)
  outlet.appendChild(message)
  setTimeout(function () {
    message.classList.remove('before')
  }, 20)
  setTimeout(function () {
    message.classList.add('after')
    message.addEventListener('transitionend', onend)
    function onend () {
      message.removeEventListener('transitionend', onend)
      message.parentNode.removeChild(message)
    }
  }, 2520)
}