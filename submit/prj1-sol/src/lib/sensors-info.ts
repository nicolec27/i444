import { Errors, Checkers } from 'cs544-js-utils';
import { validateFindCommand, SensorType, Sensor, SensorReading,
	 makeSensorType, makeSensor, makeSensorReading 
       } from './validators.js';

type FlatReq = Checkers.FlatReq; //dictionary mapping strings to strings

//marks T as having being run through validate()
type Checked<T> = Checkers.Checked<T>;

/*********************** Top Level Sensors Info ************************/

export class SensorsInfo {
	private readonly sensorTypes: IndexedCollection<SensorType>;
	private readonly sensors: IndexedCollection<Sensor>;
	private readings: Record<string, SensorReading[]>;

  //TODO: define instance fields; good idea to keep private and
  //readonly when possible.

  constructor() {
  	this.sensorTypes = 
  		new IndexedCollection('id', ['manufacturer', 'modelNumber', 'quantity']);
  	this.sensors = new IndexedCollection('id', ['sensorTypeId']);
  	this.readings = {};
    //TODO
  }

  /** Clear out all sensors info from this object.  Return empty array */
  clear() : Errors.Result<string[]> {
    //TODO
    this.sensorTypes.clear();
    this.sensors.clear();
    this.readings = {};
    return Errors.okResult([]);
  }

  /** Add sensor-type defined by req to this.  If there is already a
   *  sensor-type having the same id, then replace it. Return single
   *  element array containing the added sensor-type.
   *
   *  Error Codes:
   *     'REQUIRED': a required field is missing.
   *     'BAD_VAL': a bad value in a field (a numeric field is not numeric)
   *     'BAD_RANGE': an incorrect range with min >= max.
   */
  addSensorType(req: Record<string, string>) : Errors.Result<SensorType[]> {
    const sensorTypeResult = makeSensorType(req);
    if (!sensorTypeResult.isOk) return sensorTypeResult;
    const sensorType = sensorTypeResult.val;
    //TODO add into this
    this.sensorTypes.add(sensorType);
    return Errors.okResult([sensorType]);
  }
  
  /** Add sensor defined by req to this.  If there is already a 
   *  sensor having the same id, then replace it.  Return single element
   *  array containing the added sensor.
   *
   *  Error Codes:
   *     'REQUIRED': a required field is missing.
   *     'BAD_VAL': a bad value in a field (a numeric field is not numeric)
   *     'BAD_RANGE': an incorrect range with min >= max.
   *     'BAD_ID': unknown sensorTypeId.
   */
  addSensor(req: Record<string, string>): Errors.Result<Sensor[]> {
    //TODO
    const sensorResult = makeSensor(req);
    if(!sensorResult.isOk) return sensorResult;
    const sensor = sensorResult.val;
    const sensorTypeId = 
    	{id: sensor.sensorTypeId} as Record<keyof SensorType, string>;
    const sensorTypes = this.sensorTypes.find(sensorTypeId);
    if (sensorTypes.length !== 1) {
    	return Error.errResult(`unknown sensor type "${sensor.sensorTypeId}"`,  'BAD_ID', 'sensorTypeId');
    }
    const [sensorType] = sensorTypes;
    if (!sensor.expected.isSubrange(sensorType.limits)) {
    	const {min: min0, max: max0} = sensorType.limits;
    	const {min: min1, max: max1} = sensor.expected;
    	return Errors.errResult('expected range');
    }
    this.sensors.add(sensor);
    return Errors.okResult([sensor]);
  }

