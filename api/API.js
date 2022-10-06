const axios = require("axios");
const https = require("https");
const fileDownload = require("js-file-download");
const fs = require("fs");

const api = axios.create({
  baseURL: process.env.IP + ":8834/",
  httpsAgent: new https.Agent({
    rejectUnauthorized: false,
  }),
  headers: {
    Accept: "application/json",
    "Content-type": "application/json",
    "X-ApiKeys":
      "accessKey=" +
      process.env.ACCESSKEY +
      ";secretKey=" +
      process.env.SECRETKEY,
  },
});

exports.getFolders = async () => {
  const result = await api({
    method: "GET",
    url: `/folders`,
  });

  return result.data;
};

exports.getScansResults = async (folderId) => {
  const scans = await api({
    method: "GET",
    url: `scans?folder_id=${folderId}`,
  });

  return scans.data.scans;
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
  });

  const result = await api({
    method: "GET",
    url: `scans/${id}/export/${genFId.data.file}/download`,
    headers: {
      accept: "application/octet-stream",
    },
  });

  return {
    name: await result.headers["content-disposition"].split('"')[1],
    data: await result.data,
  };
};
