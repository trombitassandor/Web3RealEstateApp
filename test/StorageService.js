const { expect } = require("chai");
const fs = require('fs');
const { default: PinataStorageService } = require('../scripts/pinataStorageService');

describe("PinataStorageService", function () {
  let pinataStorageService;
  const mockApiKey = '007cc80ed8bdb18134b8';
  const mockApiSecret = '21c4c0dcabcced58efbb4104b94d82b6826ce277308bd818529911260ff13534';
  let cid;
  const filePath = './metadata/RealEstate00.json';

  beforeEach(() => {
    pinataStorageService = new PinataStorageService(mockApiKey, mockApiSecret);
  });

  it("should upload a file and return the CID", async function () {
    cid = await pinataStorageService.uploadFile(filePath);
    expect(cid).to.be.a('string');
    expect(cid.length).to.be.greaterThan(0);
  });

  it("should fetch a file URL from a CID", async function () {
    const fileUrl = await pinataStorageService.fetchFile(cid);
    expect(fileUrl).to.include('pinata.cloud');
  });

  it("should list pinned files", async function () {
    const pinnedFiles = await pinataStorageService.listPinnedFiles();
    expect(pinnedFiles).to.be.an('array');
    expect(pinnedFiles).to.have.length.greaterThan(0);
  });
});