  /** Add sensor reading defined by req to this.  If there is already
   *  a reading for the same sensorId and timestamp, then replace it.
   *  Return single element array containing added sensor reading.
   *
   *  Error Codes:
   *     'REQUIRED': a required field is missing.
   *     'BAD_VAL': a bad value in a field (a numeric field is not numeric)
   *     'BAD_RANGE': an incorrect range with min >= max.
   *     'BAD_ID': unknown sensorId.
   */
  addSensorReading(req: Record<string, string>)
    : Errors.Result<SensorReading[]> 
  {
    //TODO
    const sensorReadingResult = makeSensorReading(req);
    if (!sensorReadingResult.isOk) return sensorReadingResult;
    const sensorReading = sensorReadingResult.val;
    const sensorId = 
    	{id: sensor.sensorId} as Record<keyof Sensor, string>;
    const sensors = this.sensors.find(sensorId);
    if (sensors.length !== 1) {
    	return Error.errResult(`unknown sensor id "${sensorReading.sensorId}"`,  'BAD_ID', 'sensorTypeId');
    }
    const readings = (this.readings[sensorReading.sensorId] ??= []);
    const index =
    	readings.findIndex(r => r.timestamp === sensorReading.timestamp);
    if (index >= 0) {
    	readings.splice(index, 1, sensorReading);
    }
    else {
    	readings.push(sensorReading);
    }
    return Errors.okResult([sensorReading]);
  }

  /** Find sensor-types which satify req. Returns [] if none. 
   *  Note that all primitive SensorType fields can be used to filter.
   *  The returned array must be sorted by sensor-type id.
   */
  findSensorTypes(req: FlatReq) : Errors.Result<SensorType[]> {
    const validResult: Errors.Result<Checked<FlatReq>> =
      validateFindCommand('findSensorTypes', req);
    if (!validResult.isOk) return validResult;
    //TODO
    const sensorTypeSearch =
    	validResult.val as Checked<Record<keyof SensorType, string>>;
    const indexedResult = this.sensorTypes.find(sensorTypeSearch);
    const filteredResult = filter(sensorTypeSearch, indexedResult);
    return Errors.okResult([filteredResult]);
  }
  
  /** Find sensors which satify req. Returns [] if none. 
   *  Note that all primitive Sensor fields can be used to filter.
   *  The returned array must be sorted by sensor id.
   */
  findSensors(req: FlatReq) : Errors.Result<Sensor[]> { 
    //TODO
    const validResult: Errors.Result<Checked<FlatReq>> =
      validateFindCommand('findSensors', req);
    if (!validResult.isOk) return validResult;
    const sensorsSearch =
    	validResult.val as Checked<Record<keyof Sensor, string>>;
    const indexedResult = this.sensors.find(sensorsSearch);
    const filteredResult = filter(sensorsSearch, indexedResult);
    return Errors.okResult([filteredResult]);
  }
  
  /** Find sensor readings which satify req. Returns [] if none.  Note
   *  that req must contain sensorId to specify the sensor whose
   *  readings are being requested.  Additionally, it may use
   *  partially specified inclusive bounds [minTimestamp,
   *  maxTimestamp] and [minValue, maxValue] to filter the results.
   *
   *  The returned array must be sorted numerically by timestamp.
   */
  findSensorReadings(req: FlatReq) : Errors.Result<SensorReading[]> {
    //TODO
    const validResult: Errors.Result<Checked<FlatReq>> =
      validateFindCommand('findSensorReadings', req);
    if (!validResult.isOk) return validResult;
    const search = makeSensorReadingsSearch(validResult.val);
    const readings = this.readings[search.sensorId] ?? [];
    const found: sensorReading[] = [];
    const { minTimestamp, maxTimestamp, minValue, maxValue } = search;
    for (const reading of readings) {
    	const {timestamp, value} = reading;
    	if (minTimestamp <= timestamp && timestamp <= maxTimestamp && minValue <= value && value <= maxValue) {
    		found.push(reading);
    	}
    }
    found.sort((r1, r2) => Number(r1.timestamp) - Number(r2.timestamp));
    return Errors.okResult(found);
  }
  
}

/*********************** SensorsInfo Factory Functions *****************/

export function makeSensorsInfo(sensorTypes: FlatReq[]=[],
				sensors: FlatReq[]=[],
				sensorReadings: FlatReq[]=[])
  : Errors.Result<SensorsInfo>
{
  const sensorsInfo = new SensorsInfo();
  const addResult =
    addSensorsInfo(sensorTypes, sensors, sensorReadings, sensorsInfo);
  return (addResult.isOk) ? Errors.okResult(sensorsInfo) : addResult;
}

