import { Errors } from 'cs544-js-utils';
import { PagedValues, makeSensorsWs, SensorsWs } from './sensors-ws.js';

import init from './init.js';
import { makeElement, getFormData } from './utils.js';

export default function makeApp(wsUrl: string) {
  const ws = makeSensorsWs(wsUrl);
  init();
  //TODO: add call to select initial tab and calls to set up
  selectTab('addSensorType');
  addSensorTypeListener(ws);
  addSensorListener(ws);
  findSensorTypesListener(ws);
  findSensorsListener(ws);
  //form submit listeners
}

//TODO: functions to select a tab and set up form submit listeners

function selectTab(rootId : string) {
  document.querySelector(`#${rootId}-tab`)!.setAttribute('checked', 'checked');
}

function addSensorTypeListener(ws: SensorsWs) {
  const addSensorTypeForm = document.getElementById('addSensorType-form') as HTMLFormElement;
  const addSensorTypeResults = document.getElementById('addSensorType-results')!;

  addSensorTypeForm.addEventListener('submit', async event => {
    event.preventDefault();
    clearErrors('addSensorType');

    try {
      const formData = getFormData(addSensorTypeForm);
      const result = await ws.addSensorType(formData);

      if (result.isOk) {
        // console.log('success');
        displayResult(result.val, addSensorTypeResults);
      }
      else {
        displayErrors('addSensorType', result.errors);
        // console.log('fail');
      }
    } catch (error) {
      displayErrors('addSensorType', [error]);
    }
  });
}

function addSensorListener(ws: SensorsWs) {
  const addSensorForm = document.getElementById('addSensor-form') as HTMLFormElement;
  const addSensorResults = document.getElementById('addSensor-results')!;

  addSensorForm.addEventListener('submit', async event => {
    event.preventDefault();
    clearErrors('addSensor');

    try {
      const formData = getFormData(addSensorForm);
      const result = await ws.addSensor(formData);


      if (result.isOk) {
        displayResult(result.val, addSensorResults);
      }
      else {
        displayErrors('addSensor', result.errors);
      }
    } catch (error) {
      displayErrors('addSensor', [error]);
    }
  });
}

function displayResult(result: Record<string, any>, data: HTMLElement) {
  const dl = makeElement('dl', { class: 'result' });

  for (const [key, value] of Object.entries(result)) {
    const dt = makeElement('dt', {}, key);
    const dd = makeElement('dd', {}, String(value));
    dl.append(dt, dd);
  }

  data.append(dl);
  
}

function findSensorTypesListener(ws: SensorsWs) {
  const findSensorTypesForm = document.getElementById('findSensorTypes-form') as HTMLFormElement;
  const findSensorTypesResults = document.getElementById('findSensorTypes-results')!;
  const el = document.getElementsByClassName('scroll');
  const prevPage = el[0].getElementsByClassName('hide')[0];
  const nextPage = el[0].getElementsByClassName('hide')[1];

  findSensorTypesForm.addEventListener('submit', async event => {
    event.preventDefault();
    clearErrors('findSensorTypes');
    findSensorTypesResults.innerHTML = '';

    let currentPage: PagedValues | null = null;

    try {
      const formData = getFormData(findSensorTypesForm);
  
      const result = await ws.findSensorTypesByReq(formData);

      if (result.isOk) {
        const pagedResult: PagedValues = result.val;
        currentPage = pagedResult;
        for (const value of pagedResult.values) {
          displayResult(value, findSensorTypesResults);
        }

        if (currentPage.prev) {
          prevPage.classList.remove('hide');
          prevPage.classList.add('show');
        }

        if (currentPage.next) {
          nextPage.classList.remove('hide');
          nextPage.classList.add('show');
        }

        nextPage.addEventListener('click', async ev => {
          ev.preventDefault();
          if (currentPage && currentPage.next) {
            for (const [key, value] of Object.entries(currentPage.next!)) {
              if (key === 'href') {
                const res = await ws.findSensorTypesByRelLink(value);
                if (res.isOk) {
                  const newResult: PagedValues = res.val;
                  currentPage = newResult;
                  findSensorTypesResults.innerHTML = '';
                  for (const value of newResult.values) {
                    displayResult(value, findSensorTypesResults);
                  }
                }
              }
            }
            
          }
          if (currentPage && currentPage.prev) {
            prevPage.classList.remove('hide');
            prevPage.classList.add('show');  
          } 
          if (currentPage && !currentPage.next) {
            nextPage.classList.remove('show');
            nextPage.classList.add('hide');
          }
        });

        prevPage.addEventListener('click', async ev => {
          ev.preventDefault();
          if (currentPage && currentPage.prev) {
            for (const [key, value] of Object.entries(currentPage.prev!)) {
              if (key === 'href') {
                const t = await ws.findSensorTypesByRelLink(value);
                if (t.isOk) {
                  const newR: PagedValues = t.val;
                  currentPage = newR;
                  findSensorTypesResults.innerHTML = '';
                  for (const value of newR.values) {
                    displayResult(value, findSensorTypesResults);
                  }
                }
              }
            }
          }
          if (currentPage && currentPage.next) {
            nextPage.classList.remove('hide');
            nextPage.classList.add('show');  
          } 
          if (currentPage && !currentPage.prev) {
            prevPage.classList.remove('show');
            prevPage.classList.add('hide');
          }
        });

      } else {
        displayErrors('findSensorTypes', result.errors);
      }
    } catch (error) {
      displayErrors('findSensorTypes', [error]);
    }
  });
}

