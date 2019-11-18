const CookieConsent = function (options) {
  this.defaultsOptions = {
    name: 'cookie_consent_status',
    value: [],
    path: '/',
    domain: '',
    expiryDays: 365
  }
  this.options = this.mergeObjects(this.defaultsOptions, options)
  this.inputs = [].slice.call(document.querySelectorAll('[data-cc-consent]'))
  this.popup = document.querySelector('.cookie-consent-popup')
  this.saveButtons = [].slice.call(document.querySelectorAll('.cookie-consent-save'))
  this.openButtons = [].slice.call(document.querySelectorAll('.cookie-consent-open'))
  this.closeButtons = [].slice.call(document.querySelectorAll('.cookie-consent-close'))

  this.addEventListeners()
  if (typeof this.get() === 'undefined') {
    this.open()
  }
  this.refreshUI()
}

CookieConsent.prototype.open = function () {
  if (this.popup) {
    this.popup.classList.add('open')
  }
}

CookieConsent.prototype.close = function () {
  if (this.popup) {
    this.popup.classList.remove('open')
  }
}

CookieConsent.prototype.addEventListeners = function () {
  if (this.saveButtons.length > 0) {
    this.saveButtons.forEach((saveButton) => {
      let samespace = saveButton.getAttribute('data-cc-namespace')
      saveButton.addEventListener('click', () => {
        this.save(samespace)
      })
    })
  }
  if (this.openButtons.length > 0) {
    this.openButtons.forEach((button) => {
      button.addEventListener('click', () => {
        this.open()
      })
    })
  }
  if (this.closeButtons.length > 0) {
    this.closeButtons.forEach((button) => {
      button.addEventListener('click', () => {
        this.close()
      })
    })
  }
}

CookieConsent.prototype.save = function (namespace) {
  this.set(this.options)
  if (this.inputs.length > 0) {
    this.inputs.forEach((input) => {
      let inputNamespace = input.getAttribute('data-cc-namespace')
      if (inputNamespace === namespace) {
        let consent = input.getAttribute('data-cc-consent')
        if (input.checked) {
          this.add(consent)
        } else {
          this.remove(consent)
        }
      }
    })
  }
  this.refreshUI()
  this.afterSave(this)
}

CookieConsent.prototype.refreshUI = function () {
  const value = this.get()
  if (typeof value === 'undefined') {
    return
  }
  this.inputs.forEach((input) => {
    let consent = input.getAttribute('data-cc-consent')
    input.checked = this.has(consent)
  })
}

CookieConsent.prototype.set = function (options) {
  let d = new Date()
  d.setDate(d.getDate() + (options.expiryDays || 365))
  let cookie = [
    options.name + '=' + JSON.stringify(options.value),
    'expires=' + d.toUTCString(),
    'path=' + (options.path || '/')
  ]
  if (options.domain) {
    cookie.push('domain=' + options.domain)
  }
  document.cookie = cookie.join(';')
}

CookieConsent.prototype.get = function () {
  let string = '; ' + document.cookie
  let parts = string.split('; ' + this.options.name + '=')
  let value = parts.length !== 2 ? undefined : parts.pop().split(';').shift()
  if (typeof value !== 'undefined') {
    return JSON.parse(value)
  }
  return value
}

CookieConsent.prototype.has = function (consent) {
  const value = this.get()
  // return (typeof value !== 'undefined' && value.includes(consent))
  return (typeof value !== 'undefined' && value.indexOf(consent) > -1)
}

CookieConsent.prototype.add = function (consent) {
  let value = this.get()
  // if (typeof value !== 'undefined' && !value.includes(consent)) {
  if (typeof value !== 'undefined' && !value.indexOf(consent) > -1) {
    value.push(consent)
    const options = this.mergeObjects(this.defaultsOptions, { value: value })
    this.set(options)
    return true
  } else {
    return false
  }
}

CookieConsent.prototype.remove = function (consent) {
  let value = this.get()
  if (typeof value === 'undefined') {
    return false
  }
  let index = value.indexOf(consent)
  if (index > -1) {
    value.splice(index, 1)
    const options = this.mergeObjects(this.defaultsOptions, { value: value })
    this.set(options)
    return true
  } else {
    return false
  }
}

CookieConsent.prototype.clean = function (config) {
  for (let consent in config) {
    if (!this.has(consent)) {
      let cookies = config[consent]['cookies']
      for (let cookie in cookies) {
        this.set({
          name: cookies[cookie],
          expiryDays: -1
        })
      }
    }
  }
}

CookieConsent.prototype.mergeObjects = function () {
  var res = {}
  for (var i = 0; i < arguments.length; i++) {
    for (let x in arguments[i]) {
      if (arguments[i].hasOwnProperty(x)) {
        res[x] = arguments[i][x]
      }
    }
  }
  return res
}

CookieConsent.prototype.afterSave = function () {}

export default CookieConsent
