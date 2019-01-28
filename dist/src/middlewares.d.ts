import World from './world';
export declare function mkdir(path: string): (next: any) => void;
export declare function writeFile(path: string, data: string): (next: any) => void;
export declare function rmdir(path: string): (next: any) => void;
export declare function unlink(path: string): (next: any) => void;
export declare function exec(cmd: string, world: World): (next: any) => void;
