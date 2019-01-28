declare class Result {
    cmd: string;
    code: string;
    options: {
        newLines: boolean;
        colors: boolean;
    };
    constructor(cmd: string, code: string, options?: {
        colors: boolean;
        newlines: boolean;
    });
    parse(stdout: string, stderr: string, err: any): this;
    strip(str: string): string;
}
export default Result;
