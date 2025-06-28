/* eslint-disable @typescript-eslint/no-explicit-any */
process.env.AWS_ACCESS_KEY_ID = "fake-access";
process.env.AWS_SECRET_ACCESS_KEY = "fake-secret";
process.env.AWS_REGION = "us-east-1";
process.env.S3_BUCKET_NAME = "my-bucket";
process.env.HTML2PDF_API_KEY = "fake-html2pdf";

import { createMocks } from "node-mocks-http";

const postMock = jest.fn();
const uploadDoneMock = jest.fn();

// mock axios
jest.mock("axios", () => ({
  post: (...args: any[]) => postMock(...args),
}));

// mock Upload
jest.mock("@aws-sdk/lib-storage", () => ({
  Upload: jest.fn().mockImplementation(() => ({
    done: uploadDoneMock,
  })),
}));

// mock S3Client
jest.mock("@aws-sdk/client-s3", () => ({
  S3Client: jest.fn().mockImplementation(() => ({
    send: jest.fn(),
  })),
}));

import handler from "@/pages/api/generate-pdf";

describe("/api/generate-pdf", () => {
  beforeEach(() => {
    postMock.mockReset();
    uploadDoneMock.mockReset();
  });

  it("should return 405 for non-POST methods", async () => {
    const { req, res } = createMocks({
      method: "GET",
    });
    await handler(req, res);
    expect(res._getStatusCode()).toBe(405);
  });

  it("should return 400 if html or session_id missing", async () => {
    const { req, res } = createMocks({
      method: "POST",
      body: {},
    });
    await handler(req, res);
    expect(res._getStatusCode()).toBe(400);
    expect(res._getJSONData()).toHaveProperty("error");
  });

  it("should return 200 and pdfUrl if success", async () => {
    const fakePdfBuffer = Buffer.from("PDF-DATA");
    postMock.mockResolvedValueOnce({
      data: fakePdfBuffer,
    });
    uploadDoneMock.mockResolvedValueOnce(true);

    const { req, res } = createMocks({
      method: "POST",
      body: {
        html: "<h1>teste</h1>",
        session_id: "sess_123",
      },
    });

    await handler(req, res);

    expect(postMock).toHaveBeenCalled();
    expect(uploadDoneMock).toHaveBeenCalled();

    expect(res._getStatusCode()).toBe(200);
    const data = res._getJSONData();
    expect(data).toHaveProperty("pdfUrl");
    expect(typeof data.pdfUrl).toBe("string");
  });

  it("should return 500 if html2pdf fails", async () => {
    postMock.mockRejectedValueOnce(new Error("html2pdf down"));

    const { req, res } = createMocks({
      method: "POST",
      body: {
        html: "<h1>teste</h1>",
        session_id: "sess_123",
      },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(500);
    expect(res._getJSONData()).toHaveProperty("error");
  });
});
