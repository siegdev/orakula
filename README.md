# Orákula ✨

![Next.js](https://img.shields.io/badge/Next.js-13-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-4.x-blue)
![License](https://img.shields.io/badge/license-MIT-green)

> **Orákula** is a platform that generates personalized mystical predictions in PDF format, delivered straight to your email.

---

## 🚀 Tech Stack

- **Next.js** (App Router)
- **TypeScript**
- **Stripe** (for payment handling)
- **Jest** (for API testing)

---

## ⚙️ Features

✅ Generates PDFs with mystical predictions  
✅ Secure payment integration (Stripe)  
✅ Session-based flow  
✅ Sends emails with the generated file  
✅ Clean architecture ready for production

---

## 🛠️ Local Development

Make sure you have **Node.js 20+** and **Docker** installed.

```bash
# install dependencies
npm install

# start the dev server
npm run dev
```

## 🐳 Running with Docker

\`\`\`bash
docker-compose up --build
\`\`\`

Then access:

- **App**: [http://localhost:3000](http://localhost:3000)

---

## 📌 API Endpoints

| Endpoint                | Description                         |
| ----------------------- | ----------------------------------- |
| \`/api/generate\`       | Generates a mystical preview        |
| \`/api/generate-full\`  | Generates the paid full prediction  |
| \`/api/send-pdf-email\` | Sends the PDF to the user via email |
| \`/api/checkout\`       | Creates a Stripe checkout session   |
| \`/api/session-data\`   | Handles session-related information |

---

## 🧪 Tests

\`\`\`bash
npm run test
\`\`\`

---

## 📄 License

This project is licensed under the **MIT License**.

---

> Developed by [siegdev](https://github.com/siegdev) 🖤
