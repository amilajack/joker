declare class Batch {
    constructor();
    addBefore(fn: any): void;
    addAfter(fn: any): void;
    add(fn: any): void;
    main(fn: any): void;
    hasMain(): boolean;
    run(fn: any): void;
}
export default Batch;
