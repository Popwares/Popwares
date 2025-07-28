// pages/api/create-product.ts
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { imageUrl, title = 'Custom Product', price } = req.body;

const response = await fetch(
  `https://km10x9-7j.myshopify.com/admin/api/2024-01/products.json`,
  {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': "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",
    },
    body: JSON.stringify({
      product: {
        title,
        images: imageUrl ? [{ src: imageUrl }] : [],
        variants: [
          {
            price,        // ✅ set price dynamically
            option1: 'S', // Shopify needs this if you are not using options
          },
        ],
      },
    }),
  }
);

  const data = await response.json();

  if (!response.ok) {
    return res.status(500).json({ error: data.errors || 'Failed to create product' });
  }

  return res.status(200).json({ success: true, product: data.product });
}
