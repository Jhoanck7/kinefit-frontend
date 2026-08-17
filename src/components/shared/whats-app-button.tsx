"use client";

import React from "react";

import { CLINIC_INFO } from "@/lib/constants";

export default function WhatsAppButton() {
  const whatsappUrl = CLINIC_INFO.socials.whatsapp;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 flex items-center justify-center
       w-12 h-12 bg-[#25D366] text-white rounded-full shadow-xl transition-all duration-300 hover:scale-110
       active:scale-95 group focus:outline-none focus:ring-4 focus:ring-green-300"
      aria-label="Contactar por WhatsApp"
    >
      {/* Icono de WhatsApp oficial  */}
      <svg
        className="w-5 h-5 fill-current drop-shadow-md transition-transform duration-300 group-hover:rotate-12"
        viewBox="0 0 24 24"
      >
        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 11.966.01c3.182.001 6.176 1.24 8.424 3.492 2.247 2.253 3.483 5.249 3.482 8.434-.004 6.618-5.34 11.957-11.91 11.957-1.996 0-3.955-.5-5.69-1.453L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.37 9.864-9.742.002-2.602-1.005-5.05-2.839-6.89C16.606 2.132 14.161.99 11.58.991c-5.441 0-9.867 4.372-9.87 9.746 0 1.691.507 3.341 1.47 4.792L2.18 21.14l5.748-1.508c1.3.719 2.723 1.102 4.16 1.102zM17.486 14.4c-.3-.149-1.776-.874-2.05-.974-.276-.101-.476-.149-.676.149-.2.299-.775.974-.95 1.173-.175.199-.35.224-.65.075-1.58-.789-2.614-1.31-3.664-3.115-.276-.475.276-.441.79-1.473.088-.174.044-.326-.022-.475-.066-.149-.676-1.625-.925-2.238-.243-.584-.489-.505-.676-.51-.175-.005-.375-.006-.575-.006-.2 0-.525.075-.8.401-.276.324-1.05 1.023-1.05 2.497 0 1.474 1.075 2.897 1.225 3.096.15.2 2.11 3.224 5.112 4.522.714.31 1.272.496 1.707.635.717.227 1.37.195 1.885.119.574-.085 1.776-.724 2.025-1.424.249-.699.249-1.3.175-1.424-.075-.124-.275-.199-.575-.349z" />
      </svg>
    </a>
  );
}
