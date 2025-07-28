// pages/api/upload-to-shopify.ts
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { base64Image } = req.body;

  if (!base64Image) {
    return res.status(400).json({ error: "Missing base64Image" });
  }
  
  // Strip the prefix first
 const base64 = base64Image.split(",")[1]?.replace(/\s/g, '');
  if (!base64) {
    return res.status(400).json({ error: "Invalid base64 format" });
  }
  
  try {
    const API_KEY = "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";
    const STORE = "km10x9-7j.myshopify.com";
    console.log("API_KEY:", API_KEY);

    console.log("POST body to Shopify :", JSON.stringify({ 
  file: { attachment: base64, filename: "custom-image.jpg" }
}, null, 2));

console.log("API endpoint :", `https://${STORE}/admin/api/2024-01/files.json`);

    if (!API_KEY || !STORE) {
      return res.status(500).json({ error: "API credentials not configured" });
    }
  
    const response = await fetch(`https://${STORE}/admin/api/2024-01/files.json`, {
      method:'POST',
      headers: {
        "X-Shopify-Access-Token": API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ 
        file: { 
          attachment: base64, 
          filename: "custom-image.png" 
        }
      })
    });

    const text = await response.text();
console.log("Shopify raw response:", text);
    let data;
    try {
      data = JSON.parse(text);
    } catch (err) {
      console.error("Invalid JSON from Shopify API:", text);
      return res.status(500).json({ error: "Invalid JSON from Shopify API", raw: text });
    }
  
    if (!response.ok) {
      console.error("Shopify API Error:", data?.errors);
      return res.status(500).json({ error: data?.errors || "File upload failed" });
    }
  
    res.status(200).json({ success: true, imageId: data?.file?.id });

  } catch (err) {
    console.error("Server Error during upload:", err);
    res.status(500).json({ error: "Server Error during upload" });
  }
}
