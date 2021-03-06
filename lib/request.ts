
import Btoa from 'btoa';

import merge from 'lodash.merge';
import urljoin from 'url-join';

import ky from 'ky-universal';

import APIError from './error';
import RequestOptions from './interfaces/RequestOptions';
import APIErrorOptions from './interfaces/APIErrorOptions';

const isStream = (attachment: any) => typeof attachment === 'object' && typeof attachment.pipe === 'function';

const getAttachmentOptions = (item: any): { filename?: string, contentType?: string, knownLength?: number } => {
  if (typeof item !== 'object' || isStream(item)) return {};

  const {
    filename,
    contentType,
    knownLength
  } = item;

  return {
    ...(filename ? { filename } : { filename: 'file' }),
    ...(contentType && { contentType }),
    ...(knownLength && { knownLength })
  };
}

class Request {
  private username;
  private key;
  private url;
  private headers: any;
  private formData: FormData;

  constructor(options: RequestOptions, formData: FormData) {
    this.username = options.username;
    this.key = options.key;
    this.url = options.url;
    this.headers = options.headers || {};
    this.formData = formData;
  }

  async request(method: string, url: string, options?: any) {
    const basic = Btoa(`${this.username}:${this.key}`);
    const headers = merge({
      Authorization: `Basic ${basic}`
    }, this.headers, options?.headers);

    delete options?.headers;

    const params = { ...options };

    if (options?.query && Object.getOwnPropertyNames(options?.query).length > 0) {
      params.searchParams = options.query;
      delete params.query
    }

    const response = await ky(
      urljoin(this.url, url),
      {
        method: method.toLocaleUpperCase(),
        headers,
        throwHttpErrors: false,
        ...params
      }
    );

    if (!response?.ok) {
      throw new APIError({
        status: response?.status,
        statusText: response?.statusText,
        body: await response?.json()
      } as APIErrorOptions);
    }

    return {
      body: await response?.json(),
      status: response?.status
    };
  }

  query(method: string, url: string, query: any, options?: any) {
    return this.request(method, url, { query, ...options });
  }

  command(method: string, url: string, data: any, options?: any) {
    return this.request(method, url, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      // json: data,
      body: data,
      ...options
    });
  }

  get(url: string, query?: any, options?: any) {
    return this.query('get', url, query, options);
  }

  head(url: string, query: any, options: any) {
    return this.query('head', url, query, options);
  }

  options(url: string, query: any, options: any) {
    return this.query('options', url, query, options);
  }

  post(url: string, data: any, options?: any) {
    return this.command('post', url, data, options);
  }

  postMulti(url: string, data: any) {

    const formData: FormData = new (this.formData as any)();
    const options: any = {
      headers: { 'Content-Type': null }
    };

    Object.keys(data)
      .filter(function (key) { return data[key]; })
      .forEach(function (key) {
        if (key === 'attachment') {
          const obj = data.attachment;

          if (Array.isArray(obj)) {
            obj.forEach(function (item) {
              const data = item.data ? item.data : item;
              const options = getAttachmentOptions(item);
              (formData as any).append(key, data, options);
            });
          } else {
            const data = isStream(obj) ? obj : obj.data;
            const options = getAttachmentOptions(obj);
            (formData as any).append(key, data, options);
          }

          return;
        }

        if (Array.isArray(data[key])) {
          data[key].forEach(function (item: any) {
            formData.append(key, item);
          });
        } else {
          formData.append(key, data[key]);
        }
      });

    return this.command('post', url, formData, options);
  }

  put(url: string, data: any, options?: any) {
    return this.command('put', url, data, options);
  }

  patch(url: string, data: any, options?: any) {
    return this.command('patch', url, data, options);
  }

  delete(url: string, data?: any, options?: any) {
    return this.command('delete', url, data, options);
  }
}

export default Request