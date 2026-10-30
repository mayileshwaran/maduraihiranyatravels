/* ==========================================================
   Madurai Hiranya Travels - Script
   Static site: every booking collects the customer's details in a form,
   then opens a pre-filled message to the company number. No backend.
   ========================================================== */
(function () {
  'use strict';

  // ---- Easy-to-edit settings ----
  var BOOKING_NUMBER = '919360009432'; // country code + number, no "+" or spaces
  var COMPANY = 'Madurai Hiranya Travels';

  function bookLink(message) {
    return 'https://wa.me/' + BOOKING_NUMBER + '?text=' + encodeURIComponent(message);
  }

  // ---- Navbar: sticky style on scroll + active link ----
  var nav = document.getElementById('mainNav');
  var sections = ['home', 'about', 'services', 'gallery', 'contact']
    .map(function (id) { return document.getElementById(id); })
    .filter(Boolean);
  var navLinks = document.querySelectorAll('.navbar-nav .nav-link');

  function onScroll() {
    nav.classList.toggle('scrolled', window.scrollY > 40);
    var pos = window.scrollY + 140;
    var current = sections[0].id;
    sections.forEach(function (s) { if (s.offsetTop <= pos) current = s.id; });
    navLinks.forEach(function (a) {
      a.classList.toggle('active', a.getAttribute('href') === '#' + current);
    });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // ---- Close mobile menu after tapping a link or button ----
  var menu = document.getElementById('navMenu');
  document.querySelectorAll('#navMenu .nav-link, #navMenu .btn').forEach(function (el) {
    el.addEventListener('click', function () {
      if (menu.classList.contains('show') && window.bootstrap) {
        bootstrap.Collapse.getOrCreateInstance(menu).hide();
      }
    });
  });

  // ---- Scroll reveal animation ----
  var revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('visible'); });
  }

  // ---- Booking form ----
  var modalEl = document.getElementById('bookingModal');
  var form = document.getElementById('bookingForm');
  var dateInput = document.getElementById('bkDate');
  var returnInput = document.getElementById('bkReturn');
  var tripSelect = document.getElementById('bkTrip');
  var returnWrap = document.getElementById('returnWrap');
  var serviceSelect = document.getElementById('bkService');

  function todayStr() {
    var t = new Date();
    return t.getFullYear() + '-' + String(t.getMonth() + 1).padStart(2, '0') + '-' + String(t.getDate()).padStart(2, '0');
  }

  function formatDate(v) {
    if (!v) return '';
    var p = v.split('-');
    return p[2] + '-' + p[1] + '-' + p[0];
  }

  function formatTime(v) {
    if (!v) return '';
    var p = v.split(':');
    var h = parseInt(p[0], 10);
    var suffix = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    return h + ':' + p[1] + ' ' + suffix;
  }

  function cleanMobile(v) {
    var digits = v.replace(/\D/g, '');
    if (digits.length === 12 && digits.indexOf('91') === 0) digits = digits.slice(2);
    if (digits.length === 11 && digits.charAt(0) === '0') digits = digits.slice(1);
    return digits;
  }

  function toggleReturn() {
    var round = tripSelect.value === 'Round Trip';
    returnWrap.style.display = round ? '' : 'none';
    if (!round) { returnInput.value = ''; returnInput.classList.remove('is-invalid'); }
  }

  dateInput.min = todayStr();
  returnInput.min = todayStr();
  toggleReturn();
  tripSelect.addEventListener('change', toggleReturn);
  dateInput.addEventListener('change', function () { returnInput.min = dateInput.value || todayStr(); });

  // Pre-select the service when a "Book Now" button on a service card is used
  modalEl.addEventListener('show.bs.modal', function (event) {
    var trigger = event.relatedTarget;
    var service = trigger ? trigger.getAttribute('data-service') : '';
    form.reset();
    form.querySelectorAll('.is-invalid').forEach(function (el) { el.classList.remove('is-invalid'); });
    dateInput.min = todayStr();
    serviceSelect.value = service || '';
    if (service === 'Airport Pickup & Drop') serviceSelect.value = 'Airport Pickup & Drop';
    toggleReturn();
  });

  form.querySelectorAll('input, select, textarea').forEach(function (f) {
    f.addEventListener('input', function () { f.classList.remove('is-invalid'); });
    f.addEventListener('change', function () { f.classList.remove('is-invalid'); });
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var f = form.elements;
    var valid = true;

    function check(field, ok) {
      field.classList.toggle('is-invalid', !ok);
      if (!ok) valid = false;
    }

    var mobile = cleanMobile(f['mobile'].value);
    check(f['name'], f['name'].value.trim().length >= 2);
    check(f['mobile'], /^[6-9]\d{9}$/.test(mobile));
    check(f['service'], f['service'].value !== '');
    check(f['trip'], f['trip'].value !== '');
    check(f['pickup'], f['pickup'].value.trim() !== '');
    check(f['drop'], f['drop'].value.trim() !== '');
    check(f['date'], f['date'].value !== '' && f['date'].value >= todayStr());
    check(f['time'], f['time'].value !== '');
    check(f['pax'], parseInt(f['pax'].value, 10) >= 1);
    if (f['returnDate'].value) check(f['returnDate'], f['returnDate'].value >= f['date'].value);

    if (!valid) {
      var firstBad = form.querySelector('.is-invalid');
      if (firstBad) firstBad.focus();
      return;
    }

    var lines = [
      'Hello ' + COMPANY + ', I would like to book a trip.',
      '',
      '*Booking Details*',
      '*Name:* ' + f['name'].value.trim(),
      '*Mobile:* +91 ' + mobile,
      '*Service:* ' + f['service'].value,
      '*Trip Type:* ' + f['trip'].value,
      '*Pickup:* ' + f['pickup'].value.trim(),
      '*Drop:* ' + f['drop'].value.trim(),
      '*Travel Date:* ' + formatDate(f['date'].value),
      '*Pickup Time:* ' + formatTime(f['time'].value)
    ];
    if (f['returnDate'].value) lines.push('*Return Date:* ' + formatDate(f['returnDate'].value));
    lines.push('*Passengers:* ' + parseInt(f['pax'].value, 10));
    lines.push('*Vehicle:* ' + (f['vehicle'].value || 'Any suitable vehicle'));
    if (f['notes'].value.trim()) lines.push('*Additional Details:* ' + f['notes'].value.trim());

    var url = bookLink(lines.join('\n'));
    var win = window.open(url, '_blank', 'noopener');
    if (!win) window.location.href = url; // pop-up blocked: open in the same tab

    bootstrap.Modal.getOrCreateInstance(modalEl).hide();
  });
})();
