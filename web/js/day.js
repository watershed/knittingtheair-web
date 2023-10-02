/***** Single knitted panel of a data point for a day *****/

const toggleElem = (btn) => {
    const elem = document.querySelector( btn.getAttribute('data-show') );
    const state = btn.getAttribute('aria-pressed') === 'true';
    elem.classList.toggle('visible');
    btn.setAttribute('aria-pressed', !state);

    if ( !state && elem.classList.contains('map-container') ) {
        initMap(elem);
    }
}

const infoProps = (elem) => {
    const target   = elem.getAttribute('aria-controls');
    const selector = `#${target} > [data-info]`;
    const info     = document.querySelector(selector);
    return {target: target, info: info};
}

const updateInfo = (btn, info, state) => {
    btn.setAttribute('aria-expanded', !state);
    info.setAttribute('aria-hidden', state);
}

const closeInfo = (target) => {
    const selector  = target ? `button[data-info]:not([aria-controls="${target}"])` : 'button[data-info]';
    const infoElems = document.querySelectorAll(selector);

    infoElems.forEach(function(elem) {
        const infoObj = infoProps(elem);
        updateInfo(elem, infoObj.info, true);
    });
}

const toggleInfo = (btn) => {
    const state  = btn.getAttribute('aria-expanded') === 'true';
    let   scope  = btn.getAttribute('data-info').replace(/^#/, '');
    scope = state ? '' : scope;
    const infoObj = infoProps(btn);

    updateInfo(btn, infoObj.info, state);

    document.querySelector('.masks').setAttribute('data-scope', scope);

    if ( !state ) {
        closeInfo(infoObj.target);
        closeDetails();
    }
}

const closeDetails = (summary) => {
    const parent  = summary ? summary.parentElement : null;
    const details = document.querySelectorAll('details');

    details.forEach(function(elem) {
        if ( elem !== parent ) {
            elem.open = false;
        }
    });

    if ( summary ) {
        closeInfo();
    }
}

const initMap = (container) => {
    const isDrawn = container.getAttribute('data-drawn') === 'true';
    const mapElem = container.querySelector('[data-coords]');

    if ( isDrawn ) {
        return;
    }

    let coords = mapElem.getAttribute('data-coords').split(',');

    coords.forEach(function(num, index) {
        num = num.trim() * 1;
        coords[index] = num;
    });

    const zoom = mapElem.getAttribute('data-zoom') * 1;

    if ( coords.length === 2 && zoom ) {
        const id  = mapElem.id;
        const map = L.map(id).setView(coords, zoom);
        L.tileLayer('http://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>. Tiles courtesy of Humanitarian OpenStreetMap Team'
        }).addTo(map);

        const marker = L.marker(coords).addTo(map);
        const html   = mapElem.getAttribute('data-marker-html');
        
        if ( html ) {
            marker.bindPopup(html).openPopup();
        }
    }

    container.setAttribute('data-drawn', 'true');
}

const infoLinks = document.querySelectorAll('a[data-info]');

infoLinks.forEach(function(link, index) {
    const btn  = document.createElement('button');
    const href = link.getAttribute('href');
    const selector = `${href} [data-info]`;
    const info = document.querySelector(selector);
    const details = link.nextElementSibling;

    if ( !details.classList.contains('details') || !info ) {
        return;
    }

    details.appendChild(info);
    info.setAttribute('aria-hidden', 'true');
    details.setAttribute('aria-live', 'polite');
    const id = `info-${index + 1}`;
    details.id = id;

    btn.textContent = link.textContent;
    btn.setAttribute('aria-expanded', 'false');
    btn.setAttribute('aria-controls', id);
    btn.setAttribute('data-info', href);
    link.replaceWith(btn);

    posX = btn.offsetWidth * -1;
    posY = btn.offsetHeight + 8;

    details.style.top  = `${posY}px`;
    details.style.left = `${posX}px`;
});

document.querySelector('#info').remove();

document.addEventListener('click', function(e) {
    let trigger = e.target;

    if ( trigger.matches('button[data-show]') ) {
        toggleElem(trigger);
    }

    if ( trigger.matches('button[data-info]') ) {
        toggleInfo(trigger);
    }

    if ( trigger.closest('summary') ) {
        trigger = trigger.closest('summary');
        closeDetails(trigger);
    }

    if ( trigger.matches('[href="#"]') ) {
        e.preventDefault();
        alert('Just a dummy link for now.');
    }
});
