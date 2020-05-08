import Logger from 'bunyan';
import {updateDomainARecord} from "./Route53Updater";
import AWS from 'aws-sdk';

jest.mock('aws-sdk');
const mockedAWS: jest.Mocked<typeof AWS> = AWS as any;

describe('Route53Updater', () => {
    let logger: Logger;
    const domain = "domain.com";
    const ip = "1.2.3.4";
    const mockedListHostedZonesPromise = jest.fn();
    const mockedChangeResourceRecordSets= jest.fn();
    const mockedChangeResourceRecordSetsPromise= jest.fn();
    beforeEach(() => {
        logger = Logger.createLogger({
            name: "test"
        });
        mockedChangeResourceRecordSets.mockImplementation(() => {
            return {
                promise: mockedChangeResourceRecordSetsPromise
            };
        });
        mockedAWS.Route53.mockImplementation(() => {
            return {
                listHostedZones: () => {
                    return {
                        promise: mockedListHostedZonesPromise
                    };
                },
                changeResourceRecordSets: mockedChangeResourceRecordSets
            } as unknown as AWS.Route53;
        });
    });

    describe('updateDomainARecord', () => {
       it('should update the IP address for a domain with a zone available to update', async () => {
           mockedListHostedZonesPromise.mockResolvedValue({
               HostedZones: [{
                   Name: `${domain}.`,
                   Id: "test-id"
               }]
           });
           await updateDomainARecord(logger, domain, ip);
           expect(mockedChangeResourceRecordSets).toBeCalledWith({
               ChangeBatch: {
                   Changes: [
                       {
                           Action: "UPSERT",
                           ResourceRecordSet: {
                               Name: domain,
                               ResourceRecords: [
                                   {
                                       Value: ip
                                   }
                               ],
                               TTL: 300,
                               Type: "A"
                           }
                       }
                   ]
               },
               HostedZoneId: "test-id"
           });
       });
        it('should throw an error if the zone lookup throws an error', async () => {
            mockedListHostedZonesPromise.mockRejectedValue(new Error("test error"));
            let error: Error = new Error();
            try {
                await updateDomainARecord(logger, domain, ip);
            } catch (err) {
                error = err;
            }
            expect(error.message).toBe(`Unable to find AWS Route 53 zone to update for domain ${domain}`);
        });
        it('should throw an error if the zone lookup does not return a matching zone', async () => {
            mockedListHostedZonesPromise.mockResolvedValue({
                HostedZones: [{
                    Name: "different-domain.com",
                    Id: "test-id"
                }]
            });
            let error: Error = new Error();
            try {
                await updateDomainARecord(logger, domain, ip);
            } catch (err) {
                error = err;
            }
            expect(error.message).toBe(`Unable to find AWS Route 53 zone to update for domain ${domain}`);
        });
        it('should throw an error if the zone A record update fails', async () => {
            mockedListHostedZonesPromise.mockResolvedValue({
                HostedZones: [{
                    Name: `${domain}.`,
                    Id: "test-id"
                }]
            });
            mockedChangeResourceRecordSetsPromise.mockRejectedValue(new Error("bob"));
            let error: Error = new Error();
            try {
                await updateDomainARecord(logger, domain, ip);
            } catch (err) {
                error = err;
            }
            expect(error.message).toBe(`Unable to update zone for domain ${domain}`);
        });
    });
});