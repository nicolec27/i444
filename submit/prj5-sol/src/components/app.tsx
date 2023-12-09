import React from 'react';

import { makeSensorsWs, SensorsWs } from '../lib/sensors-ws.js';

import Tab from './tab.js';

import SENSOR_FIELDS from './sensor-fields.js';
import { Errors } from 'cs544-js-utils';


type AppProps = {
  wsUrl: string,
};

export default function App(props: AppProps) {
  const ws = makeSensorsWs(props.wsUrl);
  const [ selectedId, selectTab ] = React.useState('addSensorType');

  const [errors, setErrors] = React.useState([]);
  const [formData, setFormData] = React.useState({});
  const [sensorFormData, setSensorFormData] = React.useState({});

  const [astid, setAstid] = React.useState('');

  const [dlContent, setDlContent] = React.useState<React.ReactElement | null>(null);

  const [sensorTypeFindResults, setSensorTypeFindResults] = React.useState({});
  const [sensorTypeFindErrors, setSensorTypeFindErrors] = React.useState({});

  const handleInputChange = (ev: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = ev.target;

    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };
  

  const findSensorType = async (ev: React.FormEvent) => {
    ev.preventDefault();
    const form = ev.target as HTMLFormElement;
    const pairs = 
    [...new FormData(form).entries()]
    .map(([k,v]) => [k,v as string])
    .filter(([_,v]) => v.trim().length > 0);
    const data: Record<string, string> = Object.fromEntries(pairs);
    try {
      const result = await ws.findSensorTypesByReq(data);
      if (!result.isOk) {
        setSensorTypeFindResults({values:[], next: undefined, prev:undefined});
        console.log(sensorTypeFindResults);
        setSensorTypeFindErrors(result.errors);
      }
    }
    catch(err){

    }
  }

  const addSensorTypeListener = async (event: React.FormEvent) => {
    event.preventDefault();
    document.querySelectorAll(`.addSensorType-errors`).forEach( el => {
      el.innerHTML = '';
    });

    try {
      const addSensorTypeForm = document.getElementById('addSensorType-form') as HTMLFormElement;
      const result = await ws.addSensorType(formData);

      // console.log(result);

      if (result.isOk) {
        // console.log("success");
        // console.log(result.val);
        const dlContent = (
          <dl className="result">
            {Object.entries(result.val).map(([key, value]) => (
              <React.Fragment key={key}>
                <dt>{key}</dt>
                <dd>{String(value)}</dd>
              </React.Fragment>
            ))}
          </dl>
        );

        setDlContent(dlContent);
      } else {
        // console.log("errors");
        // console.log(result.errors);
        for (const err of result.errors) {
          const id = err.options.widget;
          const widget = id && document.querySelector(`#addSensorType-${id}-error`);
          if (widget) {
            widget.append(err.message);
          }
        }

      }
    } catch (error) {
      console.log([errors]);
    }
  };

  const addSensorListener = async (event: React.FormEvent) => {
    event.preventDefault();
    document.querySelectorAll(`.addSensor-errors`).forEach( el => {
      el.innerHTML = '';
    });

    try {
      const addSensorForm = document.getElementById('addSensor-form') as HTMLFormElement;
      const result = await ws.addSensor(sensorFormData);

      // console.log(result);

      if (result.isOk) {
        // console.log("success");
        // console.log(result.val);
        // const dlContent = (
        //   <dl className="result">
        //     {Object.entries(result.val).map(([key, value]) => (
        //       <React.Fragment key={key}>
        //         <dt>{key}</dt>
        //         <dd>{String(value)}</dd>
        //       </React.Fragment>
        //     ))}
        //   </dl>
        // );

        // setDlContent(dlContent);
      } else {
        // console.log("errors");
        // console.log(result.errors);
        for (const err of result.errors) {
          const id = err.options.widget;
          const widget = id && document.querySelector(`#addSensor-${id}-error`);
          if (widget) {
            widget.append(err.message);
          }
        }

      }
    } catch (error) {
      console.log([errors]);
    }
  };

 
  const renderTabContent = () => {
    switch (selectedId) {
      case 'addSensorType':
        return (
          <React.Fragment>

            <div id="addSensorType-content">
              <ul id="addSensorType-errors" className="addSensorType-errors"></ul>
              <form className="grid-form" id="addSensorType-form" name="addSensorType-form" onSubmit={(event) => addSensorTypeListener(event)}>
              
                <label htmlFor="addSensorType-id">Sensor Type ID<span className="required" title="Required">*</span></label>
                <span><input type="text" id="addSensorType-id" name="id" value={astid} /> <br />
                <span id="addSensorType-id-error" className="addSensorType-errors error"></span></span>

                <label htmlFor="addSensorType-manufacturer">Manufacturer<span className="required" title="Required">*</span></label>
                <span><input type="text" id="addSensorType-manufacturer" name="manufacturer" /> <br />
                <span id="addSensorType-manufacturer-error" className="addSensorType-errors error"></span></span>

                <label htmlFor="addSensorType-modelNumber">Model Number<span className="required" title="Required">*</span></label>
                <span><input type="text" id="addSensorType-modelNumber" name="modelNumber" /> <br />
                <span id="addSensorType-modelNumber-error" className="addSensorType-errors error"></span></span>

                <label htmlFor="addSensorType-quantity">Quantity<span className="required" title="Required">*</span></label>
                <span><input type="text" id="addSensorType-quantity" name="quantity" /> <br />
                <span id="addSensorType-quantity-error" className="addSensorType-errors error"></span></span>

                <label htmlFor="addSensorType-unit">Unit<span className="required" title="Required">*</span></label>
                <span><input type="text" id="addSensorType-unit" name="unit" /> <br />
                <span id="addSensorType-unit-error" className="addSensorType-errors error"></span></span>
                
                <label htmlFor="addSensorType-min">Min Limit<span className="required" title="Required">*</span></label>
                <span><input type="number" id="addSensorType-min" name="min" /> <br />
                <span id="addSensorType-min-error" className="addSensorType-errors error"></span></span>

                <label htmlFor="addSensorType-max">Max Limit<span className="required" title="Required">*</span></label>
                <span><input type="number" id="addSensorType-max" name="max" /> <br />
                <span id="addSensorType-max-error" className="addSensorType-errors error"></span></span>

                <span></span>

                <button type="submit">Add Sensor Type</button>
              </form>
              <div id="addSensorType-results" className="results"> </div>
            </div>
          </React.Fragment>
        );

      case 'addSensor':
        return (
          <React.Fragment>
    
            <div id="addSensor-content">
              <ul id="addSensor-errors" className="addSensor-errors"></ul>
              <form className="grid-form" id="addSensor-form" name="addSensor-form" onSubmit={(event) => addSensorListener(event)}>
                <label htmlFor="addSensor-id">Sensor ID<span className="required" title="Required">*</span></label>
                <span><input type="text" id="addSensor-id" name="id" /> <br />
                <span id="addSensor-id-error" className="addSensor-errors error"></span></span>
    
                <label htmlFor="addSensor-sensorTypeId">Sensor Type ID<span className="required" title="Required">*</span></label>
                <span><input type="text" id="addSensor-sensorTypeId" name="sensorTypeId" /> <br />
                <span id="addSensor-sensorTypeId-error" className="addSensor-errors error"></span></span>
    
                <label htmlFor="addSensor-period">Period<span className="required" title="Required">*</span></label>
                <span><input type="text" id="addSensor-period" name="unit" /> <br />
                <span id="addSensor-period-error" className="addSensor-errors error"></span></span>
                
                <label htmlFor="addSensor-min">Min Expected<span className="required" title="Required">*</span></label>
                <span><input type="number" id="addSensor-min" name="min" /> <br />
                <span id="addSensor-min-error" className="addSensor-errors error"></span></span>
    
                <label htmlFor="addSensor-max">Max Expected<span className="required" title="Required">*</span></label>
                <span><input type="number" id="addSensor-max" name="max" /> <br />
                <span id="addSensor-max-error" className="addSensor-errors error"></span></span>
    
                <span></span>
    
                <button type="submit">Add Sensor</button>
              </form>
            </div>
          </React.Fragment>
        ); 

      case 'findSensorTypes':
        return (
          <React.Fragment>
    
            <div id="findSensorTypes-content">
              <ul id="findSensorTypes-errors" className="findSensorTypes-errors"></ul>
              <form className="grid-form" id="findSensorTypes-form" name="findSensorTypes-form">
                <label htmlFor="findSensorTypes-id">Sensor Type ID</label>
                <span><input type="text" id="findSensorTypes-id" name="id" onChange={handleInputChange} /> <br />
                <span id="findSensorTypes-id-error" className="findSensorTypes-errors error"></span></span>
    
                <label htmlFor="findSensorTypes-manufacturer">Manufacturer</label>
                <span><input type="text" id="findSensorTypes-manufacturer" name="manufacturer" onChange={handleInputChange} /> <br />
                <span id="findSensorTypes-manufacturer-error" className="findSensorTypes-errors error"></span></span>

                <label htmlFor="findSensorTypes-modelNumber">Model Number</label>
                <span><input type="text" id="findSensorTypes-modelNumber" name="modelNumber" onChange={handleInputChange} /> <br />
                <span id="findSensorTypes-modelNumber-error" className="findSensorTypes-errors error"></span></span>

                <label htmlFor="findSensorTypes-quantity">Quantity</label>
                <span><input type="text" id="findSensorTypes-quantity" name="quantity" onChange={handleInputChange} /> <br />
                <span id="findSensorTypes-quantity-error" className="findSensorTypes-errors error"></span></span>

                <label htmlFor="findSensorTypes-unit">Unit</label>
                <span><input type="text" id="findSensorTypes-unit" name="unit" onChange={handleInputChange} /> <br />
                <span id="findSensorTypes-unit-error" className="findSensorTypes-errors error"></span></span>

                <span></span>

                <button type="submit">Find Sensor Types</button>
                {/* {sensorTypeSearchResults} */}
              </form>
            </div>
          </React.Fragment>
        ); 
      case 'findSensors':
        return (
          <React.Fragment>
    
            <div id="findSensors-content">
              <ul id="findSensors-errors" className="findSensors-errors"></ul>
              <form className="grid-form" id="findSensors-form" name="findSensors-form">
                <label htmlFor="findSensors-id">Sensor ID</label>
                <span><input type="text" id="findSensors-id" name="id" /> <br />
                <span id="findSensors-id-error" className="findSensors-errors error"></span></span>

                <label htmlFor="findSensors-sensorTypeId">Sensor Type ID</label>
                <span><input type="text" id="findSensors-sensorTypeId" name="id" /> <br />
                <span id="findSensors-sensorTypeId-error" className="findSensors-errors error"></span></span>

                <span></span>

                <button type="submit">Find Sensors</button>
              </form>
            </div>
          </React.Fragment>
        );
       
      default:
        return null;
    }
  };

  return (
    <div className="tabs">
      <Tab id="addSensorType" label="Add Sensor Type" 
           isSelected={selectedId === 'addSensorType'}
           select={selectTab}>

        {renderTabContent()}
        
         {/* TODO Add Sensor Type Component */}
      </Tab>
      <Tab id="addSensor" label="Add Sensor" 
           isSelected={selectedId === 'addSensor'}
           select={selectTab}>
        {renderTabContent()}
         {/* TODO Add Sensor Component */}
      </Tab>
      <Tab id="findSensorTypes" label="Find Sensor Types" 
           isSelected={selectedId === 'findSensorTypes'}
           select={selectTab}>
        {renderTabContent()}
         {/* TODO Find Sensor Type Component */}
      </Tab>
      <Tab id="findSensors" label="Find Sensors" 
           isSelected={selectedId === 'findSensors'}
           select={selectTab}>
        {renderTabContent()}
         {/* TODO Find Sensor Component */}
      </Tab>
    </div>
  );
}

