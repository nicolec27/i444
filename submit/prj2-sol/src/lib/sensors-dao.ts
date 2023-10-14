import { SensorType, Sensor, SensorReading,
	 SensorTypeSearch, SensorSearch, SensorReadingSearch,
       } from './validators.js';

import { Errors, } from 'cs544-js-utils';

import * as mongo from 'mongodb';

/** All that this DAO should do is maintain a persistent data for sensors.
 *
 *  Most routines return an errResult with code set to 'DB' if
 *  a database error occurs.
 */

/** return a DAO for sensors at URL mongodbUrl */
export async function
makeSensorsDao(mongodbUrl: string) : Promise<Errors.Result<SensorsDao>> {
  return SensorsDao.make(mongodbUrl);
}

//the types stored within collections
type DbSensorType = SensorType & { _id: string };
type DbSensor = Sensor & { _id: string };

//options for new MongoClient()
const MONGO_OPTIONS = {
  ignoreUndefined: true,  //ignore undefined fields in queries
};

export class SensorsDao {

  
  private constructor(private readonly client: mongo.MongoClient,
    private readonly sensorTypes: mongo.Collection<DbSensorType>,
    private readonly sensors: mongo.Collection<DbSensor>) {
    //TODO
  }

  /** factory method
   *  Error Codes: 
   *    DB: a database error was encountered.
   */
  static async make(dbUrl: string) : Promise<Errors.Result<SensorsDao>> {
    try {
      const client = await (new mongo.MongoClient(dbUrl, MONGO_OPTIONS)).connect();
      const db = client.db();
      const sensorTypes = db.collection<DbSensorType>(ST_COLLECTION);
      await sensorTypes.createIndex('sensorTypeId');
      const sensors = db.collection<DbSensor>(SENSOR_COLLECTION);
      await sensors.createIndex('sensorId');
      return Errors.okResult(new SensorsDao(client, sensorTypes, sensors));
    }
    catch (error) {
      return Errors.errResult(error.message, 'DB');
    }
  }

  /** Release all resources held by this dao.
   *  Specifically, close any database connections.
   *  Error Codes: 
   *    DB: a database error was encountered.
   */
  async close() : Promise<Errors.Result<void>> {
    try {
      await this.client.close();
      return Errors.VOID_RESULT;
    }
    catch (e) {
      return Errors.errResult(e.message, 'DB');
    }
  }

  /** Clear out all sensor info in this database
   *  Error Codes: 
   *    DB: a database error was encountered.
   */
  async clear() : Promise<Errors.Result<void>> {
    try {
      await this.sensorTypes.deleteMany({});
      await this.sensors.deleteMany({});
      return Errors.VOID_RESULT;
    }
    catch (e) {
      return Errors.errResult(e.message, 'DB');
    }
  }


  /** Add sensorType to this database.
   *  Error Codes: 
   *    EXISTS: sensorType with specific id already exists in DB.
   *    DB: a database error was encountered.
   */
  async addSensorType(sensorType: SensorType)
    : Promise<Errors.Result<SensorType>>
  {
    const sensorTypeObj = { ...sensorType, _id: sensorType.id };
    try {
      const registeredSensorType = await this.sensorTypes.findOne({ _id: sensorType.id});
      if (registeredSensorType) {
        return Errors.errResult('Sensor type already exists.', 'EXISTS')
      }
      const collection = this.sensorTypes;
      await collection.insertOne(sensorTypeObj);
    }
    catch (e) {
      return Errors.errResult(e.message, 'DB');
    }
    return Errors.okResult(sensorTypeObj);
  }

  /** Add sensor to this database.
   *  Error Codes: 
   *    EXISTS: sensor with specific id already exists in DB.
   *    DB: a database error was encountered.
   */
  async addSensor(sensor: Sensor) : Promise<Errors.Result<Sensor>> {
    const sensorObj = { ...sensor, _id: sensor.id };
    try {
      const registeredSensor = await this.sensors.findOne({ _id: sensor.id });
      if (registeredSensor) {
        return Errors.errResult('Sensor already exists.', 'EXISTS');
      }
      const collection = this.sensors;
      await collection.insertOne(sensorObj);
    } catch (e) {
      return Errors.errResult(e.message, 'DB');
    }
    return Errors.okResult(sensorObj);
  }

  /** Add sensorReading to this database.
   *  Error Codes: 
   *    EXISTS: reading for same sensorId and timestamp already in DB.
   *    DB: a database error was encountered.
   */
  async addSensorReading(sensorReading: SensorReading)
    : Promise<Errors.Result<SensorReading>> 
  {
    return Errors.errResult('todo', 'TODO');
  }

  /** Find sensor-types which satify search. Returns [] if none. 
   *  Note that all primitive SensorType fields can be used to filter.
   *  The returned array must be sorted by sensor-type id.
   *  Error Codes: 
   *    DB: a database error was encountered.
   */
  async findSensorTypes(search: SensorTypeSearch)
    : Promise<Errors.Result<SensorType[]>> 
  {
    try {
      const collection = this.sensorTypes;
      const query = { ...search }; 
      const sensorTypes = await collection.find(query).toArray();
      return Errors.okResult(sensorTypes);
    } catch (e) {
      return Errors.errResult(e.message, 'DB');
    }
  }
  
  /** Find sensors which satify search. Returns [] if none. 
   *  Note that all primitive Sensor fields can be used to filter.
   *  The returned array must be sorted by sensor-type id.
   *  Error Codes: 
   *    DB: a database error was encountered.
   */
  async findSensors(search: SensorSearch) : Promise<Errors.Result<Sensor[]>> {
    try {
      const collection = this.sensors;
      const query = { ...search }; 
      const sensors = await collection.find(query).toArray();
      return Errors.okResult(sensors);
    } catch (e) {
      return Errors.errResult(e.message, 'DB');
    }
  }

  /** Find sensor readings which satisfy search. Returns [] if none. 
   *  The returned array must be sorted by timestamp.
   *  Error Codes: 
   *    DB: a database error was encountered.
   */
  async findSensorReadings(search: SensorReadingSearch)
    : Promise<Errors.Result<SensorReading[]>> 
  {
    return Errors.errResult('todo', 'TODO');
  }

  async #nextId() : Promise<string> {
    const query = { sensorTypeId: NEXT_ID_KEY };
    const update = { $inc: { [NEXT_ID_KEY]: 1 } };
    const options =
      { upsert: true, returnDocument: mongo.ReturnDocument.AFTER };
    const counts = this.sensorTypes as unknown as mongo.Collection;
    const ret =  await counts.findOneAndUpdate(query, update, options);
    if (ret !== null) {
      const seq = ret.value[NEXT_ID_KEY];
      return String(seq) + Math.random().toFixed(RAND_LEN).replace(/^0\./, '_');
    }
    return 'ERROR';
  }
  
} //SensorsDao

//mongo err.code on inserting duplicate entry
const MONGO_DUPLICATE_CODE = 11000;
const ST_COLLECTION = 'sensorTypes';
const SENSOR_COLLECTION = 'sensors';
const NEXT_ID_KEY = 'count';
const RAND_LEN = 2;

