import { Nic } from "./Nic";
import Logger from "bunyan";
import {NextFunction, Request, Response} from "express";
import {verifyErrResponse} from "../test/helpers";

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
        beforeEach(() => {
            nic = new Nic(logger);
            req = {
                headers: {
                    authorization: "Basic " + Buffer.from("testUser:testPass").toString('base64')
                },
                query: {
                    myip: "192.13.14.1",
                    hostname: "itsamiricle.com"
                }
            } as unknown as Request;
            res = {
                status: mockResStatus,
                json: mockJson
            } as unknown as Response;
            next = jest.fn();
        });
        it('should update IP with valid credentials', () => {
            nic.update(req, res);
            verifyErrResponse(mockResStatus, mockJson, 501, 'Endpoint Incomplete');
        });
        it('should not update IP with missing authorisation header', () => {
            delete req.headers.authorization;
            nic.update(req, res);
            verifyErrResponse(mockResStatus, mockJson, 401, 'Update failed due to invalid authorisation header.');
        });
        it('should not update IP with incorrect credentials in authorisation header', () => {
            req.headers.authorization = "blah blah blah";
            nic.update(req, res);
            verifyErrResponse(mockResStatus, mockJson, 401, 'Update failed due to invalid authorisation header.');
        });
        it('should not update IP with missing hostname paramater', () => {
            delete req.query.hostname;
            nic.update(req, res);
            verifyErrResponse(mockResStatus, mockJson, 400, 'Failed update due to hostname missing from query parameters.');
        });
        it('should not update IP with missing IP parameter', () => {
            delete req.query.myip;
            nic.update(req, res);
            verifyErrResponse(mockResStatus, mockJson, 400, 'Failed update due to IP address missing from query parameters.');
        });
        it('should not update IP with invalid IP parameter', () => {
            req.query.myip = "plaster";
            nic.update(req, res);
            verifyErrResponse(mockResStatus, mockJson, 400, 'Failed update due to IP address missing from query parameters.');
        });
    });
});