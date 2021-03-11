const wednesday = document.getElementById('wednesday');
const thursday = document.getElementById('thursday');

/**
 * Convert time to users local time.
 * @param {String} timeStr - time to convert.
 * @param {Number} day - day of the time.
 * @returns {String}
 */
function toLocaleTime(timeStr, day) {
  const [ time, period ] = timeStr.split(' ');
  const [ hour, mintues ] = time.split(':').map(Number);

  const date = new Date(Date.UTC(
    2021,
    2,  // month is 0 indexed
    day,
    // ET = UTC-5
    hour + 5 + (period === 'pm' && hour < 12 ? 12 : 0),
    mintues,
    0
  ));

  return date.toLocaleTimeString([], { timeStyle: 'short' });
}

/**
 * Create the output for a presentation.
 * @param {Object} presentation - presentation object.
 * @returns {HTMLLIElement}
 */
function createPresentationOutput(presentation) {
  const { title, presenter, link } = presentation;

  const li = document.createElement('li');
  li.classList.add('axeConPresentation');
  // turn a non-array into an arry
  const presenters = [].concat(presenter);
  li.innerHTML = `<a href="${link}">${title}</a> by ${presenters.join(', ')}`;

  return li;
}

/**
 * Append the presentation to the DOM
 * @param {Object} presentationData - presentation data.
 * @param {HTMLLIElement} li - presentation li node.
 */
function appendToDom(presentationData, node) {
  for (const time in presentationData) {
     const date = node.id === 'wednesday' ? 'Wednesday, March 10' : 'Thursday, March 11';

     const li = document.createElement('li');
     const h3 = document.createElement('h3');
     h3.textContent = time;
     li.classList.add('axeConHour');
     li.appendChild(h3);

     const ul = document.createElement('ul');
     ul.setAttribute('aria-label', `${time}, ${date}`);
     ul.classList.add('axeConHourList');
     presentationData[time].forEach(presentationLi => {
       ul.appendChild(presentationLi);
     });
     li.appendChild(ul);

     node.appendChild(li);
   }
}

fetch('./data.json')
  .then(response => response.json())

  // convert to locale time
  .then(data => {
    data.wednesday.forEach(presentation => {
      presentation.start = toLocaleTime(presentation.start, 10);
      presentation.end = toLocaleTime(presentation.end, 10);
    });
    data.thursday.forEach(presentation => {
      presentation.start = toLocaleTime(presentation.start, 11);
      presentation.end = toLocaleTime(presentation.end, 11);
    });

    return data;
  })

  // create the output
  .then(data => {
    const presentations = {
      wednesday: {},
      thursday: {}
    };

    data.wednesday.forEach(presentation => {
      const { start, end } = presentation;

      // group presentations by time
      presentations.wednesday[start] = presentations.wednesday[start] || [];
      presentations.wednesday[start].push(
        createPresentationOutput(presentation)
      );
    });
    data.thursday.forEach(presentation => {
      const { start, end } = presentation;

      // group presentations by time
      presentations.thursday[start] = presentations.thursday[start] || [];
      presentations.thursday[start].push(
        createPresentationOutput(presentation)
      );
    });

    return presentations;
  })

  // append output to DOM
  .then(presentations => {
     appendToDom(presentations.wednesday, wednesday);
     appendToDom(presentations.thursday, thursday);
  });