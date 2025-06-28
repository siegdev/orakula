import handler from "@/pages/api/generate-full";
import { createMocks } from "node-mocks-http";

global.fetch = jest.fn();

describe("/api/generate-full", () => {
  beforeEach(() => {
    (fetch as jest.Mock).mockReset();
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  it("should return 200 with preview and full when valid data is sent", async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      json: async () => ({
        choices: [
          {
            message: {
              content: "Previsão completa\nSegunda linha da previsão",
            },
          },
        ],
      }),
    });

    const { req, res } = createMocks({
      method: "POST",
      body: {
        name: "Julio",
        birthdate: "1990-01-01",
        plan: "advanced",
      },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);

    const data = res._getJSONData();
    expect(data).toHaveProperty("preview");
    expect(data).toHaveProperty("full");
    expect(typeof data.preview).toBe("string");
    expect(typeof data.full).toBe("string");
  });

  it("should return 400 if required fields are missing", async () => {
    const { req, res } = createMocks({
      method: "POST",
      body: {},
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
    const data = res._getJSONData();
    expect(data).toHaveProperty("error");
  });

  it("should return 500 if OpenAI request fails", async () => {
    (fetch as jest.Mock).mockRejectedValueOnce(new Error("OpenAI failure"));

    const { req, res } = createMocks({
      method: "POST",
      body: {
        name: "Julio",
        birthdate: "1990-01-01",
        plan: "basic",
      },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(500);
    const data = res._getJSONData();
    expect(data).toHaveProperty("error");
  });

  it("should return 400 for non-POST methods", async () => {
    const { req, res } = createMocks({
      method: "GET",
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
  });
});
