export declare type Options = {
    newLines: boolean;
    colors: boolean;
};
declare type Error = {
    code: number;
    killed: boolean;
};
export default class Result {
    cmd: string;
    code: number;
    options: Options;
    stdout: string;
    stderr: string;
    killed: boolean;
    err: Error;
    constructor(cmd: string, code: number, options?: Options);
    parse(stdout: string, stderr: string, err: Error): Result;
    strip(str: string): string;
}
export {};