export function addSensorsInfo(sensorTypes: FlatReq[], sensors: FlatReq[],
			       sensorReadings: FlatReq[],
			       sensorsInfo: SensorsInfo)
  : Errors.Result<void>
{
  for (const sensorType of sensorTypes) {
    const result = sensorsInfo.addSensorType(sensorType);
    if (!result.isOk) return result;
  }
  for (const sensor of sensors) {
    const result = sensorsInfo.addSensor(sensor);
    if (!result.isOk) return result;
  }
  for (const reading of sensorReadings) {
    const result = sensorsInfo.addSensorReading(reading);
    if (!result.isOk) return result;
  }
  return Errors.VOID_RESULT;
}



/****************************** Utilities ******************************/

//TODO add any utility functions or classes
type Timestamp = number;

type SensorReadingSearch = {
	sensorId: string,
	minTimestamp: Timestamp;
	maxTimestamp: Timestamp;
	minValue: number;
	maxValue: number;
};

function makeSensorReadingsSearch(search: Checked<FlatReq>)
	: SensorReadingSearch
{
	const search1: SensorReadingSearch = {
		sensorId: search.sensorId,
		minTimestamp: -Infinity, maxTimestamp: Infinity,
		minValue: -Infinity, maxValue: Infinity,
	};
	for (const k of ['minTimestamp', 'maxTimestamp', 'minValue', 'maxValue']) {
		const k1: keyof SensorReadingSearch = 
			k as keyof Omit<sensorReadingSearch, 'sensorId'>;
		if (search[k] !== undefined) search1[k1] = Number(search[k]);
	}
	return search1;
}

function filter<T>(search: Record<keyof T, string>, list: T[]) : T[] {
	const check = (obj: T, k: keyof T, v: string) =>
		(v.length === 0 || obj[k] === undefined || obj[k] === v);
	const select = (obj: T) => Object.entries(search)
		.every(([k, v]: [string, string]) => check(obj, k as keyof T, v));
	return list.filter(obj => select(obj));
}

type ID = string;
type Indexes<T> = Record<keyof T, Record<string, Set<ID>>>;

class IndexedCollection<T extends Record<string, any>> {
	private primaryKey: keyof T;
	private objects: Record<ID, T>;
	private indexes: Indexes<T>;
	constructor(primaryKey: keyof T, secondaryKeys: (keyof T)[]) {
		this.primaryKey = primaryKey;
		this.objects = {};
		this.indexed = {} as Indexes<T>;
		for (const k of secondaryKeys) this.indexes[k] = {};
	}
	
	clear() {
		this.objects = {};
		for (const k of Object.keys(this.indexes)) {
			this.indexes[k as keyof T] = {};
		}
	}
	
	add(obj: T) {
		const id = obj[this.primaryKey] as string;
		this.objects[id] = obj;
		for (const k of Object.keys(this.indexes)) {
			const v = String(obj[k]);
			this.indexes[k][v].add(id);
		}
	}
	
	find(search: Record<keyof T, string>) : T[] {
		const searchId = search[this.primaryKey] ?? '';
		let ids = (searchId.length > 0)
			? new Set((this.objects[searchId]) ? [searchId] : [])
			: new Set(Object.keys(this.objects));
		const searchPairs = 
			Object.entries(search).filter(([k,_]) => k !== this.primaryKey)
		for (const [k, v] of searchPairs) {
			const index = this.indexes[k];
			if (index) {
				const indexIds = index[v] ?? new Set<ID>();
				ids = intersection(ids, indexIds);
			}
		}
		return [...ids].sort().map(id => this.objects[id]);
	}
}

function intersection<T>(set1: Set<T>, set2: Set<T>) {
	const [iterSet, argSet] = 
		(set1.size < set2.size) ? [set1, set2] : [set2, set1];
	return new Set<T>([...iterSet].filter(e => argSet.has(e)));
};
			
