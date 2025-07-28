"use client";
import React, { useState, useRef } from "react";
import Draggable from "react-draggable";
import html2canvas from "html2canvas";
import { LayoutGrid, Minus, Plus, Text } from "lucide-react";
import Image from "next/image";

// Sample product data
const products = [
  {
    id: "p1",
    name: "10oz Arena",
    category: "NATURAL (Compostable)",
    image: "/images/product-one.png",
  },
  {
    id: "p2",
    name: "12oz Arena",
    category: "NATURAL (Compostable)",
    image: "/images/product-two.png",
  },
];

const templates = [
  { id: "t1", name: "Wedding Template", image: "/images/template-one.png" },
  { id: "t2", name: "Birthday Template", image: "/images/template-two.png" },
  { id: "t3", name: "Corporate Template", image: "/images/template-three.png" },
];


const pattern = [
  { id: "t1", name: "Pattern First", image: "/images/pattern-one.svg" },
  { id: "t2", name: "Pattern Second", image: "/images/pattern-two.svg" },
  { id: "t3", name: "Pattern Third", image: "/images/pattern-three.svg" },
  { id: "t4", name: "Pattern Four", image: "/images/pattern-four.svg" },
  { id: "t5", name: "Pattern Five", image: "/images/pattern-five.svg" },
];

// Define the Item type for use in map functions
type Item = {
  id: string;
  name: string;
  image: string;
};

interface CustomOptions {
  productId: string;
  templateId: string;
  patternId: string;
  text: string;
  pic: string;
  size: string;
}

const ProductCustomizer = () => {
  const sizePriceMap: Record<string, string> = {
  "12 pack": "100",
  "48 pack": "120",
  "96 pack": "180",
  "120 pack": "220",
};
  const [options, setOptions] = useState<CustomOptions>({
    productId: "",
    templateId: "",
    patternId: "",
    text: "",
    pic: "",
    size:""
  });
const [activeOption, setActiveOption] = useState("productId");
  const imageNewUrl = "https://bikerzsupermart.com/wp-content/uploads/2024/01/WhatsApp-Image-2023zz-2.png";

  const SHOPIFY_STORE_DOMAIN = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN
  const SHOPIFY_ADMIN_API_TOKEN = process.env.NEXT_PUBLIC_SHOPIFY_ADMIN_API_TOKEN 
  console.log("SHOPIFY_ADMIN_API_TOKEN:", SHOPIFY_ADMIN_API_TOKEN);

  const templateRef = useRef<HTMLElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  const [templateSize, setTemplateSize] = useState(150);
  const [patternSize, setPatternSize] = useState(150);
  const [textSize, setTextSize] = useState(16);
  const selectedSizePrice = sizePriceMap[options.size] || "100";
 

const generateFinalImage = async () => {
  if (previewRef.current) {
    const elements = previewRef.current.querySelectorAll("*");
    elements.forEach((el) => {
      const htmlEl = el as HTMLElement;
      const computedStyle = getComputedStyle(htmlEl);
      htmlEl.style.backgroundColor = safeColor(computedStyle.backgroundColor);
      htmlEl.style.color = safeColor(computedStyle.color);
      htmlEl.style.borderColor = safeColor(computedStyle.borderColor);
      htmlEl.style.boxShadow = "none";
    });

    previewRef.current.style.backgroundColor = "#ffffff";
    previewRef.current.style.color = "#000000";
    previewRef.current.style.boxShadow = "none";
    previewRef.current.style.borderColor = "#ccc";

    const canvas = await html2canvas(previewRef.current, {
      backgroundColor: "#ffffff",
      useCORS: true,
    });

    const base64 = canvas.toDataURL("image/png");

    // ✅ Paste this below
    const sizeKB = (base64.length * (3 / 4)) / 1024;
    console.log("Generated image size:", sizeKB.toFixed(2), "KB");

    return base64;
  }
  return null;
};


// Helper to fallback color string if contains oklab/oklch
function safeColor(colorStr: string): string {
  if (colorStr.includes("oklab") || colorStr.includes("oklch")) {
    // Return fallback color
    return "transparent";
  }
  return colorStr;
}


  const handleSubmit = async () => {
  const dynamicPrice = "34.99"; // Replace this with the calculated price if needed

  const payload = {
    variantId: "gid://shopify/ProductVariant/46835996393639",
    quantity: 1,
    attributes: [
      { key: "productId", value: options.productId },
      { key: "templateId", value: options.templateId },
      { key: "patternId", value: options.patternId },
      { key: "text", value: options.text },
      { key: "pic", value: options.pic },
      { key: "finalImage", value: imageNewUrl || "" },
    ],
  };

  const resOfProduct = await fetch('/api/create-product', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      imageUrl: imageNewUrl,
      title: 'My Custom Product',
      price: dynamicPrice, // 💡 Pass the price here
    }),
  });

  const data = await resOfProduct.json();
  console.log("data:", data);

  const res = await fetch("/api/add-to-cart", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const result = await res.json();

  if (result.success) {
    window.location.href = result.checkoutUrl;
  } else {
    alert("Error: " + JSON.stringify(result.error));
  }
};


