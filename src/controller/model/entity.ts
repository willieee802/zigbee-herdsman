import Database from '../database';
import {Adapter} from '../../adapter';
import events from 'events';

abstract class Entity extends events.EventEmitter {
    protected static databases: Map<number, Database> = new Map<number, Database>();
    protected static adapters: Map<number, Adapter> = new Map<number, Adapter>();

    public static injectDatabase(database: Database): void {
        Entity.databases.set(database.id, database);
    }

    public static databaseIDExists(id: number): boolean {
        return Entity.databases.get(id) !== undefined;
    }

    public static getDatabaseByID(id: number): Database {
        return Entity.databases.get(id);
    }

    public static injectAdapter(databaseID: number, adapter: Adapter): void {
        Entity.adapters.set(databaseID, adapter);
    }

    public static getAdapterByID(id: number): Adapter {
        return Entity.adapters.get(id);
    }
}

export default Entity;