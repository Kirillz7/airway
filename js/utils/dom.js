(function (App) {
  'use strict';
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  function el(tag, attrs = {}, children = []) {
    const isSvg = ['svg', 'path', 'circle', 'g', 'polyline', 'rect', 'line'].includes(tag);
    const node = isSvg ? document.createElementNS('http://www.w3.org/2000/svg', tag) : document.createElement(tag);
    
    Object.entries(attrs).forEach(([k, v]) => {
      if (v == null) return;
      if (k === 'class') {
        if (isSvg) node.setAttribute('class', v);
        else node.className = v;
      }
      else if (k === 'html') node.innerHTML = v;
      else if (k === 'text') node.textContent = v;
      else if (k.startsWith('on') && typeof v === 'function') node.addEventListener(k.slice(2), v);
      else node.setAttribute(k, v);
    });
    (Array.isArray(children) ? children : [children]).forEach(c => {
      if (c == null) return;
      node.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
    });
    return node;
  }
  App.dom = { $, $$, el };
})(window.App = window.App || {});