import events from "node:events";

import type {Adapter} from "../../adapter";
import type Database from "../database";

// biome-ignore lint/suspicious/noExplicitAny: API
type EventMap<T> = Record<keyof T, any[]> | DefaultEventMap;
type DefaultEventMap = [never];

export abstract class Entity<T extends EventMap<T> = DefaultEventMap> extends events.EventEmitter<T> {
    protected static databases: Map<number, Database> = new Map<number, Database>();
    protected static adapters: Map<number, Adapter> = new Map<number, Adapter>();

    public static injectDatabase(database: Database): void {
        Entity.databases.set(database.id, database);
    }

    public static injectAdapter(databaseID: number, adapter: Adapter): void {
        Entity.adapters.set(databaseID, adapter);
    }

    public static removeDatabase(databaseID: number): void {
        Entity.databases.delete(databaseID);
    }

    public static removeAdapter(databaseID: number): void {
        Entity.adapters.delete(databaseID);
    }

    public static getAdapterByID(id: number): Adapter | undefined {
        return Entity.adapters.get(id);
    }

    public static databaseIDExists(id: number): boolean {
        return Entity.databases.get(id) !== undefined;
    }

    public static getDatabaseByID(id: number): Database | undefined {
        return Entity.databases.get(id);
    }
}

export default Entity;
