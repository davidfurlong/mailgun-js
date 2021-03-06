import Request from './request';
interface DomainData {
    name: string;
    require_tls: any;
    skip_verification: any;
    state: any;
    wildcard: any;
    spam_action: any;
    created_at: string | Date;
    smtp_password: string;
    smtp_login: string;
    type: string;
}
declare class Domain {
    name: any;
    require_tls: any;
    skip_verification: any;
    state: any;
    wildcard: any;
    spam_action: any;
    created_at: any;
    smtp_password: any;
    smtp_login: any;
    type: any;
    receiving_dns_records: any;
    sending_dns_records: any;
    constructor(data: DomainData, receiving?: any, sending?: any);
}
export default class DomainClient {
    request: Request;
    constructor(request: Request);
    _parseMessage(response: {
        body: any;
    }): any;
    _parseDomainList(response: {
        body: {
            items: DomainData;
        };
    }): Domain[];
    _parseDomain(response: {
        body: {
            domain: any;
            receiving_dns_records: any;
            sending_dns_records: any;
        };
    }): Domain;
    _parseTrackingSettings(response: {
        body: {
            tracking: any;
        };
    }): any;
    _parseTrackingUpdate(response: {
        body: any;
    }): any;
    list(query: any): Promise<Domain[]>;
    get(domain: string): Promise<Domain>;
    create(data: any): Promise<Domain>;
    destroy(domain: string): Promise<any>;
    getTracking(domain: string): Promise<any>;
    updateTracking(domain: string, type: string, data: any): Promise<any>;
}
export {};
