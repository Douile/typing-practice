const API = 'https://www.randomtext.me/api/gibberish/p-1/35-100';

class Race {
  constructor() {
    this.start = null;
    this.end = null;
    this.pos = 0;
    this.errors = 0;
    this.text = document.querySelector('.typerace-text');
    this.output = document.querySelector('.typerace-stats');
    this._text = this.text.textContent;
    this.setActive(0);
    this.render();
  }
  setActive(index) {
    this.text.querySelectorAll('span.active').forEach(e => e.classList.remove('active'));
    if (index !== null) this.text.children[index].classList.add('active');
  }
  input(char, clear) {
    if (this.start === null) this.start = new Date().getTime();
    if (char === this._text[this.pos]) {
      this.pos += 1;
    } else {
      this.errors += 1;
    }
    if (char === ' ') clear();
    if (this.pos >= this._text.length) {
      if (this.end === null) this.end = new Date().getTime();
      clear();
      return this.setActive(null);
    }
    this.setActive(this.pos);
    this.render();
  }
  render() {
    let content = ['Begin typing to start...', 'TIP: You don\'t need to use backspace'];
    if (this.start !== null) {
      let time = this.end === null ? new Date().getTime() : this.end;
      let duration = time-this.start;

      let cps = Math.round((this.pos+1)*100 / (duration/1000))/100,
      wps = Math.round(100*cps/4)/100,
      cpm = Math.round(cps*60*100)/100,
      wpm = Math.round(wps*60*100)/100,
      err = Math.round(this.errors/this.pos*100);
      content = [`${cps}CPS`, `${wps}WPS`, `${cpm}CPM`, `${wpm}WPM`, `${this.errors}Errors`, `${err}Error%`, `${Math.round(duration/1000)}s`];
    }

    let spans = this.output.querySelectorAll('span');
    if (spans.length < content.length) {
      for (let i=spans.length;i<content.length;i++) {
        this.output.appendChild(document.createElement('span'));
      }
      spans = this.output.querySelectorAll('span');
    }
    for (let i=0;i<spans.length;i++) {
      if (i<content.length) {
        spans[i].innerText = content[i];
      } else {
        this.output.removeChild(spans[i]);
      }
    }
  }
}

var _active = null;

function getText() {
  return new Promise((resolve,reject) => {
    fetch(API, {method:'GET',mode:'cors'}).then((res) => {
      res.json().then((json) => {
        resolve(json.text_out.replace(/<[^\>]+\>/g,''));
      }).catch(reject);
    }).catch(reject);
  })
}

async function load() {
  let text = await getText(), textDOM = document.querySelector('.typerace-text');
  removeChildren(textDOM);
  setText(textDOM, text);
  document.querySelector('.typerace-input').value = '';
  _active = new Race();
}

function removeChildren(element) {
  element.innerHTML = '';
}

function setText(element, text) {
  for (let i=0;i<text.length;i++) {
    let s = document.createElement('span');
    s.innerText = text[i];
    element.appendChild(s);
  }
}

window.addEventListener('load', async function() {
  await load();
  document.querySelector('.typerace-input').focus();
});
window.addEventListener('keydown', (e) => {
  if (e.target.tagName !== 'INPUT' || !e.target.classList.contains('typerace-input')) return;
  if (_active === null) _active = new Race();
  _active.input(e.key, () => {e.target.value=''});
});
window.addEventListener('click', (e) => {
  if (e.target.tagName !== 'A') return;
  switch (e.target.hash) {
    case '#restart':
    e.preventDefault();
    _active = new Race();
    break;
    case '#reload':
    e.preventDefault();
    load();
    break;
    default:
    console.log(e);
  }
})