function findSensorsListener(ws: SensorsWs) {
  const findSensorsForm = document.getElementById('findSensors-form') as HTMLFormElement;
  const findSensorsResults = document.getElementById('findSensors-results')!;
  const el = document.getElementsByClassName('scroll');
  const prevPage = el[2].getElementsByClassName('hide')[0];
  const nextPage = el[2].getElementsByClassName('hide')[1];

  findSensorsForm.addEventListener('submit', async event => {
    event.preventDefault();
    clearErrors('findSensors');
    findSensorsResults.innerHTML = '';

    let currentPage: PagedValues | null = null;

    try {
      const formData = getFormData(findSensorsForm);
      const result = await ws.findSensorsByReq(formData);

      if (result.isOk) {
        const pagedResult: PagedValues = result.val;
        currentPage = pagedResult;
        for (const value of pagedResult.values) {
          displayResult(value, findSensorsResults);
        }

        if (currentPage.prev) {
          prevPage.classList.remove('hide');
          prevPage.classList.add('show');
        }

        if (currentPage.next) {
          nextPage.classList.remove('hide');
          nextPage.classList.add('show');
        }

        nextPage.addEventListener('click', async ev => {
          ev.preventDefault();
          if (currentPage && currentPage.next) {
            for (const [key, value] of Object.entries(currentPage.next!)) {
              if (key === 'href') {
                const res = await ws.findSensorsByRelLink(value);
                if (res.isOk) {
                  const newResult: PagedValues = res.val;
                  currentPage = newResult;
                  findSensorsResults.innerHTML = '';
                  for (const value of newResult.values) {
                    displayResult(value, findSensorsResults);
                  }
                }
              }
            }
            
          }
          if (currentPage && currentPage.prev) {
            prevPage.classList.remove('hide');
            prevPage.classList.add('show');  
          } 
          if (currentPage && !currentPage.next) {
            nextPage.classList.remove('show');
            nextPage.classList.add('hide');
          }
        });

        prevPage.addEventListener('click', async ev => {
          ev.preventDefault();
          if (currentPage && currentPage.prev) {
            for (const [key, value] of Object.entries(currentPage.prev!)) {
              if (key === 'href') {
                const t = await ws.findSensorsByRelLink(value);
                if (t.isOk) {
                  const newR: PagedValues = t.val;
                  currentPage = newR;
                  findSensorsResults.innerHTML = '';
                  for (const value of newR.values) {
                    displayResult(value, findSensorsResults);
                  }
                }
              }
            }
          }
          if (currentPage && currentPage.next) {
            nextPage.classList.remove('hide');
            nextPage.classList.add('show');  
          } 
          if (currentPage && !currentPage.prev) {
            prevPage.classList.remove('show');
            prevPage.classList.add('hide');
          }
        });


      } else {
        displayErrors('findSensors', result.errors);
      }
    } catch (error) {
      displayErrors('findSensors', [error]);
    }
  });
}

/** clear out all errors within tab specified by rootId */
function clearErrors(rootId: string) {
  document.querySelectorAll(`.${rootId}-errors`).forEach( el => {
    el.innerHTML = '';
  });
}

/** Display errors for rootId.  If an error has a widget widgetId such
 *  that an element having ID `${rootId}-${widgetId}-error` exists,
 *  then the error message is added to that element; otherwise the
 *  error message is added to the element having to the element having
 *  ID `${rootId}-errors` wrapped within an `<li>`.
 */  
function displayErrors(rootId: string, errors: Errors.Err[]) {
  for (const err of errors) {
    const id = err.options.widget;
    const widget = id && document.querySelector(`#${rootId}-${id}-error`);
    if (widget) {
      widget.append(err.message);
    }
    else {
      const li = makeElement('li', {class: 'error'}, err.message);
      document.querySelector(`#${rootId}-errors`)!.append(li);
    }
  }
}

/** Turn visibility of element on/off based on isVisible.  This
 *  is done by adding class "show" or "hide".  It presupposes
 *  that "show" and "hide" are set up with appropriate CSS styles.
 */
function setVisibility(element: HTMLElement, isVisible: boolean) {
  element.classList.add(isVisible ? 'show' : 'hide');
  element.classList.remove(isVisible ? 'hide' : 'show');
}


