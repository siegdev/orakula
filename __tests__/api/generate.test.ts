import handler from "@/pages/api/generate";
import { createMocks } from "node-mocks-http";

describe("/api/generate", () => {
  it("should return 200 with a valid preview", async () => {
    const { req, res } = createMocks({
      method: "POST",
      body: {
        nome: "Julio",
        dataNascimento: "1990-01-01",
      },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    const data = res._getJSONData();

    expect(data).toHaveProperty("randomPreview");
    expect(typeof data.randomPreview).toBe("string");
  });

  it("should return 405 if method not POST", async () => {
    const { req, res } = createMocks({
      method: "GET",
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(405);
  });
});
