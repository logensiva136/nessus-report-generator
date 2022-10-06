const axios = require("axios");
const https = require("https");
const fileDownload = require("js-file-download");
const fs = require("fs");

const api = axios.create({
  baseURL: "https://192.168.100.24:8834/",
  httpsAgent: new https.Agent({
    rejectUnauthorized: false,
  }),
  headers: {
    Accept: "application/json",
    "Content-type": "application/json",
    "X-ApiKeys":
      "accessKey=69b355f439f0a81f216e72ec79fd5009c21822e9506e9228ec62d875790defce;secretKey=3a811d99586e8036cdd4d9f8834bae782b798c3297005cc6cd6aeb9c2552853e;",
  },
});

exports.getFolders = async () => {
  return await api({
    method: "GET",
    url: `/folders`,
  })
    .then((data) => {
      // console.log(data.length);
      return data.data;
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.getScansResults = async (folderId) => {
  // console.log(typeof +folderId);
  return await api({
    method: "GET",
    url: `scans?folder_id=${folderId}`,
    // data: {
    //   folder_id: +folderId,
    // },
  })
    .then((data) => {
      return data.data.scans;
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.download = async (id, fn) => {
  const genFId = await api({
    method: "POST",
    url: `scans/${id}/export`,
    headers: {
      accept: "application/octet-stream",
    },
    data: {
      format: "csv",
    },
  })
    .then((data) => {
      return data.data.file;
    })
    .catch((err) => console.log(err));

  // console.log(genFId);
  return await api({
    method: "GET",
    url: `scans/${id}/export/${genFId}/download`,
    headers: {
      accept: "application/octet-stream",
    },
  })
    .then(async (data) => {
      return {
        name: await data.headers["content-disposition"].split('"')[1],
        data: await data.data,
      };
    })
    .catch((err) => console.log(err));

  // accept: application/octet-stream
};