const handleCheckout = async () => { 
  const payload = {
    title: "Custom Printed Mug",
    price: selectedSizePrice,
    imageUrl: imageNewUrl,
    quantity: 1,
    options: {
      productId: options.productId,
      templateId: options.templateId,
      patternId: options.patternId,
      text: options.text,
      pic: options.pic,
      size: options.size
    },
  };

  const res = await fetch("/api/create-draft-order", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const result = await res.json();

  if (result.success) {
    if (typeof window !== "undefined") {
  if (window.parent !== window) { 
    window.parent.postMessage(
      { type: "checkout", url: result.checkoutUrl },
      "*"
    );
  } else { 
    window.location.href = result.checkoutUrl;
  }
}
  } else {
    console.error("Error creating draft order:", result.error);
    alert("Failed to checkout.");
  }
};


  return (
 <div className="flex  max-[640px]:flex max-[640px]:flex-col-reverse    " style={{ gap: "20px" }}
 
 >
     
      <div style={{ backgroundColor: "#ffedd4", flex:"1"}} className=" max-w-[557px] max-[640px]:w-full flex-1 w-full p-4 rounded shadow-md pt-20 max-[640px]:pt-10">
        <h2 className="text-xl font-bold mb-4 "
        style={{ color: "#313943" }}
        >
          Customize Your Products
        </h2>
 


<div className="max-[640px]:overflow-x-auto">
 <div className="flex mb-4 max-[640px]:w-[557px]">
          {[
            { key: "productId", step:"Step 01",  label: "Choose Product", options: products , icon:"/images/icon-menu-gobelets.svg" },
            { key: "templateId",  step:"Step 02",  label: "Choose Template", options: templates , icon:"/images/icon-menu-deco.svg"},
            { key: "patternId",  step:"Step 03",  label: "Choose Pattern", options: pattern , icon:"/images/icon-menu-themes.svg"},
          ].map((item) => (
            <>
        
           <div style={{
            color:"#000"
           }}>
              {item?.step}<sup 
 style={{
  color:"red"
 }}
 >
  {item?.step === "Step 01" ? " *" : item?.step === "Step 02" ? " (Optional)" : item?.step === "Step 03" ? " (Optional)" : ""}
   
 
 
 </sup>
             <div
              key={item.key}
              onClick={() => setActiveOption(item.key)}
              className={`p-2 mr-2 rounded cursor-pointer ${
                activeOption === item.key ? "activeColor" : "defaultColor"
              }`}
              style={{ display: "flex", alignItems: "center", gap: "8px" , fontSize:'14px' }}
              >
             
              <Image src={item?.icon} alt="" height={60} width={60} color="#fff"
              className={`p-2 mr-2 rounded cursor-pointer ${
                activeOption === item.key ? "activeImg" : "defaultImg"
              }`}
              />
              {item.label}
            </div>
           </div>
              </>
          ))}
        </div>
</div>

       

        {/* Display Select Based on Active Tab */}
        {activeOption && (
          <div className="mb-4">
  <label className="block mb-2" style={{
    color:"#000"
  }}>
    {activeOption === "productId" ? "Choose glass:" :
     activeOption === "templateId" ? "Choose Template:" :
     "Choose Pattern:" }
  </label>

  <div className="flex flex-wrap gap-4">
    {(activeOption === "productId" ? products :
      activeOption === "templateId" ? templates : pattern
    ).map((item: Item) => (
      <div
        key={item.id}
        onClick={() => setOptions({ ...options, [activeOption]: item.id })}
        className={`p-4 border  rounded cursor-pointer text-center max-w-[119px] w-full flex flex-col items-center ${
          (options as any)[activeOption] === item.id ? "border-orange-500 bg-orange-100" : "border-gray-400"
        }`}
      >
        {/* If you have images for products, you can show them here. Otherwise omit. */}
        <img src={item.image} alt={item.name} className="mb-2 w-10 h-10 object-contain  " />
        <div className=" text-[12px] " style={{
          color:"#000"
        }}>{item.name}</div>
      </div>
    ))}
  </div>
</div>
        )}

        
      


<div className="flex gap-[10px]    max-[640px]:flex-col">
<div className="flex-1">
   <span style={{
    color:"#000"
   }}>
          Step 04 
          <sup 
 style={{
  color:"red"
 }}
 >
     (Optional) 
   
 
 
 </sup>
        </span>
 <input
          type="text"
          value={options.text}
          onChange={(e) => setOptions({ ...options, text: e.target.value })}
          placeholder="Enter custom text"
          className="border p-2 my-2 w-full"
          style={{
            border:"1px solid #000",
            color:"#000"
          }}
        />
           
          
          
          
</div>
<div className="flex-1">
   <span
   style={{
    color:"#000"
   }}>
   
          Step 05  <sup 
 style={{
  color:"red"
 }}
 >
     (Optional) 
   
 
 
 </sup>
        </span>
  <input
          type="file"
          value={options.pic}
          onChange={(e) => setOptions({ ...options, pic: e.target.value })}
          placeholder="Enter pic image URL"
          className="border p-2 my-2 w-full"
          style={{
            border:"1px solid #000",
            color:"#000"
          }}
        /></div>


</div>
<div className="flex gap-5 items-center max-[640px]:flex-col max-[640px]:items-start"   >
<div>
  <span style={{
    color:"#000"
  }}>
Size
  </span>
   <br />
 <select
  className="border p-2 my-2 w-[200px]"
  value={options.size}
  onChange={(e) => setOptions({ ...options, size: e.target.value })}
  style={{
    border:"1px solid #000",
    color:"#000"
  }}
> 
  <option value="12 pack">12 pack</option>
  <option value="48 pack">48 pack</option>
  <option value="96 pack">96 pack</option>
  <option value="120 pack">120 pack</option>
</select>
</div>

<div className="p-4 pt-8 max-[640px]:p-0">
  <div
  style={{
    color:"#000"
  }}
  >

  Price:
  
   <span
  style={{
    fontSize:"18px",
    color:"red"
  }}
  >₹{selectedSizePrice}.00</span>


  </div>
</div>
</div>


 
          <div>
          <button
          onClick={handleCheckout}
          className="text-white px-4 py-2 mt-4 rounded"
          style={{ backgroundColor: "#004b26", cursor: "pointer" }}
        >
          Add to Cart
        </button>
          </div>
       
      </div>

   
      <div
        className="relative w-full h-[100vh] flex-1 rounded overflow-hidden flex items-center justify-center max-[640px]:min-h-[500px]  "
        style={{ backgroundColor: "#fafafa",}}
        ref={previewRef}
      >
        
        {/* Product Image */}
        {options.productId && (
          <img
            src={products.find((p: Item) => p.id === options.productId)?.image}
            alt="Product Preview"
            className="max-h-full max-[640px]:relative max-w-full object-contain"
            crossOrigin="anonymous"
          />
        )}

        {/* Template Overlay */}
        {options.templateId && (
          <Draggable nodeRef={templateRef as any} bounds="parent">
            <img
              ref={templateRef as any}
              src={templates.find((t: Item) => t.id === options.templateId)?.image}
              alt="Template Overlay"
              className="absolute cursor-move"
              style={{ width: `${templateSize}px`, height: "auto" }}
              crossOrigin="anonymous"
            />
          </Draggable>
        )}

        {/* Pattern Overlay */}
        {options.patternId && (
          <Draggable nodeRef={templateRef as any} bounds="parent">
            <img
              ref={templateRef as any}
              src={pattern.find((t: Item) => t.id === options.patternId)?.image}
              alt="Pattern Overlay"
              className="absolute  cursor-move"
              style={{ width: `${patternSize}px`, height: "auto" }}
              crossOrigin="anonymous"
            />
          </Draggable>
        )}

        {/* Draggable Text */}
        {options.text && (
          <Draggable nodeRef={textRef as any} bounds="parent">
            <div
              ref={textRef}
              className="absolute   text-black font-bold bg-black/50 px-3 py-1 rounded cursor-move"
              style={{ fontSize: `${textSize}px` }}
            >
              {options.text}
            </div>
          </Draggable>
        )}

        {/* Picture URL */}
        {options.pic && (
          <img
            src={options.pic}
            alt="Custom Pic"
            className="absolute  bottom-0 left-0 max-w-[100px] max-h-[100px]"
            crossOrigin="anonymous"
          />
        )}
 <div    className="absolute bottom-[10px]  ">
    {/* Controls */}
    <div className="col-span-2 mt-4 flex flex-wrap gap-4">
  {/* Template Size */}
  <button
    aria-label="Increase Template Size"
    className="bg-gray-300 p-2 rounded"
    onClick={() => setTemplateSize((s) => s + 10)}
  >
    <Plus size={20} />
  </button>
  <button
    aria-label="Decrease Template Size"
    className="bg-gray-300 p-2 rounded"
    onClick={() => setTemplateSize((s) => Math.max(50, s - 10))}
  >
    <Minus size={20} />
  </button>

  {/* Pattern Size */}
  <button
    aria-label="Increase Pattern Size"
    className="bg-gray-300 p-2 rounded"
    onClick={() => setPatternSize((s) => s + 10)}
  >
    <LayoutGrid size={20} />
    <Plus size={16} className="absolute bottom-0 right-0" />
  </button>
  <button
    aria-label="Decrease Pattern Size"
    className="bg-gray-300 p-2 rounded"
    onClick={() => setPatternSize((s) => Math.max(50, s - 10))}
  >
    <LayoutGrid size={20} />
    <Minus size={16} className="absolute bottom-0 right-0" />
  </button>

  {/* Text Size */}
  <button
    aria-label="Increase Text Size"
    className="bg-gray-300 p-2 rounded"
    onClick={() => setTextSize((s) => s + 2)}
  >
    <Text size={20} />
    <Plus size={16} className="absolute bottom-0 right-0" />
  </button>
  <button
    aria-label="Decrease Text Size"
    className="bg-gray-300 p-2 rounded"
    onClick={() => setTextSize((s) => Math.max(8, s - 2))}
  >
    <Text size={20} />
    <Minus size={16} className="absolute bottom-0 right-0" />
  </button>
</div>
  </div>
      </div>

      

      
    </div>

  );
};

export default ProductCustomizer;
