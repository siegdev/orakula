/* eslint-disable @typescript-eslint/no-explicit-any */
import handler from "@/pages/api/session-data";
import { createMocks } from "node-mocks-http";
import Stripe from "stripe";

// mock Stripe
jest.mock("stripe", () => {
  const sessionRetrieveMock = jest.fn();
  return jest.fn(() => ({
    checkout: {
      sessions: {
        retrieve: sessionRetrieveMock,
      },
    },
  }));
});

describe("/api/session-data", () => {
  const stripeMock = new Stripe("sk_test", {
    apiVersion: "2025-03-31.basil",
  }) as any;

  beforeEach(() => {
    stripeMock.checkout.sessions.retrieve.mockReset();
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  it("should return 400 if session_id is missing", async () => {
    const { req, res } = createMocks({
      method: "GET",
      query: {},
    });
    await handler(req, res);
    expect(res._getStatusCode()).toBe(400);
    expect(res._getJSONData()).toHaveProperty("error");
  });

  it("should return 200 with session metadata", async () => {
    stripeMock.checkout.sessions.retrieve.mockResolvedValueOnce({
      metadata: {
        name: "Julio",
        birthdate: "1990-01-01",
        email: "julio@example.com",
        plan: "advanced",
      },
    });

    const { req, res } = createMocks({
      method: "GET",
      query: {
        session_id: "sess_123",
      },
    });

    await handler(req, res);
    expect(res._getStatusCode()).toBe(200);
    const data = res._getJSONData();
    expect(data).toEqual({
      name: "Julio",
      birthdate: "1990-01-01",
      email: "julio@example.com",
      plan: "advanced",
    });
  });

  it("should return 500 if Stripe fails", async () => {
    stripeMock.checkout.sessions.retrieve.mockRejectedValueOnce(
      new Error("fail")
    );

    const { req, res } = createMocks({
      method: "GET",
      query: {
        session_id: "sess_123",
      },
    });

    await handler(req, res);
    expect(res._getStatusCode()).toBe(500);
    expect(res._getJSONData()).toHaveProperty("error");
  });
});
