import Logger from 'bunyan';
import AWS from 'aws-sdk';
import {ResourceId} from "aws-sdk/clients/route53";

export const updateDomainARecord = async (logger: Logger, domain: string, ip: string) => {
    logger.info(`Looking up zone for ${domain}`);
    const zone = await findZone(logger, domain);
    if (zone) {
        const zoneId = zone.Id;
        logger.info(`Found zone for ${domain}: ${zoneId}`);
        await updateARecord(logger, zoneId, domain, ip);
    } else {
        logger.info(`Unable to find AWS Route 53 zone to update for domain ${domain}`);
        throw new Error(`Unable to find AWS Route 53 zone to update for domain ${domain}`);
    }
};

const findZone = async (logger: Logger, domain: string) => {
    try {
        const route53 = new AWS.Route53();
        const zones = await route53.listHostedZones().promise();
        return zones.HostedZones.find(z=> z.Name === `${domain}.`);
    } catch (err) {
        logger.error({
            awsError: err.message,
            message:`Unable to find AWS Route 53 zone to update for domain ${domain}`
        });
        throw new Error(`Unable to find AWS Route 53 zone to update for domain ${domain}`);
    }
};

const updateARecord = async (logger: Logger, zoneId: ResourceId, domain: string, ip: string) => {
    try {
        const route53 = new AWS.Route53();
        const params = {
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
            HostedZoneId: zoneId
        };
        logger.info(`Starting A record update for ${domain} on ${zoneId}`);
        await route53.changeResourceRecordSets(params).promise();
        logger.info(`Completed A record update for ${domain} on ${zoneId}`);
    } catch (err) {
        logger.error({
            awsError: err.message,
            message:`Unable to update zone for domain ${domain}`
        });
        throw new Error(`Unable to update zone for domain ${domain}`);
    }
};