/* eslint-disable @typescript-eslint/no-explicit-any */
import handler from "@/pages/api/checkout";
import { createMocks } from "node-mocks-http";
import Stripe from "stripe";

jest.mock("stripe", () => {
  const mStripe = {
    checkout: {
      sessions: {
        create: jest.fn(),
      },
    },
  };
  return jest.fn(() => mStripe);
});

describe("/api/checkout", () => {
  const stripeMock = new Stripe("sk_test_123", {
    apiVersion: "2025-03-31.basil",
  }) as any;

  beforeEach(() => {
    stripeMock.checkout.sessions.create.mockReset();
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  it("should return 405 for non-POST methods", async () => {
    const { req, res } = createMocks({
      method: "GET",
    });

    await handler(req, res);
    expect(res._getStatusCode()).toBe(405);
  });

  it("should return 400 if plan is invalid", async () => {
    const { req, res } = createMocks({
      method: "POST",
      body: {
        plan: "invalid",
        name: "Julio",
        birthdate: "1990-01-01",
        email: "julio@example.com",
      },
    });

    await handler(req, res);
    expect(res._getStatusCode()).toBe(400);
    expect(res._getJSONData()).toHaveProperty("error");
  });

  it("should return 200 and session url when success", async () => {
    stripeMock.checkout.sessions.create.mockResolvedValueOnce({
      url: "https://stripe-session.com/success",
    });

    const { req, res } = createMocks({
      method: "POST",
      body: {
        plan: "basic",
        name: "Julio",
        birthdate: "1990-01-01",
        email: "julio@example.com",
      },
    });

    process.env.NEXT_PUBLIC_STRIPE_MODE = "test";
    process.env.NEXT_PUBLIC_STRIPE_PRICE_BASIC_TEST = "price_123";
    process.env.NEXT_PUBLIC_BASE_URL = "http://localhost:3000";

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    const data = res._getJSONData();
    expect(data).toHaveProperty("url");
    expect(typeof data.url).toBe("string");
  });

  it("should return 500 if Stripe fails", async () => {
    stripeMock.checkout.sessions.create.mockRejectedValueOnce(
      new Error("fail")
    );

    const { req, res } = createMocks({
      method: "POST",
      body: {
        plan: "basic",
        name: "Julio",
        birthdate: "1990-01-01",
        email: "julio@example.com",
      },
    });

    process.env.NEXT_PUBLIC_STRIPE_MODE = "test";
    process.env.NEXT_PUBLIC_STRIPE_PRICE_BASIC_TEST = "price_123";
    process.env.NEXT_PUBLIC_BASE_URL = "http://localhost:3000";

    await handler(req, res);

    expect(res._getStatusCode()).toBe(500);
    const data = res._getJSONData();
    expect(data).toHaveProperty("error");
  });
});
