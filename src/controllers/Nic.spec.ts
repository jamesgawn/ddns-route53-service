import { Nic } from "./Nic";
import Logger from "bunyan";
import {NextFunction, Request, Response} from "express";

describe("Nic", () => {
    let nic: Nic;
    let testUser: string;
    let testPass: string;
    let logger: Logger;

    beforeAll(() => {
        testUser = "testUser";
        testPass = "testPass";
        logger = Logger.createLogger({
            name: "test-logger"
        });
    });

    beforeEach(() => {
        process.env.SERVICE_USER = testUser;
        process.env.SERVICE_PASS = testPass;
    });

    describe('constructor',  () => {
        it('should successfully create if user and pass env vars are available', () => {
            nic = new Nic(logger);
            expect(nic).toBeInstanceOf(Nic);
            expect(nic).not.toBeNull();
        });
        it('should throw an error if user env var is not available', () => {
            delete process.env.SERVICE_USER;
            try {
                nic = new Nic(logger);
            } catch (err) {
                expect(err.message).toBe("No service credentials specified in environment variables.");
            }
        });
        it('should throw an error if pass env var is not available', () => {
            delete process.env.SERVICE_PASS;
            try {
                nic = new Nic(logger);
            } catch (err) {
                expect(err.message).toBe("No service credentials specified in environment variables.");
            }
        });
    });

    describe('update', () => {
        let req: Request;
        let res: Response;
        let next: NextFunction;

        const mockResStatus = jest.fn();
        const mockJson = jest.fn();
        const mockNext = jest.fn();
        beforeEach(() => {
            nic = new Nic(logger);
            req = {
                headers: {
                    authorisation: undefined
                }
            } as unknown as Request;
            res = {
                status: mockResStatus,
                json: mockJson
            } as unknown as Response;
            next = jest.fn();
        });
        it('should update IP with valid credentials', () => {
            req.headers.authorization = "something";
            nic.update(req, res, mockNext);
            expect(mockResStatus).toBeCalledWith(501);
            expect(mockJson).toBeCalledWith({message: "Endpoint Incomplete"});
        });
        it('should not update IP with missing authorisation header', () => {
            nic.update(req, res, mockNext);
            expect(mockResStatus).toBeCalledWith(401);
            expect(mockNext).toBeCalledWith(new Error('Update failed due to missing authorisation header.'));
        });
    });
});