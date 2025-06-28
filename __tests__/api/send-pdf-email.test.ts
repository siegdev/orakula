/* eslint-disable @typescript-eslint/no-require-imports */
import handler from "@/pages/api/send-pdf-email";
import { createMocks } from "node-mocks-http";

// Mock nodemailer
jest.mock("nodemailer", () => {
  const sendMailMock = jest.fn().mockResolvedValue(true);
  return {
    createTransport: jest.fn(() => ({
      sendMail: sendMailMock,
    })),
  };
});

describe("/api/send-pdf-email", () => {
  const nodemailer = require("nodemailer");
  const sendMailMock = nodemailer.createTransport().sendMail;

  beforeEach(() => {
    sendMailMock.mockClear();
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  it("should return 405 for non-POST methods", async () => {
    const { req, res } = createMocks({
      method: "GET",
    });
    await handler(req, res);
    expect(res._getStatusCode()).toBe(405);
  });

  it("should return 400 if required fields are missing", async () => {
    const { req, res } = createMocks({
      method: "POST",
      body: {},
    });
    await handler(req, res);
    expect(res._getStatusCode()).toBe(400);
    expect(res._getJSONData()).toHaveProperty("error");
  });

  it("should return 200 if email sent successfully", async () => {
    const { req, res } = createMocks({
      method: "POST",
      body: {
        email: "julio@example.com",
        pdfUrl: "https://pdf.orakula.com/test.pdf",
        fullReading: "Sua leitura completa aqui",
      },
    });
    await handler(req, res);
    expect(res._getStatusCode()).toBe(200);
    expect(sendMailMock).toHaveBeenCalledTimes(1);
    expect(res._getJSONData()).toEqual({ ok: true });
  });

  it("should return 500 if sendMail throws", async () => {
    sendMailMock.mockRejectedValueOnce(new Error("send error"));
    const { req, res } = createMocks({
      method: "POST",
      body: {
        email: "julio@example.com",
        pdfUrl: "https://pdf.orakula.com/test.pdf",
        fullReading: "Conteúdo da leitura",
      },
    });
    await handler(req, res);
    expect(res._getStatusCode()).toBe(500);
    expect(res._getJSONData()).toHaveProperty("error");
  });
});
