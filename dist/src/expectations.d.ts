import AssertionError from 'assertion-error';
export declare function code(code: any): (result: any) => AssertionError<{}> | undefined;
export declare function time(): (result: any) => any;
export declare function stderr(expected: any): (result: any) => AssertionError<{}> | undefined;
export declare function stdout(expected: any): (result: any) => AssertionError<{}> | undefined;
export declare function exists(path: any): (result: any) => any;
export declare function match(path: any, data: any): (result: any) => AssertionError<{}> | undefined;
