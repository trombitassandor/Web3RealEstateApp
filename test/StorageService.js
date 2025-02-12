const { expect } = require("chai");
const fs = require('fs');
const { default: PinataStorageService } = require('../scripts/pinataStorageService');

describe("PinataStorageService", function () {
  let pinataStorageService;
  const apiKey = '007cc80ed8bdb18134b8';
  const apiSecret = '21c4c0dcabcced58efbb4104b94d82b6826ce277308bd818529911260ff13534';
  let cid;
  const filePath = './metadata/RealEstate00.json';

  this.beforeAll(() => {
    pinataStorageService = new PinataStorageService(apiKey, apiSecret);
  });

  it("should upload a file from path and return the CID", async function () {
    cid = await pinataStorageService.uploadFileFromPath(filePath);
    expect(cid).to.be.a('string');
    expect(cid.length).to.be.greaterThan(0);
  });

  it("should upload a file and return the CID", async function () {
    const file = fs.createReadStream(filePath);
    const fileName = filePath.split('/').pop();
    cid = await pinataStorageService.uploadFile(file, fileName);
    expect(cid).to.be.a('string');
    expect(cid.length).to.be.greaterThan(0);
  });

  it("should fetch a file URL from a CID", async function () {
    const fileUrl = await pinataStorageService.getUrl(cid);
    expect(fileUrl).to.include('pinata.cloud');
  });

  it("should list pinned files", async function () {
    const pinnedFiles = await pinataStorageService.listPinnedFiles();
    expect(pinnedFiles).to.be.an('array');
    expect(pinnedFiles).to.have.length.greaterThan(0);
  });

  it("should get pinned file", async function () {
    const file = await pinataStorageService.fetchFile(cid);
    const jsonFile = await file.json();
    console.log("jsonFile=", jsonFile);
  });

  it("should unpin a file successfully", async function () {
    const pinnedFiles = await pinataStorageService.listPinnedFiles();
    console.log("pinned files before pin\n", pinnedFiles);
    const result = await pinataStorageService.unpinFile(cid);
    expect(result).to.have.property('message')
      .that.equals('Successfully unpinned file');
  });
});
