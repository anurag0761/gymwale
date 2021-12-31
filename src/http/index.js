import { API_URL } from './config';
import axios from 'axios';
import AsyncStorage from '@react-native-community/async-storage';
// import {_getUser} from '../api/auth';

// let session_key = false;

let headers = {
    'Content-type': 'application/x-www-form-urlencoded',
    'Accept': 'application/json',
};
let client = axios.create({
  // baseURL: API_URL,
  headers,
  withCredentials: false,
});headers
client.interceptors.request.use(async (config) => {
  // let token = await _getUser()
  // const token = await AsyncStorage.getItem('user')
  //   .then((res) => JSON.parse(res))
  //   .then((res) => (res ? res.token : null))
  //   .catch(() => false);
  // console.log('AUTHORIZATION TOKEN ', token);
//   config.headers.Authorization = `Bearer ${token}`;
  // console.log('CONFIG ', config);
  return config;
});

client.interceptors.response.use(
  async function (response) {
    // let session_key = await _getSessionToken().then(session_key=>session_key).catch(err=>false);
    // if(session_key === false){
    //  await _setSessionToken(response.headers.session_key)
    // }
    // console.log('interceptor res : ', response);
    return response.data;
  },
  function ({ response }) {
    return Promise.reject({ status: response.status, ...response.data });
  }
);

export default {
  get: async function (url, data) {
    // return new Promise((resolve, reject) => {
    return await client.get(url, { params: data });
    //     .then((res) => {
    //       resolve(res);
    //     })
    //     .catch((error) => {
    //       reject(error);
    //     });
    // });
  },
  post: async function (url, data) {
    return new Promise((resolve, reject) => {
      client
        .post(url, data)
        .then((res) => {
          resolve(res);
        })
        .catch((error) => {
          reject(error);
        });
    });
  },
  put: async function (url, data) {
    return new Promise((resolve, reject) => {
      client
        .put(url, data)
        .then((res) => {
          resolve(res);
        })
        .catch((error) => {
          reject(error);
        });
    });
  },
  delete: async function (url, data) {
    return new Promise((resolve, reject) => {
      client
        .delete(url, data)
        .then((res) => {
          resolve(res);
        })
        .catch((error) => {
          reject(error);
        });
    });
  },
  fetch: (options) => client(options),
};
