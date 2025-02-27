import {apiURL} from "../config.js"

import axios from "axios"

class RestService {
    constructor() {
        this.url = apiURL
        this.token = sessionStorage.getItem("token")
    }

    _post(path, body, authenticate = true) {
        const requestOptions = {
            'Content-Type': "application/json"
        }
        if (authenticate) {
            requestOptions.Authorization = `Bearer ${this.token}`
        }
        return axios.post(this.url + path, body, requestOptions)
            .then((response) => {
                return response.data;
            }).catch((error) => {
                throw new Error(error.response?.data?.message)
            })
    }

    _get(path, authenticate = true) {
        const requestOptions = {
            'Content-Type': "application/json"
        }
        if (authenticate) {
            requestOptions.Authorization = `Bearer ${this.token}`
        }
        return this._request(path, requestOptions, 'get')
    }

    _getById(path, id, authenticate = true) {
        const requestOptions = {
            'Content-Type': "application/json"
        }
        if (authenticate) {
            requestOptions.Authorization = `Bearer ${this.token}`
        }
        return this._request(path + "/" + id, requestOptions, 'get')
    }

    _put(path, id, body, authenticate = true) {
        this._authenticate = authenticate;
        return axios.put(this.url + path + "/" + id, body)
            .then((response) => {
                return response.data;
            }).catch((error) => {
                throw new Error(error.response?.data?.message)
            })
    }

    _delete(path, id, authenticate = true) {
        const requestOptions = {
            'Content-Type': "application/json"
        }
        if (authenticate) {
            requestOptions.Authorization = `Bearer ${this.token}`
        }
        return this._request(path + "/" + id, requestOptions, 'delete')
    }

    _request(path, options, metodo) {
        return axios[metodo.toLowerCase()](this.url + path, options)
            .then((response) => {
                return response.data;
            }).catch((error) => {
                throw new Error(error.response?.data?.message)
            })
    }
}

export default RestService