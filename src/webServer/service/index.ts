import * as http from 'http';
import * as httpService from './http/httpService';
import * as wsService from './ws/wsService';

let service: http.Server;
export function start(port: number) {
    service = httpService.start(port);
    wsService.start(service);
}

export function getService() {
    return service;
}
