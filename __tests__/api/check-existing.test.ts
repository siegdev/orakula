/* eslint-disable @typescript-eslint/no-explicit-any */
process.env.AWS_ACCESS_KEY_ID = "fake-access";
process.env.AWS_SECRET_ACCESS_KEY = "fake-secret";
process.env.AWS_REGION = "us-east-1";
process.env.S3_BUCKET_NAME = "my-bucket";

const sendMock = jest.fn();

jest.mock("@aws-sdk/client-s3", () => ({
  S3Client: jest.fn().mockImplementation(() => ({
    send: sendMock,
  })),
  HeadObjectCommand: jest.fn(),
}));

import handler from "@/pages/api/check-existing-pdf";
import { createMocks } from "node-mocks-http";

describe("/api/check-existing-pdf", () => {
  beforeEach(() => {
    sendMock.mockReset();
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  it("should return 405 for non-GET methods", async () => {
    const { req, res } = createMocks({ method: "POST" });
    await handler(req, res);
    expect(res._getStatusCode()).toBe(405);
  });

  it("should return 400 if session_id is missing", async () => {
    const { req, res } = createMocks({ method: "GET", query: {} });
    await handler(req, res);
    expect(res._getStatusCode()).toBe(400);
  });

  it("should return exists true if pdf found", async () => {
    sendMock.mockResolvedValueOnce({
      $metadata: { httpStatusCode: 200 },
    });

    const { req, res } = createMocks({
      method: "GET",
      query: { session_id: "sess_123" },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    const data = res._getJSONData();
    expect(data.exists).toBe(true);
    expect(data).toHaveProperty("pdfUrl");
  });

  it("should return exists false if pdf not found", async () => {
    const notFoundError = new Error("not found") as any;
    notFoundError.name = "NotFound";
    notFoundError.$metadata = { httpStatusCode: 404 };

    sendMock.mockRejectedValueOnce(notFoundError);

    const { req, res } = createMocks({
      method: "GET",
      query: { session_id: "sess_999" },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    const data = res._getJSONData();
    expect(data.exists).toBe(false);
  });

  it("should return 500 on unexpected error", async () => {
    sendMock.mockRejectedValueOnce(new Error("AWS down"));

    const { req, res } = createMocks({
      method: "GET",
      query: { session_id: "sess_fail" },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(500);
    expect(res._getJSONData()).toHaveProperty("error");
  });
});
