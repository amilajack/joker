import AssertionError from 'assertion-error';
import Result from './result';
export declare function code(code: number): (result: Result) => AssertionError<{}> | undefined;
export declare function time(): (result: Result) => any;
export declare function stderr(expected: String | RegExp): (result: Result) => AssertionError<{}> | undefined;
export declare function stdout(expected: String | RegExp): (result: Result) => AssertionError<{}> | undefined;
export declare function exists(path: string): (result: Result) => any;
export declare function match(path: string, data: String | RegExp): (result: Result) => AssertionError<{}> | undefined;
