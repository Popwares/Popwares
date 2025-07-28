// pages/api/add-to-cart.ts

import type { NextApiRequest, NextApiResponse } from 'next';
 
type Data = 
  | { success: true; checkoutUrl: string }
  | { success: false; error: any };

export default async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
  }

  const {
    variantId = "gid://shopify/ProductVariant/46835996393639",
    quantity = 1,
    attributes = [
      { key: "color", value: "red" },
      { key: "size", value: "M" },
      { key: "text", value: "My Custom Name" },
      { key: "pic", value: "My pic image" },
      {key:"finalImage" , value:"https://bikerzsupermart.com/wp-content/uploads/2024/01/WhatsApp-Image-2023zz-2.png"}
    ],
  } = req.body || {};

  const query = `
    mutation cartCreate($input: CartInput!) {
      cartCreate(input: $input) {
        cart {
          id
          checkoutUrl
        }
        userErrors {
          field
          message
        }
      }
    }
  `;

  const variables = {
    input: {
      lines: [
        {
          quantity,
          merchandiseId: variantId,
          attributes,
        }
      ]
    }
  };

  try {
    const response = await fetch(`https://km10x9-7j.myshopify.com/api/2024-01/graphql.json`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': "5ebcdf451becb11f8bec59d62f367811",
      },
      body: JSON.stringify({ query, variables }),
    });

    const data = await response.json();

    // Check for errors and userErrors
    if (data.errors) {
      return res.status(400).json({ success: false, error: data.errors });
    }

    const userErrors = data.data?.cartCreate?.userErrors || [];
    if (userErrors.length > 0) {
      return res.status(400).json({ success: false, error: userErrors });
    }

    const checkoutUrl = data.data.cartCreate.cart.checkoutUrl;

    if (!checkoutUrl) {
      return res.status(500).json({ success: false, error: 'No checkout URL returned' });
    }

    return res.status(200).json({
      success: true,
      checkoutUrl,
    });
  } catch (error) {
    console.error('Shopify API error:', error);
    return res.status(500).json({ success: false, error: 'Something went wrong' });
  }
}
