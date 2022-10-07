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
  }).catch((err) => {
    console.log(err);
  });

  return result.data;
};

exports.getScansResults = async (folderId) => {
  const scans = await api({
    method: "GET",
    url: `scans?folder_id=${folderId}`,
  }).catch((err) => {
    console.log(err);
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
      template_id: "",
      reportContents: {
        csvColumns: {
          id: true,
          cve: true,
          cvss: true,
          risk: true,
          hostname: true,
          protocol: true,
          port: true,
          plugin_name: true,
          synopsis: true,
          description: true,
          solution: true,
          see_also: true,
          plugin_output: true,
          stig_severity: true,
          cvss3_base_score: true,
          cvss_temporal_score: true,
          cvss3_temporal_score: true,
          risk_factor: true,
          references: true,
          plugin_information: true,
          exploitable_with: true,
        },
      },
      extraFilters: { host_ids: [], plugin_ids: [] },
    },
  }).catch((err) => {
    console.log(err);
  });
  // console.log(genFId.data);
  // setTimeout(() => {}, 500);

  while (true) {
    const status = await api({
      method: "GET",
      url: `scans/${id}/export/${genFId.data.file}/status`,
      headers: {
        accept: "application/json",
      },
    });
    if (status.data.status !== "ready") {
      {
      }
    } else {
      break;
    }
  }

  const result = await api({
    method: "GET",
    url: `scans/${id}/export/${genFId.data.file}/download`,
    headers: {
      accept: "application/octet-stream",
    },
  }).catch((err) => {
    console.log(err);
  });

  return {
    name: await result.headers["content-disposition"].split('"')[1],
    data: await result.data,
  };
};
