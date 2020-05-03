import { index } from "./Home";
import { Response } from "express";

describe("Home", () => {
    describe("index", () => {
        it("should return simple home content", () => {
            const resMock = {
                json: jest.fn()
            } as unknown as Response;
            index({} as any, resMock);
            expect(resMock.json).toBeCalledWith({
                message: "Dynamic DNS Service"
            });
        });
    });
});