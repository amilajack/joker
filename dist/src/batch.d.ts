declare type BatchFn = (error: Error) => void;
export default class Batch {
    before: Array<BatchFn>;
    afterBefore: Array<BatchFn>;
    after: Array<BatchFn>;
    beforeAfter: Array<BatchFn>;
    fn: BatchFn | null;
    constructor();
    addBefore(fn: BatchFn): void;
    addAfter(fn: BatchFn): void;
    add(fn: BatchFn): void;
    main(fn: BatchFn): void;
    hasMain(): boolean;
    run(fn: BatchFn): void;
}
export {};
